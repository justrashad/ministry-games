import type { AlternateAnswer, Question } from '../types';

/** Builds a built-in question with stable IDs: sample-<id> and sample-<id>-a<n> for answers. */
type AnswerSeed = [text: string, points: number];

interface Extra {
  isFinalRound?: boolean;
  isFinalChallenge?: boolean;
  notes?: string;
  alternates?: [accepted: string, answerIndex: number][];
}

export function q(id: string, category: string, question: string, answers: AnswerSeed[], extra: Extra = {}): Question {
  const built: Question = {
    id: `sample-${id}`,
    category,
    question,
    answers: answers.map(([text, points], i) => ({ id: `sample-${id}-a${i + 1}`, text, points })),
  };
  if (extra.isFinalRound) built.isFinalRound = true;
  if (extra.isFinalChallenge) built.isFinalChallenge = true;
  if (extra.notes) built.notes = extra.notes;
  if (extra.alternates?.length) {
    built.alternateAnswers = extra.alternates.map(
      ([acceptedAnswer, index]): AlternateAnswer => ({ acceptedAnswer, matchesAnswerId: `sample-${id}-a${index + 1}` }),
    );
  }
  return built;
}

