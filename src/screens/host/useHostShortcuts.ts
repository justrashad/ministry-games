import { useEffect, useRef } from 'react';
import type { GameState } from '../../types';
import { isTimerRunning } from '../../engine/timer';
import { dispatchGame } from '../../sync/gameStore';

function typingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function useHostShortcuts(state: GameState | null): void {
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = ref.current;
      if (!s || e.metaKey || e.ctrlKey || e.altKey || typingInField(e.target)) return;
      if (document.querySelector('dialog[open]')) return;
      if (s.phase === 'finalChallenge' || s.phase === 'gameOver') return;
      const now = Date.now();
      const round = s.round;
      const digit = /^Digit([1-9])$/.exec(e.code);
      if (digit && round) {
        const answer = round.question.answers[Number(digit[1]) - 1];
        if (!answer) return;
        e.preventDefault();
        if (e.shiftKey || s.phase === 'roundOver') dispatchGame({ type: 'SHOW_ANSWER', answerId: answer.id });
        else dispatchGame({ type: 'SCORE_ANSWER', answerId: answer.id, now });
        return;
      }
      const key = e.key.toLowerCase();
      const actions: Record<string, () => void> = {
        x: () => dispatchGame({ type: 'ADD_STRIKE' }),
        z: () => dispatchGame({ type: 'REMOVE_STRIKE' }),
        s: () => dispatchGame({ type: 'START_STEAL' }),
        b: () => dispatchGame({ type: 'ARM_BUZZERS' }),
        '[': () => dispatchGame({ type: 'SET_CONTROL', team: 0 }),
        ']': () => dispatchGame({ type: 'SET_CONTROL', team: 1 }),
        q: () => dispatchGame({ type: 'SHOW_QUESTION' }),
        r: () => dispatchGame({ type: 'REVEAL_NEXT' }),
        t: () => dispatchGame(isTimerRunning(s.timer) ? { type: 'TIMER_PAUSE', now } : { type: 'TIMER_START', now }),
        n: () => {
          if (s.phase === 'intro' || s.phase === 'roundOver') dispatchGame({ type: 'NEXT_ROUND', now });
        },
        p: () => dispatchGame({ type: 'SET_PAUSED', paused: !s.paused, now }),
      };
      const action = actions[key];
      if (action) {
        e.preventDefault();
        action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
