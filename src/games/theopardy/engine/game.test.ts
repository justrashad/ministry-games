import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../core/lib/random';
import { createCodec } from '../../../core/sync/envelope';
import { createGame, fullCategories } from './createGame';
import { activeTile, currentBoard, gameWinner, reduceGame, tilesLeft } from './game';
import { isGameState, theopardyDefinition } from './syncDefinition';
import { clearBoard, clueBank, newGame, run, win } from './testUtils';

/** A tile that is not the bonus tile, so its value is easy to predict. */
function plainTile(state: ReturnType<typeof newGame>, level: number): { category: number; tile: number } {
  const board = currentBoard(state)!;
  const category = board.categories.findIndex((c) => !c.tiles[level - 1].bonus && !c.tiles[level - 1].done);
  return { category, tile: level - 1 };
}

function bonusTile(state: ReturnType<typeof newGame>): { category: number; tile: number } {
  const board = currentBoard(state)!;
  for (let c = 0; c < board.categories.length; c += 1) {
    const t = board.categories[c].tiles.findIndex((tile) => tile.bonus);
    if (t >= 0) return { category: c, tile: t };
  }
  throw new Error('no bonus tile');
}

describe('building a game', () => {
  it('builds two boards of six categories with five tiles each', () => {
    const game = newGame();
    expect(game.boards).toHaveLength(2);
    for (const board of game.boards) {
      expect(board.categories).toHaveLength(6);
      for (const category of board.categories) {
        expect(category.tiles.map((t) => t.clue.level)).toEqual([1, 2, 3, 4, 5]);
        expect(category.tiles.every((t) => t.clue.category === category.name)).toBe(true);
      }
    }
    expect(game.boards[0].categories[0].tiles.map((t) => t.value)).toEqual([100, 200, 300, 400, 500]);
    expect(game.boards[1].categories[0].tiles.map((t) => t.value)).toEqual([200, 400, 600, 800, 1000]);
  });

  it('never repeats a category or a clue across rounds', () => {
    const game = newGame();
    const names = game.boards.flatMap((b) => b.categories.map((c) => c.name));
    expect(new Set(names).size).toBe(names.length);
    const ids = game.boards.flatMap((b) => b.categories.flatMap((c) => c.tiles.map((t) => t.clue.id)));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain(game.final?.clue.id);
  });

  it('hides exactly one bonus tile per board, never on the easiest row', () => {
    for (let seed = 1; seed <= 25; seed += 1) {
      const game = newGame({ rng: mulberry32(seed) });
      for (const board of game.boards) {
        const bonus = board.categories.flatMap((c) => c.tiles.map((t, row) => ({ t, row }))).filter((x) => x.t.bonus);
        expect(bonus).toHaveLength(1);
        expect(bonus[0].row).toBeGreaterThan(0);
      }
    }
  });

  it('builds the same game from the same clues and seed', () => {
    const a = newGame({ rng: mulberry32(42) });
    const b = newGame({ rng: mulberry32(42) });
    expect({ ...a, id: '' }).toEqual({ ...b, id: '' });
  });

  it('ignores categories that are missing a level', () => {
    const clues = [...clueBank(4), { id: 'x', type: 'clue' as const, category: 'Thin', level: 1 as const, prompt: 'p', answer: 'a' }];
    expect([...fullCategories(clues).keys()]).not.toContain('Thin');
  });

  it('plays fewer rounds or smaller boards when the packs are small, and says so', () => {
    const oneRound = createGame({ clues: clueBank(8), rng: mulberry32(1) });
    expect(oneRound.ok && oneRound.game.boards).toHaveLength(1);
    expect(oneRound.ok && oneRound.warnings.join(' ')).toMatch(/not enough full categories for 2 rounds/);
    const small = createGame({ clues: clueBank(4), rng: mulberry32(1) });
    expect(small.ok && small.game.boards[0].categories).toHaveLength(4);
    const none = createGame({ clues: clueBank(2), rng: mulberry32(1) });
    expect(none.ok).toBe(false);
  });

  it('prefers clues that were not played recently', () => {
    const clues = clueBank(12, 2);
    const avoid = new Set(clues.filter((c) => c.id.endsWith('-0')).map((c) => c.id));
    const result = createGame({ clues, avoidIds: avoid, rng: mulberry32(3) });
    const ids = result.ok ? result.game.boards.flatMap((b) => b.categories.flatMap((c) => c.tiles.map((t) => t.clue.id))) : [];
    expect(ids.length).toBe(60);
    expect(ids.every((id) => id.endsWith('-1'))).toBe(true);
  });

  it('takes the final clue from the finals, or from a spare hard clue, or ends without one', () => {
    expect(newGame().final?.clue.id).toBe('final-1');
    const spare = createGame({ clues: clueBank(12, 2), rounds: 1, rng: mulberry32(5) });
    expect(spare.ok && spare.game.final?.clue.level).toBeGreaterThanOrEqual(4);
    const none = createGame({ clues: clueBank(6), rounds: 1, rng: mulberry32(5) });
    expect(none.ok && none.game.final).toBeNull();
    expect(none.ok && none.warnings.join(' ')).toMatch(/No clue was left over/);
  });
});

