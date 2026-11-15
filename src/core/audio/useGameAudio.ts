import { useEffect, useRef } from 'react';
import { music, type Song } from './music';

interface EventfulState {
  id: string;
  event: { seq: number };
}

/**
 * Calls `onEvent` once for each new game moment while this window is the one
 * making sound. Opening a screen in the middle of a game never replays the
 * moment already on screen.
 */
export function useEventSounds<S extends EventfulState>(state: S | null, enabled: boolean, onEvent: (state: S) => void): void {
  const seen = useRef<string | null>(null);
  const handler = useRef(onEvent);
  handler.current = onEvent;
  useEffect(() => {
    if (!state) {
      seen.current = null;
      return;
    }
    const key = `${state.id}:${state.event.seq}`;
    const first = seen.current === null;
    if (seen.current === key) return;
    seen.current = key;
    if (!first && enabled) handler.current(state);
  }, [state, enabled]);
}

/** Keeps the right song playing for the moment in the game; null means silence. */
export function useMusic(song: Song | null, enabled: boolean, fadeIn = 0.6): void {
  const id = enabled && song ? song.id : null;
  const songRef = useRef(song);
  songRef.current = song;
  useEffect(() => {
    if (id && songRef.current) music.play(songRef.current, { fadeIn });
    else music.stop(0.7);
  }, [id, fadeIn]);
  useEffect(() => () => music.stop(0.4), []);
}
