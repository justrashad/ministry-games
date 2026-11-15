import { describe, expect, it } from 'vitest';
import { orderQuestions, pickNextQuestion } from './questionPicker';
import { mulberry32 } from './random';
import { makeQuestion } from './testUtils';

const qs = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`, [10]));

describe('question randomization', () => {
  it('keeps order when playing in order', () => {
    expect(orderQuestions(qs, 'inOrder').map((q) => q.id)).toEqual(qs.map((q) => q.id));
  });

  it('shuffles deterministically with a seed and keeps every question', () => {
    const a = orderQuestions(qs, 'shuffle', mulberry32(42)).map((q) => q.id);
    const b = orderQuestions(qs, 'shuffle', mulberry32(42)).map((q) => q.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(qs.map((q) => q.id));
    expect([...a].sort()).toEqual(qs.map((q) => q.id).sort());
  });

  it('never repeats a question while avoiding repeats', () => {
    const pools = { regular: qs.slice(0, 3), final: [] };
    const used: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const next = pickNextQuestion(pools, used, false, true);
      expect(next).not.toBeNull();
      expect(used).not.toContain(next!.id);
      used.push(next!.id);
    }
    expect(pickNextQuestion(pools, used, false, true)).toBeNull();
  });

  it('recycles when repeats are allowed', () => {
    const pools = { regular: qs.slice(0, 2), final: [] };
    expect(pickNextQuestion(pools, ['q0', 'q1'], false, false, 'q1')?.id).toBe('q0');
  });

  it('final rounds prefer final questions and fall back to regular ones', () => {
    const final = makeQuestion('f1', [10], { isFinalRound: true });
    expect(pickNextQuestion({ regular: qs, final: [final] }, [], true, true)?.id).toBe('f1');
    expect(pickNextQuestion({ regular: qs, final: [final] }, ['f1'], true, true)?.id).toBe('q0');
  });
});

describe('recently played questions', () => {
  it('moves recently played questions to the back without dropping them', async () => {
    const { deprioritize } = await import('./createGame');
    const ids = deprioritize(qs.slice(0, 5), new Set(['q0', 'q2'])).map((q) => q.id);
    expect(ids).toEqual(['q1', 'q3', 'q4', 'q0', 'q2']);
    expect(deprioritize(qs.slice(0, 3), undefined).map((q) => q.id)).toEqual(['q0', 'q1', 'q2']);
  });
});
