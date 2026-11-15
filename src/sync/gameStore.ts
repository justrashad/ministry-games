import { useSyncExternalStore } from 'react';
import type { GameState } from '../types';
import { reduceGame, type GameAction } from '../engine/game';
import { uid } from '../lib/ids';
import { fullKey, parseJSON, readJSON, STORAGE_KEYS, writeJSON } from '../lib/storage';
import { createLocalChannel, type Transport } from './channel';
import { mergeEnvelope, sanitizeEnvelope, type GameEnvelope, type RemoteAction, type SyncMessage } from './envelope';

/*
 * Every window (and every connected phone) holds a replica of the game. Whoever
 * dispatches applies the pure reducer, bumps a revision number, saves to
 * localStorage (refresh recovery), and sends the new state over every transport.
 * Receivers adopt anything newer and pass it along to their other transports,
 * so the TV window relays between the laptop's tabs and a phone remote.
 */

export const WINDOW_ORIGIN = uid('win');
const POLL_MS = 600;

let envelope: GameEnvelope = sanitizeEnvelope(readJSON(STORAGE_KEYS.game)) ?? { rev: 0, origin: WINDOW_ORIGIN, state: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const transports = new Map<string, Transport>();

function broadcast(message: SyncMessage, exceptId?: string): void {
  transports.forEach((t) => {
    if (t.id !== exceptId) t.post(message);
  });
}

function apply(next: GameEnvelope, sourceId: string | undefined, persist: boolean): void {
  envelope = next;
  if (persist) writeJSON(STORAGE_KEYS.game, envelope);
  broadcast({ type: 'state', envelope }, sourceId);
  emit();
}

let acceptRemoteActions = false;

/** Only the TV window (the room owner) carries out actions sent by buzzer and player phones. */
export function setAcceptRemoteActions(accept: boolean): void {
  acceptRemoteActions = accept;
}

export function applyRemoteAction(action: RemoteAction): void {
  const now = Date.now();
  if (action.type === 'BUZZ') {
    dispatchGame({ type: 'BUZZ', team: action.team });
    return;
  }
  // A player's phone may only answer its own turn's current question. If the host
  // already moved on (typed an answer or passed), the late answer is dropped rather
  // than landing on the wrong question.
  const fc = envelope.state?.finalChallenge;
  if (!fc || fc.phase !== 'answering' || fc.activePlayer !== action.player || fc.current !== action.question) return;
  dispatchGame({ type: 'FC_SUBMIT', text: action.text, now });
}

/** Entry point for every message arriving over any transport. */
export function receiveSyncMessage(message: SyncMessage, source: Transport): void {
  if (message.type === 'ping') return;
  if (message.type === 'action') {
    if (acceptRemoteActions) applyRemoteAction(message.action);
    return;
  }
  if (message.type === 'hello') {
    if (message.origin === WINDOW_ORIGIN) return;
    if (message.wantsSync) source.post({ type: 'state', envelope, force: true });
    else if (envelope.state) source.post({ type: 'state', envelope });
    return;
  }
  const next = mergeEnvelope(envelope, message.envelope, message.force === true);
  // Local-channel messages were already saved by the sender (same localStorage), remote ones were not.
  if (next) apply(next, source.id, source.id !== 'local');
}

/** Adds a transport (for example a phone connection). Returns a function that removes it. */
export function registerTransport(transport: Transport): () => void {
  transports.set(transport.id, transport);
  return () => {
    if (transports.get(transport.id) === transport) transports.delete(transport.id);
  };
}

export function getEnvelope(): GameEnvelope {
  return envelope;
}

const local = createLocalChannel();
export const syncMode = local.native ? 'BroadcastChannel' : 'storage polling';

if (typeof window !== 'undefined') {
  registerTransport(local);
  local.subscribe((message) => receiveSyncMessage(message, local));
  const adoptFromStorage = (raw: unknown) => {
    const stored = sanitizeEnvelope(raw);
    if (!stored) return;
    const next = mergeEnvelope(envelope, stored, false);
    if (next) apply(next, 'local', false);
  };
  window.addEventListener('storage', (e) => {
    if (e.key === fullKey(STORAGE_KEYS.game)) adoptFromStorage(parseJSON(e.newValue));
  });
  if (!local.native) window.setInterval(() => adoptFromStorage(readJSON(STORAGE_KEYS.game)), POLL_MS);
  local.post({ type: 'hello', origin: WINDOW_ORIGIN });
}

export function dispatchGame(action: GameAction): void {
  const next = reduceGame(envelope.state, action);
  if (next === envelope.state) return;
  apply({ rev: envelope.rev + 1, origin: WINDOW_ORIGIN, state: next }, undefined, true);
}

export function getGameState(): GameState | null {
  return envelope.state;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const snapshot = () => envelope.state;

export function useGameState(): GameState | null {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
