import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../core/lib/random';
import { normalizeClue } from '../../../core/questions/normalize';
import { LEVELS, QUESTION_LIMITS } from '../../../core/questions/types';
import { createGame } from '../engine/createGame';
import type { QuestionPack } from './clueBuilder';
import { STARTER_PACK } from './starterPack';
import { STARTER_PACK_ES } from './starterPackEs';

const packs: [string, QuestionPack][] = [
  ['English', STARTER_PACK],
  ['Spanish', STARTER_PACK_ES],
];

/** Lowercase with accents removed, so "Saúl" and "saul" compare equal. */
function plain(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

describe.each(packs)('starter pack (%s)', (_name, pack) => {
  const all = [...pack.questions, ...pack.bonus];

  it('has 12 questions at every stage and at least 3 bonus questions', () => {
    expect(pack.questions).toHaveLength(60);
    expect(LEVELS.map((level) => pack.questions.filter((q) => q.level === level).length)).toEqual([12, 12, 12, 12, 12]);
    expect(pack.bonus.length).toBeGreaterThanOrEqual(3);
  });

  it('has at least 4 subjects at every stage, so a board never repeats one', () => {
    for (const level of LEVELS) {
      expect(new Set(pack.questions.filter((q) => q.level === level).map((q) => q.category)).size, `level ${level}`).toBeGreaterThanOrEqual(4);
    }
  });

  it('every question is valid exactly as written', () => {
    for (const q of all) {
      const result = normalizeClue(q);
      expect(result.errors, q.id).toEqual([]);
      expect(result.question, q.id).toEqual(q);
    }
  });

  it('uses unique ids', () => {
    expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
  });

  it('never gives the answer away in the question', () => {
    for (const q of all) {
      const prompt = ` ${plain(q.prompt).replace(/[^a-z0-9]+/g, ' ')} `;
      for (const answer of [q.answer, ...(q.accept ?? [])]) {
        const needle = plain(answer).replace(/^(a|an|the|un|una|el|la|los|las|al) /, '').replace(/[^a-z0-9]+/g, ' ').trim();
        expect(prompt.includes(` ${needle} `), `${q.id}: "${answer}" appears in the question`).toBe(false);
      }
    }
  });

  it('keeps questions short enough to read on a TV and quotes no verse text', () => {
    for (const q of all) {
      expect(q.prompt.length, q.id).toBeLessThanOrEqual(Math.min(QUESTION_LIMITS.prompt, 130));
      expect(/["“”«»]/.test(q.prompt), q.id).toBe(false);
    }
  });

  it('cites a scripture for every question except the ones about the Bible itself', () => {
    for (const q of all) {
      if (q.category === pack.questions.find((x) => x.id === 'sb-n6')?.category && !q.reference) continue;
      expect(q.reference, q.id).toBeTruthy();
    }
  });

  it('deals full games, and three games in a row before reusing a question', () => {
    const seen = new Set<string>();
    for (let n = 0; n < 3; n += 1) {
      const result = createGame({ questions: pack.questions, bonus: pack.bonus, avoidIds: seen, rng: mulberry32(n + 1), now: 1 });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const ids = result.game.boards.flatMap((b) => b.stages.flatMap((s) => s.map((slot) => slot.question.id)));
      for (const id of ids) {
        expect(seen.has(id), `game ${n + 1} repeats ${id}`).toBe(false);
        seen.add(id);
      }
    }
  });
});

describe('English and Spanish packs', () => {
  it('match question for question', () => {
    const en = [...STARTER_PACK.questions, ...STARTER_PACK.bonus];
    const es = [...STARTER_PACK_ES.questions, ...STARTER_PACK_ES.bonus];
    expect(es.map((q) => [q.id, q.level, !!q.reference])).toEqual(en.map((q) => [q.id, q.level, !!q.reference]));
  });
});
