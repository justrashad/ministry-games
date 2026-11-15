import { useSyncExternalStore } from 'react';
import { fullKey, parseJSON, readJSON, writeJSON } from '../lib/storage';

export interface PersistentStore<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(listener: () => void): () => void;
  useValue(): T;
}

/**
 * A tiny external store persisted to localStorage. Changes made in another tab
 * arrive through the "storage" event, so the TV window picks up settings too.
 */
export function createPersistentStore<T>(key: string, sanitize: (raw: unknown) => T): PersistentStore<T> {
  let value = sanitize(readJSON(key));
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  const get = () => value;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const set = (next: T | ((prev: T) => T)) => {
    const resolved = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
    if (Object.is(resolved, value)) return;
    value = resolved;
    writeJSON(key, resolved);
    emit();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key !== fullKey(key)) return;
      value = sanitize(parseJSON(e.newValue));
      emit();
    });
  }

  return {
    get,
    set,
    subscribe,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useValue: () => useSyncExternalStore(subscribe, get, get),
  };
}
