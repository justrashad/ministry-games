import { describe, expect, it } from 'vitest';
import { makeQuestion, makeSettings, run, startGame, toPlaying } from './testUtils';
import { hiddenAnswerCount } from './game';

const Q1 = makeQuestion('q1', [30, 20, 15, 10]);
const Q2 = makeQuestion('q2', [40, 25, 10]);
const Q3 = makeQuestion('q3', [35, 30, 20]);
const QF = makeQuestion('qf', [50, 30, 20], { isFinalRound: true });
const noFinal = makeSettings((s) => ({ ...s, rules: { ...s.rules, finalRound: { ...s.rules.finalRound, enabled: false } } }));

describe('round flow', () => {
  it('starts in intro, then round intro, then playing', () => {
    let s = startGame([Q1, Q2, Q3], noFinal);
    expect(s.phase).toBe('intro');
    s = run(s, { type: 'NEXT_ROUND', now: 1 });
    expect(s.phase).toBe('roundIntro');
    expect(s.round?.question.id).toBe('q1');
    s = run(s, { type: 'SHOW_QUESTION' });
    expect(s.phase).toBe('playing');
  });

  it('reveals an answer and banks its points exactly once', () => {
    let s = toPlaying(startGame([Q1, Q2], noFinal));
    s = run(s, { type: 'SET_CONTROL', team: 0 }, { type: 'SCORE_ANSWER', answerId: 'q1-a1', now: 2 });
    expect(s.round?.bank).toBe(30);
    expect(s.round?.revealed['q1-a1']).toEqual({ source: 'scored', visible: true });
    const again = run(s, { type: 'SCORE_ANSWER', answerId: 'q1-a1', now: 3 });
    expect(again).toBe(s);
    expect(again.round?.bank).toBe(30);
  });

  it('show-only reveals never add points', () => {
    let s = toPlaying(startGame([Q1], noFinal));
    s = run(s, { type: 'SHOW_ANSWER', answerId: 'q1-a2' });
    expect(s.round?.bank).toBe(0);
    expect(s.round?.revealed['q1-a2']?.source).toBe('shown');
    const second = run(s, { type: 'SHOW_ANSWER', answerId: 'q1-a2' });
    expect(second).toBe(s);
  });

  it('awards the bank times the multiplier once and ignores repeat awards', () => {
    let s = toPlaying(startGame([Q1, Q2], noFinal));
    s = run(
      s,
      { type: 'SET_CONTROL', team: 1 },
      { type: 'SCORE_ANSWER', answerId: 'q1-a1', now: 2 },
      { type: 'SCORE_ANSWER', answerId: 'q1-a3', now: 3 },
      { type: 'AWARD_ROUND', team: 1, now: 4 },
    );
    expect(s.phase).toBe('roundOver');
    expect(s.teams[1].score).toBe(45);
    const repeat = run(s, { type: 'AWARD_ROUND', team: 1, now: 5 });
    expect(repeat.teams[1].score).toBe(45);
    expect(repeat).toBe(s);
  });

  it('applies round multipliers from house rules', () => {
    let s = toPlaying(startGame([Q1, Q2, Q3], noFinal));
    s = run(s, { type: 'SET_CONTROL', team: 0 }, { type: 'SCORE_ANSWER', answerId: 'q1-a1', now: 2 }, { type: 'AWARD_ROUND', team: 0, now: 3 });
    expect(s.teams[0].score).toBe(30);
    s = run(s, { type: 'NEXT_ROUND', now: 4 }, { type: 'SHOW_QUESTION' });
    expect(s.round?.multiplier).toBe(2);
    s = run(s, { type: 'SET_CONTROL', team: 0 }, { type: 'SCORE_ANSWER', answerId: 'q2-a1', now: 5 }, { type: 'AWARD_ROUND', team: 0, now: 6 });
    expect(s.teams[0].score).toBe(30 + 80);
  });

  it('a question multiplier overrides the round multiplier', () => {
    const special = makeQuestion('qs', [10, 5], { multiplier: 5 });
    let s = toPlaying(startGame([special], noFinal));
    expect(s.round?.multiplier).toBe(5);
    s = run(s, { type: 'SET_CONTROL', team: 0 }, { type: 'SCORE_ANSWER', answerId: 'qs-a1', now: 1 }, { type: 'AWARD_ROUND', team: 0, now: 2 });
    expect(s.teams[0].score).toBe(50);
  });

  it('auto-awards when the controlling team clears the board', () => {
    let s = toPlaying(startGame([Q2], noFinal));
    s = run(
      s,
      { type: 'SET_CONTROL', team: 0 },
      { type: 'SCORE_ANSWER', answerId: 'q2-a1', now: 1 },
      { type: 'SCORE_ANSWER', answerId: 'q2-a2', now: 2 },
      { type: 'SCORE_ANSWER', answerId: 'q2-a3', now: 3 },
    );
    expect(s.phase).toBe('roundOver');
    expect(s.round?.result).toMatchObject({ team: 0, points: 75, via: 'play' });
  });

  it('reveals remaining answers at round end when the house rule is on', () => {
    let s = toPlaying(startGame([Q1], noFinal));
    s = run(s, { type: 'SET_CONTROL', team: 0 }, { type: 'SCORE_ANSWER', answerId: 'q1-a1', now: 1 }, { type: 'AWARD_ROUND', team: 0, now: 2 });
    expect(s.round && hiddenAnswerCount(s.round)).toBe(0);
    const off = makeSettings((x) => ({ ...x, rules: { ...x.rules, revealRemainingOnRoundEnd: false, finalRound: { ...x.rules.finalRound, enabled: false } } }));
    let t = toPlaying(startGame([Q1], off));
    t = run(t, { type: 'SET_CONTROL', team: 0 }, { type: 'SCORE_ANSWER', answerId: 'q1-a1', now: 1 }, { type: 'AWARD_ROUND', team: 0, now: 2 });
    expect(t.round && hiddenAnswerCount(t.round)).toBe(3);
  });

  it('undoing a scored answer removes its points before the award', () => {
    let s = toPlaying(startGame([Q1], noFinal));
    s = run(s, { type: 'SCORE_ANSWER', answerId: 'q1-a2', now: 1 }, { type: 'HIDE_ANSWER', answerId: 'q1-a2' });
    expect(s.round?.bank).toBe(0);
    expect(s.round?.revealed['q1-a2']).toBeUndefined();
  });
});

