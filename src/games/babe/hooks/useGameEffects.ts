import { useEffect, useState } from 'react';
import { fireConfetti } from '../../../core/lib/confetti';
import { playKit } from '../../../core/audio/sfx';
import { useEventSounds, useMusic } from '../../../core/audio/useGameAudio';
import { audio } from '../../../core/audio/engine';
import { soundPrefs } from '../../../core/audio/prefs';
import { KIT, type BabeSound } from '../audio/kit';
import { OUTRO, THEME, THINK } from '../audio/music';
import { rungs } from '../engine/game';
import { dispatchGame, getGameState } from '../sync/gameStore';
import type { GameState } from '../types';


function celebrate(): void {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) fireConfetti();
}

/** Whether a team is still inside its Search the Scriptures minute. */
function useLookupRunning(state: GameState | null): boolean {
  const until = state?.active?.lookupUntil ?? 0;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until || until <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [until]);
  return !!state && (state.phase === 'question' || state.phase === 'missed') && until > now;
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
    if (kind === 'right') {
      if (s.phase === 'bonusReveal') playKit(KIT, 'bonusRight');
      else playClimb(rungs(s, s.event.team ?? s.active?.team ?? 0));
      return;
    }
    if (kind !== 'none' && kind in KIT) playKit(KIT, kind as BabeSound);
  });
  const lookup = useLookupRunning(state);
  const song = !state ? null : state.phase === 'intro' ? THEME : lookup ? THINK : state.phase === 'gameOver' ? OUTRO : null;
  useMusic(song, enabled);
}

function playClimb(rung: number): void {
  if (!soundPrefs.get().sfx) return;
  audio.whenRunning((_ctx, t) => KIT.climb(t, rung));
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
