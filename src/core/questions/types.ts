/*
 * Question shapes shared by every title.
 *
 *   survey     a prompt with ranked answers and points (Ministry Showdown)
 *   clue       a prompt with one right answer (Theopardy!, grade-level game)
 *   truefalse  a statement that is true or false (Kingdom Squares)
 *
 * Every question carries a category. Clue and true/false questions also carry a
 * difficulty level from 1 (easiest) to 5, which a title maps onto its own board:
 * tile values, grade tiers, and so on. A survey question has no "type" field in
 * files saved before this format existed, so a missing type means survey.
 */

export type QuestionType = 'survey' | 'clue' | 'truefalse';

export type Level = 1 | 2 | 3 | 4 | 5;

export const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

export const QUESTION_LIMITS = {
  category: 40,
  prompt: 240,
  answer: 80,
  accept: 8,
  reference: 60,
  correction: 240,
  notes: 500,
} as const;

export interface QuestionBase {
  id: string;
  category: string;
  /** Scripture citation the answer rests on, for example "Genesis 6:14". Never verse text. */
  reference?: string;
  notes?: string;
}

export interface ClueQuestion extends QuestionBase {
  type: 'clue';
  level: Level;
  prompt: string;
  answer: string;
  /** Other wordings the host should accept as correct. */
  accept?: string[];
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'truefalse';
  level: Level;
  statement: string;
  isTrue: boolean;
  /** What the account actually says. Required when the statement is false. */
  correction?: string;
}

/** Reads the type of an untrusted question object. A missing type is a survey question. */
export function questionTypeOf(raw: unknown): QuestionType | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const type = (raw as { type?: unknown }).type;
  if (type === undefined || type === 'survey') return 'survey';
  return type === 'clue' || type === 'truefalse' ? type : null;
}

/** Accepts 1 to 5 as a number or numeric text; anything else is null. */
export function toLevel(raw: unknown): Level | null {
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() ? Number(raw) : NaN;
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 5 ? n : null;
}
