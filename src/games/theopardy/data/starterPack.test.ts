import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../core/lib/random';
import { normalizeClue } from '../../../core/questions/normalize';
import { QUESTION_LIMITS } from '../../../core/questions/types';
import { createGame, fullCategories } from '../engine/createGame';
import type { CluePack } from './clueBuilder';
import { STARTER_PACK } from './starterPack';
import { STARTER_PACK_ES } from './starterPackEs';

const packs: [string, CluePack][] = [
  ['English', STARTER_PACK],
  ['Spanish', STARTER_PACK_ES],
];

/** Lowercase with accents removed, so "Saúl" and "saul" compare equal. */
function plain(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

describe.each(packs)('starter pack (%s)', (_name, pack) => {
  const all = [...pack.clues, ...pack.finals];

  it('has 12 full categories of 5 clues and at least 3 final clues', () => {
    const groups = fullCategories(pack.clues);
    expect(groups.size).toBe(12);
    expect(pack.clues).toHaveLength(60);
    for (const levels of groups.values()) {
      expect(Object.values(levels).map((list) => list.length)).toEqual([1, 1, 1, 1, 1]);
    }
    expect(pack.finals.length).toBeGreaterThanOrEqual(3);
  });

  it('every clue is valid exactly as written', () => {
    for (const clue of all) {
      const result = normalizeClue(clue);
      expect(result.errors, clue.id).toEqual([]);
      expect(result.question, clue.id).toEqual(clue);
    }
  });

  it('uses unique ids', () => {
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
  });

  it('never gives the answer away in the clue', () => {
    for (const clue of all) {
      const prompt = ` ${plain(clue.prompt).replace(/[^a-z0-9]+/g, ' ')} `;
      for (const answer of [clue.answer, ...(clue.accept ?? [])]) {
        const needle = plain(answer).replace(/^(a|an|the|un|una|el|la|los|las) /, '').replace(/[^a-z0-9]+/g, ' ').trim();
        expect(prompt.includes(` ${needle} `), `${clue.id}: "${answer}" appears in the clue`).toBe(false);
      }
    }
  });

  it('keeps clues short enough to read on a TV and quotes no verse text', () => {
    for (const clue of all) {
      expect(clue.prompt.length, clue.id).toBeLessThanOrEqual(QUESTION_LIMITS.prompt);
      expect(clue.prompt.length, clue.id).toBeLessThanOrEqual(130);
      expect(/["“”«»]/.test(clue.prompt), clue.id).toBe(false);
    }
  });

  it('builds a full two-round game with a final', () => {
    const result = createGame({ clues: pack.clues, finals: pack.finals, rng: mulberry32(11) });
    if (!result.ok) throw new Error(result.error);
    expect(result.warnings).toEqual([]);
    expect(result.game.boards.map((b) => b.categories.length)).toEqual([6, 6]);
    expect(pack.finals.map((c) => c.id)).toContain(result.game.final?.clue.id);
  });
});

describe('starter pack languages', () => {
  it('Spanish translates every English clue, id for id and level for level', () => {
    const shape = (pack: CluePack) => [...pack.clues, ...pack.finals].map((c) => `${c.id}:${c.level}`);
    expect(shape(STARTER_PACK_ES)).toEqual(shape(STARTER_PACK));
  });

  it('keeps each category together in both languages', () => {
    const byCategory = (pack: CluePack) => {
      const map = new Map<string, string[]>();
      for (const c of pack.clues) map.set(c.category, [...(map.get(c.category) ?? []), c.id]);
      return [...map.values()];
    };
    expect(byCategory(STARTER_PACK_ES)).toEqual(byCategory(STARTER_PACK));
  });

  it('keeps the same scripture chapters and verses in both languages', () => {
    const numbers = (ref: string | undefined) => (ref ?? '').replace(/^[^:]*?(\d+:)/, '$1').replace(/[^0-9:;,-]/g, '');
    STARTER_PACK.clues.concat(STARTER_PACK.finals).forEach((en, i) => {
      const es = STARTER_PACK_ES.clues.concat(STARTER_PACK_ES.finals)[i];
      expect(numbers(es.reference), en.id).toBe(numbers(en.reference));
    });
  });
});
