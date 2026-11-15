import type { ClueQuestion } from '../../../core/questions/types';
import type { Board, GameEvent, GameEventKind, GameState, HelpName, StageIndex, TeamIndex } from '../types';

/*
 * The game's rules as one pure function. Screens and phones send actions; the
 * reducer returns the next state, or the same object when an action isn't allowed
 * right now (a late tap, a help already used, a question already played).
 *
 * One turn:
 *   pick      the team picks an open question on its board          PICK
 *   question  the host reads it; helps can be used                  LOOKUP, SWAP
 *             the host marks the answer                             JUDGE
 *   missed    wrong, and Second Try is left: use it or show answer  SECOND_TRY, SHOW_ANSWER
 *   reveal    the answer is on screen                               CONTINUE
 * Turns alternate. A team whose board is done sits out while the other finishes.
 * After both boards, the bonus question, then the winner.
 */

export type GameAction =
  | { type: 'NEW_GAME'; game: GameState }
  | { type: 'CLEAR_GAME' }
  | { type: 'START' }
  | { type: 'PICK'; stage: number; slot: number }
  /** Search the Scriptures. `at` is the time the help was used, in ms since 1970. */
  | { type: 'LOOKUP'; at: number }
  | { type: 'SWAP' }
  | { type: 'JUDGE'; correct: boolean }
  | { type: 'SECOND_TRY' }
  | { type: 'SHOW_ANSWER' }
  | { type: 'CONTINUE' }
  | { type: 'BONUS_SHOW' }
  | { type: 'BONUS_REVEAL' }
  | { type: 'BONUS_JUDGE'; team: TeamIndex; correct: boolean }
  /** Host: show the winner once both bonus answers are marked. */
  | { type: 'FINISH' }
  /** Host: end the game now, from anywhere. */
  | { type: 'END_GAME' }
  /** Host correction of whose turn it is. */
  | { type: 'SET_TURN'; team: TeamIndex };

export function otherTeam(team: TeamIndex): TeamIndex {
  return team === 0 ? 1 : 0;
}

function withEvent(state: GameState, kind: GameEventKind, team?: TeamIndex): GameState {
  const event: GameEvent = team === undefined ? { seq: state.event.seq + 1, kind } : { seq: state.event.seq + 1, kind, team };
  return { ...state, event };
}

export function openCount(board: Board): number {
  return board.stages.reduce((n, stage) => n + stage.filter((slot) => slot.result === null).length, 0);
}

export function rightCount(board: Board): number {
  return board.stages.reduce((n, stage) => n + stage.filter((slot) => slot.result === 'right').length, 0);
}

/** Rungs climbed: right answers on the board, plus the bonus question. */
export function rungs(state: Pick<GameState, 'boards' | 'bonus'>, team: TeamIndex): number {
  return rightCount(state.boards[team]) + (state.bonus?.results[team] === true ? 1 : 0);
}

/** Rungs on a full ladder: every board question plus the bonus question, when there is one. */
export function ladderHeight(state: Pick<GameState, 'boards' | 'bonus'>): number {
  return state.boards[0].stages.reduce((n, stage) => n + stage.length, 0) + (state.bonus ? 1 : 0);
}

export function gameWinner(state: Pick<GameState, 'boards' | 'bonus'>): TeamIndex | 'tie' {
  const a = rungs(state, 0);
  const b = rungs(state, 1);
  if (a === b) return 'tie';
  return a > b ? 0 : 1;
}

/** The question in play, if any. */
export function activeQuestion(state: GameState): ClueQuestion | null {
  const a = state.active;
  if (!a) return null;
  return state.boards[a.team].stages[a.stage]?.[a.slot]?.question ?? null;
}

export function canUseHelp(state: GameState, help: HelpName): boolean {
  const a = state.active;
  if (state.phase !== 'question' || !a || !state.helps[a.team][help]) return false;
  if (help === 'swap') return !a.retry && (state.spares[a.stage]?.length ?? 0) > 0;
  if (help === 'lookup') return a.lookupUntil === null;
  return false;
}

function setResult(state: GameState, result: 'right' | 'wrong'): GameState {
  const a = state.active!;
  const boards: [Board, Board] = [state.boards[0], state.boards[1]];
  boards[a.team] = {
    stages: state.boards[a.team].stages.map((stage, s) => (s === a.stage ? stage.map((slot, i) => (i === a.slot ? { ...slot, result } : slot)) : stage)),
  };
  return { ...state, boards, phase: 'reveal', active: { ...a, result } };
}

function afterTurn(state: GameState): GameState {
  const other = otherTeam(state.turn);
  if (openCount(state.boards[other]) > 0) return { ...state, phase: 'pick', active: null, turn: other };
  if (openCount(state.boards[state.turn]) > 0) return { ...state, phase: 'pick', active: null };
  if (state.bonus) return withEvent({ ...state, phase: 'bonusIntro', active: null }, 'bonus');
  return withEvent({ ...state, phase: 'gameOver', active: null }, 'gameOver');
}

