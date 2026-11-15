import { useEffect, useRef } from 'react';
import { fireConfetti } from '../../../core/lib/confetti';
import { sound, type SoundName } from '../../../core/lib/sound';
import { dispatchGame, getGameState } from '../sync/gameStore';
import type { GameEventKind, GameState } from '../types';

const SOUNDS: Partial<Record<GameEventKind, SoundName>> = {
  start: 'gameStart',
  pick: 'reveal',
  correct: 'correct',
  wrong: 'strike',
  blocked: 'miss',
  gameWon: 'roundWin',
  matchOver: 'celebrate',
};

/** Plays each game moment's sound once on the TV, and confetti when a game or the match is won. */
export function useGameSounds(state: GameState | null): void {
  const lastSeq = useRef<number | null>(null);
  useEffect(() => {
    if (!state) {
      lastSeq.current = null;
      return;
    }
    // Opening the screen in the middle of a game must not replay the last moment.
    if (lastSeq.current === null) {
      lastSeq.current = state.event.seq;
      return;
    }
    if (state.event.seq === lastSeq.current) return;
    lastSeq.current = state.event.seq;
    const name = SOUNDS[state.event.kind];
    if (name) sound.play(name);
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if ((state.event.kind === 'matchOver' || state.event.kind === 'gameWon') && !reduced) fireConfetti();
  }, [state]);
}

/** Browsers stay silent until someone clicks or presses a key on the page. */
export function useUnlockSound(): void {
  useEffect(() => {
    const unlock = () => void sound.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);
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
