import type { GameState, Question, QuestionSet, Settings } from '../types';
import { DEFAULT_SETTINGS, sanitizeSettings } from './defaults';
import { createGame } from './createGame';
import { reduceGame, type GameAction } from './game';
import { mulberry32 } from './random';

export function makeQuestion(id: string, points: number[], extra: Partial<Question> = {}): Question {
  return {
    id,
    category: 'Test',
    question: `Question ${id}`,
    answers: points.map((p, i) => ({ id: `${id}-a${i + 1}`, text: `Answer ${i + 1}`, points: p })),
    ...extra,
  };
}

export function makeSet(questions: Question[]): QuestionSet {
  return { id: 'set-test', name: 'Test Set', questions, createdAt: 0, updatedAt: 0 };
}

export function makeSettings(patch: (s: Settings) => Settings = (s) => s): Settings {
  const base = sanitizeSettings(DEFAULT_SETTINGS);
  return patch({ ...base, questions: { ...base.questions, order: 'inOrder' } });
}

export function startGame(questions: Question[], settings = makeSettings()): GameState {
  const result = createGame({ settings, set: makeSet(questions), rng: mulberry32(7), now: 1000, id: 'game-test' });
  if (!result.ok) throw new Error(result.error);
  return result.game;
}

export function run(state: GameState, ...actions: GameAction[]): GameState {
  let s: GameState | null = state;
  for (const action of actions) s = reduceGame(s, action);
  if (!s) throw new Error('game cleared');
  return s;
}

/** Moves a fresh game into the first round with the question visible. */
export function toPlaying(state: GameState): GameState {
  return run(state, { type: 'NEXT_ROUND', now: 1000 }, { type: 'SHOW_QUESTION' });
}
