import type { Question, QuestionSet, QuestionSetExport } from '../types';
import { createSampleSets, sampleSetId } from '../data/sampleQuestions';
import { langStore, t, type Lang } from '../i18n/i18n';
import { dedupeQuestionIds, sanitizeStoredSet } from '../engine/validation';
import { uid } from '../lib/ids';
import { STORAGE_KEYS } from '../lib/storage';
import { createPersistentStore } from './persistentStore';

export interface LibraryState {
  sets: QuestionSet[];
}

function sanitizeLibrary(raw: unknown): LibraryState {
  if (typeof raw !== 'object' || raw === null || !Array.isArray((raw as { sets?: unknown }).sets)) {
    // First visit: start with the starter set in the device's language.
    return { sets: createSampleSets(Date.now(), langStore.get()) };
  }
  const seen = new Set<string>();
  const sets: QuestionSet[] = [];
  for (const item of (raw as { sets: unknown[] }).sets) {
    const set = sanitizeStoredSet(item);
    if (!set) continue;
    if (seen.has(set.id)) set.id = uid('set');
    seen.add(set.id);
    sets.push(set);
  }
  return { sets };
}

export const libraryStore = createPersistentStore<LibraryState>(STORAGE_KEYS.library, sanitizeLibrary);
export const useLibrary = () => libraryStore.useValue();

function updateSet(setId: string, fn: (set: QuestionSet) => QuestionSet): void {
  libraryStore.set((prev) => ({
    sets: prev.sets.map((s) => (s.id === setId ? { ...fn(s), updatedAt: Date.now() } : s)),
  }));
}

export function getSet(setId: string | null | undefined): QuestionSet | undefined {
  const { sets } = libraryStore.get();
  return sets.find((s) => s.id === setId);
}

export function createSet(name: string, description?: string): QuestionSet {
  const now = Date.now();
  const set: QuestionSet = { id: uid('set'), name: name.trim().slice(0, 60) || 'New question set', questions: [], createdAt: now, updatedAt: now };
  if (description?.trim()) set.description = description.trim().slice(0, 200);
  libraryStore.set((prev) => ({ sets: [...prev.sets, set] }));
  return set;
}

export function renameSet(setId: string, name: string, description?: string): void {
  const trimmed = name.trim().slice(0, 60);
  if (!trimmed) return;
  updateSet(setId, (s) => {
    const next: QuestionSet = { ...s, name: trimmed };
    if (description !== undefined) {
      if (description.trim()) next.description = description.trim().slice(0, 200);
      else delete next.description;
    }
    return next;
  });
}

export function duplicateSet(setId: string): QuestionSet | undefined {
  const source = getSet(setId);
  if (!source) return undefined;
  const now = Date.now();
  const copy: QuestionSet = {
    ...source,
    id: uid('set'),
    name: `${source.name} (copy)`.slice(0, 60),
    questions: source.questions.map((q) => ({ ...q, id: uid('q') })),
    createdAt: now,
    updatedAt: now,
  };
  delete copy.isSample;
  libraryStore.set((prev) => ({ sets: [...prev.sets, copy] }));
  return copy;
}

export function deleteSet(setId: string): void {
  libraryStore.set((prev) => ({ sets: prev.sets.filter((s) => s.id !== setId) }));
}

/** Adds a ready-made set (e.g. a question pack) to the library. */
export function addSet(set: QuestionSet): QuestionSet {
  libraryStore.set((prev) => ({ sets: [...prev.sets, set] }));
  return set;
}

export function importSet(data: QuestionSetExport): QuestionSet {
  const now = Date.now();
  const existingNames = new Set(libraryStore.get().sets.map((s) => s.name));
  let name = data.name;
  let n = 2;
  while (existingNames.has(name)) name = `${data.name} (${n++})`;
  const set: QuestionSet = {
    id: uid('set'),
    name: name.slice(0, 60),
    questions: dedupeQuestionIds(data.questions).questions,
    createdAt: now,
    updatedAt: now,
  };
  if (data.description) set.description = data.description;
  libraryStore.set((prev) => ({ sets: [...prev.sets, set] }));
  return set;
}

/** Adds the built-in sample set in the given language (as a new copy if one already exists). */
export function restoreSampleSet(lang: Lang = langStore.get()): QuestionSet {
  const [sample] = createSampleSets(Date.now(), lang);
  const exists = libraryStore.get().sets.some((s) => s.id === sampleSetId(lang));
  const set: QuestionSet = exists ? { ...sample, id: uid('set'), name: `${sample.name} ${t('(fresh copy)')}` } : sample;
  libraryStore.set((prev) => ({ sets: [...prev.sets, set] }));
  return set;
}

export function upsertQuestion(setId: string, question: Question): void {
  updateSet(setId, (s) => {
    const index = s.questions.findIndex((q) => q.id === question.id);
    const questions = index >= 0 ? s.questions.map((q) => (q.id === question.id ? question : q)) : [...s.questions, question];
    return { ...s, questions };
  });
}

export function deleteQuestion(setId: string, questionId: string): void {
  updateSet(setId, (s) => ({ ...s, questions: s.questions.filter((q) => q.id !== questionId) }));
}

export function duplicateQuestion(setId: string, questionId: string): void {
  updateSet(setId, (s) => {
    const index = s.questions.findIndex((q) => q.id === questionId);
    if (index < 0) return s;
    const source = s.questions[index];
    const idMap = new Map<string, string>();
    const answers = source.answers.map((a) => {
      const id = uid('a');
      idMap.set(a.id, id);
      return { ...a, id };
    });
    const copy: Question = { ...source, id: uid('q'), question: `${source.question}`, answers };
    if (source.alternateAnswers) {
      copy.alternateAnswers = source.alternateAnswers.map((alt) => ({ ...alt, matchesAnswerId: idMap.get(alt.matchesAnswerId) ?? alt.matchesAnswerId }));
    }
    const questions = [...s.questions];
    questions.splice(index + 1, 0, copy);
    return { ...s, questions };
  });
}

export function moveQuestion(setId: string, questionId: string, direction: -1 | 1): void {
  updateSet(setId, (s) => {
    const index = s.questions.findIndex((q) => q.id === questionId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= s.questions.length) return s;
    const questions = [...s.questions];
    [questions[index], questions[target]] = [questions[target], questions[index]];
    return { ...s, questions };
  });
}
