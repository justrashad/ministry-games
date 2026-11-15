import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../core/lib/random';
import type { TrueFalseQuestion } from '../../../core/questions/types';
import { createCodec } from '../../../core/sync/envelope';
import type { GameState, Owner } from '../types';
import { createGame } from './createGame';
import { boardWinner, lineFor, matchWinner, reduceGame, wouldWin, type GameAction } from './game';
import { isGameState, squaresDefinition } from './syncDefinition';

function statements(n: number): TrueFalseQuestion[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `s${i}`,
    type: 'truefalse' as const,
    category: 'Test',
    level: 1 as const,
    statement: `Statement ${i}`,
    isTrue: i % 2 === 0,
    ...(i % 2 === 0 ? {} : { correction: `Correction ${i}` }),
  }));
}

function newMatch(gamesToWin = 2, n = 30): GameState {
  const result = createGame({ statements: statements(n), gamesToWin, rng: mulberry32(5), now: 1 });
  if (!result.ok) throw new Error(result.error);
  return result.game;
}

function run(state: GameState, ...actions: GameAction[]): GameState {
  let current: GameState | null = state;
  for (const action of actions) current = reduceGame(current, action);
  if (!current) throw new Error('match was cleared');
  return current;
}

/** Picks a square and makes the right (or wrong) call for whatever statement comes up. */
function play(state: GameState, square: number, right: boolean): GameState {
  const picked = run(state, { type: 'PICK', square });
  const truth = picked.active!.question.isTrue;
  return run(picked, { type: 'ANSWER', team: picked.turn, answer: right ? truth : !truth }, { type: 'CONTINUE' });
}

const board = (cells: string): Owner[] => [...cells].map((c) => (c === '1' ? 0 : c === '2' ? 1 : null));

describe('board rules', () => {
  it('finds three in a row in rows, columns and diagonals', () => {
    expect(lineFor(board('111......'), 0)).toEqual([0, 1, 2]);
    expect(lineFor(board('2..2..2..'), 1)).toEqual([0, 3, 6]);
    expect(lineFor(board('..1.1.1..'), 0)).toEqual([2, 4, 6]);
    expect(lineFor(board('11.......'), 0)).toBeNull();
  });

  it('a team wins with three in a row or with any five squares', () => {
    expect(boardWinner(board('222......'))).toEqual({ team: 1, line: [0, 1, 2] });
    expect(boardWinner(board('11.2.1.21'))).toBeNull();
    const noLine = board('112221112');
    expect(lineFor(noLine, 0)).toBeNull();
    expect(lineFor(noLine, 1)).toBeNull();
    expect(boardWinner(noLine)).toEqual({ team: 0, line: null });
  });

  it('knows when one more square would win', () => {
    expect(wouldWin(board('11.......'), 2, 0)).toBe(true);
    expect(wouldWin(board('11.......'), 2, 1)).toBe(false);
    expect(wouldWin(board('1.2212.1.'), 8, 0)).toBe(true);
    expect(wouldWin(board('1.2212.1.'), 6, 0)).toBe(false);
    expect(wouldWin(board('11.......'), 0, 0)).toBe(false);
  });
});

