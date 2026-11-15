import { createPersistentStore } from '../../../core/state/persistentStore';

/** What the family chose last time on the New game screen. */
export interface Setup {
  teamNames: [string, string];
}

export const DEFAULT_SETUP: Setup = { teamNames: ['', ''] };

const NAME_MAX = 24;

export function cleanTeamName(raw: unknown): string {
  return typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX) : '';
}

function sanitize(raw: unknown): Setup {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_SETUP;
  const names = Array.isArray((raw as Partial<Setup>).teamNames) ? (raw as Setup).teamNames : [];
  return { teamNames: [cleanTeamName(names[0]), cleanTeamName(names[1])] };
}

export const setupStore = createPersistentStore<Setup>('setup.v1', sanitize);

/* Questions used in recent games, newest last, so new games reach for fresh ones first. */

const RECENT_MAX = 120;

function sanitizeRecent(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string').slice(-RECENT_MAX) : [];
}

export const recentQuestionsStore = createPersistentStore<string[]>('recent-questions.v1', sanitizeRecent);

export function rememberQuestions(ids: string[]): void {
  if (ids.length === 0) return;
  recentQuestionsStore.set((prev) => [...prev.filter((id) => !ids.includes(id)), ...ids].slice(-RECENT_MAX));
}
