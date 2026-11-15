import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../core/lib/random';
import { LEVELS, type ClueQuestion } from '../../../core/questions/types';
import type { GameState } from '../types';
import { createGame, questionIds } from './createGame';
import { activeQuestion, canUseHelp, gameWinner, ladderHeight, openCount, reduceGame, rungs, type GameAction } from './game';
import { babeDefinition, isGameState, sanitizeRemoteAction } from './syncDefinition';

/** `perLevel` questions at each level, spread over `subjects` subjects. */
function bank(perLevel = 6, subjects = 3): ClueQuestion[] {
  return LEVELS.flatMap((level) =>
    Array.from({ length: perLevel }, (_, i) => ({ id: `q${level}-${i}`, type: 'clue' as const, category: `Subject ${i % subjects}`, level, prompt: `Question ${level}/${i}`, answer: `Answer ${level}/${i}`, reference: `Book ${level}:${i}` })),
  );
}

const BONUS: ClueQuestion = { id: 'bonus-1', type: 'clue', category: 'Bonus', level: 5, prompt: 'Bonus question', answer: 'Bonus answer' };

function newGame(input: Partial<Parameters<typeof createGame>[0]> = {}): GameState {
  const result = createGame({ questions: bank(), bonus: [BONUS], rng: mulberry32(3), now: 1, ...input });
  if (!result.ok) throw new Error(result.error);
  return result.game;
}

function run(state: GameState, ...actions: GameAction[]): GameState {
  let current: GameState | null = state;
  for (const action of actions) current = reduceGame(current, action);
  if (!current) throw new Error('game was cleared');
  return current;
}

/** The first open question on the team's board. */
function firstOpen(state: GameState, team: 0 | 1): { stage: number; slot: number } {
  for (const [stage, slots] of state.boards[team].stages.entries()) {
    const slot = slots.findIndex((s) => s.result === null);
    if (slot !== -1) return { stage, slot };
  }
  throw new Error('board is done');
}

/** Plays the next turn with the given result, declining Second Try. */
function turn(state: GameState, correct: boolean): GameState {
  let s = run(state, { type: 'PICK', ...firstOpen(state, state.turn) }, { type: 'JUDGE', correct });
  if (s.phase === 'missed') s = run(s, { type: 'SHOW_ANSWER' });
  return run(s, { type: 'CONTINUE' });
}

describe('createGame', () => {
  it('deals each team 2 questions per stage, from the right levels, with no question twice', () => {
    const g = newGame();
    expect(g.boards.map((b) => b.stages.map((s) => s.length))).toEqual([
      [2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2],
    ]);
    g.boards.forEach((b) => b.stages.forEach((stage, i) => stage.forEach((slot) => expect(slot.question.level).toBe(LEVELS[i]))));
    const ids = questionIds(g);
    expect(new Set(ids).size).toBe(ids.length);
    expect(g.spares.map((s) => s.length)).toEqual([2, 2, 2, 2, 2]);
    expect(ladderHeight(g)).toBe(11);
  });

  it('gives a team two different subjects at a stage when it can', () => {
    const g = newGame();
    g.boards.forEach((b) => b.stages.forEach((stage) => expect(stage[0].question.category).not.toBe(stage[1].question.category)));
  });

  it('plays the demo with one question per stage and no bonus', () => {
    const g = newGame({ perStage: 1, bonus: [] });
    expect(g.boards[0].stages.every((s) => s.length === 1)).toBe(true);
    expect(g.bonus).toBeNull();
    expect(ladderHeight(g)).toBe(5);
  });

  it('refuses a question set too small for the boards', () => {
    const result = createGame({ questions: bank(3), bonus: [] });
    expect(result.ok).toBe(false);
  });

  it('draws recently played questions last', () => {
    const avoid = new Set(bank().filter((q) => !q.id.endsWith('-5')).map((q) => q.id));
    const g = newGame({ avoidIds: avoid, perStage: 1 });
    // One fresh question per level exists, and the first board dealt gets it.
    expect(g.boards[0].stages.every((s) => !avoid.has(s[0].question.id))).toBe(true);
  });

  it('builds the same game from the same questions and seed', () => {
    expect(questionIds(newGame())).toEqual(questionIds(newGame()));
  });
});

