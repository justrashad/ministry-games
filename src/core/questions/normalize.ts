import { uid } from '../lib/ids';
import { QUESTION_LIMITS, toLevel, type ClueQuestion, type QuestionBase, type TrueFalseQuestion } from './types';

/*
 * Turns untrusted JSON (a pack from the server, an imported file, something in
 * local storage) into a typed clue or true/false question. A question that can't
 * be repaired is rejected with plain-language errors; nothing is guessed.
 */

export interface Normalized<Q> {
  question: Q | null;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(raw: unknown, max: number): string {
  return typeof raw === 'string' ? raw.trim().slice(0, max) : '';
}

function base(raw: Record<string, unknown>): QuestionBase {
  const out: QuestionBase = {
    id: text(raw.id, 80) || uid('q'),
    category: text(raw.category, QUESTION_LIMITS.category) || 'General',
  };
  const reference = text(raw.reference, QUESTION_LIMITS.reference);
  if (reference) out.reference = reference;
  const notes = text(raw.notes, QUESTION_LIMITS.notes);
  if (notes) out.notes = notes;
  return out;
}

export function normalizeClue(raw: unknown, label = 'Question'): Normalized<ClueQuestion> {
  if (!isRecord(raw)) return { question: null, errors: [`${label} is not a question object.`] };
  const errors: string[] = [];
  if (raw.type !== 'clue') errors.push(`${label} is not a clue question.`);
  const prompt = text(raw.prompt, QUESTION_LIMITS.prompt);
  if (!prompt) errors.push(`${label} is missing its clue text.`);
  const answer = text(raw.answer, QUESTION_LIMITS.answer);
  if (!answer) errors.push(`${label} is missing its answer.`);
  const level = toLevel(raw.level);
  if (level === null) errors.push(`${label} needs a level from 1 to 5.`);
  if (errors.length > 0 || level === null) return { question: null, errors };

  const question: ClueQuestion = { ...base(raw), type: 'clue', level, prompt, answer };
  if (Array.isArray(raw.accept)) {
    const seen = new Set<string>([answer.toLowerCase()]);
    const accept: string[] = [];
    for (const item of raw.accept) {
      const alt = text(item, QUESTION_LIMITS.answer);
      if (!alt || seen.has(alt.toLowerCase())) continue;
      seen.add(alt.toLowerCase());
      accept.push(alt);
      if (accept.length === QUESTION_LIMITS.accept) break;
    }
    if (accept.length > 0) question.accept = accept;
  }
  return { question, errors };
}

export function normalizeTrueFalse(raw: unknown, label = 'Question'): Normalized<TrueFalseQuestion> {
  if (!isRecord(raw)) return { question: null, errors: [`${label} is not a question object.`] };
  const errors: string[] = [];
  if (raw.type !== 'truefalse') errors.push(`${label} is not a true or false question.`);
  const statement = text(raw.statement, QUESTION_LIMITS.prompt);
  if (!statement) errors.push(`${label} is missing its statement.`);
  if (typeof raw.isTrue !== 'boolean') errors.push(`${label} must say whether the statement is true or false.`);
  const level = toLevel(raw.level);
  if (level === null) errors.push(`${label} needs a level from 1 to 5.`);
  const correction = text(raw.correction, QUESTION_LIMITS.correction);
  if (raw.isTrue === false && !correction) errors.push(`${label} is false, so it needs a correction that says what is true.`);
  if (errors.length > 0 || level === null || typeof raw.isTrue !== 'boolean') return { question: null, errors };

  const question: TrueFalseQuestion = { ...base(raw), type: 'truefalse', level, statement, isTrue: raw.isTrue };
  if (correction) question.correction = correction;
  return { question, errors };
}

/** Normalizes a whole list, keeping the good questions and collecting every error. Duplicate ids are replaced. */
export function normalizeList<Q extends { id: string }>(
  raw: unknown,
  normalizeOne: (item: unknown, label: string) => Normalized<Q>,
): { questions: Q[]; errors: string[] } {
  if (!Array.isArray(raw)) return { questions: [], errors: ['The questions list is missing.'] };
  const questions: Q[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  raw.forEach((item, i) => {
    const result = normalizeOne(item, `Question ${i + 1}`);
    errors.push(...result.errors);
    if (!result.question) return;
    const q = seen.has(result.question.id) ? { ...result.question, id: uid('q') } : result.question;
    seen.add(q.id);
    questions.push(q);
  });
  return { questions, errors };
}
