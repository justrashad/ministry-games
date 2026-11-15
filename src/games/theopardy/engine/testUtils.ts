import { mulberry32 } from '../../../core/lib/random';
import { LEVELS, type ClueQuestion } from '../../../core/questions/types';
import type { GameState } from '../types';
import { createGame, type CreateGameInput } from './createGame';
import { reduceGame, type GameAction } from './game';

/** A bank of `categories` full categories with `perLevel` clues at each level. */
export function clueBank(categories: number, perLevel = 1): ClueQuestion[] {
  const out: ClueQuestion[] = [];
  for (let c = 0; c < categories; c += 1) {
    for (const level of LEVELS) {
      for (let n = 0; n < perLevel; n += 1) {
        out.push({ id: `c${c}-l${level}-${n}`, type: 'clue', category: `Category ${c}`, level, prompt: `Clue ${c}/${level}/${n}`, answer: `Answer ${c}/${level}/${n}` });
      }
    }
  }
  return out;
}

export function finalClue(id = 'final-1'): ClueQuestion {
  return { id, type: 'clue', category: 'Final', level: 5, prompt: 'Final clue', answer: 'Final answer' };
}

export function newGame(input: Partial<CreateGameInput> = {}): GameState {
  const result = createGame({ clues: clueBank(12), finals: [finalClue()], rng: mulberry32(7), now: 1, ...input });
  if (!result.ok) throw new Error(result.error);
  return result.game;
}

export function run(state: GameState, ...actions: GameAction[]): GameState {
  let current: GameState | null = state;
  for (const action of actions) current = reduceGame(current, action);
  if (!current) throw new Error('game was cleared');
  return current;
}

/** Plays one tile to the answer screen with the given team answering right. */
export function win(state: GameState, category: number, tile: number, team: 0 | 1): GameState {
  return run(state, { type: 'SELECT', category, tile }, { type: 'BUZZ', team }, { type: 'JUDGE', correct: true }, { type: 'CONTINUE' });
}

/** Plays every remaining tile of the current board with nobody answering. */
export function clearBoard(state: GameState): GameState {
  let current = state;
  const board = current.boards[current.round];
  board.categories.forEach((category, c) => {
    category.tiles.forEach((tile, t) => {
      if (!tile.done) current = run(current, { type: 'SELECT', category: c, tile: t }, { type: 'REVEAL' }, { type: 'CONTINUE' });
    });
  });
  return current;
}
