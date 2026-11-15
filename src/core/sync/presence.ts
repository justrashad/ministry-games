import { useEffect, useState } from 'react';
import { readRaw, STORAGE_KEYS, writeRaw } from '../lib/storage';
import { useRemoteStatus } from './remote';

const BEAT_MS = 2000;
const STALE_MS = 5500;

/**
 * The game screen announces itself so the host window knows not to double up
 * sounds. It only counts while it is on screen: a game screen hidden in another
 * tab (an iPad switched back to the host controls) hands the sound to the host.
 */
export function startDisplayPresence(): () => void {
  const clear = () => writeRaw(STORAGE_KEYS.presence, '0', true);
  const beat = () => {
    if (document.visibilityState === 'hidden') clear();
    else writeRaw(STORAGE_KEYS.presence, String(Date.now()), true);
  };
  beat();
  const id = window.setInterval(beat, BEAT_MS);
  document.addEventListener('visibilitychange', beat);
  window.addEventListener('pagehide', clear);
  return () => {
    window.clearInterval(id);
    document.removeEventListener('visibilitychange', beat);
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
    const update = () => setConnected(isConnected());
    const id = window.setInterval(update, 1000);
    window.addEventListener('storage', update);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('storage', update);
    };
  }, []);
  if (remote.role === 'remote') return remote.phase === 'connected';
  return connected;
}
