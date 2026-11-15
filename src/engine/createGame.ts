import type { GameState, QuestionSet, RoundPlanEntry, Settings, TeamConfig } from '../types';
import { GAME_SCHEMA_VERSION } from '../types';
import { LIMITS, multiplierForRound } from './defaults';
import { isPlayableQuestion, orderQuestions } from './questionPicker';
import { createTimer } from './timer';
import { uid } from '../lib/ids';

export interface CreateGameInput {
  settings: Settings;
  set: QuestionSet;
  teams?: [TeamConfig, TeamConfig];
  rng?: () => number;
  now?: number;
  id?: string;
  /** Question ids played in recent games; they are moved to the back of each deck. */
  recentQuestionIds?: ReadonlySet<string>;
  /** Marks the free one-round demo. */
  demo?: boolean;
}

/** Stable partition: fresh questions first (in their chosen order), recent ones after. */
export function deprioritize<T extends { id: string }>(items: T[], recent: ReadonlySet<string> | undefined): T[] {
  if (!recent || recent.size === 0) return items;
  return [...items.filter((q) => !recent.has(q.id)), ...items.filter((q) => recent.has(q.id))];
}

export type CreateGameResult = { ok: true; game: GameState } | { ok: false; error: string };

export function summarizeSet(set: QuestionSet) {
  const playable = set.questions.filter(isPlayableQuestion);
  return {
    regular: playable.filter((q) => !q.isFinalRound && !q.isFinalChallenge).length,
    final: playable.filter((q) => q.isFinalRound && !q.isFinalChallenge).length,
    finalChallenge: playable.filter((q) => q.isFinalChallenge).length,
  };
}

export function buildRoundPlan(settings: Settings): RoundPlanEntry[] {
  const { rules } = settings;
  const plan: RoundPlanEntry[] = [];
  for (let i = 0; i < rules.rounds; i += 1) plan.push({ isFinal: false, multiplier: multiplierForRound(rules, i) });
  if (rules.finalRound.enabled) {
    for (let i = 0; i < rules.finalRound.questionCount; i += 1) plan.push({ isFinal: true, multiplier: rules.finalRound.multiplier });
  }
  return plan;
}

export function createGame(input: CreateGameInput): CreateGameResult {
  const { settings, set } = input;
  const rng = input.rng ?? Math.random;
  const now = input.now ?? Date.now();
  const playable = set.questions.filter(isPlayableQuestion);
  const regular = playable.filter((q) => !q.isFinalRound && !q.isFinalChallenge);
  const final = playable.filter((q) => q.isFinalRound && !q.isFinalChallenge);
  const finalChallenge = playable.filter((q) => q.isFinalChallenge);
  if (regular.length + final.length === 0) {
    return { ok: false, error: `"${set.name}" has no round questions yet. Add a question or choose another set.` };
  }
  const order = settings.questions.order;
  const teamConfigs = input.teams ?? settings.teams;
  const team = (i: 0 | 1) => ({
    name: teamConfigs[i].name.trim().slice(0, LIMITS.teamName) || `Team ${i + 1}`,
    color: teamConfigs[i].color,
    score: 0,
  });

  const game: GameState = {
    schema: GAME_SCHEMA_VERSION,
    id: input.id ?? uid('game'),
    createdAt: now,
    endedAt: null,
    phase: 'intro',
    teams: [team(0), team(1)],
    config: {
      rules: settings.rules,
      timerEnabled: settings.timer.enabled,
      timerSeconds: settings.timer.defaultSeconds,
      avoidRepeats: settings.questions.avoidRepeats,
      setId: set.id,
      setName: set.name,
      finalChallenge: settings.finalChallenge,
      ...(input.demo ? { demo: true } : {}),
    },
    roundPlan: buildRoundPlan(settings),
    pools: {
      regular: deprioritize(orderQuestions(regular, order, rng), input.recentQuestionIds),
      final: deprioritize(orderQuestions(final, order, rng), input.recentQuestionIds),
      finalChallenge: deprioritize(orderQuestions(finalChallenge, order, rng), input.recentQuestionIds),
    },
    usedQuestionIds: [],
    round: null,
    played: [],
    timer: createTimer(0),
    paused: false,
    event: { seq: 1, kind: 'gameStart' },
    finalChallenge: null,
    fcAttempts: 0,
    recorded: { game: false, finalChallenge: false },
  };
  return { ok: true, game };
}
