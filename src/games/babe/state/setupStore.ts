import { createPersistentStore } from '../../../core/state/persistentStore';

/** What the family chose last time on the New game screen. */
export interface Setup {
  teamNames: [string, string];
  /** Question packs switched off on the New game screen ('starter' for the starter pack). */
  skippedPacks: string[];
}

export const DEFAULT_SETUP: Setup = { teamNames: ['', ''], skippedPacks: [] };

const NAME_MAX = 24;

export function cleanTeamName(raw: unknown): string {
  return typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX) : '';
}

function sanitize(raw: unknown): Setup {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_SETUP;
  const s = raw as Partial<Setup>;
  const names = Array.isArray(s.teamNames) ? s.teamNames : [];
  const skippedPacks = Array.isArray(s.skippedPacks) ? s.skippedPacks.filter((id): id is string => typeof id === 'string').slice(0, 50) : [];
  return { teamNames: [cleanTeamName(names[0]), cleanTeamName(names[1])], skippedPacks };
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
