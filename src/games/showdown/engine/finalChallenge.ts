import type { FcResponse, FinalChallengeState, GameState, PlayerIndex, Question } from '../types';
import { LIMITS } from './defaults';
import { gameWinner, withEvent } from './events';
import { matchAnswer } from './matching';
import { createTimer, pauseTimer, startTimer, timerRemaining } from './timer';

export type FcAction =
  | { type: 'FC_OPEN'; now: number }
  | { type: 'FC_START'; players: [string, string] }
  | { type: 'FC_BEGIN_TURN'; now: number }
  | { type: 'FC_SUBMIT'; text: string; now: number }
  | { type: 'FC_SKIP' }
  | { type: 'FC_REPEAT' }
  | { type: 'FC_END_TURN'; now: number }
  | { type: 'FC_READY_NEXT' }
  | { type: 'FC_SET_MATCH'; question: number; player: PlayerIndex; answerId: string | null }
  | { type: 'FC_SET_POINTS'; question: number; player: PlayerIndex; points: number | null }
  | { type: 'FC_CONFIRM'; question: number; confirmed: boolean }
  | { type: 'FC_BEGIN_REVEAL' }
  | { type: 'FC_REVEAL_NEXT' }
  | { type: 'FC_REVEAL_ALL' }
  | { type: 'FC_RESTART'; now: number }
  | { type: 'FC_EXIT'; now: number };

export function isFcAction(action: { type: string }): action is FcAction {
  return action.type.startsWith('FC_');
}

const emptyResponse = (): FcResponse => ({ text: '', matchId: null, autoMatched: false, pointsOverride: null, answered: false });

/** Rotates through the pool so a restarted challenge gets fresh questions when enough exist. */
export function selectFcQuestions(pool: readonly Question[], count: number, attempt: number): Question[] {
  if (pool.length === 0) return [];
  const n = Math.min(count, pool.length);
  const start = (attempt * n) % pool.length;
  return Array.from({ length: n }, (_, i) => pool[(start + i) % pool.length]);
}

export function canOpenFinalChallenge(s: GameState): boolean {
  return s.config.finalChallenge.enabled && s.pools.finalChallenge.length > 0;
}

export function createFinalChallenge(s: GameState, attempt: number, players: [string, string] = ['', '']): FinalChallengeState | null {
  const cfg = s.config.finalChallenge;
  const questions = selectFcQuestions(s.pools.finalChallenge, cfg.questionCount, attempt);
  if (questions.length === 0) return null;
  const winner = gameWinner(s);
  return {
    phase: 'setup',
    players,
    activePlayer: 0,
    team: winner === 'tie' ? null : winner,
    questions,
    responses: [questions.map(emptyResponse), questions.map(emptyResponse)],
    pending: [],
    current: null,
    confirmed: questions.map(() => false),
    revealStep: 0,
    targetScore: cfg.targetScore,
    duplicatePolicy: cfg.duplicatePolicy,
    seconds: [cfg.player1Seconds, cfg.player2Seconds],
    repeatSeq: 0,
  };
}

/* ---------------------------- scoring ---------------------------------- */

export function fcCellPoints(fc: FinalChallengeState, q: number, p: PlayerIndex): number {
  const response = fc.responses[p][q];
  if (!response) return 0;
  if (response.pointsOverride !== null) return response.pointsOverride;
  if (!response.matchId) return 0;
  if (p === 1 && fc.duplicatePolicy === 'secondScoresZero' && fc.responses[0][q]?.matchId === response.matchId) return 0;
  return fc.questions[q]?.answers.find((a) => a.id === response.matchId)?.points ?? 0;
}

export function fcCellRevealed(fc: FinalChallengeState, q: number, p: PlayerIndex): boolean {
  return fc.revealStep > p * fc.questions.length + q;
}

export function fcPlayerTotal(fc: FinalChallengeState, p: PlayerIndex, revealedOnly = false): number {
  return fc.questions.reduce((sum, _q, i) => (revealedOnly && !fcCellRevealed(fc, i, p) ? sum : sum + fcCellPoints(fc, i, p)), 0);
}

