import type { ActiveClue, Board, GameEvent, GameEventKind, GameState, TeamIndex, Tile } from '../types';

/*
 * Theopardy!'s rules as one pure function. Screens and phones send actions;
 * the reducer returns the next state, or the same object when an action isn't
 * allowed right now (a late buzz, a tile that was already played).
 *
 * Flow of one clue:
 *   board      the team in control picks a tile            SELECT
 *   clue       the clue is shown and the buzzers open      BUZZ, or REVEAL when nobody knows
 *   answering  the team that buzzed answers                JUDGE right / wrong
 *              wrong costs nothing; the other team gets one chance at the same clue
 *   reveal     the answer is shown                         CONTINUE
 * A right answer scores the tile and gives that team control of the board.
 */

export type GameAction =
  | { type: 'NEW_GAME'; game: GameState }
  | { type: 'CLEAR_GAME' }
  | { type: 'START' }
  | { type: 'SELECT'; category: number; tile: number }
  | { type: 'BUZZ'; team: TeamIndex }
  | { type: 'JUDGE'; correct: boolean }
  /** Nobody buzzed (or the host calls time): show the answer, no points. */
  | { type: 'REVEAL' }
  | { type: 'CONTINUE' }
  | { type: 'NEXT_ROUND' }
  | { type: 'FINAL_SHOW_CLUE' }
  | { type: 'FINAL_REVEAL' }
  | { type: 'FINAL_JUDGE'; team: TeamIndex; correct: boolean }
  | { type: 'FINISH' }
  /** Host correction. The result never goes below zero. */
  | { type: 'ADJUST_SCORE'; team: TeamIndex; delta: number }
  | { type: 'SET_CONTROL'; team: TeamIndex };

export function otherTeam(team: TeamIndex): TeamIndex {
  return team === 0 ? 1 : 0;
}

function withEvent(state: GameState, kind: GameEventKind, extra: Omit<GameEvent, 'seq' | 'kind'> = {}): GameState {
  return { ...state, event: { seq: state.event.seq + 1, kind, ...extra } };
}

export function currentBoard(state: GameState): Board | null {
  return state.boards[state.round] ?? null;
}

export function activeTile(state: GameState): Tile | null {
  if (!state.active) return null;
  return currentBoard(state)?.categories[state.active.category]?.tiles[state.active.tile] ?? null;
}

export function tilesLeft(board: Board): number {
  return board.categories.reduce((n, c) => n + c.tiles.filter((t) => !t.done).length, 0);
}

export function isLastRound(state: GameState): boolean {
  return state.round >= state.boards.length - 1;
}

export function gameWinner(state: Pick<GameState, 'scores'>): TeamIndex | 'tie' {
  if (state.scores[0] === state.scores[1]) return 'tie';
  return state.scores[0] > state.scores[1] ? 0 : 1;
}

function addScore(scores: [number, number], team: TeamIndex, points: number): [number, number] {
  const next: [number, number] = [scores[0], scores[1]];
  next[team] = Math.max(0, next[team] + points);
  return next;
}

/** Marks the active tile as played and moves to the answer screen. */
function settle(state: GameState, winner: TeamIndex | null): GameState {
  const active = state.active;
  const board = currentBoard(state);
  if (!active || !board) return state;
  const tile = board.categories[active.category].tiles[active.tile];
  const boards = state.boards.map((b, r) =>
    r !== state.round
      ? b
      : {
          ...b,
          categories: b.categories.map((c, ci) =>
            ci !== active.category ? c : { ...c, tiles: c.tiles.map((t, ti) => (ti !== active.tile ? t : { ...t, done: true, wonBy: winner })) },
          ),
        },
  );
  const next: GameState = {
    ...state,
    boards,
    phase: 'reveal',
    active: { ...active, answering: null, winner },
    scores: winner === null ? state.scores : addScore(state.scores, winner, active.value),
    control: winner ?? state.control,
    played: [...state.played, { round: state.round, questionId: tile.clue.id, category: board.categories[active.category].name, value: active.value, team: winner }],
  };
  return winner === null ? withEvent(next, 'reveal') : withEvent(next, 'correct', { team: winner, value: active.value });
}

