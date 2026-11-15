import { createPersistentStore } from '../../../core/state/persistentStore';
import { BOARD_LIMITS } from '../engine/createGame';

/** What the family chose last time on the New game screen. */
export interface Setup {
  teamNames: [string, string];
  rounds: number;
  categories: number;
  /** Question packs switched off on the New game screen ('starter' for the starter pack). */
  skippedPacks: string[];
}

export const DEFAULT_SETUP: Setup = { teamNames: ['', ''], rounds: 2, categories: 6, skippedPacks: [] };

const NAME_MAX = 24;

function clampInt(raw: unknown, min: number, max: number, fallback: number): number {
  const n = typeof raw === 'number' ? raw : Number.NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

export function cleanTeamName(raw: unknown): string {
  return typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX) : '';
}

function sanitize(raw: unknown): Setup {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_SETUP;
  const s = raw as Partial<Setup>;
  const names = Array.isArray(s.teamNames) ? s.teamNames : [];
  return {
    teamNames: [cleanTeamName(names[0]), cleanTeamName(names[1])],
    rounds: clampInt(s.rounds, BOARD_LIMITS.rounds.min, BOARD_LIMITS.rounds.max, DEFAULT_SETUP.rounds),
    categories: clampInt(s.categories, BOARD_LIMITS.categories.min, BOARD_LIMITS.categories.max, DEFAULT_SETUP.categories),
    skippedPacks: Array.isArray(s.skippedPacks) ? s.skippedPacks.filter((id): id is string => typeof id === 'string').slice(0, 50) : [],
  };
}

export const setupStore = createPersistentStore<Setup>('setup.v1', sanitize);

/* Clues used in recent games, newest last, so new games reach for fresh ones first. */

const RECENT_MAX = 240;

function sanitizeRecent(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string').slice(-RECENT_MAX) : [];
}

export const recentCluesStore = createPersistentStore<string[]>('recent-clues.v1', sanitizeRecent);

export function rememberClues(ids: string[]): void {
  recentCluesStore.set((prev) => [...prev.filter((id) => !ids.includes(id)), ...ids].slice(-RECENT_MAX));
}