describe('turns', () => {
  it('starts with team 1 picking, and alternates after every question', () => {
    let g = run(newGame(), { type: 'START' });
    expect(g.phase).toBe('pick');
    expect(g.turn).toBe(0);
    g = turn(g, true);
    expect(g.turn).toBe(1);
    g = turn(g, false);
    expect(g.turn).toBe(0);
  });

  it('climbs a rung for a right answer and costs nothing for a wrong one', () => {
    let g = run(newGame(), { type: 'START' });
    g = turn(g, true);
    g = turn(g, false);
    expect([rungs(g, 0), rungs(g, 1)]).toEqual([1, 0]);
    expect(openCount(g.boards[1])).toBe(9);
  });

  it('ignores a pick of a question already played, or out of range', () => {
    let g = run(newGame(), { type: 'START' });
    g = turn(g, true);
    g = turn(g, true);
    expect(run(g, { type: 'PICK', stage: 0, slot: 0 })).toBe(g);
    expect(run(g, { type: 'PICK', stage: 9, slot: 0 })).toBe(g);
    expect(run(g, { type: 'PICK', stage: 0, slot: 5 })).toBe(g);
  });

  it('lets one team finish its board when the other is done', () => {
    let g = run(newGame({ perStage: 1, bonus: [] }), { type: 'START' });
    for (let i = 0; i < 4; i += 1) g = turn(turn(g, true), true);
    g = turn(g, true); // team 1's last question
    expect(openCount(g.boards[0])).toBe(0);
    expect(g.turn).toBe(1);
    expect(g.phase).toBe('pick');
    g = turn(g, false);
    expect(g.phase).toBe('gameOver');
    expect(gameWinner(g)).toBe(0);
  });

  it('lets the host hand the turn over, but not to a team with nothing left', () => {
    const g = run(newGame(), { type: 'START' });
    expect(run(g, { type: 'SET_TURN', team: 1 }).turn).toBe(1);
    expect(run(g, { type: 'SET_TURN', team: 0 })).toBe(g);
  });
});

describe('helps', () => {
  it('Search the Scriptures starts the timer once per team', () => {
    let g = run(newGame(), { type: 'START' }, { type: 'PICK', stage: 0, slot: 0 });
    expect(canUseHelp(g, 'lookup')).toBe(true);
    g = run(g, { type: 'LOOKUP', at: 1000 });
    expect(g.active?.lookupUntil).toBe(61000);
    expect(g.helps[0].lookup).toBe(false);
    expect(run(g, { type: 'LOOKUP', at: 2000 })).toBe(g);
    g = run(g, { type: 'JUDGE', correct: true }, { type: 'CONTINUE' }, { type: 'PICK', stage: 0, slot: 0 });
    expect(canUseHelp(g, 'lookup')).toBe(true);
  });

  it('Swap trades the question for a spare at the same stage', () => {
    let g = run(newGame(), { type: 'START' }, { type: 'PICK', stage: 2, slot: 1 });
    const before = activeQuestion(g)!;
    const spare = g.spares[2][0];
    g = run(g, { type: 'SWAP' });
    expect(activeQuestion(g)?.id).toBe(spare.id);
    expect(activeQuestion(g)?.id).not.toBe(before.id);
    expect(activeQuestion(g)?.level).toBe(3);
    expect(g.spares[2]).toHaveLength(1);
    expect(g.helps[0].swap).toBe(false);
    expect(run(g, { type: 'SWAP' })).toBe(g);
  });

  it('Second Try gives one more answer after a miss', () => {
    let g = run(newGame(), { type: 'START' }, { type: 'PICK', stage: 0, slot: 0 }, { type: 'JUDGE', correct: false });
    expect(g.phase).toBe('missed');
    g = run(g, { type: 'SECOND_TRY' });
    expect(g.phase).toBe('question');
    expect(g.helps[0].secondTry).toBe(false);
    expect(g.active?.retry).toBe(true);
    // No swap on a second try, and a second miss goes straight to the answer.
    expect(canUseHelp(g, 'swap')).toBe(false);
    g = run(g, { type: 'JUDGE', correct: false });
    expect(g.phase).toBe('reveal');
    expect(g.boards[0].stages[0][0].result).toBe('wrong');
  });

  it('a miss goes straight to the answer once Second Try is used', () => {
    let g = run(newGame(), { type: 'START' }, { type: 'PICK', stage: 0, slot: 0 }, { type: 'JUDGE', correct: false }, { type: 'SECOND_TRY' }, { type: 'JUDGE', correct: true }, { type: 'CONTINUE' });
    g = turn(g, true);
    g = run(g, { type: 'PICK', ...firstOpen(g, 0) }, { type: 'JUDGE', correct: false });
    expect(g.phase).toBe('reveal');
  });

  it('declining Second Try keeps it for later', () => {
    const g = run(newGame(), { type: 'START' }, { type: 'PICK', stage: 0, slot: 0 }, { type: 'JUDGE', correct: false }, { type: 'SHOW_ANSWER' });
    expect(g.phase).toBe('reveal');
    expect(g.helps[0].secondTry).toBe(true);
  });
});