export function fcTotal(fc: FinalChallengeState, revealedOnly = false): number {
  return fcPlayerTotal(fc, 0, revealedOnly) + fcPlayerTotal(fc, 1, revealedOnly);
}

export function fcTotalCells(fc: FinalChallengeState): number {
  return fc.questions.length * 2;
}

/* ---------------------------- reducer ---------------------------------- */

function setFc(s: GameState, fc: FinalChallengeState): GameState {
  return { ...s, finalChallenge: fc };
}

/** Ends the active player's turn. `announce` is false when a timeUp event already fired. */
export function fcEndTurn(s: GameState, now: number, announce = true): GameState {
  const fc = s.finalChallenge;
  if (!fc || fc.phase !== 'answering') return s;
  const next = setFc(
    { ...s, timer: pauseTimer(s.timer, now) },
    { ...fc, phase: fc.activePlayer === 0 ? 'handoff' : 'review', current: null, pending: [] },
  );
  return announce ? withEvent(next, 'fcTurnEnd', { value: fc.activePlayer }) : next;
}

function completeReveal(s: GameState, fc: FinalChallengeState): GameState {
  const done: FinalChallengeState = { ...fc, revealStep: fcTotalCells(fc), phase: 'complete' };
  const total = fcTotal(done);
  return withEvent(setFc(s, done), total >= done.targetScore ? 'fcTargetReached' : 'fcComplete', { value: total });
}

function cleanPlayer(name: string, fallback: string): string {
  const trimmed = name.trim().slice(0, LIMITS.playerName);
  return trimmed || fallback;
}

