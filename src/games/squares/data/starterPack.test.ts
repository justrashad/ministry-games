import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../core/lib/random';
import { normalizeTrueFalse } from '../../../core/questions/normalize';
import { LEVELS } from '../../../core/questions/types';
import { createGame } from '../engine/createGame';
import { STARTER_PACK } from './starterPack';
import { STARTER_PACK_ES } from './starterPackEs';
import type { StatementPack } from './statementBuilder';

const packs: [string, StatementPack][] = [
  ['English', STARTER_PACK],
  ['Spanish', STARTER_PACK_ES],
];

describe.each(packs)('starter pack (%s)', (_name, pack) => {
  const all = pack.statements;

  it('has 60 statements in 6 categories, two at each level', () => {
    expect(all).toHaveLength(60);
    const categories = new Map<string, number[]>();
    for (const s of all) categories.set(s.category, [...(categories.get(s.category) ?? []), s.level]);
    expect(categories.size).toBe(6);
    for (const levels of categories.values()) {
      expect(LEVELS.map((level) => levels.filter((l) => l === level).length)).toEqual([2, 2, 2, 2, 2]);
    }
  });

  it('is half true and half false, and every category has both', () => {
    expect(all.filter((s) => s.isTrue)).toHaveLength(30);
    const byCategory = new Map<string, boolean[]>();
    for (const s of all) byCategory.set(s.category, [...(byCategory.get(s.category) ?? []), s.isTrue]);
    for (const answers of byCategory.values()) {
      expect(answers.filter(Boolean).length).toBeGreaterThanOrEqual(3);
      expect(answers.filter((a) => !a).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('every statement is valid exactly as written, and every one has a reference', () => {
    for (const s of all) {
      const result = normalizeTrueFalse(s);
      expect(result.errors, s.id).toEqual([]);
      expect(result.question, s.id).toEqual(s);
      expect(s.reference, s.id).toBeTruthy();
    }
  });

  it('gives a correction for every false statement and none for a true one', () => {
    for (const s of all) expect(!!s.correction, s.id).toBe(!s.isTrue);
  });

  it('uses unique ids and quotes no verse text', () => {
    expect(new Set(all.map((s) => s.id)).size).toBe(all.length);
    for (const s of all) expect(/["“”«»]/.test(s.statement + (s.correction ?? '')), s.id).toBe(false);
  });

  it('keeps statements short enough to read on a TV', () => {
    for (const s of all) expect(s.statement.length, s.id).toBeLessThanOrEqual(130);
  });

  it('builds a match', () => {
    const result = createGame({ statements: all, rng: mulberry32(4) });
    expect(result.ok && result.game.deck).toHaveLength(60);
  });
});

describe('starter pack languages', () => {
  it('Spanish translates every English statement: same id, level, answer and order', () => {
    const shape = (pack: StatementPack) => pack.statements.map((s) => `${s.id}:${s.level}:${s.isTrue}`);
    expect(shape(STARTER_PACK_ES)).toEqual(shape(STARTER_PACK));
  });

  it('keeps each category together in both languages', () => {
    const groups = (pack: StatementPack) => {
      const map = new Map<string, string[]>();
      for (const s of pack.statements) map.set(s.category, [...(map.get(s.category) ?? []), s.id]);
      return [...map.values()];
    };
    expect(groups(STARTER_PACK_ES)).toEqual(groups(STARTER_PACK));
  });

  it('keeps the same chapters and verses in both languages', () => {
    const numbers = (ref: string | undefined) => (ref ?? '').match(/\d+:[\d,\s-]+/g)?.map((n) => n.replace(/\s/g, '')).join('|');
    STARTER_PACK.statements.forEach((en, i) => {
      expect(numbers(STARTER_PACK_ES.statements[i].reference), en.id).toBe(numbers(en.reference));
    });
  });
});
