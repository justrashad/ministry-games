import { useEffect, useState } from 'react';
import { readRaw, STORAGE_KEYS, writeRaw } from '../lib/storage';
import { useRemoteStatus } from './remote';

const BEAT_MS = 2000;
const STALE_MS = 5500;

/** The game screen announces itself so the host window knows not to double up sounds. */
export function startDisplayPresence(): () => void {
  const beat = () => writeRaw(STORAGE_KEYS.presence, String(Date.now()), true);
  beat();
  const id = window.setInterval(beat, BEAT_MS);
  const clear = () => writeRaw(STORAGE_KEYS.presence, '0', true);
  window.addEventListener('pagehide', clear);
  return () => {
    window.clearInterval(id);
    window.removeEventListener('pagehide', clear);
    clear();
  };
}

function isConnected(): boolean {
  const last = Number(readRaw(STORAGE_KEYS.presence) ?? 0);
  return Number.isFinite(last) && Date.now() - last < STALE_MS;
}

/**
 * True when a game screen is showing this game: a TV window on this computer,
 * or, for a phone remote, the TV it is connected to.
 */
export function useDisplayConnected(): boolean {
  const remote = useRemoteStatus();
  const [connected, setConnected] = useState(isConnected);
  useEffect(() => {
    const id = window.setInterval(() => setConnected(isConnected()), 1500);
    return () => window.clearInterval(id);
  }, []);
  if (remote.role === 'remote') return remote.phase === 'connected';
  return connected;
}