describe('strikes', () => {
  it('adds and removes strikes', () => {
    let s = toPlaying(startGame([Q1], noFinal));
    s = run(s, { type: 'ADD_STRIKE' }, { type: 'ADD_STRIKE' });
    expect(s.round?.strikes).toBe(2);
    s = run(s, { type: 'REMOVE_STRIKE' });
    expect(s.round?.strikes).toBe(1);
    s = run(s, { type: 'REMOVE_STRIKE' }, { type: 'REMOVE_STRIKE' });
    expect(s.round?.strikes).toBe(0);
  });

  it('never exceeds the configured maximum', () => {
    let s = toPlaying(startGame([Q1], noFinal));
    s = run(s, { type: 'ADD_STRIKE' }, { type: 'ADD_STRIKE' }, { type: 'ADD_STRIKE' }, { type: 'ADD_STRIKE' });
    expect(s.round?.strikes).toBe(3);
  });

  it('enters the steal state automatically on the final strike when a team is in control', () => {
    let s = toPlaying(startGame([Q1], noFinal));
    s = run(s, { type: 'SET_CONTROL', team: 0 }, { type: 'ADD_STRIKE' }, { type: 'ADD_STRIKE' }, { type: 'ADD_STRIKE' });
    expect(s.phase).toBe('steal');
    expect(s.round?.stealingTeam).toBe(1);
  });

  it('respects a custom strike count', () => {
    const two = makeSettings((x) => ({ ...x, rules: { ...x.rules, maxStrikes: 2, finalRound: { ...x.rules.finalRound, enabled: false } } }));
    let s = toPlaying(startGame([Q1], two));
    s = run(s, { type: 'SET_CONTROL', team: 1 }, { type: 'ADD_STRIKE' }, { type: 'ADD_STRIKE' });
    expect(s.phase).toBe('steal');
    expect(s.round?.stealingTeam).toBe(0);
  });
});

