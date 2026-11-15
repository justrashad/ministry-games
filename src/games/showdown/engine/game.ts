import type {
  GameState,
  PlayedRound,
  Question,
  RevealEntry,
  RoundPlanEntry,
  RoundResultVia,
  RoundState,
  TeamColorId,
  TeamIndex,
} from '../types';
import { LIMITS, isTeamColor } from './defaults';
import { gameWinner, otherTeam, withEvent, withTeamScore } from './events';
import { fcEndTurn, fcReduce, isFcAction, type FcAction } from './finalChallenge';
import { pickNextQuestion } from './questionPicker';
import { addTime, createTimer, expireIfDue, pauseTimer, startTimer } from './timer';

export type GameAction =
  | { type: 'NEW_GAME'; game: GameState }
  | { type: 'CLEAR_GAME' }
  | { type: 'NEXT_ROUND'; now: number }
  | { type: 'SHOW_QUESTION' }
  | { type: 'SET_CONTROL'; team: TeamIndex | null }
  | { type: 'SCORE_ANSWER'; answerId: string; now: number }
  | { type: 'SHOW_ANSWER'; answerId: string }
  | { type: 'REVEAL_NEXT' }
  | { type: 'REVEAL_ALL' }
  | { type: 'HIDE_ANSWER'; answerId: string }
  | { type: 'ARM_BUZZERS' }
  | { type: 'BUZZ'; team: TeamIndex }
  | { type: 'ADD_STRIKE' }
  | { type: 'REMOVE_STRIKE' }
  | { type: 'START_STEAL' }
  | { type: 'CANCEL_STEAL' }
  | { type: 'STEAL_SUCCESS'; answerId?: string; now: number }
  | { type: 'STEAL_FAIL'; now: number }
  | { type: 'AWARD_ROUND'; team: TeamIndex; now: number }
  | { type: 'RESET_ROUND' }
  | { type: 'SKIP_QUESTION' }
  | { type: 'END_GAME'; now: number }
  | { type: 'ADJUST_SCORE'; team: TeamIndex; delta: number; allowNegative?: boolean }
  | { type: 'SET_SCORE'; team: TeamIndex; score: number; allowNegative?: boolean }
  | { type: 'RENAME_TEAM'; team: TeamIndex; name: string }
  | { type: 'SET_TEAM_COLOR'; team: TeamIndex; color: TeamColorId }
  | { type: 'SET_PAUSED'; paused: boolean; now: number }
  | { type: 'SET_TIMER_ENABLED'; enabled: boolean; seconds: number }
  | { type: 'TIMER_START'; now: number }
  | { type: 'TIMER_PAUSE'; now: number }
  | { type: 'TIMER_RESET' }
  | { type: 'TIMER_ADD'; seconds: number; now: number }
  | { type: 'TIMER_EXPIRE'; now: number }
  | { type: 'MARK_RECORDED'; which: 'game' | 'finalChallenge' }
  | FcAction;

/* ---------------------------- helpers ---------------------------------- */

export function roundTimerSeconds(s: GameState, round: Pick<RoundState, 'isFinal' | 'question'>): number {
  const finalSeconds = s.config.rules.finalRound.timerSeconds;
  if (round.isFinal && finalSeconds > 0) return finalSeconds;
  if (!s.config.timerEnabled) return 0;
  return round.question.timeLimit ?? s.config.timerSeconds;
}

export function buildRound(s: GameState, index: number, plan: RoundPlanEntry, question: Question): RoundState {
  const limit = plan.isFinal ? s.config.rules.finalRound.answerLimit : Infinity;
  const q: Question = plan.isFinal && question.answers.length > limit ? { ...question, answers: question.answers.slice(0, limit) } : question;
  return {
    index,
    isFinal: plan.isFinal,
    multiplier: q.multiplier ?? plan.multiplier,
    question: q,
    revealed: {},
    bank: 0,
    strikes: 0,
    controllingTeam: null,
    stealingTeam: null,
    result: null,
    holdReveals: plan.isFinal && s.config.rules.finalRound.revealMode === 'simultaneous',
    faceoff: { armed: false, team: null },
  };
}

/** Buzzers are open only while nobody controls the round yet and nothing has been scored. */
export function buzzersOpen(s: GameState): boolean {
  const r = s.round;
  return !!r && s.phase === 'playing' && !r.result && !!r.faceoff?.armed && r.faceoff.team === null && r.controllingTeam === null;
}