function reduceLive(state: GameState, action: Exclude<GameAction, { type: 'NEW_GAME' } | { type: 'CLEAR_GAME' }>): GameState {
  switch (action.type) {
    case 'START':
      return state.phase === 'intro' ? withEvent({ ...state, phase: 'pick' }, 'start', state.turn) : state;

    case 'PICK': {
      if (state.phase !== 'pick') return state;
      const slot = state.boards[state.turn].stages[action.stage]?.[action.slot];
      if (!slot || slot.result !== null) return state;
      return withEvent(
        { ...state, phase: 'question', active: { team: state.turn, stage: action.stage as StageIndex, slot: action.slot, lookupUntil: null, retry: false, result: null } },
        'pick',
        state.turn,
      );
    }

    case 'LOOKUP': {
      if (!canUseHelp(state, 'lookup') || !Number.isFinite(action.at)) return state;
      const a = state.active!;
      const helps: GameState['helps'] = [state.helps[0], state.helps[1]];
      helps[a.team] = { ...helps[a.team], lookup: false };
      return withEvent({ ...state, helps, active: { ...a, lookupUntil: action.at + state.config.lookupSeconds * 1000 } }, 'lookup', a.team);
    }

    case 'SWAP': {
      if (!canUseHelp(state, 'swap')) return state;
      const a = state.active!;
      const [fresh, ...rest] = state.spares[a.stage];
      const spares = state.spares.map((list, s) => (s === a.stage ? rest : list));
      const boards: [Board, Board] = [state.boards[0], state.boards[1]];
      boards[a.team] = {
        stages: state.boards[a.team].stages.map((stage, s) => (s === a.stage ? stage.map((slot, i) => (i === a.slot ? { question: fresh, result: null } : slot)) : stage)),
      };
      const helps: GameState['helps'] = [state.helps[0], state.helps[1]];
      helps[a.team] = { ...helps[a.team], swap: false };
      // A swapped-in question starts fresh: no timer running on it.
      return withEvent({ ...state, boards, spares, helps, active: { ...a, lookupUntil: null } }, 'swap', a.team);
    }

    case 'JUDGE': {
      if (state.phase !== 'question' || !state.active) return state;
      const team = state.active.team;
      if (action.correct) return withEvent(setResult(state, 'right'), 'right', team);
      if (state.helps[team].secondTry && !state.active.retry) return withEvent({ ...state, phase: 'missed' }, 'wrong', team);
      return withEvent(setResult(state, 'wrong'), 'wrong', team);
    }

    case 'SECOND_TRY': {
      if (state.phase !== 'missed' || !state.active || !state.helps[state.active.team].secondTry) return state;
      const team = state.active.team;
      const helps: GameState['helps'] = [state.helps[0], state.helps[1]];
      helps[team] = { ...helps[team], secondTry: false };
      return withEvent({ ...state, helps, phase: 'question', active: { ...state.active, retry: true } }, 'secondTry', team);
    }

    case 'SHOW_ANSWER':
      return state.phase === 'missed' && state.active ? setResult(state, 'wrong') : state;

    case 'CONTINUE':
      return state.phase === 'reveal' ? afterTurn(state) : state;

    case 'BONUS_SHOW':
      return state.phase === 'bonusIntro' ? { ...state, phase: 'bonusQuestion' } : state;

    case 'BONUS_REVEAL':
      return state.phase === 'bonusQuestion' ? { ...state, phase: 'bonusReveal' } : state;

    case 'BONUS_JUDGE': {
      if (state.phase !== 'bonusReveal' || !state.bonus) return state;
      const results: [boolean | null, boolean | null] = [state.bonus.results[0], state.bonus.results[1]];
      results[action.team] = action.correct;
      return { ...state, bonus: { ...state.bonus, results } };
    }

    case 'FINISH':
      if (state.phase !== 'bonusReveal' || state.bonus?.results.includes(null)) return state;
      return withEvent({ ...state, phase: 'gameOver', active: null }, 'gameOver');

    case 'END_GAME':
      return state.phase === 'gameOver' ? state : withEvent({ ...state, phase: 'gameOver', active: null }, 'gameOver');

    case 'SET_TURN':
      return state.phase === 'pick' && state.turn !== action.team && openCount(state.boards[action.team]) > 0 ? { ...state, turn: action.team } : state;

    default:
      return state;
  }
}

export function reduceGame(state: GameState | null, action: GameAction): GameState | null {
  if (action.type === 'NEW_GAME') return action.game;
  if (action.type === 'CLEAR_GAME') return null;
  if (!state) return state;
  return reduceLive(state, action);
}
