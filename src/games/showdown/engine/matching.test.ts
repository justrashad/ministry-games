import { describe, expect, it } from 'vitest';
import { matchAnswer, similarity } from './matching';
import type { Question } from '../types';

const question: Question = {
  id: 'q',
  category: 'Test',
  question: 'Name something a family might do together after dinner.',
  answers: [
    { id: 'walk', text: 'Take a walk', points: 30 },
    { id: 'talk', text: 'Talk together', points: 25 },
    { id: 'study', text: 'Study', points: 20 },
    { id: 'game', text: 'Play a game', points: 15 },
    { id: 'clean', text: 'Clean up', points: 10 },
  ],
  alternateAnswers: [{ acceptedAnswer: 'Wash the dishes', matchesAnswerId: 'clean' }],
};

describe('answer matching', () => {
  it('matches near phrasings', () => {
    expect(matchAnswer(question, 'Go for a walk')?.answerId).toBe('walk');
    expect(matchAnswer(question, 'walking')?.answerId).toBe('walk');
    expect(matchAnswer(question, 'talk')?.answerId).toBe('talk');
    expect(matchAnswer(question, 'play games')?.answerId).toBe('game');
  });

  it('uses alternate answers', () => {
    expect(matchAnswer(question, 'wash dishes')?.answerId).toBe('clean');
  });

  it('tolerates small typos', () => {
    expect(matchAnswer(question, 'studdy')?.answerId).toBe('study');
  });

  it('returns no match for unrelated answers', () => {
    expect(matchAnswer(question, 'Go shopping')).toBeNull();
    expect(matchAnswer(question, 'Play outside')).toBeNull();
    expect(matchAnswer(question, '   ')).toBeNull();
  });

  it('scores identical text as a perfect match', () => {
    expect(similarity('Take a walk', 'take a walk!')).toBe(1);
  });
});

describe('Spanish answers', () => {
  it('ignores accents, articles and simple plurals', async () => {
    const { SAMPLE_FINAL_CHALLENGE_QUESTIONS_ES } = await import('../data/sampleQuestionsEs');
    const byId = (id: string) => SAMPLE_FINAL_CHALLENGE_QUESTIONS_ES.find((q) => q.id === id)!;
    const place = byId('sample-es-fc-05');
    expect(matchAnswer(place, 'jerusalen')?.answerId).toBe(place.answers[0].id);
    expect(matchAnswer(place, 'el jardín de Edén')?.answerId).toBe(place.answers[4].id);
    const fruit = byId('sample-es-fc-08');
    expect(matchAnswer(fruit, 'higo')?.answerId).toBe(fruit.answers[0].id);
    expect(matchAnswer(fruit, 'las uvas')?.answerId).toBe(fruit.answers[1].id);
    const saturday = byId('sample-es-fc-07');
    expect(matchAnswer(saturday, 'predicar')?.answerId).toBe(saturday.answers[0].id);
  });
});
