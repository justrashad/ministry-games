import type { Settings } from '../types';
import { sanitizeSettings } from '../engine/defaults';
import { STORAGE_KEYS } from '../lib/storage';
import { createPersistentStore } from './persistentStore';

export const settingsStore = createPersistentStore<Settings>(STORAGE_KEYS.settings, sanitizeSettings);

export const useSettings = () => settingsStore.useValue();

/** Update one section of settings. The result is re-sanitized so bad input can never persist. */
export function updateSettings<K extends keyof Settings>(section: K, patch: Partial<Settings[K]> | Settings[K]): void {
  settingsStore.set((prev) => {
    const current: unknown = prev[section];
    const merged =
      Array.isArray(current) || typeof current !== 'object' || current === null ? patch : { ...(current as object), ...(patch as object) };
    return sanitizeSettings({ ...prev, [section]: merged });
  });
}

export function replaceSettings(next: Settings): void {
  settingsStore.set(sanitizeSettings(next));
}