describe('stealing', () => {
  const toSteal = () => {
    let s = toPlaying(startGame([Q1, Q2], noFinal));
    s = run(
      s,
      { type: 'SET_CONTROL', team: 0 },
      { type: 'SCORE_ANSWER', answerId: 'q1-a2', now: 1 },
      { type: 'ADD_STRIKE' },
      { type: 'ADD_STRIKE' },
      { type: 'ADD_STRIKE' },
    );
    expect(s.phase).toBe('steal');
    return s;
  };

  it('a successful steal awards the bank plus the stolen answer exactly once', () => {
    let s = toSteal();
    s = run(s, { type: 'SCORE_ANSWER', answerId: 'q1-a1', now: 2 });
    expect(s.phase).toBe('roundOver');
    expect(s.teams[1].score).toBe(50);
    expect(s.teams[0].score).toBe(0);
    expect(s.round?.result?.via).toBe('steal');
    const again = run(s, { type: 'STEAL_SUCCESS', answerId: 'q1-a3', now: 3 }, { type: 'SCORE_ANSWER', answerId: 'q1-a3', now: 3 });
    expect(again.teams[1].score).toBe(50);
  });

  it('can award only the stolen answer under the answer-only rule', () => {
    const rule = makeSettings((x) => ({ ...x, rules: { ...x.rules, stealAward: 'answerOnly', finalRound: { ...x.rules.finalRound, enabled: false } } }));
    let s = toPlaying(startGame([Q1], rule));
    s = run(
      s,
      { type: 'SET_CONTROL', team: 0 },
      { type: 'SCORE_ANSWER', answerId: 'q1-a2', now: 1 },
      { type: 'ADD_STRIKE' },
      { type: 'ADD_STRIKE' },
      { type: 'ADD_STRIKE' },
      { type: 'STEAL_SUCCESS', answerId: 'q1-a4', now: 2 },
    );
    expect(s.teams[1].score).toBe(10);
  });

  it('a failed steal gives the bank to the original team', () => {
    let s = toSteal();
    s = run(s, { type: 'STEAL_FAIL', now: 2 });
    expect(s.teams[0].score).toBe(20);
    expect(s.teams[1].score).toBe(0);
    expect(s.round?.result?.via).toBe('stealFailed');
  });

  it('cancelling a steal returns control and removes the last strike', () => {
    let s = toSteal();
    s = run(s, { type: 'CANCEL_STEAL' });
    expect(s.phase).toBe('playing');
    expect(s.round?.strikes).toBe(2);
    expect(s.round?.stealingTeam).toBeNull();
  });

  it('an answer already on the board cannot be used to steal', () => {
    const s = toSteal();
    expect(run(s, { type: 'STEAL_SUCCESS', answerId: 'q1-a2', now: 5 })).toBe(s);
  });
});

describe('scores', () => {
  it('prevents negative scores unless explicitly allowed', () => {
    let s = startGame([Q1], noFinal);
    s = run(s, { type: 'ADJUST_SCORE', team: 0, delta: -10 });
    expect(s.teams[0].score).toBe(0);
    s = run(s, { type: 'ADJUST_SCORE', team: 0, delta: -10, allowNegative: true });
    expect(s.teams[0].score).toBe(-10);
  });

  it('rejects invalid numbers', () => {
    const s = startGame([Q1], noFinal);
    expect(run(s, { type: 'SET_SCORE', team: 1, score: Number.NaN })).toBe(s);
    expect(run(s, { type: 'ADJUST_SCORE', team: 1, delta: Number.POSITIVE_INFINITY })).toBe(s);
  });
});