describe('a turn', () => {
  const started = run(newMatch(), { type: 'START' });

  it('starts with team 1 picking', () => {
    expect(started.phase).toBe('pick');
    expect(started.turn).toBe(0);
  });

  it('a right call claims the square and passes the turn', () => {
    const picked = run(started, { type: 'PICK', square: 4 });
    expect(picked.phase).toBe('question');
    expect(picked.active?.square).toBe(4);
    const called = run(picked, { type: 'ANSWER', team: 0, answer: picked.active!.question.isTrue });
    expect(called.phase).toBe('reveal');
    expect(called.squares[4]).toBe(0);
    expect(called.active?.outcome).toBe('claimed');
    expect(called.event.kind).toBe('correct');
    const next = run(called, { type: 'CONTINUE' });
    expect(next.phase).toBe('pick');
    expect(next.turn).toBe(1);
    expect(next.active).toBeNull();
  });

  it('a wrong call gives the square to the other team', () => {
    const picked = run(started, { type: 'PICK', square: 0 });
    const called = run(picked, { type: 'ANSWER', team: 0, answer: !picked.active!.question.isTrue });
    expect(called.squares[0]).toBe(1);
    expect(called.active?.outcome).toBe('given');
    expect(called.event.kind).toBe('wrong');
    expect(called.played.at(-1)).toMatchObject({ team: 0, correct: false });
  });

  it('a wrong call never hands the other team the win; the square stays open', () => {
    const twoInARow = { ...started, squares: board('22.......'), turn: 0 as const };
    const picked = run(twoInARow, { type: 'PICK', square: 2 });
    const called = run(picked, { type: 'ANSWER', team: 0, answer: !picked.active!.question.isTrue });
    expect(called.squares[2]).toBeNull();
    expect(called.active?.outcome).toBe('blocked');
    expect(called.event.kind).toBe('blocked');
    const next = run(called, { type: 'CONTINUE' });
    expect(next.phase).toBe('pick');
    expect(next.turn).toBe(1);
  });

  it('the blocked rule also covers a fifth square', () => {
    const fourSquares = { ...started, squares: board('12.212..2'), turn: 0 as const };
    expect(lineFor(fourSquares.squares, 1)).toBeNull();
    expect(lineFor(fourSquares.squares.map((o, i) => (i === 7 ? 1 : o)), 1)).toBeNull();
    const picked = run(fourSquares, { type: 'PICK', square: 7 });
    const called = run(picked, { type: 'ANSWER', team: 0, answer: !picked.active!.question.isTrue });
    expect(called.active?.outcome).toBe('blocked');
  });

  it('ignores a taken square, a square off the board, and a call from the wrong team', () => {
    const taken = { ...started, squares: board('1........') };
    expect(reduceGame(taken, { type: 'PICK', square: 0 })).toBe(taken);
    expect(reduceGame(started, { type: 'PICK', square: 9 })).toBe(started);
    expect(reduceGame(started, { type: 'PICK', square: 1.5 })).toBe(started);
    const picked = run(started, { type: 'PICK', square: 3 });
    expect(reduceGame(picked, { type: 'ANSWER', team: 1, answer: true })).toBe(picked);
    expect(reduceGame(started, { type: 'ANSWER', team: 0, answer: true })).toBe(started);
  });

  it('the host can draw a different statement for the same square', () => {
    const picked = run(started, { type: 'PICK', square: 5 });
    const skipped = run(picked, { type: 'SKIP' });
    expect(skipped.active?.square).toBe(5);
    expect(skipped.active?.question.id).not.toBe(picked.active?.question.id);
    expect(skipped.next).toBe(picked.next + 1);
  });

  it('draws each statement once, then starts the deck over', () => {
    let state = run(newMatch(2, 9), { type: 'START' });
    const seen: string[] = [];
    for (let i = 0; i < 10; i += 1) {
      state = run(state, { type: 'PICK', square: state.squares.findIndex((s) => s === null) });
      seen.push(state.active!.question.id);
      state = run(state, { type: 'SKIP' });
      seen.push(state.active!.question.id);
      state = { ...state, phase: 'pick', active: null };
    }
    expect(new Set(seen.slice(0, 9)).size).toBe(9);
    expect(seen[9]).toBe(seen[0]);
  });
});

describe('games and the match', () => {
  it('three in a row wins the game, and the match goes on until a team has enough wins', () => {
    let state = run(newMatch(2), { type: 'START' });
    state = play(state, 0, true); // team 1 claims 0
    state = play(state, 3, true); // team 2 claims 3
    state = play(state, 1, true); // team 1 claims 1
    state = play(state, 4, true); // team 2 claims 4
    state = play(state, 2, true); // team 1 claims 2: top row
    expect(state.phase).toBe('gameWon');
    expect(state.gameWinner).toBe(0);
    expect(state.winLine).toEqual([0, 1, 2]);
    expect(state.wins).toEqual([1, 0]);

    state = run(state, { type: 'NEXT_GAME' });
    expect(state.phase).toBe('pick');
    expect(state.game).toBe(1);
    expect(state.squares.every((s) => s === null)).toBe(true);
    expect(state.turn).toBe(1);
    expect(state.starter).toBe(1);
  });

  it('a team that reaches the number of wins takes the match', () => {
    let state = run(newMatch(1), { type: 'START' });
    for (const square of [0, 3, 1, 4, 2]) state = play(state, square, true);
    expect(state.phase).toBe('gameWon');
    state = run(state, { type: 'NEXT_GAME' });
    expect(state.phase).toBe('matchOver');
    expect(matchWinner(state)).toBe(0);
  });

  it('five squares win when nobody has three in a row', () => {
    let state = run(newMatch(1), { type: 'START' });
    state = { ...state, squares: board('1.2221112'), turn: 0 };
    expect(boardWinner(state.squares)).toBeNull();
    state = play(state, 1, true);
    expect(state.phase).toBe('gameWon');
    expect(state.gameWinner).toBe(0);
    expect(state.winLine).toBeNull();
  });

  it('the host can end the match early, and a tie is reported as one', () => {
    const state = run(newMatch(), { type: 'START' }, { type: 'FINISH' });
    expect(state.phase).toBe('matchOver');
    expect(matchWinner(state)).toBe('tie');
  });

  it('only changes whose turn it is between turns', () => {
    const state = run(newMatch(), { type: 'START' }, { type: 'SET_TURN', team: 1 });
    expect(state.turn).toBe(1);
    const picked = run(state, { type: 'PICK', square: 0 });
    expect(reduceGame(picked, { type: 'SET_TURN', team: 0 })).toBe(picked);
  });
});