describe('playing a clue', () => {
  const started = run(newGame(), { type: 'START' });

  it('starts on the board with team 1 in control', () => {
    expect(started.phase).toBe('board');
    expect(started.control).toBe(0);
  });

  it('a right answer scores the tile and gives that team control', () => {
    const pick = plainTile(started, 3);
    const clue = run(started, { type: 'SELECT', ...pick });
    expect(clue.phase).toBe('clue');
    expect(activeTile(clue)?.clue.level).toBe(3);
    const buzzed = run(clue, { type: 'BUZZ', team: 1 });
    expect(buzzed.phase).toBe('answering');
    expect(buzzed.active?.answering).toBe(1);
    const right = run(buzzed, { type: 'JUDGE', correct: true });
    expect(right.phase).toBe('reveal');
    expect(right.scores).toEqual([0, 300]);
    expect(right.control).toBe(1);
    expect(right.active?.winner).toBe(1);
    const back = run(right, { type: 'CONTINUE' });
    expect(back.phase).toBe('board');
    expect(back.active).toBeNull();
    expect(currentBoard(back)!.categories[pick.category].tiles[pick.tile]).toMatchObject({ done: true, wonBy: 1 });
  });

  it('only the first buzz counts', () => {
    const pick = plainTile(started, 1);
    const buzzed = run(started, { type: 'SELECT', ...pick }, { type: 'BUZZ', team: 0 });
    expect(reduceGame(buzzed, { type: 'BUZZ', team: 1 })).toBe(buzzed);
    expect(buzzed.active?.answering).toBe(0);
  });

  it('ignores buzzes when no clue is open', () => {
    expect(reduceGame(started, { type: 'BUZZ', team: 0 })).toBe(started);
  });

  it('a wrong answer costs nothing and passes the clue to the other team', () => {
    const pick = plainTile(started, 4);
    const wrong = run(started, { type: 'SELECT', ...pick }, { type: 'BUZZ', team: 0 }, { type: 'JUDGE', correct: false });
    expect(wrong.scores).toEqual([0, 0]);
    expect(wrong.phase).toBe('answering');
    expect(wrong.active?.answering).toBe(1);
    expect(wrong.active?.missed).toEqual([0]);
    const steal = run(wrong, { type: 'JUDGE', correct: true });
    expect(steal.scores).toEqual([0, 400]);
    expect(steal.control).toBe(1);
  });

  it('when both teams miss, nobody scores and control stays put', () => {
    const pick = plainTile(started, 2);
    const missed = run(started, { type: 'SELECT', ...pick }, { type: 'BUZZ', team: 1 }, { type: 'JUDGE', correct: false }, { type: 'JUDGE', correct: false });
    expect(missed.phase).toBe('reveal');
    expect(missed.scores).toEqual([0, 0]);
    expect(missed.control).toBe(0);
    expect(missed.active?.winner).toBeNull();
    expect(missed.played.at(-1)).toMatchObject({ team: null, value: 200 });
  });

  it('the host can show the answer when nobody buzzes', () => {
    const pick = plainTile(started, 5);
    const shown = run(started, { type: 'SELECT', ...pick }, { type: 'REVEAL' });
    expect(shown.phase).toBe('reveal');
    expect(shown.scores).toEqual([0, 0]);
    expect(currentBoard(shown)!.categories[pick.category].tiles[pick.tile].done).toBe(true);
  });

  it('a played tile cannot be picked again', () => {
    const pick = plainTile(started, 1);
    const after = win(started, pick.category, pick.tile, 0);
    expect(reduceGame(after, { type: 'SELECT', ...pick })).toBe(after);
    expect(reduceGame(after, { type: 'SELECT', category: 99, tile: 0 })).toBe(after);
  });

  it('the bonus tile is worth double, with no wager', () => {
    const pick = bonusTile(started);
    const base = currentBoard(started)!.categories[pick.category].tiles[pick.tile].value;
    const clue = run(started, { type: 'SELECT', ...pick });
    expect(clue.event.kind).toBe('bonus');
    expect(clue.active?.value).toBe(base * 2);
    const right = run(clue, { type: 'BUZZ', team: 0 }, { type: 'JUDGE', correct: true });
    expect(right.scores).toEqual([base * 2, 0]);
  });

  it('bumps the event counter on every visible moment', () => {
    const pick = plainTile(started, 1);
    const a = run(started, { type: 'SELECT', ...pick });
    const b = run(a, { type: 'BUZZ', team: 0 });
    const c = run(b, { type: 'JUDGE', correct: true });
    expect([a.event.kind, b.event.kind, c.event.kind]).toEqual(['select', 'buzz', 'correct']);
    expect(c.event.seq).toBe(started.event.seq + 3);
  });
});

