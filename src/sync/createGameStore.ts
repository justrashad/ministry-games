import { useSyncExternalStore } from 'react';
import { uid } from '../lib/ids';
import { fullKey, parseJSON, readJSON, writeJSON } from '../lib/storage';
import { createLocalChannel, type Transport } from './channel';
import type { GameDefinition } from './definition';
import { createCodec, mergeEnvelope, type GameEnvelope, type SyncMessage } from './envelope';

/*
 * Every window (and every connected phone) holds a replica of the game. Whoever
 * dispatches applies the title's pure reducer, bumps a revision number, saves to
 * localStorage (refresh recovery), and sends the new state over every transport.
 * Receivers adopt anything newer and pass it along to their other transports,
 * so the TV window relays between the laptop's tabs and a phone remote.
 */

const POLL_MS = 600;

/** The part of a store the phone remote uses. It never needs to know the title's types. */
export interface SyncStore {
  readonly origin: string;
  sanitizeMessage(raw: unknown): SyncMessage | null;
  receiveSyncMessage(message: SyncMessage, source: Transport): void;
  registerTransport(transport: Transport): () => void;
  setAcceptRemoteActions(accept: boolean): void;
}

export interface GameStore<S, A, R> extends SyncStore {
  readonly syncMode: 'BroadcastChannel' | 'storage polling';
  dispatchGame(action: A): void;
  getGameState(): S | null;
  getEnvelope(): GameEnvelope<S>;
  useGameState(): S | null;
  applyRemoteAction(action: R): void;
}

let active: SyncStore | null = null;

/** The store of the title this app was built as. The phone remote talks to it through this. */
export function activeStore(): SyncStore {
  if (!active) throw new Error('No game store has been created yet. Import the store of the title before using the phone remote.');
  return active;
}

export function createGameStore<S, A, R>(definition: GameDefinition<S, A, R>): GameStore<S, A, R> {
  const origin = uid('win');
  const codec = createCodec<S, R>(definition);

  let envelope: GameEnvelope<S> = codec.sanitizeEnvelope(readJSON(definition.storageKey)) ?? { rev: 0, origin, state: null };
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  const transports = new Map<string, Transport>();
  let acceptRemoteActions = false;

  function broadcast(message: SyncMessage, exceptId?: string): void {
    transports.forEach((t) => {
      if (t.id !== exceptId) t.post(message);
    });
  }

  function apply(next: GameEnvelope<S>, sourceId: string | undefined, persist: boolean): void {
    envelope = next;
    if (persist) writeJSON(definition.storageKey, envelope);
    broadcast({ type: 'state', envelope }, sourceId);
    emit();
  }

  function dispatchGame(action: A): void {
    const next = definition.reduce(envelope.state, action);
    if (next === envelope.state) return;
    apply({ rev: envelope.rev + 1, origin, state: next }, undefined, true);
  }

  function applyRemoteAction(action: R): void {
    definition.applyRemoteAction(action, envelope.state, dispatchGame, Date.now());
  }

  /** Entry point for every message arriving over any transport. Messages must already be sanitized. */
  function receiveSyncMessage(raw: SyncMessage, source: Transport): void {
    const message = raw as SyncMessage<S, R>;
    if (message.type === 'ping') return;
    if (message.type === 'action') {
      if (acceptRemoteActions) applyRemoteAction(message.action);
      return;
    }
    if (message.type === 'hello') {
      if (message.origin === origin) return;
      if (message.wantsSync) source.post({ type: 'state', envelope, force: true });
      else if (envelope.state) source.post({ type: 'state', envelope });
      return;
    }
    const next = mergeEnvelope(envelope, message.envelope, message.force === true);
    // Local-channel messages were already saved by the sender (same localStorage), remote ones were not.
    if (next) apply(next, source.id, source.id !== 'local');
  }

  /** Adds a transport (for example a phone connection). Returns a function that removes it. */
  function registerTransport(transport: Transport): () => void {
    transports.set(transport.id, transport);
    return () => {
      if (transports.get(transport.id) === transport) transports.delete(transport.id);
    };
  }

  const local = createLocalChannel(definition.channelName, codec.sanitizeMessage);

  if (typeof window !== 'undefined') {
    registerTransport(local);
    local.subscribe((message) => receiveSyncMessage(message, local));
    const adoptFromStorage = (raw: unknown) => {
      const stored = codec.sanitizeEnvelope(raw);
      if (!stored) return;
      const next = mergeEnvelope(envelope, stored, false);
      if (next) apply(next, 'local', false);
    };
    window.addEventListener('storage', (e) => {
      if (e.key === fullKey(definition.storageKey)) adoptFromStorage(parseJSON(e.newValue));
    });
    if (!local.native) window.setInterval(() => adoptFromStorage(readJSON(definition.storageKey)), POLL_MS);
    local.post({ type: 'hello', origin });
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const snapshot = () => envelope.state;

  const store: GameStore<S, A, R> = {
    origin,
    syncMode: local.native ? 'BroadcastChannel' : 'storage polling',
    sanitizeMessage: codec.sanitizeMessage,
    receiveSyncMessage,
    registerTransport,
    /** Only the TV window (the room owner) carries out actions sent by buzzer and player phones. */
    setAcceptRemoteActions: (accept) => {
      acceptRemoteActions = accept;
    },
    dispatchGame,
    getGameState: () => envelope.state,
    getEnvelope: () => envelope,
    useGameState: () => useSyncExternalStore(subscribe, snapshot, snapshot),
    applyRemoteAction,
  };
  active = store;
  return store;
}
