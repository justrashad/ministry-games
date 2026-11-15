import { useSyncExternalStore } from 'react';
import type { DataConnection, Peer as PeerInstance, PeerOptions } from 'peerjs';
import { readRaw, writeRaw } from '../lib/storage';
import type { Transport } from './channel';
import { sanitizeMessage, type RemoteAction } from './envelope';
import { receiveSyncMessage, registerTransport, setAcceptRemoteActions, WINDOW_ORIGIN } from './gameStore';
import { msg } from '../i18n/i18n';
import { generateRoomCode, isValidRoomCode, normalizeRoomCode, peerIdForRoom } from './roomCode';

/*
 * Phone remote. The TV window opens a "room" (a PeerJS peer with a fixed id built
 * from a short code). A phone connects to it directly over WebRTC. The public
 * PeerJS service is only used to introduce the two devices; game data flows
 * device to device. Each connection is just another sync transport, so the
 * existing replicated game store does the rest.
 */

export type RemoteRole = 'none' | 'room' | 'remote';
export type RemotePhase = 'idle' | 'starting' | 'waiting' | 'connected' | 'reconnecting' | 'error';

export interface RemoteStatus {
  role: RemoteRole;
  phase: RemotePhase;
  code: string | null;
  phones: number;
  /** English message text; screens translate it with t(error, errorVars). */
  error: string | null;
  errorVars?: Record<string, string>;
}

const ROOM_KEY = 'remote-room-code';
const ROLE_KEY = 'survey-showdown:remote-role';
const JOIN_KEY = 'survey-showdown:remote-join';
const PING_MS = 4000;
const STALE_MS = 13000;
const RETRY_MS = 3000;
const CONNECT_TIMEOUT_MS = 10000;
const MAX_ID_RETRIES = 6;
const PEER_OPTIONS: PeerOptions = { debug: 0 };

let status: RemoteStatus = { role: 'none', phase: 'idle', code: null, phones: 0, error: null };
const listeners = new Set<() => void>();

function setStatus(patch: Partial<RemoteStatus>): void {
  status = { ...status, ...patch };
  if (!('errorVars' in patch) && 'error' in patch) delete status.errorVars;
  listeners.forEach((l) => l());
}

