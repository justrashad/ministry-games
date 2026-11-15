import type { GameEvent, GameEventKind, GameState, Owner, Outcome, TeamIndex } from '../types';

/*
 * Kingdom Squares' rules as one pure function. Screens and phones send actions;
 * the reducer returns the next state, or the same object when an action isn't
 * allowed right now (a late call, a square that is already taken).
 *
 * One turn:
 *   pick      the team whose turn it is picks an open square        PICK
 *   question  the host reads the statement, the team calls it       ANSWER true / false
 *   reveal    the answer is shown and the square changes hands      CONTINUE
 * Turns always alternate. After CONTINUE the board is checked for a win.
 */

export type GameAction =
  | { type: 'NEW_GAME'; game: GameState }
  | { type: 'CLEAR_GAME' }
  | { type: 'START' }
  | { type: 'PICK'; square: number }
  | { type: 'ANSWER'; team: TeamIndex; answer: boolean }
  /** Host: draw a different statement for the same square (a repeat, or one the family wants to skip). */
  | { type: 'SKIP' }
  | { type: 'CONTINUE' }
  | { type: 'NEXT_GAME' }
  /** Host: end the match now. */
  | { type: 'FINISH' }
  /** Host correction of whose turn it is. */
  | { type: 'SET_TURN'; team: TeamIndex };

export const SQUARE_COUNT = 9;
export const SQUARES_TO_WIN = 5;

/** Every three in a row: rows, columns, diagonals. */
export const LINES: readonly (readonly number[])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function otherTeam(team: TeamIndex): TeamIndex {
  return team === 0 ? 1 : 0;
}

function withEvent(state: GameState, kind: GameEventKind, extra: Omit<GameEvent, 'seq' | 'kind'> = {}): GameState {
  return { ...state, event: { seq: state.event.seq + 1, kind, ...extra } };
}

export function emptyBoard(): Owner[] {
  return Array.from({ length: SQUARE_COUNT }, () => null);
}

export function squaresHeld(squares: readonly Owner[], team: TeamIndex): number {
  return squares.filter((owner) => owner === team).length;
}

/** The first three in a row the team holds, if any. */
export function lineFor(squares: readonly Owner[], team: TeamIndex): number[] | null {
  const line = LINES.find((l) => l.every((i) => squares[i] === team));
  return line ? [...line] : null;
}

/** The game's winner: three in a row, or five squares. */
export function boardWinner(squares: readonly Owner[]): { team: TeamIndex; line: number[] | null } | null {
  for (const team of [0, 1] as const) {
    const line = lineFor(squares, team);
    if (line) return { team, line };
  }
  for (const team of [0, 1] as const) {
    if (squaresHeld(squares, team) >= SQUARES_TO_WIN) return { team, line: null };
  }
  return null;
}

/** Whether taking this open square would win the game for the team. */
export function wouldWin(squares: readonly Owner[], square: number, team: TeamIndex): boolean {
  if (squares[square] !== null) return false;
  const after = squares.map((owner, i) => (i === square ? team : owner));
  return boardWinner(after)?.team === team;
}

export function matchWinner(state: Pick<GameState, 'wins'>): TeamIndex | 'tie' {
  if (state.wins[0] === state.wins[1]) return 'tie';
  return state.wins[0] > state.wins[1] ? 0 : 1;
}

export function matchDecided(state: Pick<GameState, 'wins' | 'config'>): boolean {
  return Math.max(state.wins[0], state.wins[1]) >= state.config.gamesToWin;
}

/** The statement the next draw will use. The deck starts over once every statement has been used. */
function draw(state: GameState): { question: GameState['deck'][number]; next: number } {
  return { question: state.deck[state.next % state.deck.length], next: state.next + 1 };
}

function reduceLive(state: GameState, action: Exclude<GameAction, { type: 'NEW_GAME' } | { type: 'CLEAR_GAME' }>): GameState {
  switch (action.type) {
    case 'START':
      return state.phase === 'intro' ? withEvent({ ...state, phase: 'pick' }, 'start', { team: state.turn }) : state;

    case 'PICK': {
      if (state.phase !== 'pick' || !Number.isInteger(action.square) || action.square < 0 || action.square >= SQUARE_COUNT) return state;
      if (state.squares[action.square] !== null || state.deck.length === 0) return state;
      const { question, next } = draw(state);
      return withEvent({ ...state, phase: 'question', next, active: { square: action.square, question, answer: null, outcome: null } }, 'pick', { team: state.turn, square: action.square });
    }

    case 'SKIP': {
      if (state.phase !== 'question' || !state.active) return state;
      const { question, next } = draw(state);
      return { ...state, next, active: { ...state.active, question } };
    }

    case 'ANSWER': {
      const active = state.active;
      if (state.phase !== 'question' || !active || action.team !== state.turn) return state;
      const team = state.turn;
      const other = otherTeam(team);
      const correct = action.answer === active.question.isTrue;
      let outcome: Outcome;
      if (correct) outcome = 'claimed';
      // A wrong call never hands the other team the win: the square stays open instead.
      else if (wouldWin(state.squares, active.square, other)) outcome = 'blocked';
      else outcome = 'given';
      const squares = outcome === 'blocked' ? state.squares : state.squares.map((owner, i) => (i === active.square ? (outcome === 'claimed' ? team : other) : owner));
      const next: GameState = {
        ...state,
        phase: 'reveal',
        squares,
        active: { ...active, answer: action.answer, outcome },
        played: [...state.played, { game: state.game, questionId: active.question.id, team, correct }],
      };
      return withEvent(next, correct ? 'correct' : outcome === 'blocked' ? 'blocked' : 'wrong', { team, square: active.square });
    }

    case 'CONTINUE': {
      if (state.phase !== 'reveal') return state;
      const result = boardWinner(state.squares);
      if (result) {
        const wins: [number, number] = [state.wins[0], state.wins[1]];
        wins[result.team] += 1;
        return withEvent({ ...state, phase: 'gameWon', active: null, wins, gameWinner: result.team, winLine: result.line }, 'gameWon', { team: result.team });
      }
      return { ...state, phase: 'pick', active: null, turn: otherTeam(state.turn) };
    }

    case 'NEXT_GAME': {
      if (state.phase !== 'gameWon') return state;
      if (matchDecided(state)) return withEvent({ ...state, phase: 'matchOver' }, 'matchOver');
      // The other team picks first in the next game.
      const starter = otherTeam(state.starter);
      return withEvent(
        { ...state, phase: 'pick', game: state.game + 1, squares: emptyBoard(), starter, turn: starter, active: null, gameWinner: null, winLine: null },
        'start',
        { team: starter },
      );
    }

    case 'FINISH':
      return state.phase === 'matchOver' ? state : withEvent({ ...state, phase: 'matchOver', active: null }, 'matchOver');

    case 'SET_TURN':
      return state.phase === 'pick' && state.turn !== action.team ? { ...state, turn: action.team } : state;

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
