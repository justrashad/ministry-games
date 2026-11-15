import type { AlternateAnswer, Answer, Question, QuestionSet, QuestionSetExport } from '../types';
import { LIMITS, toFiniteNumber } from './defaults';
import { uid } from '../lib/ids';
import { english, type Tr } from '../i18n/msg';
import { QUESTION_LIMITS, questionTypeOf, toLevel } from '../questions/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Validation for questions edited in the app (already typed). Pass `tr` to get messages in another language. */
export function validateQuestion(q: Question, tr: Tr = english): string[] {
  const errors: string[] = [];
  if (!q.question.trim()) errors.push(tr('Enter the question text.'));
  if (q.question.length > LIMITS.questionText) errors.push(tr('Keep the question under {n} characters.', { n: LIMITS.questionText }));
  if (q.answers.length === 0) errors.push(tr('Add at least one answer.'));
  const ids = new Set<string>();
  q.answers.forEach((a, i) => {
    if (!a.text.trim()) errors.push(tr('Answer {n} needs text.', { n: i + 1 }));
    if (!Number.isFinite(a.points)) errors.push(tr('Answer {n} needs a number of points.', { n: i + 1 }));
    else if (a.points < 0 || a.points > LIMITS.maxPoints) errors.push(tr('Answer {n} points must be between 0 and {max}.', { n: i + 1, max: LIMITS.maxPoints }));
    if (ids.has(a.id)) errors.push(tr('Answer {n} has a duplicate ID.', { n: i + 1 }));
    ids.add(a.id);
  });
  if (q.multiplier !== undefined && (!Number.isInteger(q.multiplier) || q.multiplier < LIMITS.multiplier.min || q.multiplier > LIMITS.multiplier.max)) {
    errors.push(tr('Multiplier must be a whole number from {min} to {max}.', { min: LIMITS.multiplier.min, max: LIMITS.multiplier.max }));
  }
  for (const alt of q.alternateAnswers ?? []) {
    if (!alt.acceptedAnswer.trim()) errors.push(tr('Alternate answers need text.'));
    if (!ids.has(alt.matchesAnswerId)) errors.push(tr('Alternate "{name}" points to an answer that no longer exists.', { name: alt.acceptedAnswer }));
  }
  return errors;
}

export interface NormalizeResult {
  question: Question | null;
  errors: string[];
  warnings: string[];
}

/** Turns untrusted JSON into a Question, repairing what it safely can. */
export function normalizeQuestion(raw: unknown, label = 'Question'): NormalizeResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isRecord(raw)) return { question: null, errors: [`${label} is not a question object.`], warnings };
  // Clue and true/false questions belong to other titles; this game only plays survey questions.
  if (questionTypeOf(raw) !== 'survey') return { question: null, errors: [`${label} is not a survey question, so Ministry Showdown can't use it.`], warnings };

  const text = typeof raw.question === 'string' ? raw.question.trim() : '';
  if (!text) errors.push(`${label} is missing its question text.`);

  const answersRaw = Array.isArray(raw.answers) ? raw.answers : null;
  if (!answersRaw) errors.push(`${label} is missing its answers list.`);
  else if (answersRaw.length === 0) errors.push(`${label} has no answers.`);

  const answers: Answer[] = [];
  const answerIds = new Set<string>();
  (answersRaw ?? []).forEach((a, i) => {
    if (!isRecord(a)) {
      errors.push(`${label}, answer ${i + 1} is not valid.`);
      return;
    }
    const answerText = typeof a.text === 'string' ? a.text.trim() : '';
    if (!answerText) errors.push(`${label}, answer ${i + 1} is missing text.`);
    const points = toFiniteNumber(a.points);
    if (points === null) errors.push(`${label}, answer ${i + 1} has points that are not a number.`);
    else if (points < 0 || points > LIMITS.maxPoints) errors.push(`${label}, answer ${i + 1} points must be between 0 and ${LIMITS.maxPoints}.`);
    let id = typeof a.id === 'string' && a.id.trim() ? a.id.trim() : '';
    if (!id || answerIds.has(id)) {
      if (id) warnings.push(`${label}: a duplicate answer ID was replaced.`);
      id = uid('a');
    }
    answerIds.add(id);
    answers.push({ id, text: answerText.slice(0, LIMITS.answerText), points: Math.round(points ?? 0) });
  });

  const alternateAnswers: AlternateAnswer[] = [];
  if (Array.isArray(raw.alternateAnswers)) {
    for (const alt of raw.alternateAnswers) {
      if (!isRecord(alt) || typeof alt.acceptedAnswer !== 'string' || typeof alt.matchesAnswerId !== 'string') continue;
      if (!answerIds.has(alt.matchesAnswerId) || !alt.acceptedAnswer.trim()) {
        warnings.push(`${label}: an alternate answer referenced a missing answer and was skipped.`);
        continue;
      }
      alternateAnswers.push({ acceptedAnswer: alt.acceptedAnswer.trim().slice(0, LIMITS.answerText), matchesAnswerId: alt.matchesAnswerId });
    }
  }

  if (errors.length > 0) return { question: null, errors, warnings };

  const question: Question = {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : uid('q'),
    category: typeof raw.category === 'string' && raw.category.trim() ? raw.category.trim().slice(0, 40) : 'General',
    question: text.slice(0, LIMITS.questionText),
    answers,
  };
  const multiplier = toFiniteNumber(raw.multiplier);
  if (multiplier !== null) {
    question.multiplier = Math.min(LIMITS.multiplier.max, Math.max(LIMITS.multiplier.min, Math.round(multiplier)));
  }
  if (raw.isFinalRound === true) question.isFinalRound = true;
  if (raw.isFinalChallenge === true) question.isFinalChallenge = true;
  const timeLimit = toFiniteNumber(raw.timeLimit);
  if (timeLimit !== null && timeLimit > 0) {
    question.timeLimit = Math.min(LIMITS.timerSeconds.max, Math.max(LIMITS.timerSeconds.min, Math.round(timeLimit)));
  }
  if (alternateAnswers.length > 0) question.alternateAnswers = alternateAnswers;
  if (typeof raw.notes === 'string' && raw.notes.trim()) question.notes = raw.notes.trim().slice(0, 500);
  const level = toLevel(raw.level);
  if (level !== null) question.level = level;
  if (typeof raw.reference === 'string' && raw.reference.trim()) question.reference = raw.reference.trim().slice(0, QUESTION_LIMITS.reference);
  return { question, errors, warnings };
}

