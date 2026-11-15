/** Safe localStorage access: every call tolerates disabled, full, or missing storage. */

import { TITLE } from '../title';

// Each title saves under its own prefix (see titles.config.ts).
const PREFIX = TITLE.storagePrefix;

export const STORAGE_KEYS = {
  settings: 'settings.v1',
  library: 'library.v1',
  history: 'history.v1',
  game: 'game.v1',
  presence: 'display-presence',
  license: 'license.v1',
} as const;

type ErrorListener = (message: string) => void;
const errorListeners = new Set<ErrorListener>();
let lastErrorAt = 0;

export function fullKey(key: string): string {
  return PREFIX + key;
}

function store(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function isStorageAvailable(): boolean {
  const s = store();
  if (!s) return false;
  try {
    const probe = fullKey('__probe');
    s.setItem(probe, '1');
    s.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function parseJSON(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function readRaw(key: string): string | null {
  try {
    return store()?.getItem(fullKey(key)) ?? null;
  } catch {
    return null;
  }
}

export function readJSON(key: string): unknown {
  return parseJSON(readRaw(key));
}

function notify(message: string): void {
  const now = Date.now();
  if (now - lastErrorAt < 5000) return;
  lastErrorAt = now;
  errorListeners.forEach((l) => l(message));
}

export function writeRaw(key: string, value: string, silent = false): boolean {
  const s = store();
  if (!s) {
    if (!silent) notify("This browser isn't allowing saves, so changes will be lost when the page closes.");
    return false;
  }
  try {
    s.setItem(fullKey(key), value);
    return true;
  } catch {
    if (!silent) notify('Saving failed because browser storage is full or blocked. Export your question sets to keep a copy.');
    return false;
  }
}

export function writeJSON(key: string, value: unknown, silent = false): boolean {
  let text: string;
  try {
    text = JSON.stringify(value);
  } catch {
    if (!silent) notify('Something could not be saved.');
    return false;
  }
  return writeRaw(key, text, silent);
}

export function removeKey(key: string): void {
  try {
    store()?.removeItem(fullKey(key));
  } catch {
    /* ignore */
  }
}

export function clearAllAppData(): void {
  const s = store();
  if (!s) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < s.length; i += 1) {
      const k = s.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => s.removeItem(k));
  } catch {
    /* ignore */
  }
}

export function onStorageError(listener: ErrorListener): () => void {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

export function approximateUsageKB(): number {
  const s = store();
  if (!s) return 0;
  let bytes = 0;
  try {
    for (let i = 0; i < s.length; i += 1) {
      const k = s.key(i);
      if (k && k.startsWith(PREFIX)) bytes += (k.length + (s.getItem(k)?.length ?? 0)) * 2;
    }
  } catch {
    return 0;
  }
  return Math.round(bytes / 1024);
}
