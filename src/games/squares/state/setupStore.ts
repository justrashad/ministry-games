import { createPersistentStore } from '../../../core/state/persistentStore';
import { MATCH_LIMITS } from '../engine/createGame';

/** What the family chose last time on the New game screen. */
export interface Setup {
  teamNames: [string, string];
  /** Games a team must win to take the match. */
  gamesToWin: number;
  /** Statement packs switched off on the New game screen ('starter' for the starter pack). */
  skippedPacks: string[];
}

export const DEFAULT_SETUP: Setup = { teamNames: ['', ''], gamesToWin: 2, skippedPacks: [] };

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
    gamesToWin: clampInt(s.gamesToWin, MATCH_LIMITS.gamesToWin.min, MATCH_LIMITS.gamesToWin.max, DEFAULT_SETUP.gamesToWin),
    skippedPacks: Array.isArray(s.skippedPacks) ? s.skippedPacks.filter((id): id is string => typeof id === 'string').slice(0, 50) : [],
  };
}

export const setupStore = createPersistentStore<Setup>('setup.v1', sanitize);

/* Statements played in recent matches, newest last, so new matches reach for fresh ones first. */

const RECENT_MAX = 120;

function sanitizeRecent(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string').slice(-RECENT_MAX) : [];
}

export const recentStatementsStore = createPersistentStore<string[]>('recent-statements.v1', sanitizeRecent);

export function rememberStatements(ids: string[]): void {
  if (ids.length === 0) return;
  recentStatementsStore.set((prev) => [...prev.filter((id) => !ids.includes(id)), ...ids].slice(-RECENT_MAX));
}