/** Ensures question IDs are unique within a list, replacing duplicates. */
export function dedupeQuestionIds(questions: Question[]): { questions: Question[]; replaced: number } {
  const seen = new Set<string>();
  let replaced = 0;
  const out = questions.map((q) => {
    if (!seen.has(q.id)) {
      seen.add(q.id);
      return q;
    }
    replaced += 1;
    const id = uid('q');
    seen.add(id);
    return { ...q, id };
  });
  return { questions: out, replaced };
}

export type ImportResult =
  | { ok: true; data: QuestionSetExport; warnings: string[] }
  | { ok: false; error: string; details: string[] };

export const MAX_IMPORT_BYTES = 2_000_000;

/** Validates a parsed import file. Invalid files are rejected as a whole with friendly details. */
export function parseQuestionSetFile(raw: unknown, tr: Tr = english): ImportResult {
  let container: Record<string, unknown>;
  if (Array.isArray(raw)) container = { name: 'Imported questions', questions: raw };
  else if (isRecord(raw)) container = raw;
  else return { ok: false, error: tr("This file doesn't look like a Ministry Showdown question set."), details: [] };

  if (container.version !== undefined && container.version !== 1) {
    const v = toFiniteNumber(container.version);
    if (v !== null && v > 1) return { ok: false, error: tr('This question set was made with a newer version of Ministry Showdown.'), details: [] };
    return { ok: false, error: tr('This file has an unknown format version.'), details: [] };
  }
  if (!Array.isArray(container.questions)) {
    return { ok: false, error: tr('The file has no "questions" list.'), details: [] };
  }
  if (container.questions.length === 0) {
    return { ok: false, error: tr('The question set in this file is empty.'), details: [] };
  }

  const warnings: string[] = [];
  const errors: string[] = [];
  const questions: Question[] = [];
  container.questions.forEach((q, i) => {
    const result = normalizeQuestion(q, `Question ${i + 1}`);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.question) questions.push(result.question);
  });
  if (errors.length > 0) {
    return {
      ok: false,
      error: errors.length === 1 ? tr('One problem was found in this file. Nothing was imported.') : tr('{n} problems were found in this file. Nothing was imported.', { n: errors.length }),
      details: errors.slice(0, 8),
    };
  }
  const deduped = dedupeQuestionIds(questions);
  if (deduped.replaced > 0) warnings.push(`${deduped.replaced} duplicate question ID(s) were replaced.`);

  const name = typeof container.name === 'string' && container.name.trim() ? container.name.trim().slice(0, 60) : 'Imported question set';
  const data: QuestionSetExport = { name, version: 1, questions: deduped.questions };
  if (typeof container.description === 'string' && container.description.trim()) data.description = container.description.trim().slice(0, 200);
  return { ok: true, data, warnings };
}

export function parseQuestionSetText(text: string, tr: Tr = english): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: tr("This file isn't valid JSON. Export a question set from Ministry Showdown and try again."), details: [] };
  }
  return parseQuestionSetFile(parsed, tr);
}

export function toExport(set: QuestionSet): QuestionSetExport {
  const out: QuestionSetExport = {
    name: set.name,
    version: 1,
    exportedAt: new Date().toISOString(),
    questions: set.questions,
  };
  if (set.description) out.description = set.description;
  return out;
}

/** Lenient loader for sets already in local storage: keeps valid questions, drops broken ones. */
export function sanitizeStoredSet(raw: unknown): QuestionSet | null {
  if (!isRecord(raw) || typeof raw.id !== 'string' || !Array.isArray(raw.questions)) return null;
  const questions: Question[] = [];
  raw.questions.forEach((q, i) => {
    const result = normalizeQuestion(q, `Question ${i + 1}`);
    if (result.question) questions.push(result.question);
  });
  const set: QuestionSet = {
    id: raw.id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 60) : 'Untitled set',
    questions: dedupeQuestionIds(questions).questions,
    createdAt: toFiniteNumber(raw.createdAt) ?? Date.now(),
    updatedAt: toFiniteNumber(raw.updatedAt) ?? Date.now(),
  };
  if (typeof raw.description === 'string' && raw.description.trim()) set.description = raw.description.trim().slice(0, 200);
  if (raw.isSample === true) set.isSample = true;
  if (typeof raw.packId === 'string' && raw.packId) set.packId = raw.packId;
  return set;
}