describe('rounds and the final', () => {
  it('moves to the second round when the board is cleared, with the trailing team picking first', () => {
    let game = run(newGame(), { type: 'START' });
    const pick = plainTile(game, 5);
    game = win(game, pick.category, pick.tile, 0);
    game = clearBoard(game);
    expect(tilesLeft(currentBoard(game)!)).toBe(0);
    expect(game.phase).toBe('roundOver');
    game = run(game, { type: 'NEXT_ROUND' });
    expect(game.phase).toBe('board');
    expect(game.round).toBe(1);
    expect(game.control).toBe(1);
    expect(currentBoard(game)!.multiplier).toBe(2);
  });

  it('plays the final round for a fixed score with nothing at risk', () => {
    let game = run(newGame({ rounds: 1 }), { type: 'START' });
    const pick = plainTile(game, 2);
    game = win(game, pick.category, pick.tile, 1);
    game = run(clearBoard(game), { type: 'NEXT_ROUND' });
    expect(game.phase).toBe('finalIntro');
    game = run(game, { type: 'FINAL_SHOW_CLUE' }, { type: 'FINAL_REVEAL' });
    expect(game.phase).toBe('finalReveal');
    game = run(game, { type: 'FINAL_JUDGE', team: 0, correct: true }, { type: 'FINAL_JUDGE', team: 1, correct: false });
    expect(game.scores).toEqual([1000, 200]);
    expect(game.final?.results).toEqual([true, false]);
    game = run(game, { type: 'FINISH' });
    expect(game.phase).toBe('gameOver');
    expect(gameWinner(game)).toBe(0);
  });

  it('lets the host change a final ruling without double counting', () => {
    let game = run(newGame({ rounds: 1 }), { type: 'START' });
    game = run(clearBoard(game), { type: 'NEXT_ROUND' }, { type: 'FINAL_SHOW_CLUE' }, { type: 'FINAL_REVEAL' });
    game = run(game, { type: 'FINAL_JUDGE', team: 0, correct: true }, { type: 'FINAL_JUDGE', team: 0, correct: true });
    expect(game.scores).toEqual([1000, 0]);
    game = run(game, { type: 'FINAL_JUDGE', team: 0, correct: false });
    expect(game.scores).toEqual([0, 0]);
  });

  it('ends after the last board when there is no final clue', () => {
    const result = createGame({ clues: clueBank(6), rounds: 1, rng: mulberry32(2) });
    if (!result.ok) throw new Error(result.error);
    const game = run(clearBoard(run(result.game, { type: 'START' })), { type: 'NEXT_ROUND' });
    expect(game.phase).toBe('gameOver');
    expect(gameWinner(game)).toBe('tie');
  });

  it('host corrections never push a score below zero', () => {
    const game = run(newGame(), { type: 'START' }, { type: 'ADJUST_SCORE', team: 0, delta: 300 }, { type: 'ADJUST_SCORE', team: 0, delta: -500 });
    expect(game.scores).toEqual([0, 0]);
  });
});

describe('sync', () => {
  it('accepts its own saved games and rejects other shapes', () => {
    expect(isGameState(newGame())).toBe(true);
    expect(isGameState({ schema: 1, id: 'x', phase: 'board', teams: [{}, {}], roundPlan: [], config: {}, event: {} })).toBe(false);
    expect(isGameState(null)).toBe(false);
  });

  it('lets phones send buzzes and nothing else', () => {
    const { sanitizeMessage } = createCodec(theopardyDefinition);
    expect(sanitizeMessage({ type: 'action', action: { type: 'BUZZ', team: 1 } })).toEqual({ type: 'action', action: { type: 'BUZZ', team: 1 } });
    expect(sanitizeMessage({ type: 'action', action: { type: 'BUZZ', team: 2 } })).toBeNull();
    expect(sanitizeMessage({ type: 'action', action: { type: 'JUDGE', correct: true } })).toBeNull();
    expect(sanitizeMessage({ type: 'action', action: { type: 'ADJUST_SCORE', team: 0, delta: 9999 } })).toBeNull();
  });

  it('a phone buzz reaches the reducer through the definition', () => {
    const open = run(newGame(), { type: 'START' }, { type: 'SELECT', category: 0, tile: 0 });
    let next = open;
    theopardyDefinition.applyRemoteAction({ type: 'BUZZ', team: 1 }, open, (action) => {
      next = reduceGame(next, action)!;
    }, 1);
    expect(next.active?.answering).toBe(1);
  });

  it('a new game replaces the old one and clearing removes it', () => {
    const a = newGame();
    const b = newGame({ rng: mulberry32(9) });
    expect(reduceGame(a, { type: 'NEW_GAME', game: b })).toBe(b);
    expect(reduceGame(a, { type: 'CLEAR_GAME' })).toBeNull();
    expect(reduceGame(null, { type: 'START' })).toBeNull();
  });
});