export function isAnswerScored(entry: RevealEntry | undefined): boolean {
  return !!entry && entry.source !== 'shown';
}

export function hiddenAnswerCount(round: RoundState): number {
  return round.question.answers.filter((a) => !round.revealed[a.id]?.visible).length;
}

function playedEntry(round: RoundState, team: TeamIndex | null, points: number, via: PlayedRound['via']): PlayedRound {
  return {
    roundIndex: round.index,
    questionId: round.question.id,
    question: round.question.question,
    category: round.question.category,
    team,
    points,
    via,
  };
}

function awardRound(
  s: GameState,
  team: TeamIndex,
  raw: number,
  via: RoundResultVia,
  now: number,
  eventKind: 'roundWin' | 'stealSuccess' = 'roundWin',
): GameState {
  const r = s.round;
  if (!r || r.result) return s;
  const points = Math.max(0, Math.round(raw * r.multiplier));
  const teams = withTeamScore(s.teams, team, s.teams[team].score + points, s.config.rules.allowNegativeScores);
  const revealed: Record<string, RevealEntry> = {};
  for (const [id, entry] of Object.entries(r.revealed)) revealed[id] = { ...entry, visible: true };
  if (s.config.rules.revealRemainingOnRoundEnd) {
    for (const answer of r.question.answers) {
      if (!revealed[answer.id]) revealed[answer.id] = { source: 'shown', visible: true };
    }
  }
  const round: RoundState = { ...r, revealed, result: { team, raw, points, via } };
  const played = [...s.played.filter((p) => p.roundIndex !== r.index), playedEntry(r, team, points, via)];
  return withEvent({ ...s, teams, round, played, phase: 'roundOver', timer: pauseTimer(s.timer, now) }, eventKind, { team, value: points });
}

function scoreAnswer(s: GameState, answerId: string, now: number): GameState {
  const r = s.round;
  if (!r || r.result) return s;
  if (s.phase === 'steal') return stealSuccess(s, answerId, now);
  if (s.phase !== 'playing') return s;
  const answer = r.question.answers.find((x) => x.id === answerId);
  if (!answer) return s;
  // Guard against double scoring: an answer can only ever add to the bank once.
  if (isAnswerScored(r.revealed[answerId])) return s;
  const round: RoundState = {
    ...r,
    revealed: { ...r.revealed, [answerId]: { source: 'scored', visible: !r.holdReveals } },
    bank: r.bank + answer.points,
  };
  const next = withEvent({ ...s, round }, 'correct', { answerId, team: r.controllingTeam ?? undefined, value: answer.points });
  const boardCleared = round.question.answers.every((x) => isAnswerScored(round.revealed[x.id]));
  if (boardCleared && round.controllingTeam !== null) return awardRound(next, round.controllingTeam, round.bank, 'play', now);
  return next;
}

function showAnswer(s: GameState, answerId: string): GameState {
  const r = s.round;
  if (!r || s.phase === 'roundIntro') return s;
  if (!r.question.answers.some((x) => x.id === answerId)) return s;
  const existing = r.revealed[answerId];
  if (existing?.visible) return s;
  const entry: RevealEntry = existing ? { ...existing, visible: true } : { source: 'shown', visible: true };
  return withEvent({ ...s, round: { ...r, revealed: { ...r.revealed, [answerId]: entry } } }, 'reveal', { answerId });
}

function revealAll(s: GameState): GameState {
  const r = s.round;
  if (!r || s.phase === 'roundIntro') return s;
  let changed = false;
  const revealed: Record<string, RevealEntry> = { ...r.revealed };
  for (const answer of r.question.answers) {
    const existing = revealed[answer.id];
    if (!existing) {
      revealed[answer.id] = { source: 'shown', visible: true };
      changed = true;
    } else if (!existing.visible) {
      revealed[answer.id] = { ...existing, visible: true };
      changed = true;
    }
  }
  return changed ? withEvent({ ...s, round: { ...r, revealed } }, 'revealAll') : s;
}

function enterSteal(s: GameState): GameState {
  const r = s.round;
  if (!r || r.controllingTeam === null) return s;
  return { ...s, phase: 'steal', round: { ...r, stealingTeam: otherTeam(r.controllingTeam) } };
}

