import { describe, expect, it } from 'vitest';
import type { GameState } from '../types';
import { fcCellPoints, fcPlayerTotal, fcTotal } from './finalChallenge';
import { makeQuestion, makeSettings, run, startGame } from './testUtils';

const round = makeQuestion('r1', [30, 20]);
const fcQs = [1, 2, 3, 4, 5].map((n) =>
  makeQuestion(`f${n}`, [30, 25, 20, 15, 10], { isFinalChallenge: true, question: `Final ${n}` }),
);

function toFinalChallenge(settingsPatch = makeSettings((s) => ({ ...s, rules: { ...s.rules, rounds: 1, finalRound: { ...s.rules.finalRound, enabled: false } } }))): GameState {
  let s = startGame([round, ...fcQs], settingsPatch);
  s = run(
    s,
    { type: 'NEXT_ROUND', now: 0 },
    { type: 'SHOW_QUESTION' },
    { type: 'SET_CONTROL', team: 0 },
    { type: 'SCORE_ANSWER', answerId: 'r1-a1', now: 0 },
    { type: 'AWARD_ROUND', team: 0, now: 0 },
    { type: 'NEXT_ROUND', now: 0 },
  );
  expect(s.phase).toBe('gameOver');
  s = run(s, { type: 'FC_OPEN', now: 0 });
  expect(s.phase).toBe('finalChallenge');
  return s;
}

