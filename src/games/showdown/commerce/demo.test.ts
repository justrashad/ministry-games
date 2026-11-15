import { describe, expect, it } from 'vitest';
import { createDemoGame, demoSet, DEMO_QUESTION_IDS } from './demo';
import { DEFAULT_SETTINGS } from '../engine/defaults';
import { reduceGame } from '../engine/game';

describe('free demo', () => {
  it('is a single round with sample questions and no final round or Final Challenge', () => {
    const result = createDemoGame(DEFAULT_SETTINGS, DEFAULT_SETTINGS.teams);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const game = result.game;
    expect(game.config.demo).toBe(true);
    expect(game.roundPlan).toEqual([{ isFinal: false, multiplier: 1 }]);
    expect(game.pools.finalChallenge).toHaveLength(0);
    expect(demoSet().questions.map((q) => q.id).sort()).toEqual([...DEMO_QUESTION_IDS].sort());
    let s = reduceGame(game, { type: 'NEXT_ROUND', now: 0 });
    expect(DEMO_QUESTION_IDS).toContain(s?.round?.question.id);
    s = reduceGame(reduceGame(s, { type: 'AWARD_ROUND', team: 0, now: 1 }), { type: 'NEXT_ROUND', now: 2 });
    expect(s?.phase).toBe('gameOver');
    expect(reduceGame(s, { type: 'FC_OPEN', now: 3 })?.phase).toBe('gameOver');
  });
});
