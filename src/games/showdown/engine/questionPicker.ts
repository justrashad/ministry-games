import type { Question } from '../types';
import { shuffle } from './random';

export type QuestionOrder = 'inOrder' | 'shuffle';

export function orderQuestions(questions: readonly Question[], order: QuestionOrder, rng: () => number = Math.random): Question[] {
  return order === 'shuffle' ? shuffle(questions, rng) : [...questions];
}

export interface QuestionPools {
  regular: Question[];
  final: Question[];
}

/**
 * Picks the next question for a round. Final rounds prefer final-round questions,
 * regular rounds prefer regular ones, and each falls back to the other pool.
 * With avoidRepeats off, exhausted pools recycle from the start.
 */
export function pickNextQuestion(
  pools: QuestionPools,
  usedIds: readonly string[],
  isFinal: boolean,
  avoidRepeats: boolean,
  currentId?: string,
): Question | null {
  const used = new Set(usedIds);
  const primary = isFinal ? pools.final : pools.regular;
  const secondary = isFinal ? pools.regular : pools.final;
  const fresh = primary.find((q) => !used.has(q.id)) ?? secondary.find((q) => !used.has(q.id));
  if (fresh) return fresh;
  if (avoidRepeats) return null;
  const recyclePool = primary.length > 0 ? primary : secondary;
  if (recyclePool.length === 0) return null;
  const offset = usedIds.length % recyclePool.length;
  for (let i = 0; i < recyclePool.length; i += 1) {
    const candidate = recyclePool[(offset + i) % recyclePool.length];
    if (candidate.id !== currentId || recyclePool.length === 1) return candidate;
  }
  return null;
}

export function isPlayableQuestion(q: Question): boolean {
  return q.question.trim().length > 0 && q.answers.length > 0 && q.answers.every((a) => a.text.trim().length > 0);
}

export function questionKind(q: Question): 'round' | 'finalRound' | 'finalChallenge' {
  if (q.isFinalChallenge) return 'finalChallenge';
  if (q.isFinalRound) return 'finalRound';
  return 'round';
}
