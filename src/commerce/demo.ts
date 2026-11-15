import type { QuestionSet, Settings, TeamConfig } from '../types';
import { SAMPLE_ROUND_QUESTIONS } from '../data/sampleQuestions';
import { SAMPLE_ROUND_QUESTIONS_ES } from '../data/sampleQuestionsEs';
import type { Lang } from '../i18n/i18n';
import { sanitizeSettings } from '../engine/defaults';
import { createGame, type CreateGameResult } from '../engine/createGame';

/** The free demo: one round, drawn at random from these sample questions. */
export const DEMO_QUESTION_IDS = ['sample-fw-01', 'sample-ch-01', 'sample-kn-03', 'sample-cr-01', 'sample-mt-03'];

export function demoSet(lang: Lang = 'en'): QuestionSet {
  const pool = lang === 'es' ? SAMPLE_ROUND_QUESTIONS_ES : SAMPLE_ROUND_QUESTIONS;
  const ids = lang === 'es' ? DEMO_QUESTION_IDS.map((id) => id.replace('sample-', 'sample-es-')) : DEMO_QUESTION_IDS;
  return {
    id: 'demo',
    name: lang === 'es' ? 'Demostración gratis' : 'Free demo',
    questions: pool.filter((q) => ids.includes(q.id)),
    createdAt: 0,
    updatedAt: 0,
  };
}

export function demoSettings(settings: Settings): Settings {
  return sanitizeSettings({
    ...settings,
    rules: { ...settings.rules, rounds: 1, multipliers: [1], finalRound: { ...settings.rules.finalRound, enabled: false } },
    finalChallenge: { ...settings.finalChallenge, enabled: false },
    questions: { ...settings.questions, order: 'shuffle', avoidRepeats: true },
  });
}

export function createDemoGame(settings: Settings, teams: [TeamConfig, TeamConfig], lang: Lang = 'en'): CreateGameResult {
  return createGame({ settings: demoSettings(settings), set: demoSet(lang), teams, demo: true });
}