describe('final challenge', () => {
  it('opens only after the game ends and picks five questions', () => {
    const s = toFinalChallenge();
    expect(s.finalChallenge?.questions).toHaveLength(5);
    expect(s.finalChallenge?.team).toBe(0);
  });

  it('saves answers, advances questions, and hands off to player 2', () => {
    let s = toFinalChallenge();
    s = run(s, { type: 'FC_START', players: ['Sarah', 'David'] }, { type: 'FC_BEGIN_TURN', now: 0 });
    expect(s.finalChallenge?.phase).toBe('answering');
    expect(s.timer.durationMs).toBe(30000);
    s = run(s, { type: 'FC_SUBMIT', text: 'Answer 1', now: 1000 });
    expect(s.finalChallenge?.current).toBe(1);
    expect(s.finalChallenge?.responses[0][0]).toMatchObject({ text: 'Answer 1', matchId: 'f1-a1', autoMatched: true });
    for (let i = 1; i < 5; i += 1) s = run(s, { type: 'FC_SUBMIT', text: `Answer ${i + 1}`, now: 2000 + i });
    expect(s.finalChallenge?.phase).toBe('handoff');
    s = run(s, { type: 'FC_READY_NEXT' });
    expect(s.finalChallenge?.phase).toBe('ready');
    expect(s.finalChallenge?.activePlayer).toBe(1);
    expect(s.timer.durationMs).toBe(35000);
  });

  it('skipped questions come back at the end of the turn', () => {
    let s = toFinalChallenge();
    s = run(s, { type: 'FC_START', players: ['A', 'B'] }, { type: 'FC_BEGIN_TURN', now: 0 }, { type: 'FC_SKIP' });
    expect(s.finalChallenge?.current).toBe(1);
    expect(s.finalChallenge?.pending).toEqual([1, 2, 3, 4, 0]);
  });

  it('ends the turn when the timer expires and rejects late answers', () => {
    let s = toFinalChallenge();
    s = run(s, { type: 'FC_START', players: ['A', 'B'] }, { type: 'FC_BEGIN_TURN', now: 0 }, { type: 'FC_SUBMIT', text: 'Answer 1', now: 5000 });
    s = run(s, { type: 'TIMER_EXPIRE', now: 31_000 });
    expect(s.finalChallenge?.phase).toBe('handoff');
    expect(s.event.kind).toBe('timeUp');
    const late = run(s, { type: 'FC_SUBMIT', text: 'late', now: 32_000 });
    expect(late).toBe(s);
    expect(s.finalChallenge?.responses[0].filter((r) => r.answered)).toHaveLength(1);
  });

  it('counts duplicate answers for both players unless the policy says otherwise', () => {
    const play = (policy: 'countBoth' | 'secondScoresZero') => {
      const settings = makeSettings((x) => ({
        ...x,
        rules: { ...x.rules, rounds: 1, finalRound: { ...x.rules.finalRound, enabled: false } },
        finalChallenge: { ...x.finalChallenge, duplicatePolicy: policy },
      }));
      let s = toFinalChallenge(settings);
      s = run(s, { type: 'FC_START', players: ['A', 'B'] }, { type: 'FC_BEGIN_TURN', now: 0 });
      for (let i = 0; i < 5; i += 1) s = run(s, { type: 'FC_SUBMIT', text: 'Answer 1', now: 1 });
      s = run(s, { type: 'FC_READY_NEXT' }, { type: 'FC_BEGIN_TURN', now: 2 });
      for (let i = 0; i < 5; i += 1) s = run(s, { type: 'FC_SUBMIT', text: 'Answer 1', now: 3 });
      return s.finalChallenge!;
    };
    const both = play('countBoth');
    expect(both.phase).toBe('review');
    expect(fcTotal(both)).toBe(300);
    const zero = play('secondScoresZero');
    expect(fcPlayerTotal(zero, 1)).toBe(0);
    expect(fcTotal(zero)).toBe(150);
  });

  it('lets the host override matches and points, then reveals the total', () => {
    let s = toFinalChallenge();
    s = run(s, { type: 'FC_START', players: ['A', 'B'] }, { type: 'FC_BEGIN_TURN', now: 0 }, { type: 'FC_END_TURN', now: 1 });
    s = run(s, { type: 'FC_READY_NEXT' }, { type: 'FC_BEGIN_TURN', now: 2 }, { type: 'FC_SUBMIT', text: 'unmatched text', now: 3 }, { type: 'FC_END_TURN', now: 4 });
    expect(s.finalChallenge?.phase).toBe('review');
    expect(s.finalChallenge?.responses[1][0].matchId).toBeNull();
    s = run(
      s,
      { type: 'FC_SET_MATCH', question: 0, player: 1, answerId: 'f1-a2' },
      { type: 'FC_SET_MATCH', question: 1, player: 0, answerId: 'f2-a1' },
      { type: 'FC_SET_POINTS', question: 2, player: 0, points: 12 },
    );
    const fc = s.finalChallenge!;
    expect(fcCellPoints(fc, 0, 1)).toBe(25);
    expect(fcTotal(fc)).toBe(25 + 30 + 12);
    s = run(s, { type: 'FC_BEGIN_REVEAL' }, { type: 'FC_REVEAL_NEXT' });
    expect(fcTotal(s.finalChallenge!, true)).toBe(0);
    s = run(s, { type: 'FC_REVEAL_NEXT' });
    expect(fcTotal(s.finalChallenge!, true)).toBe(30);
    s = run(s, { type: 'FC_REVEAL_ALL' });
    expect(s.finalChallenge?.phase).toBe('complete');
    expect(s.event).toMatchObject({ kind: 'fcComplete', value: 67 });
  });

  it('celebrates reaching the target and exits back to the finished game', () => {
    const settings = makeSettings((x) => ({
      ...x,
      rules: { ...x.rules, rounds: 1, finalRound: { ...x.rules.finalRound, enabled: false } },
      finalChallenge: { ...x.finalChallenge, targetScore: 50 },
    }));
    let s = toFinalChallenge(settings);
    s = run(s, { type: 'FC_START', players: ['A', 'B'] }, { type: 'FC_BEGIN_TURN', now: 0 });
    s = run(s, { type: 'FC_SUBMIT', text: 'Answer 1', now: 1 }, { type: 'FC_SUBMIT', text: 'Answer 1', now: 1 }, { type: 'FC_END_TURN', now: 2 });
    s = run(s, { type: 'FC_READY_NEXT' }, { type: 'FC_BEGIN_TURN', now: 3 }, { type: 'FC_END_TURN', now: 4 });
    s = run(s, { type: 'FC_BEGIN_REVEAL' }, { type: 'FC_REVEAL_ALL' });
    expect(s.event.kind).toBe('fcTargetReached');
    s = run(s, { type: 'FC_EXIT', now: 5 });
    expect(s.phase).toBe('gameOver');
    expect(s.finalChallenge?.phase).toBe('complete');
  });

  it('restarting picks the next questions and keeps player names', () => {
    const extra = [6, 7, 8, 9, 10].map((n) => makeQuestion(`f${n}`, [10], { isFinalChallenge: true }));
    let s = startGame([round, ...fcQs, ...extra], makeSettings((x) => ({ ...x, rules: { ...x.rules, rounds: 1, finalRound: { ...x.rules.finalRound, enabled: false } } })));
    s = run(s, { type: 'NEXT_ROUND', now: 0 }, { type: 'NEXT_ROUND', now: 0 }, { type: 'FC_OPEN', now: 0 }, { type: 'FC_START', players: ['Sarah', 'David'] });
    s = run(s, { type: 'FC_RESTART', now: 1 });
    expect(s.finalChallenge?.phase).toBe('setup');
    expect(s.finalChallenge?.players).toEqual(['Sarah', 'David']);
    expect(s.finalChallenge?.questions[0].id).toBe('f6');
  });
});
