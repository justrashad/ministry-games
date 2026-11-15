import { describe, expect, it } from 'vitest';
import { createSampleSets } from './sampleQuestions';
import { validateQuestion } from '../engine/validation';
import { matchAnswer } from '../engine/matching';
import { questionKind } from '../engine/questionPicker';
import { demoSet } from '../commerce/demo';

describe('Spanish starter set', () => {
  const [en] = createSampleSets(0, 'en');
  const [es] = createSampleSets(0, 'es');

  it('mirrors the English set question for question', () => {
    expect(es.id).not.toBe(en.id);
    expect(es.questions.length).toBe(en.questions.length);
    es.questions.forEach((q, i) => {
      const e = en.questions[i];
      expect(q.id).toBe(e.id.replace('sample-', 'sample-es-'));
      expect(questionKind(q)).toBe(questionKind(e));
      expect(q.answers.map((a) => a.points)).toEqual(e.answers.map((a) => a.points));
    });
  });

  it('every question is valid and every Final Challenge answer and alternate matches itself', () => {
    for (const q of es.questions) {
      expect(validateQuestion(q)).toEqual([]);
      if (!q.isFinalChallenge) continue;
      q.answers.forEach((a) => expect(matchAnswer(q, a.text)?.answerId).toBe(a.id));
      q.alternateAnswers?.forEach((alt) => expect(matchAnswer(q, alt.acceptedAnswer)?.answerId).toBe(alt.matchesAnswerId));
    }
  });

  it('the demo deals Spanish questions in Spanish', () => {
    expect(demoSet('es').questions).toHaveLength(5);
    expect(demoSet('es').questions.every((q) => q.id.startsWith('sample-es-'))).toBe(true);
    expect(demoSet('en').questions).toHaveLength(5);
  });
});
