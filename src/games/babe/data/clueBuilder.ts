import type { ClueQuestion, Level } from '../../../core/questions/types';

/** Compact way to write a question: id, subject, stage level (1 Newborn to 5 Mature), question text, answer, scripture reference, other accepted answers. */
export function clue(id: string, category: string, level: Level, prompt: string, answer: string, reference?: string, accept?: string[]): ClueQuestion {
  const out: ClueQuestion = { id, type: 'clue', category, level, prompt, answer };
  if (reference) out.reference = reference;
  if (accept && accept.length > 0) out.accept = accept;
  return out;
}

export interface QuestionPack {
  id: string;
  name: string;
  description: string;
  questions: ClueQuestion[];
  /** Questions set aside for the bonus round. */
  bonus: ClueQuestion[];
}