function reduceLive(state: GameState, action: Exclude<GameAction, { type: 'NEW_GAME' } | { type: 'CLEAR_GAME' }>): GameState {
  switch (action.type) {
    case 'START':
      return state.phase === 'intro' ? withEvent({ ...state, phase: 'board' }, 'start') : state;

    case 'SELECT': {
      if (state.phase !== 'board') return state;
      const tile = currentBoard(state)?.categories[action.category]?.tiles[action.tile];
      if (!tile || tile.done) return state;
      const value = tile.bonus ? tile.value * state.config.bonusMultiplier : tile.value;
      const active: ActiveClue = { category: action.category, tile: action.tile, value, bonus: tile.bonus, missed: [], answering: null, winner: null };
      return withEvent({ ...state, phase: 'clue', active }, tile.bonus ? 'bonus' : 'select', { value });
    }

    case 'BUZZ': {
      // First buzz wins: once a team is answering, later buzzes are ignored.
      if (state.phase !== 'clue' || !state.active || state.active.missed.includes(action.team)) return state;
      return withEvent({ ...state, phase: 'answering', active: { ...state.active, answering: action.team } }, 'buzz', { team: action.team });
    }

    case 'JUDGE': {
      const active = state.active;
      if (state.phase !== 'answering' || !active || active.answering === null) return state;
      const team = active.answering;
      if (action.correct) return settle(state, team);
      const missed = [...active.missed, team];
      const other = otherTeam(team);
      // A miss costs nothing. The other team gets one chance, then the answer is shown.
      if (missed.includes(other)) return settle({ ...state, active: { ...active, missed } }, null);
      return withEvent({ ...state, active: { ...active, missed, answering: other } }, 'wrong', { team });
    }

    case 'REVEAL':
      return state.phase === 'clue' || state.phase === 'answering' ? settle(state, null) : state;

    case 'CONTINUE': {
      if (state.phase !== 'reveal') return state;
      const board = currentBoard(state);
      if (board && tilesLeft(board) > 0) return { ...state, phase: 'board', active: null };
      return withEvent({ ...state, phase: 'roundOver', active: null }, 'roundOver');
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'roundOver') return state;
      if (!isLastRound(state)) {
        // The team that is behind picks first in the next round; on a tie, control stays where it is.
        const winner = gameWinner(state);
        const control = winner === 'tie' ? state.control : otherTeam(winner);
        return withEvent({ ...state, phase: 'board', round: state.round + 1, control }, 'start');
      }
      if (state.final) return withEvent({ ...state, phase: 'finalIntro' }, 'final');
      return withEvent({ ...state, phase: 'gameOver' }, 'gameOver');
    }

    case 'FINAL_SHOW_CLUE':
      return state.phase === 'finalIntro' ? withEvent({ ...state, phase: 'finalClue' }, 'select') : state;

    case 'FINAL_REVEAL':
      return state.phase === 'finalClue' ? withEvent({ ...state, phase: 'finalReveal' }, 'reveal') : state;

    case 'FINAL_JUDGE': {
      if (state.phase !== 'finalReveal' || !state.final) return state;
      const before = state.final.results[action.team];
      if (before === action.correct) return state;
      const results: [boolean | null, boolean | null] = [state.final.results[0], state.final.results[1]];
      results[action.team] = action.correct;
      // Changing a ruling takes back the points the earlier ruling gave.
      let scores = state.scores;
      if (before === true) scores = addScore(scores, action.team, -state.config.finalValue);
      if (action.correct) scores = addScore(scores, action.team, state.config.finalValue);
      const next = { ...state, scores, final: { ...state.final, results } };
      return action.correct ? withEvent(next, 'correct', { team: action.team, value: state.config.finalValue }) : withEvent(next, 'wrong', { team: action.team });
    }

    case 'FINISH': {
      if (state.phase === 'gameOver') return state;
      // The final round ends once both teams have been judged; the host can also end any game early.
      return withEvent({ ...state, phase: 'gameOver', active: null }, 'gameOver');
    }

    case 'ADJUST_SCORE': {
      if (!Number.isFinite(action.delta) || action.delta === 0) return state;
      return { ...state, scores: addScore(state.scores, action.team, Math.round(action.delta)) };
    }

    case 'SET_CONTROL':
      return state.phase === 'board' && state.control !== action.team ? { ...state, control: action.team } : state;

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
