import type { SyncMessage } from './envelope';

export type { GameEnvelope, SyncMessage } from './envelope';

/** Anything that can carry sync messages: a BroadcastChannel, a phone connection, and so on. */
export interface Transport {
  readonly id: string;
  post(message: SyncMessage): void;
}

export interface LocalChannel extends Transport {
  readonly native: boolean;
  subscribe(listener: (message: SyncMessage) => void): () => void;
}

/**
 * BroadcastChannel when available; otherwise a no-op channel (the store falls back to storage events + polling).
 * The title's store passes its channel name and its message validator.
 */
export function createLocalChannel(name: string, sanitizeMessage: (raw: unknown) => SyncMessage | null): LocalChannel {
  if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel(name);
      const listeners = new Set<(m: SyncMessage) => void>();
      bc.onmessage = (event: MessageEvent) => {
        const message = sanitizeMessage(event.data);
        if (message) listeners.forEach((l) => l(message));
      };
      return {
        id: 'local',
        native: true,
        post: (message) => {
          try {
            bc.postMessage(message);
          } catch {
            /* ignore */
          }
        },
        subscribe: (listener) => {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
      };
    } catch {
      /* fall through */
    }
  }
  return { id: 'local', native: false, post: () => undefined, subscribe: () => () => undefined };
}
