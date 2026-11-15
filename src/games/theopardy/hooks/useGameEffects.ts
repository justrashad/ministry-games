import { useEffect } from 'react';
import { fireConfetti } from '../../../core/lib/confetti';
import { playKit } from '../../../core/audio/sfx';
import { useEventSounds, useMusic } from '../../../core/audio/useGameAudio';
import { KIT, type TheoSound } from '../audio/kit';
import { OUTRO, THEME, THINK } from '../audio/music';
import { dispatchGame, getGameState } from '../sync/gameStore';
import type { GameState } from '../types';


function celebrate(): void {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) fireConfetti();
}

/**
 * Sound and music for the game. `enabled` is true only in the window making
 * sound (see useSoundLeader); `confetti` on the TV screen.
 */
export function useGameSounds(state: GameState | null, enabled: boolean, confetti = false): void {
  useEventSounds(state, true, (s) => {
    const kind = s.event.kind;
    if (kind === 'gameOver' && confetti) celebrate();
    if (!enabled) return;
    const name: TheoSound | null =
      kind === 'buzz' ? (s.event.team === 1 ? 'buzz1' : 'buzz0') : kind === 'none' ? null : (kind as TheoSound);
    if (name && name in KIT) playKit(KIT, name);
  });
  const song = !state ? null : state.phase === 'intro' ? THEME : state.phase === 'finalClue' ? THINK : state.phase === 'gameOver' ? OUTRO : null;
  useMusic(song, enabled);
}
/** Keyboard buzzers on the TV or host computer: A for team 1, L for team 2. USB buzzers that type a key work the same way. */
export function useKeyboardBuzzers(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      const key = e.key.toLowerCase();
      if (key !== 'a' && key !== 'l') return;
      if (getGameState()?.phase !== 'clue') return;
      dispatchGame({ type: 'BUZZ', team: key === 'a' ? 0 : 1 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