describe('building a match', () => {
  it('needs nine usable statements and ignores duplicates and other question types', () => {
    expect(createGame({ statements: statements(8) }).ok).toBe(false);
    const dupes = [...statements(9), ...statements(9)];
    expect(createGame({ statements: dupes }).ok).toBe(true);
    const clue = { id: 'c', type: 'clue', category: 'x', level: 1, prompt: 'p', answer: 'a' } as unknown as TrueFalseQuestion;
    expect(createGame({ statements: [...statements(8), clue] }).ok).toBe(false);
  });

  it('puts recently played statements at the back of the deck', () => {
    const all = statements(20);
    const avoid = new Set(all.slice(0, 10).map((q) => q.id));
    const result = createGame({ statements: all, avoidIds: avoid, rng: mulberry32(3) });
    if (!result.ok) throw new Error(result.error);
    expect(result.game.deck.slice(0, 10).every((q) => !avoid.has(q.id))).toBe(true);
    expect(result.game.deck.slice(10).every((q) => avoid.has(q.id))).toBe(true);
  });

  it('keeps the number of wins between 1 and 3', () => {
    expect(newMatch(9).config.gamesToWin).toBe(3);
    expect(newMatch(0).config.gamesToWin).toBe(1);
  });
});

describe('sync', () => {
  const started = run(newMatch(), { type: 'START' });

  it('accepts its own saved matches and rejects other games', () => {
    expect(isGameState(started)).toBe(true);
    expect(isGameState({ schema: 1, id: 'x', phase: 'board', boards: [{}], scores: [0, 0], config: {}, event: {} })).toBe(false);
  });

  it('lets phones send a true or false call and nothing else', () => {
    const { sanitizeMessage } = createCodec(squaresDefinition);
    expect(sanitizeMessage({ type: 'action', action: { type: 'ANSWER', team: 1, answer: false, square: 4 } })).toEqual({ type: 'action', action: { type: 'ANSWER', team: 1, answer: false, square: 4 } });
    expect(sanitizeMessage({ type: 'action', action: { type: 'ANSWER', team: 1, answer: 'false', square: 4 } })).toBeNull();
    expect(sanitizeMessage({ type: 'action', action: { type: 'ANSWER', team: 1, answer: true, square: 9 } })).toBeNull();
    expect(sanitizeMessage({ type: 'action', action: { type: 'PICK', square: 4 } })).toBeNull();
    expect(sanitizeMessage({ type: 'action', action: { type: 'FINISH' } })).toBeNull();
  });

  it('a phone call counts only for the team in turn and the square in play', () => {
    const picked = run(started, { type: 'PICK', square: 6 });
    const apply = (action: Parameters<typeof squaresDefinition.applyRemoteAction>[0]) => {
      let next = picked;
      squaresDefinition.applyRemoteAction(action, picked, (a) => {
        next = reduceGame(next, a)!;
      }, 1);
      return next;
    };
    expect(apply({ type: 'ANSWER', team: 1, answer: true, square: 6 })).toBe(picked);
    expect(apply({ type: 'ANSWER', team: 0, answer: true, square: 2 })).toBe(picked);
    expect(apply({ type: 'ANSWER', team: 0, answer: true, square: 6 }).phase).toBe('reveal');
  });
});
