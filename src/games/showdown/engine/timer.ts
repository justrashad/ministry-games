import type { TimerState } from '../types';

/**
 * Timers are stored as wall-clock data (not ticking counters) so every window
 * computes the same remaining time without needing a message per second.
 */
export function createTimer(seconds: number): TimerState {
  const ms = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds * 1000)) : 0;
  return { durationMs: ms, remainingMs: ms, runningSince: null, expired: false };
}

export function timerRemaining(t: TimerState, now: number): number {
  if (t.runningSince === null) return Math.max(0, t.remainingMs);
  return Math.max(0, t.remainingMs - Math.max(0, now - t.runningSince));
}

export function secondsLeft(t: TimerState, now: number): number {
  return Math.ceil(timerRemaining(t, now) / 1000);
}

export function isTimerRunning(t: TimerState): boolean {
  return t.runningSince !== null;
}

export function isTimerActive(t: TimerState): boolean {
  return t.durationMs > 0;
}

export function startTimer(t: TimerState, now: number): TimerState {
  if (t.runningSince !== null || t.remainingMs <= 0) return t;
  return { ...t, runningSince: now, expired: false };
}

export function pauseTimer(t: TimerState, now: number): TimerState {
  if (t.runningSince === null) return t;
  return { ...t, remainingMs: timerRemaining(t, now), runningSince: null };
}

export function resetTimer(t: TimerState, seconds?: number): TimerState {
  return createTimer(seconds ?? t.durationMs / 1000);
}

export function addTime(t: TimerState, seconds: number, now: number): TimerState {
  if (!Number.isFinite(seconds) || seconds === 0) return t;
  const remaining = Math.max(0, timerRemaining(t, now) + seconds * 1000);
  const wasRunning = t.runningSince !== null;
  return {
    durationMs: Math.max(t.durationMs, remaining),
    remainingMs: remaining,
    runningSince: wasRunning && remaining > 0 ? now : null,
    expired: remaining > 0 ? false : t.expired,
  };
}

/** Returns the same object when nothing changed so reducers can detect no-ops. */
export function expireIfDue(t: TimerState, now: number): TimerState {
  if (t.runningSince === null || timerRemaining(t, now) > 0) return t;
  return { ...t, remainingMs: 0, runningSince: null, expired: true };
}
