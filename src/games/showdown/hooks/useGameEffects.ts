import { useEffect, useRef } from 'react';
import type { GameEvent, GameState } from '../types';
import { sound, type SoundName } from '../../../core/lib/sound';
import { secondsLeft, timerRemaining } from '../engine/timer';
import { dispatchGame } from '../sync/gameStore';
import { useSettings } from '../state/settingsStore';
import { useMusic } from '../../../core/audio/useGameAudio';
import { OUTRO, THEME } from '../audio/music';

const EVENT_SOUNDS: Partial<Record<GameEvent['kind'], SoundName>> = {
  gameStart: 'gameStart',
  roundStart: 'roundStart',
  finalRound: 'finalRound',
  questionShown: 'reveal',
  correct: 'correct',
  reveal: 'reveal',
  revealAll: 'reveal',
  strike: 'strike',
  steal: 'steal',
  stealSuccess: 'stealSuccess',
  roundWin: 'roundWin',
  timeUp: 'timeUp',
  gameOver: 'celebrate',
  buzz: 'buzz',
  fcOpen: 'finalRound',
  fcStart: 'gameStart',
  fcSubmit: 'submit',
  fcTurnEnd: 'roundStart',
  fcTargetReached: 'celebrate',
  fcComplete: 'roundWin',
};

/** Calls `handler` once for each new game event (never for the event present at mount). */
export function useGameEvents(state: GameState | null, handler: (event: GameEvent, state: GameState) => void): void {
  const seenRef = useRef<string | null>(state ? `${state.id}:${state.event.seq}` : null);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    if (!state) return;
    const key = `${state.id}:${state.event.seq}`;
    if (seenRef.current === key) return;
    const firstSight = seenRef.current === null;
    seenRef.current = key;
    if (!firstSight) handlerRef.current(state.event, state);
  }, [state]);
}

/** Plays sounds for game events. Only one window should pass enabled=true. */
export function useGameSounds(state: GameState | null, enabled: boolean): void {
  const { audio } = useSettings();
  useEffect(() => {
    sound.setVolume(audio.volume);
  }, [audio.volume]);
  useGameEvents(state, (event, s) => {
    if (!enabled || !audio.enabled) return;
    if (event.kind === 'fcCellReveal') {
      sound.play((event.value ?? 0) > 0 ? 'correct' : 'miss');
      return;
    }
    const name = EVENT_SOUNDS[event.kind];
    if (name) sound.play(name);
    // The final strike also opens the steal: follow the strike sound with the steal cue.
    if (event.kind === 'strike' && s.phase === 'steal') window.setTimeout(() => sound.play('steal'), 900);
  });
  const song = !state ? null : state.phase === 'intro' ? THEME : state.phase === 'gameOver' ? OUTRO : null;
  useMusic(song, enabled && audio.enabled);
}

/**
 * Keeps the shared timer honest: expires it at zero (idempotent across windows)
 * and optionally plays warning ticks in the last five seconds.
 */
export function useTimerDriver(state: GameState | null, playTicks: boolean): void {
  const { audio } = useSettings();
  const lastTickRef = useRef<number | null>(null);
  const running = !!state && state.timer.runningSince !== null;
  const timerRef = useRef(state?.timer);
  timerRef.current = state?.timer;

  useEffect(() => {
    if (!running) {
      lastTickRef.current = null;
      return;
    }
    const id = window.setInterval(() => {
      const timer = timerRef.current;
      if (!timer || timer.runningSince === null) return;
      const now = Date.now();
      if (timerRemaining(timer, now) <= 0) {
        dispatchGame({ type: 'TIMER_EXPIRE', now });
        return;
      }
      const secs = secondsLeft(timer, now);
      if (playTicks && audio.enabled && secs <= 5 && secs !== lastTickRef.current) {
        lastTickRef.current = secs;
        sound.play('tick');
      }
    }, 150);
    return () => window.clearInterval(id);
  }, [running, playTicks, audio.enabled]);
}