function stealSuccess(s: GameState, answerId: string | undefined, now: number): GameState {
  const r = s.round;
  if (s.phase !== 'steal' || !r || r.result || r.stealingTeam === null) return s;
  let round = r;
  let answerPoints = 0;
  if (answerId) {
    const answer = r.question.answers.find((x) => x.id === answerId);
    if (!answer || isAnswerScored(r.revealed[answerId])) return s;
    answerPoints = answer.points;
    round = { ...r, revealed: { ...r.revealed, [answerId]: { source: 'steal', visible: true } }, bank: r.bank + answer.points };
  }
  const raw = s.config.rules.stealAward === 'answerOnly' ? answerPoints : round.bank;
  return awardRound({ ...s, round }, r.stealingTeam, raw, 'steal', now, 'stealSuccess');
}

function endGame(s: GameState, now: number): GameState {
  if (s.phase === 'gameOver' || s.phase === 'finalChallenge') return s;
  const winner = gameWinner(s);
  return withEvent({ ...s, phase: 'gameOver', endedAt: now, timer: pauseTimer(s.timer, now), paused: false }, 'gameOver', {
    team: winner === 'tie' ? undefined : winner,
  });
}

function nextRound(s: GameState, now: number): GameState {
  const allowed = ['intro', 'roundIntro', 'playing', 'steal', 'roundOver'];
  if (!allowed.includes(s.phase)) return s;
  let played = s.played;
  const current = s.round;
  if (current && !current.result && s.phase !== 'intro') {
    // Moving on without awarding: record the round as unscored so history stays complete.
    played = [...played.filter((p) => p.roundIndex !== current.index), playedEntry(current, null, 0, 'none')];
  }
  const nextIndex = s.phase === 'intro' || !current ? 0 : current.index + 1;
  if (nextIndex >= s.roundPlan.length) return endGame({ ...s, played }, now);
  const plan = s.roundPlan[nextIndex];
  const question = pickNextQuestion(s.pools, s.usedQuestionIds, plan.isFinal, s.config.avoidRepeats, current?.question.id);
  if (!question) return endGame({ ...s, played }, now);
  const round = buildRound(s, nextIndex, plan, question);
  return withEvent(
    {
      ...s,
      played,
      phase: 'roundIntro',
      round,
      usedQuestionIds: [...s.usedQuestionIds, question.id],
      timer: createTimer(roundTimerSeconds(s, round)),
      paused: false,
    },
    plan.isFinal ? 'finalRound' : 'roundStart',
    { value: nextIndex },
  );
}

function adjustTeamScore(s: GameState, team: TeamIndex, score: number, allowNegative?: boolean): GameState {
  if (!Number.isFinite(score)) return s;
  const teams = withTeamScore(s.teams, team, score, allowNegative ?? s.config.rules.allowNegativeScores);
  if (teams[team].score === s.teams[team].score) return s;
  return { ...s, teams };
}

/* ---------------------------- reducer ---------------------------------- */

export function reduceGame(state: GameState | null, action: GameAction): GameState | null {
  if (action.type === 'NEW_GAME') return action.game;
  if (action.type === 'CLEAR_GAME') return null;
  if (!state) return state;
  return gameReducer(state, action);
}

