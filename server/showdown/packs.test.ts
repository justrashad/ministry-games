import { describe, expect, it } from 'vitest';
import { QUESTION_PACKS } from './packs';
import { validateQuestion } from '../../src/games/showdown/engine/validation';
import { matchAnswer } from '../../src/games/showdown/engine/matching';
import { PACK_CATALOG } from '../../src/games/showdown/commerce/catalog';

describe('question packs', () => {
  it('every pack question is valid and ids are unique across packs', () => {
    const ids = new Set<string>();
    for (const pack of QUESTION_PACKS) {
      const set = pack;
      expect(set.questions.some((q) => q.isFinalChallenge)).toBe(true);
      expect(set.questions.filter((q) => !q.isFinalChallenge && !q.isFinalRound).length).toBeGreaterThanOrEqual(8);
      for (const q of set.questions) {
        expect(validateQuestion(q)).toEqual([]);
        expect(ids.has(q.id)).toBe(false);
        ids.add(q.id);
      }
    }
  });

  it('lists answers from most to least points', () => {
    for (const pack of QUESTION_PACKS) {
      for (const q of pack.questions) {
        const points = q.answers.map((a) => a.points);
        expect(points, `${q.id}`).toEqual([...points].sort((a, b) => b - a));
      }
    }
  });

  it('Final Challenge answers and alternates auto-match the intended answer', () => {
    for (const pack of QUESTION_PACKS) {
      for (const q of pack.questions.filter((x) => x.isFinalChallenge)) {
        for (const a of q.answers) expect(matchAnswer(q, a.text)?.answerId, `${q.id}: ${a.text}`).toBe(a.id);
        for (const alt of q.alternateAnswers ?? []) expect(matchAnswer(q, alt.acceptedAnswer)?.answerId, `${q.id}: ${alt.acceptedAnswer}`).toBe(alt.matchesAnswerId);
      }
    }
  });
});

describe('store catalog', () => {
  it('matches the server pack content exactly (ids, names, counts)', () => {
    expect(PACK_CATALOG.map((p) => p.id)).toEqual(QUESTION_PACKS.map((p) => p.id));
    for (const info of PACK_CATALOG) {
      const pack = QUESTION_PACKS.find((p) => p.id === info.id)!;
      expect(info.name).toBe(pack.name);
      expect(info.description).toBe(pack.description);
      expect(info.questionCount).toBe(pack.questions.length);
      expect(info.finalChallengeCount).toBe(pack.questions.filter((q) => q.isFinalChallenge).length);
    }
  });
});
