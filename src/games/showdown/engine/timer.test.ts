import { describe, expect, it } from 'vitest';
import { addTime, createTimer, expireIfDue, pauseTimer, secondsLeft, startTimer, timerRemaining } from './timer';

describe('timer', () => {
  it('counts down from wall-clock time while running', () => {
    const t = startTimer(createTimer(30), 1000);
    expect(timerRemaining(t, 1000)).toBe(30000);
    expect(secondsLeft(t, 11_500)).toBe(20);
  });

  it('pauses and resumes without losing time', () => {
    let t = startTimer(createTimer(30), 0);
    t = pauseTimer(t, 10_000);
    expect(timerRemaining(t, 99_999)).toBe(20_000);
    t = startTimer(t, 50_000);
    expect(timerRemaining(t, 55_000)).toBe(15_000);
  });

  it('adds time, including after pausing', () => {
    let t = startTimer(createTimer(10), 0);
    t = addTime(t, 5, 5000);
    expect(timerRemaining(t, 5000)).toBe(10_000);
    t = pauseTimer(t, 6000);
    t = addTime(t, 10, 7000);
    expect(t.runningSince).toBeNull();
    expect(timerRemaining(t, 7000)).toBe(19_000);
  });

  it('never goes below zero and expires exactly once', () => {
    const t = startTimer(createTimer(5), 0);
    expect(timerRemaining(t, 999_999)).toBe(0);
    expect(expireIfDue(t, 4000)).toBe(t);
    const expired = expireIfDue(t, 5000);
    expect(expired).toMatchObject({ expired: true, runningSince: null, remainingMs: 0 });
    expect(expireIfDue(expired, 9000)).toBe(expired);
  });

  it('will not start a finished timer', () => {
    const t = expireIfDue(startTimer(createTimer(1), 0), 2000);
    expect(startTimer(t, 3000)).toBe(t);
  });
});