export function gameReducer(s: GameState, a: GameAction): GameState {
  if (isFcAction(a)) return fcReduce(s, a);

  switch (a.type) {
    case 'NEW_GAME':
    case 'CLEAR_GAME':
      return s;

    case 'NEXT_ROUND':
      return nextRound(s, a.now);

    case 'SHOW_QUESTION': {
      if (s.phase !== 'roundIntro' || !s.round) return s;
      const r = s.round;
      // Arm the face-off buzzers unless the host already chose a team during the round intro.
      const armed = s.config.rules.faceoffBuzzers !== false && r.controllingTeam === null;
      return withEvent(
        { ...s, phase: 'playing', round: { ...r, faceoff: { armed, team: null } }, timer: createTimer(roundTimerSeconds(s, r)) },
        'questionShown',
      );
    }

    case 'ARM_BUZZERS': {
      const r = s.round;
      if (!r || s.phase !== 'playing' || r.result) return s;
      return withEvent({ ...s, round: { ...r, controllingTeam: null, faceoff: { armed: true, team: null } } }, 'buzzersArmed');
    }

    case 'BUZZ': {
      // First buzz wins; every later buzz is ignored until the host re-arms.
      if (!buzzersOpen(s) || (a.team !== 0 && a.team !== 1)) return s;
      const r = s.round!;
      return withEvent({ ...s, round: { ...r, controllingTeam: a.team, faceoff: { armed: false, team: a.team } } }, 'buzz', { team: a.team });
    }

    case 'SET_CONTROL': {
      const r = s.round;
      if (!r || !(s.phase === 'playing' || s.phase === 'roundIntro') || r.controllingTeam === a.team) return s;
      // A host choice settles the face-off; buzzers close.
      const faceoff = r.faceoff?.armed ? { armed: false, team: r.faceoff.team } : r.faceoff;
      return { ...s, round: { ...r, controllingTeam: a.team, faceoff } };
    }

    case 'SCORE_ANSWER':
      return scoreAnswer(s, a.answerId, a.now);

    case 'SHOW_ANSWER':
      return showAnswer(s, a.answerId);

    case 'REVEAL_NEXT': {
      const r = s.round;
      if (!r) return s;
      const next = r.question.answers.find((x) => !r.revealed[x.id]?.visible);
      return next ? showAnswer(s, next.id) : s;
    }

    case 'REVEAL_ALL':
      return revealAll(s);

    case 'HIDE_ANSWER': {
      const r = s.round;
      if (!r || r.result || !(s.phase === 'playing' || s.phase === 'steal')) return s;
      const entry = r.revealed[a.answerId];
      if (!entry) return s;
      const answer = r.question.answers.find((x) => x.id === a.answerId);
      const revealed = { ...r.revealed };
      delete revealed[a.answerId];
      const bank = isAnswerScored(entry) ? Math.max(0, r.bank - (answer?.points ?? 0)) : r.bank;
      return { ...s, round: { ...r, revealed, bank } };
    }

    case 'ADD_STRIKE': {
      const r = s.round;
      if (s.phase !== 'playing' || !r || r.result) return s;
      const max = s.config.rules.maxStrikes;
      if (r.strikes >= max) return s;
      const strikes = r.strikes + 1;
      const next = withEvent({ ...s, round: { ...r, strikes } }, 'strike', { value: strikes, team: r.controllingTeam ?? undefined });
      return strikes >= max ? enterSteal(next) : next;
    }

    case 'REMOVE_STRIKE': {
      const r = s.round;
      if (!r || r.result) return s;
      if (s.phase === 'steal') return gameReducer(s, { type: 'CANCEL_STEAL' });
      if (s.phase !== 'playing' || r.strikes === 0) return s;
      return withEvent({ ...s, round: { ...r, strikes: r.strikes - 1 } }, 'strikeRemoved', { value: r.strikes - 1 });
    }

    case 'START_STEAL': {
      const r = s.round;
      if (s.phase !== 'playing' || !r || r.result || r.controllingTeam === null) return s;
      return withEvent(enterSteal(s), 'steal', { team: otherTeam(r.controllingTeam) });
    }

    case 'CANCEL_STEAL': {
      const r = s.round;
      if (s.phase !== 'steal' || !r || r.result) return s;
      const strikes = Math.min(r.strikes, s.config.rules.maxStrikes - 1);
      return withEvent({ ...s, phase: 'playing', round: { ...r, strikes, stealingTeam: null } }, 'stealCancelled');
    }

    case 'STEAL_SUCCESS':
      return stealSuccess(s, a.answerId, a.now);

    case 'STEAL_FAIL': {
      const r = s.round;
      if (s.phase !== 'steal' || !r || r.result || r.controllingTeam === null) return s;
      return awardRound(s, r.controllingTeam, r.bank, 'stealFailed', a.now);
    }

    case 'AWARD_ROUND': {
      const r = s.round;
      if (!r || r.result || !(s.phase === 'playing' || s.phase === 'steal')) return s;
      return awardRound(s, a.team, r.bank, r.controllingTeam === a.team ? 'play' : 'manual', a.now);
    }

    case 'RESET_ROUND': {
      const r = s.round;
      if (!r || !['roundIntro', 'playing', 'steal', 'roundOver'].includes(s.phase)) return s;
      let teams = s.teams;
      if (r.result) {
        // Undo the award exactly; clamp at zero unless negative scores are allowed.
        teams = withTeamScore(teams, r.result.team, teams[r.result.team].score - r.result.points, s.config.rules.allowNegativeScores);
      }
      const plan: RoundPlanEntry = { isFinal: r.isFinal, multiplier: s.roundPlan[r.index]?.multiplier ?? r.multiplier };
      const fresh = buildRound(s, r.index, plan, r.question);
      const played = s.played.filter((p) => p.roundIndex !== r.index);
      const phase = s.phase === 'roundIntro' ? 'roundIntro' : 'playing';
      return withEvent({ ...s, teams, played, phase, round: fresh, timer: createTimer(roundTimerSeconds(s, fresh)) }, 'roundReset');
    }

    case 'SKIP_QUESTION': {
      const r = s.round;
      if (!r || r.result || !['roundIntro', 'playing', 'steal'].includes(s.phase)) return s;
      const question = pickNextQuestion(s.pools, s.usedQuestionIds, r.isFinal, s.config.avoidRepeats, r.question.id);
      if (!question || question.id === r.question.id) return s;
      const plan: RoundPlanEntry = { isFinal: r.isFinal, multiplier: s.roundPlan[r.index]?.multiplier ?? r.multiplier };
      const fresh = { ...buildRound(s, r.index, plan, question), controllingTeam: r.controllingTeam };
      const phase = s.phase === 'roundIntro' ? 'roundIntro' : 'playing';
      return withEvent(
        { ...s, phase, round: fresh, usedQuestionIds: [...s.usedQuestionIds, question.id], timer: createTimer(roundTimerSeconds(s, fresh)) },
        phase === 'playing' ? 'questionShown' : 'roundStart',
        { value: r.index },
      );
    }

    case 'END_GAME':
      return endGame(s, a.now);

    case 'ADJUST_SCORE':
      if (!Number.isFinite(a.delta) || a.delta === 0) return s;
      return adjustTeamScore(s, a.team, s.teams[a.team].score + a.delta, a.allowNegative);

    case 'SET_SCORE':
      return adjustTeamScore(s, a.team, a.score, a.allowNegative);

    case 'RENAME_TEAM': {
      const name = a.name.trim().slice(0, LIMITS.teamName);
      if (!name || name === s.teams[a.team].name) return s;
      const teams: [typeof s.teams[0], typeof s.teams[1]] = [s.teams[0], s.teams[1]];
      teams[a.team] = { ...teams[a.team], name };
      return { ...s, teams };
    }

    case 'SET_TEAM_COLOR': {
      if (!isTeamColor(a.color) || s.teams[a.team].color === a.color) return s;
      const teams: [typeof s.teams[0], typeof s.teams[1]] = [s.teams[0], s.teams[1]];
      teams[a.team] = { ...teams[a.team], color: a.color };
      return { ...s, teams };
    }

    case 'SET_PAUSED': {
      if (s.paused === a.paused) return s;
      return { ...s, paused: a.paused, timer: a.paused ? pauseTimer(s.timer, a.now) : s.timer };
    }

    case 'SET_TIMER_ENABLED': {
      const seconds = Math.min(LIMITS.timerSeconds.max, Math.max(LIMITS.timerSeconds.min, Math.round(a.seconds)));
      const config = { ...s.config, timerEnabled: a.enabled, timerSeconds: seconds };
      const next = { ...s, config };
      if (s.round && (s.phase === 'playing' || s.phase === 'roundIntro')) {
        next.timer = createTimer(roundTimerSeconds(next, s.round));
      }
      return next;
    }

    case 'TIMER_START': {
      const timer = startTimer(s.timer, a.now);
      return timer === s.timer ? s : { ...s, timer };
    }

    case 'TIMER_PAUSE': {
      const timer = pauseTimer(s.timer, a.now);
      return timer === s.timer ? s : { ...s, timer };
    }

    case 'TIMER_RESET': {
      let seconds = s.timer.durationMs / 1000;
      if (s.phase === 'finalChallenge' && s.finalChallenge) seconds = s.finalChallenge.seconds[s.finalChallenge.activePlayer];
      else if (s.round) seconds = roundTimerSeconds(s, s.round);
      return { ...s, timer: createTimer(seconds) };
    }

    case 'TIMER_ADD': {
      if (s.timer.durationMs === 0 && s.phase !== 'finalChallenge') return s;
      const timer = addTime(s.timer, a.seconds, a.now);
      return timer === s.timer ? s : { ...s, timer };
    }

    case 'TIMER_EXPIRE': {
      const timer = expireIfDue(s.timer, a.now);
      if (timer === s.timer) return s;
      const next = withEvent({ ...s, timer }, 'timeUp');
      if (s.phase === 'finalChallenge' && s.finalChallenge?.phase === 'answering') return fcEndTurn(next, a.now, false);
      return next;
    }

    case 'MARK_RECORDED':
      if (s.recorded[a.which]) return s;
      return { ...s, recorded: { ...s.recorded, [a.which]: true } };

    default:
      return s;
  }
}