export function fcReduce(s: GameState, a: FcAction): GameState {
  if (a.type === 'FC_OPEN') {
    if (s.phase !== 'gameOver' || !canOpenFinalChallenge(s)) return s;
    const fc = createFinalChallenge(s, s.fcAttempts);
    if (!fc) return s;
    return withEvent(
      { ...s, phase: 'finalChallenge', finalChallenge: fc, timer: createTimer(fc.seconds[0]), paused: false, recorded: { ...s.recorded, finalChallenge: false } },
      'fcOpen',
    );
  }

  const fc = s.finalChallenge;
  if (s.phase !== 'finalChallenge' || !fc) return s;

  switch (a.type) {
    case 'FC_START': {
      if (fc.phase !== 'setup') return s;
      const players: [string, string] = [cleanPlayer(a.players[0], 'Player 1'), cleanPlayer(a.players[1], 'Player 2')];
      return setFc({ ...s, timer: createTimer(fc.seconds[0]) }, { ...fc, players, phase: 'ready', activePlayer: 0 });
    }
    case 'FC_BEGIN_TURN': {
      if (fc.phase !== 'ready') return s;
      const pending = fc.questions.map((_, i) => i);
      const timer = startTimer(createTimer(fc.seconds[fc.activePlayer]), a.now);
      return withEvent(setFc({ ...s, timer, paused: false }, { ...fc, phase: 'answering', pending, current: pending[0] ?? null }), 'fcStart', {
        value: fc.activePlayer,
      });
    }
    case 'FC_SUBMIT': {
      if (fc.phase !== 'answering' || fc.current === null) return s;
      if (s.timer.durationMs > 0 && timerRemaining(s.timer, a.now) <= 0) return fcEndTurn(s, a.now);
      const text = a.text.trim().slice(0, LIMITS.answerText);
      if (!text) return s;
      const q = fc.current;
      const match = matchAnswer(fc.questions[q], text);
      const response: FcResponse = { text, matchId: match?.answerId ?? null, autoMatched: match !== null, pointsOverride: null, answered: true };
      const playerResponses = fc.responses[fc.activePlayer].map((r, i) => (i === q ? response : r));
      const responses: [FcResponse[], FcResponse[]] = fc.activePlayer === 0 ? [playerResponses, fc.responses[1]] : [fc.responses[0], playerResponses];
      const pending = fc.pending.filter((i) => i !== q);
      const updated: FinalChallengeState = { ...fc, responses, pending, current: pending[0] ?? null };
      const next = withEvent(setFc(s, updated), 'fcSubmit', { value: q });
      return pending.length === 0 ? fcEndTurn(next, a.now) : next;
    }
    case 'FC_SKIP': {
      if (fc.phase !== 'answering' || fc.current === null || fc.pending.length < 2) return s;
      const pending = [...fc.pending.filter((i) => i !== fc.current), fc.current];
      return setFc(s, { ...fc, pending, current: pending[0] });
    }
    case 'FC_REPEAT': {
      if (fc.phase !== 'answering') return s;
      return withEvent(setFc(s, { ...fc, repeatSeq: fc.repeatSeq + 1 }), 'fcRepeat');
    }
    case 'FC_END_TURN':
      return fcEndTurn(s, a.now);
    case 'FC_READY_NEXT': {
      if (fc.phase !== 'handoff') return s;
      return setFc({ ...s, timer: createTimer(fc.seconds[1]) }, { ...fc, phase: 'ready', activePlayer: 1 });
    }
    case 'FC_SET_MATCH': {
      if (fc.phase !== 'review' && fc.phase !== 'reveal') return s;
      const question = fc.questions[a.question];
      if (!question) return s;
      if (a.answerId !== null && !question.answers.some((x) => x.id === a.answerId)) return s;
      const responses: [FcResponse[], FcResponse[]] = [[...fc.responses[0]], [...fc.responses[1]]];
      responses[a.player][a.question] = { ...responses[a.player][a.question], matchId: a.answerId, autoMatched: false };
      return setFc(s, { ...fc, responses });
    }
    case 'FC_SET_POINTS': {
      if (fc.phase !== 'review' && fc.phase !== 'reveal') return s;
      if (!fc.questions[a.question]) return s;
      const points = a.points === null || !Number.isFinite(a.points) ? null : Math.min(LIMITS.maxPoints, Math.max(0, Math.round(a.points)));
      const responses: [FcResponse[], FcResponse[]] = [[...fc.responses[0]], [...fc.responses[1]]];
      responses[a.player][a.question] = { ...responses[a.player][a.question], pointsOverride: points };
      return setFc(s, { ...fc, responses });
    }
    case 'FC_CONFIRM': {
      if (fc.phase !== 'review' || !fc.questions[a.question]) return s;
      const confirmed = fc.confirmed.map((c, i) => (i === a.question ? a.confirmed : c));
      return setFc(s, { ...fc, confirmed });
    }
    case 'FC_BEGIN_REVEAL': {
      if (fc.phase !== 'review') return s;
      return setFc(s, { ...fc, phase: 'reveal', revealStep: 0, confirmed: fc.confirmed.map(() => true) });
    }
    case 'FC_REVEAL_NEXT': {
      if (fc.phase !== 'reveal') return s;
      const total = fcTotalCells(fc);
      const step = Math.min(total, fc.revealStep + 1);
      if (step >= total) return completeReveal(s, fc);
      const n = fc.questions.length;
      const cell = step - 1;
      const player: PlayerIndex = cell >= n ? 1 : 0;
      const points = fcCellPoints(fc, cell % n, player);
      return withEvent(setFc(s, { ...fc, revealStep: step }), 'fcCellReveal', { value: points });
    }
    case 'FC_REVEAL_ALL': {
      if (fc.phase !== 'reveal') return s;
      return completeReveal(s, fc);
    }
    case 'FC_RESTART': {
      const attempts = s.fcAttempts + 1;
      const fresh = createFinalChallenge(s, attempts, fc.players);
      if (!fresh) return s;
      return withEvent(
        { ...s, fcAttempts: attempts, finalChallenge: fresh, timer: createTimer(fresh.seconds[0]), recorded: { ...s.recorded, finalChallenge: false } },
        'fcOpen',
      );
    }
    case 'FC_EXIT': {
      const keep = fc.phase === 'complete' ? fc : null;
      return { ...s, phase: 'gameOver', finalChallenge: keep, timer: pauseTimer(s.timer, a.now) };
    }
    default:
      return s;
  }
}