describe('round transitions and resets', () => {
  it('next round resets round state but keeps scores, names and settings', () => {
    let s = toPlaying(startGame([Q1, Q2], noFinal));
    s = run(
      s,
      { type: 'RENAME_TEAM', team: 0, name: 'The Shepherds' },
      { type: 'SET_CONTROL', team: 0 },
      { type: 'SCORE_ANSWER', answerId: 'q1-a1', now: 1 },
      { type: 'ADD_STRIKE' },
      { type: 'AWARD_ROUND', team: 0, now: 2 },
      { type: 'NEXT_ROUND', now: 3 },
    );
    expect(s.round?.question.id).toBe('q2');
    expect(s.round?.strikes).toBe(0);
    expect(s.round?.bank).toBe(0);
    expect(s.round?.controllingTeam).toBeNull();
    expect(Object.keys(s.round?.revealed ?? {})).toHaveLength(0);
    expect(s.teams[0]).toMatchObject({ name: 'The Shepherds', score: 30 });
    expect(s.config.rules.maxStrikes).toBe(3);
  });

  it('reset round undoes an award exactly', () => {
    let s = toPlaying(startGame([Q1], noFinal));
    s = run(s, { type: 'ADJUST_SCORE', team: 0, delta: 5 }, { type: 'SET_CONTROL', team: 0 }, { type: 'SCORE_ANSWER', answerId: 'q1-a1', now: 1 }, { type: 'AWARD_ROUND', team: 0, now: 2 });
    expect(s.teams[0].score).toBe(35);
    s = run(s, { type: 'RESET_ROUND' });
    expect(s.teams[0].score).toBe(5);
    expect(s.phase).toBe('playing');
    expect(s.round?.result).toBeNull();
    expect(s.played).toHaveLength(0);
  });

  it('skip question swaps in an unused question', () => {
    let s = toPlaying(startGame([Q1, Q2, Q3], noFinal));
    s = run(s, { type: 'SKIP_QUESTION' });
    expect(s.round?.question.id).toBe('q2');
    expect(s.usedQuestionIds).toEqual(['q1', 'q2']);
  });

  it('ends the game after the last planned round and plays the final round last', () => {
    let s = toPlaying(startGame([Q1, Q2, Q3, QF]));
    expect(s.roundPlan.map((p) => p.isFinal)).toEqual([false, false, false, true]);
    for (let i = 0; i < 3; i += 1) s = run(s, { type: 'AWARD_ROUND', team: 0, now: i }, { type: 'NEXT_ROUND', now: i }, { type: 'SHOW_QUESTION' });
    expect(s.round?.isFinal).toBe(true);
    expect(s.round?.question.id).toBe('qf');
    expect(s.round?.multiplier).toBe(3);
    s = run(s, { type: 'AWARD_ROUND', team: 1, now: 9 }, { type: 'NEXT_ROUND', now: 10 });
    expect(s.phase).toBe('gameOver');
    expect(s.played).toHaveLength(4);
  });

  it('simultaneous final-round reveals hold answers until reveal all', () => {
    const sim = makeSettings((x) => ({ ...x, rules: { ...x.rules, rounds: 1, finalRound: { ...x.rules.finalRound, revealMode: 'simultaneous' } } }));
    let s = toPlaying(startGame([Q1, QF], sim));
    s = run(s, { type: 'AWARD_ROUND', team: 0, now: 1 }, { type: 'NEXT_ROUND', now: 2 }, { type: 'SHOW_QUESTION' });
    s = run(s, { type: 'SCORE_ANSWER', answerId: 'qf-a1', now: 3 });
    expect(s.round?.revealed['qf-a1']).toEqual({ source: 'scored', visible: false });
    expect(s.round?.bank).toBe(50);
    s = run(s, { type: 'REVEAL_ALL' });
    expect(s.round?.revealed['qf-a1']?.visible).toBe(true);
  });

  it('a new game replaces the previous one entirely', () => {
    let s = toPlaying(startGame([Q1], noFinal));
    s = run(s, { type: 'ADJUST_SCORE', team: 0, delta: 50 });
    const fresh = startGame([Q2], noFinal);
    s = run(s, { type: 'NEW_GAME', game: fresh });
    expect(s.teams[0].score).toBe(0);
    expect(s.phase).toBe('intro');
    expect(s.round).toBeNull();
  });
});

