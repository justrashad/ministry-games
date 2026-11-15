import { useEffect, useRef } from 'react';
import { fireConfetti } from '../../../core/lib/confetti';
import { sound, type SoundName } from '../../../core/lib/sound';
import { dispatchGame, getGameState } from '../sync/gameStore';
import type { GameEventKind, GameState } from '../types';

const SOUNDS: Partial<Record<GameEventKind, SoundName>> = {
  start: 'gameStart',
  pick: 'reveal',
  lookup: 'submit',
  swap: 'reveal',
  right: 'correct',
  wrong: 'strike',
  secondTry: 'steal',
  bonus: 'finalRound',
  gameOver: 'celebrate',
};

/** Plays each game moment's sound once on the TV, and confetti at the end. */
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
    if (state.event.kind === 'gameOver' && !reduced) fireConfetti();
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

/** Keyboard marking on the TV or host computer while a question is up: R for right, W for wrong. */
export function useKeyboardJudge(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      const key = e.key.toLowerCase();
      if ((key !== 'r' && key !== 'w') || getGameState()?.phase !== 'question') return;
      dispatchGame({ type: 'JUDGE', correct: key === 'r' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
