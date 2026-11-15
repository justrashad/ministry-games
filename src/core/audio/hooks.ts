import { useEffect, useState, useSyncExternalStore } from 'react';
import { useDisplayConnected } from '../sync/presence';
import { audio } from './engine';
import { soundPrefs } from './prefs';

function subscribeVisibility(cb: () => void): () => void {
  document.addEventListener('visibilitychange', cb);
  return () => document.removeEventListener('visibilitychange', cb);
}

export function useIsVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== 'hidden',
    () => true,
  );
}

/**
 * Whether this window is the one that should make sound. One device, one voice:
 * the game screen plays while it is on screen; the host plays when no game screen
 * is showing on this device (an iPad sending its own screen to the TV, say). A
 * phone remote stays quiet while the TV it controls is connected.
 */
export function useSoundLeader(role: 'display' | 'host'): boolean {
  const visible = useIsVisible();
  const displayConnected = useDisplayConnected();
  if (role === 'display') return visible;
  return visible && !displayConnected;
}

/** True while this window should make sound but the browser is still waiting for a touch. */
export function useSoundLocked(active: boolean): boolean {
  const prefs = soundPrefs.useValue();
  const [locked, setLocked] = useState(() => audio.isLocked());
  useEffect(() => {
    setLocked(audio.isLocked());
    const off = audio.onStateChange(() => setLocked(audio.isLocked()));
    const id = window.setInterval(() => setLocked(audio.isLocked()), 1000);
    return () => {
      off();
      window.clearInterval(id);
    };
  }, []);
  return active && (prefs.sfx || prefs.music) && audio.isSupported() && locked;
}