describe('game timer', () => {
  const timed = makeSettings((x) => ({ ...x, timer: { enabled: true, defaultSeconds: 20 }, rules: { ...x.rules, finalRound: { ...x.rules.finalRound, enabled: false } } }));

  it('resets per round and expires only once', () => {
    let s = toPlaying(startGame([Q1, Q2], timed));
    expect(s.timer.durationMs).toBe(20000);
    s = run(s, { type: 'TIMER_START', now: 0 });
    const early = run(s, { type: 'TIMER_EXPIRE', now: 10000 });
    expect(early).toBe(s);
    s = run(s, { type: 'TIMER_EXPIRE', now: 21000 });
    expect(s.timer.expired).toBe(true);
    expect(s.event.kind).toBe('timeUp');
    expect(run(s, { type: 'TIMER_EXPIRE', now: 22000 })).toBe(s);
    s = run(s, { type: 'AWARD_ROUND', team: 0, now: 23000 }, { type: 'NEXT_ROUND', now: 24000 });
    expect(s.timer).toMatchObject({ durationMs: 20000, remainingMs: 20000, runningSince: null, expired: false });
  });
});

describe('buzz-in face-off', () => {
  it('arms buzzers when the question is shown and gives control to the first buzz only', () => {
    let s = toPlaying(startGame([Q1], noFinal));
    expect(s.round?.faceoff).toEqual({ armed: true, team: null });
    s = run(s, { type: 'BUZZ', team: 1 });
    expect(s.round?.controllingTeam).toBe(1);
    expect(s.round?.faceoff).toEqual({ armed: false, team: 1 });
    expect(s.event).toMatchObject({ kind: 'buzz', team: 1 });
    const late = run(s, { type: 'BUZZ', team: 0 });
    expect(late).toBe(s);
  });

  it('does not arm when the host picked a team during the round intro', () => {
    let s = run(startGame([Q1], noFinal), { type: 'NEXT_ROUND', now: 0 }, { type: 'SET_CONTROL', team: 0 }, { type: 'SHOW_QUESTION' });
    expect(s.round?.faceoff?.armed).toBe(false);
    expect(run(s, { type: 'BUZZ', team: 1 })).toBe(s);
  });

  it('host choice closes the buzzers and re-arming clears control', () => {
    let s = toPlaying(startGame([Q1], noFinal));
    s = run(s, { type: 'SET_CONTROL', team: 0 });
    expect(s.round?.faceoff?.armed).toBe(false);
    s = run(s, { type: 'ARM_BUZZERS' });
    expect(s.round?.controllingTeam).toBeNull();
    s = run(s, { type: 'BUZZ', team: 1 });
    expect(s.round?.controllingTeam).toBe(1);
  });

  it('respects the house rule turning buzzers off', () => {
    const off = makeSettings((x) => ({ ...x, rules: { ...x.rules, faceoffBuzzers: false, finalRound: { ...x.rules.finalRound, enabled: false } } }));
    const s = toPlaying(startGame([Q1], off));
    expect(s.round?.faceoff?.armed).toBe(false);
    expect(run(s, { type: 'BUZZ', team: 0 })).toBe(s);
  });
});