export function getRemoteStatus(): RemoteStatus {
  return status;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRemoteStatus(): RemoteStatus {
  return useSyncExternalStore(subscribe, getRemoteStatus, getRemoteStatus);
}

type PeerConstructor = new (...args: unknown[]) => PeerInstance;
let peerCtor: PeerConstructor | null = null;

/** PeerJS is loaded only when someone uses the remote, keeping the main bundle small. */
async function loadPeer(): Promise<PeerConstructor> {
  if (peerCtor) return peerCtor;
  const mod = (await import('peerjs')) as unknown as { Peer?: PeerConstructor; default?: PeerConstructor };
  const ctor = mod.Peer ?? mod.default;
  if (!ctor) throw new Error('PeerJS unavailable');
  peerCtor = ctor;
  return ctor;
}

function errorType(err: unknown): string {
  return typeof err === 'object' && err !== null && typeof (err as { type?: unknown }).type === 'string' ? (err as { type: string }).type : 'unknown';
}

const timers = new Set<number>();
function later(fn: () => void, ms: number): void {
  const id = window.setTimeout(() => {
    timers.delete(id);
    fn();
  }, ms);
  timers.add(id);
}
function clearTimers(): void {
  timers.forEach((id) => window.clearTimeout(id));
  timers.clear();
}

interface Attached {
  transport: Transport;
  close: () => void;
}

/** Wires a data connection into the game store with a heartbeat that detects silent drops (sleeping phones). */
function attach(conn: DataConnection, onGone: () => void): Attached {
  const transport: Transport = {
    id: `peer:${conn.connectionId}`,
    post: (message) => {
      try {
        if (conn.open) void conn.send(message);
      } catch {
        /* the heartbeat will notice a dead connection */
      }
    },
  };
  let lastSeen = Date.now();
  let done = false;
  const unregister = registerTransport(transport);
  const finish = () => {
    if (done) return;
    done = true;
    window.clearInterval(heartbeat);
    unregister();
    onGone();
  };
  const heartbeat = window.setInterval(() => {
    if (Date.now() - lastSeen > STALE_MS) {
      finish();
      try {
        conn.close();
      } catch {
        /* ignore */
      }
      return;
    }
    transport.post({ type: 'ping' });
  }, PING_MS);
  conn.on('data', (raw: unknown) => {
    lastSeen = Date.now();
    const message = sanitizeMessage(raw);
    if (message) receiveSyncMessage(message, transport);
  });
  conn.on('close', finish);
  conn.on('error', finish);
  return {
    transport,
    close: () => {
      finish();
      try {
        conn.close();
      } catch {
        /* ignore */
      }
    },
  };
}

/* ------------------------------ TV side -------------------------------- */

let roomPeer: PeerInstance | null = null;
const roomConnections = new Map<string, Attached>();
let idRetries = 0;

function updatePhoneCount(): void {
  if (status.role !== 'room') return;
  const phones = roomConnections.size;
  setStatus({ phones, phase: phones > 0 ? 'connected' : roomPeer?.open ? 'waiting' : status.phase });
}

function roomCode(fresh = false): string {
  const saved = readRaw(ROOM_KEY);
  if (!fresh && saved && isValidRoomCode(saved)) return saved;
  const code = generateRoomCode();
  writeRaw(ROOM_KEY, code, true);
  return code;
}

export function isRoomEnabled(): boolean {
  const saved = readRaw(ROOM_KEY);
  return !!saved && isValidRoomCode(saved) && readRaw(`${ROOM_KEY}-on`) === '1';
}

function openRoomPeer(Peer: PeerConstructor, code: string): void {
  if (status.role !== 'room') return;
  const peer = new Peer(peerIdForRoom(code), PEER_OPTIONS);
  roomPeer = peer;

  peer.on('open', () => {
    idRetries = 0;
    setStatus({ phase: roomConnections.size > 0 ? 'connected' : 'waiting', error: null });
  });

  peer.on('connection', (conn: DataConnection) => {
    conn.on('open', () => {
      const attached = attach(conn, () => {
        roomConnections.delete(conn.connectionId);
        updatePhoneCount();
      });
      roomConnections.set(conn.connectionId, attached);
      updatePhoneCount();
    });
  });

  peer.on('disconnected', () => {
    // Lost the introduction service only; phones already connected keep working.
    if (roomPeer === peer && !peer.destroyed) later(() => !peer.destroyed && peer.reconnect(), RETRY_MS);
  });

  peer.on('error', (err: unknown) => {
    if (roomPeer !== peer) return;
    const type = errorType(err);
    if (type === 'unavailable-id') {
      // Usually this TV's own previous session is still registered for a few seconds.
      // If it keeps happening, another TV has this code, so pick a new one.
      peer.destroy();
      roomPeer = null;
      idRetries += 1;
      const next = idRetries > MAX_ID_RETRIES ? roomCode(true) : code;
      if (next !== code) idRetries = 0;
      setStatus({ phase: 'starting', code: next, error: null });
      later(() => openRoomPeer(Peer, next), RETRY_MS);
      return;
    }
    if (type === 'browser-incompatible') {
      setStatus({ phase: 'error', error: msg("This browser can't connect to phones. Try Chrome, Edge, Safari or Firefox.") });
      return;
    }
    if (['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected'].includes(type)) {
      setStatus({ phase: roomConnections.size > 0 ? 'connected' : 'error', error: msg('Trying to reach the connection service. Check the internet connection.') });
      later(() => {
        if (status.role !== 'room' || roomPeer !== peer) return;
        if (peer.destroyed) openRoomPeer(Peer, code);
        else peer.reconnect();
      }, RETRY_MS * 2);
    }
  });
}

/** Opens (or resumes) the TV's phone room. Safe to call repeatedly. */
export async function startRoom(): Promise<void> {
  if (status.role === 'room') return;
  if (status.role === 'remote') leaveRoom();
  const code = roomCode();
  writeRaw(`${ROOM_KEY}-on`, '1', true);
  setAcceptRemoteActions(true);
  setStatus({ role: 'room', phase: 'starting', code, phones: 0, error: null });
  let Peer: PeerConstructor;
  try {
    Peer = await loadPeer();
  } catch {
    setStatus({ phase: 'error', error: msg("The phone remote couldn't load. Connect to the internet and try again.") });
    return;
  }
  openRoomPeer(Peer, code);
}

export function stopRoom(): void {
  writeRaw(`${ROOM_KEY}-on`, '0', true);
  setAcceptRemoteActions(false);
  clearTimers();
  roomConnections.forEach((c) => c.close());
  roomConnections.clear();
  roomPeer?.destroy();
  roomPeer = null;
  setStatus({ role: 'none', phase: 'idle', code: null, phones: 0, error: null });
}

/** Gives the room a brand-new code and disconnects any phones (use if an unwanted device joined). */
export async function newRoomCode(): Promise<void> {
  stopRoom();
  roomCode(true);
  await startRoom();
}

/* ------------------------------ phone side ----------------------------- */

let remotePeer: PeerInstance | null = null;
let remoteLink: Attached | null = null;
let everConnected = false;

function savedJoinCode(): string | null {
  try {
    return window.sessionStorage.getItem(JOIN_KEY);
  } catch {
    return null;
  }
}

function saveJoinCode(code: string | null): void {
  try {
    if (code) window.sessionStorage.setItem(JOIN_KEY, code);
    else window.sessionStorage.removeItem(JOIN_KEY);
  } catch {
    /* ignore */
  }
}

function scheduleReconnect(): void {
  if (status.role !== 'remote') return;
  later(connectToRoom, RETRY_MS);
}

function connectToRoom(): void {
  if (status.role !== 'remote' || !status.code || remoteLink) return;
  const peer = remotePeer;
  if (!peer || peer.destroyed) return;
  if (!peer.open) {
    if (peer.disconnected) peer.reconnect();
    return;
  }
  const conn = peer.connect(peerIdForRoom(status.code), { reliable: true });
  let opened = false;
  later(() => {
    if (opened || status.role !== 'remote') return;
    try {
      conn.close();
    } catch {
      /* ignore */
    }
    setStatus({ phase: everConnected ? 'reconnecting' : 'starting' });
    scheduleReconnect();
  }, CONNECT_TIMEOUT_MS);
  conn.on('open', () => {
    opened = true;
    everConnected = true;
    remoteLink = attach(conn, () => {
      remoteLink = null;
      if (status.role !== 'remote') return;
      setStatus({ phase: 'reconnecting', error: null });
      scheduleReconnect();
    });
    // Ask the TV for its game. Its reply replaces whatever this phone had stored.
    remoteLink.transport.post({ type: 'hello', origin: WINDOW_ORIGIN, wantsSync: true });
    setStatus({ phase: 'connected', error: null });
  });
}

/** Connects this device to a TV as its remote. */
export async function joinRoom(rawCode: string): Promise<boolean> {
  const code = normalizeRoomCode(rawCode);
  if (!isValidRoomCode(code)) {
    setStatus({ role: 'none', phase: 'error', code: null, error: msg('Room codes are 5 letters and numbers, like the one on the TV.') });
    return false;
  }
  if (status.role === 'room') stopRoom();
  if (status.role === 'remote' && status.code === code && remotePeer && !remotePeer.destroyed) {
    connectToRoom();
    return true;
  }
  leaveRoom(false);
  saveJoinCode(code);
  everConnected = false;
  setStatus({ role: 'remote', phase: 'starting', code, phones: 0, error: null });
  let Peer: PeerConstructor;
  try {
    Peer = await loadPeer();
  } catch {
    setStatus({ phase: 'error', error: msg("The phone remote couldn't load. Connect to the internet and try again.") });
    return false;
  }
  if (status.role !== 'remote' || status.code !== code) return false;
  const peer = new Peer(PEER_OPTIONS);
  remotePeer = peer;
  peer.on('open', connectToRoom);
  peer.on('disconnected', () => {
    if (remotePeer === peer && !peer.destroyed) later(() => !peer.destroyed && peer.reconnect(), RETRY_MS);
  });
  peer.on('error', (err: unknown) => {
    if (remotePeer !== peer || status.role !== 'remote') return;
    const type = errorType(err);
    if (type === 'peer-unavailable') {
      if (everConnected) {
        setStatus({ phase: 'reconnecting', error: null });
        scheduleReconnect();
      } else {
        setStatus({ phase: 'error', error: msg('No TV is using code {code} right now. Check the code on the TV screen.'), errorVars: { code } });
      }
      return;
    }
    if (type === 'browser-incompatible') {
      setStatus({ phase: 'error', error: msg("This browser can't act as a remote. Try Chrome or Safari.") });
      return;
    }
    setStatus({ phase: everConnected ? 'reconnecting' : 'error', error: msg('Having trouble reaching the TV. Check that both devices are online.') });
    later(() => {
      if (remotePeer !== peer || status.role !== 'remote') return;
      if (peer.disconnected && !peer.destroyed) peer.reconnect();
      else connectToRoom();
    }, RETRY_MS * 2);
  });
  return true;
}

export type PhoneRole = 'host' | 'buzzer' | 'player';

/** Remembers what this phone is being used for, so a refresh returns to the same screen. */
export function savePhoneRole(role: PhoneRole | null): void {
  try {
    if (role) window.sessionStorage.setItem(ROLE_KEY, role);
    else window.sessionStorage.removeItem(ROLE_KEY);
  } catch {
    /* ignore */
  }
}

export function getPhoneRole(): PhoneRole | null {
  try {
    const value = window.sessionStorage.getItem(ROLE_KEY);
    return value === 'host' || value === 'buzzer' || value === 'player' ? value : null;
  } catch {
    return null;
  }
}

/** Sends a buzz or a Final Challenge answer to the TV. Returns false when not connected. */
export function sendRemoteAction(action: RemoteAction): boolean {
  if (status.role !== 'remote' || status.phase !== 'connected' || !remoteLink) return false;
  remoteLink.transport.post({ type: 'action', action });
  return true;
}

/** Retries right away after an error, keeping the same code. */
export function retryJoin(): void {
  if (status.code) void joinRoom(status.code);
}

export function leaveRoom(clearSaved = true): void {
  if (clearSaved) {
    saveJoinCode(null);
    savePhoneRole(null);
  }
  clearTimers();
  remoteLink?.close();
  remoteLink = null;
  remotePeer?.destroy();
  remotePeer = null;
  everConnected = false;
  if (status.role !== 'room') setStatus({ role: 'none', phase: 'idle', code: null, phones: 0, error: null });
}

export function clearRemoteError(): void {
  if (status.role === 'none') setStatus({ phase: 'idle', error: null });
}

/** Resumes a phone's remote session after a refresh (the TV resumes its room from the game screen). */
export function resumeRemoteSession(): void {
  const code = savedJoinCode();
  if (code) void joinRoom(code);
}

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || status.role !== 'remote' || remoteLink) return;
    if (remotePeer?.disconnected && !remotePeer.destroyed) remotePeer.reconnect();
    connectToRoom();
  });
}

