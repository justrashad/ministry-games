import type { HistoryEntry } from '../types';
import { STORAGE_KEYS } from '../../../core/lib/storage';
import { createPersistentStore } from '../../../core/state/persistentStore';

const MAX_ENTRIES = 50;

function sanitizeHistory(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (e): e is HistoryEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as HistoryEntry).id === 'string' &&
        Array.isArray((e as HistoryEntry).teams) &&
        (e as HistoryEntry).teams.length === 2 &&
        Array.isArray((e as HistoryEntry).rounds),
    )
    .slice(0, MAX_ENTRIES);
}

export const historyStore = createPersistentStore<HistoryEntry[]>(STORAGE_KEYS.history, sanitizeHistory);
export const useHistory = () => historyStore.useValue();

/** Inserts or replaces an entry by game id so re-recording never duplicates. */
export function saveHistoryEntry(entry: HistoryEntry): void {
  historyStore.set((prev) => [entry, ...prev.filter((e) => e.id !== entry.id)].slice(0, MAX_ENTRIES));
}

export function patchHistoryEntry(id: string, patch: Partial<HistoryEntry>): void {
  historyStore.set((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
}

export function deleteHistoryEntry(id: string): void {
  historyStore.set((prev) => prev.filter((e) => e.id !== id));
}

/** Question ids (rounds and Final Challenge) played in the most recent `games` games. */
export function recentQuestionIds(games: number): Set<string> {
  const ids = new Set<string>();
  if (games <= 0) return ids;
  for (const entry of historyStore.get().slice(0, games)) {
    entry.rounds.forEach((r) => ids.add(r.questionId));
    entry.finalChallenge?.questionIds?.forEach((id) => ids.add(id));
  }
  return ids;
}

export function clearHistory(): void {
  historyStore.set([]);
}
