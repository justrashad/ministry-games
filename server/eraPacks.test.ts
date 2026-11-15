import { describe, expect, it } from 'vitest';
import { ERA_PACKS } from '../src/core/commerce/eraPacks';
import type { ClueQuestion, TrueFalseQuestion } from '../src/core/questions/types';
import { PACKS as THEO, PACKS_ES as THEO_ES } from './theopardy/packs';
import { PACKS as SQUARES, PACKS_ES as SQUARES_ES } from './squares/packs';
import { PACKS as BABE, PACKS_ES as BABE_ES } from './babe/packs';

const ids = ERA_PACKS.map((p) => p.id);

function sameShape(packs: { id: string; name: string; questions: { id: string }[] }[], es: Record<string, { questions: { id: string }[] }>) {
  expect(packs.map((p) => p.id)).toEqual(ids);
  for (const pack of packs) {
    expect(pack.name).toBe(ERA_PACKS.find((p) => p.id === pack.id)?.name);
    expect(es[pack.id].questions.map((q) => q.id)).toEqual(pack.questions.map((q) => q.id));
    expect(new Set(pack.questions.map((q) => q.id)).size).toBe(pack.questions.length);
  }
}

function clueRules(list: ClueQuestion[]) {
  for (const c of list) {
    expect(c.prompt, c.id).not.toMatch(/["“”]/);
    expect(c.prompt.length, c.id).toBeLessThanOrEqual(130);
    expect(c.prompt.toLowerCase(), c.id).not.toContain(c.answer.toLowerCase());
    expect(c.reference, c.id).toBeTruthy();
  }
}

describe('era packs', () => {
  it('Theopardy!: 12 categories of 5 clues and at least 3 final-round clues per pack', () => {
    sameShape(THEO, THEO_ES);
    for (const pack of THEO) {
      const board = pack.questions.filter((q) => !q.id.includes('-final-'));
      expect(board.length).toBe(60);
      expect(new Set(board.map((q) => q.category)).size).toBe(12);
      expect(pack.questions.length - board.length).toBeGreaterThanOrEqual(3);
      clueRules(pack.questions);
      clueRules(THEO_ES[pack.id].questions);
    }
  });

  it('Kingdom Squares: 60 statements in 6 categories, every false one corrected', () => {
    sameShape(SQUARES, SQUARES_ES);
    for (const pack of SQUARES) {
      for (const list of [pack.questions, SQUARES_ES[pack.id].questions] as TrueFalseQuestion[][]) {
        expect(list.length).toBe(60);
        expect(new Set(list.map((q) => q.category)).size).toBe(6);
        for (const s of list) if (!s.isTrue) expect(s.correction, s.id).toBeTruthy();
        const trues = list.filter((s) => s.isTrue).length;
        expect(trues).toBeGreaterThanOrEqual(25);
        expect(trues).toBeLessThanOrEqual(35);
      }
    }
  });

  it('Spiritual Babe: 12 questions per stage plus bonus questions', () => {
    sameShape(BABE, BABE_ES);
    for (const pack of BABE) {
      const main = pack.questions.filter((q) => !q.id.includes('-bonus-'));
      for (const level of [1, 2, 3, 4, 5]) expect(main.filter((q) => q.level === level).length, `${pack.id} ${level}`).toBe(12);
      expect(pack.questions.length - main.length).toBeGreaterThanOrEqual(2);
      for (const list of [pack.questions, BABE_ES[pack.id].questions]) {
        for (const q of list) {
          expect(q.prompt, q.id).not.toMatch(/["“”]/);
          expect(q.reference, q.id).toBeTruthy();
        }
      }
    }
  });
});