describe('bonus and the end', () => {
  function bothBoardsDone(): GameState {
    let g = run(newGame({ perStage: 1 }), { type: 'START' });
    for (let i = 0; i < 5; i += 1) g = turn(turn(g, true), i < 2);
    return g;
  }

  it('moves to the bonus round after both boards, and adds a rung for a right bonus answer', () => {
    let g = bothBoardsDone();
    expect(g.phase).toBe('bonusIntro');
    expect([rungs(g, 0), rungs(g, 1)]).toEqual([5, 2]);
    g = run(g, { type: 'BONUS_SHOW' }, { type: 'BONUS_REVEAL' });
    expect(run(g, { type: 'FINISH' })).toBe(g);
    g = run(g, { type: 'BONUS_JUDGE', team: 0, correct: false }, { type: 'BONUS_JUDGE', team: 1, correct: true }, { type: 'FINISH' });
    expect(g.phase).toBe('gameOver');
    expect([rungs(g, 0), rungs(g, 1)]).toEqual([5, 3]);
    expect(gameWinner(g)).toBe(0);
  });

  it('calls a tie a tie', () => {
    let g = run(newGame({ perStage: 1, bonus: [] }), { type: 'START' });
    for (let i = 0; i < 5; i += 1) g = turn(turn(g, true), true);
    expect(g.phase).toBe('gameOver');
    expect(gameWinner(g)).toBe('tie');
  });

  it('lets the host end the game from anywhere', () => {
    const g = run(newGame(), { type: 'START' }, { type: 'PICK', stage: 0, slot: 0 }, { type: 'END_GAME' });
    expect(g.phase).toBe('gameOver');
  });
});

describe('phones', () => {
  const dispatched: GameAction[] = [];
  const dispatch = (a: GameAction) => dispatched.push(a);

  it('accepts only well-formed phone requests', () => {
    expect(sanitizeRemoteAction({ type: 'PICK', team: 1, stage: 4, slot: 1 })).toEqual({ type: 'PICK', team: 1, stage: 4, slot: 1 });
    expect(sanitizeRemoteAction({ type: 'PICK', team: 1, stage: 5, slot: 0 })).toBeNull();
    expect(sanitizeRemoteAction({ type: 'HELP', team: 0, help: 'secondTry' })).toBeNull();
    expect(sanitizeRemoteAction({ type: 'JUDGE', team: 0 })).toBeNull();
    expect(sanitizeRemoteAction(null)).toBeNull();
  });

  it("acts only for the team whose turn it is", () => {
    const g = run(newGame(), { type: 'START' });
    dispatched.length = 0;
    babeDefinition.applyRemoteAction({ type: 'PICK', team: 1, stage: 0, slot: 0 }, g, dispatch, 5000);
    expect(dispatched).toEqual([]);
    babeDefinition.applyRemoteAction({ type: 'PICK', team: 0, stage: 0, slot: 0 }, g, dispatch, 5000);
    expect(dispatched).toEqual([{ type: 'PICK', stage: 0, slot: 0 }]);
  });

  it('uses a help from the phone only on that team’s question', () => {
    const g = run(newGame(), { type: 'START' }, { type: 'PICK', stage: 0, slot: 0 });
    dispatched.length = 0;
    babeDefinition.applyRemoteAction({ type: 'HELP', team: 1, help: 'swap' }, g, dispatch, 5000);
    expect(dispatched).toEqual([]);
    babeDefinition.applyRemoteAction({ type: 'HELP', team: 0, help: 'swap' }, g, dispatch, 5000);
    expect(dispatched).toEqual([{ type: 'SWAP' }]);
    babeDefinition.applyRemoteAction({ type: 'HELP', team: 0, help: 'lookup' }, g, dispatch, 5000);
    expect(dispatched[1]).toEqual({ type: 'LOOKUP', at: 5000 });
  });

  it('recognizes a saved game', () => {
    expect(isGameState(newGame())).toBe(true);
    expect(isGameState({ ...newGame(), boards: [] })).toBe(false);
    expect(isGameState(null)).toBe(false);
  });
});
