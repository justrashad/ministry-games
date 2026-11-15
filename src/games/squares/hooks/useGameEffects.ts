import { useEffect } from 'react';
import { fireConfetti } from '../../../core/lib/confetti';
import { playKit } from '../../../core/audio/sfx';
import { useEventSounds, useMusic } from '../../../core/audio/useGameAudio';
import { KIT, type SquaresSound } from '../audio/kit';
import { OUTRO, THEME } from '../audio/music';
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
    if ((kind === 'gameWon' || kind === 'matchOver') && confetti) celebrate();
    if (!enabled) return;
    const name: SquaresSound | null =
      kind === 'correct' ? (s.event.team === 1 ? 'mark1' : 'mark0') : kind === 'none' ? null : (kind as SquaresSound);
    if (name && name in KIT) playKit(KIT, name);
  });
  const song = !state ? null : state.phase === 'intro' ? THEME : state.phase === 'matchOver' ? OUTRO : null;
  useMusic(song, enabled);
}

/**
 * Keyboard calls on the TV or host computer: T (or V, for verdadero) for true, F for false, for the team
 * whose turn it is, and 1 to 9 to pick a square. USB buzzers that type a key work the same way.
 */
export function useKeyboardCalls(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      const state = getGameState();
      if (!state) return;
      const key = e.key.toLowerCase();
      if (state.phase === 'question' && (key === 't' || key === 'v' || key === 'f')) {
        dispatchGame({ type: 'ANSWER', team: state.turn, answer: key !== 'f' });
        return;
      }
      if (state.phase === 'pick' && /^[1-9]$/.test(key)) dispatchGame({ type: 'PICK', square: Number(key) - 1 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
