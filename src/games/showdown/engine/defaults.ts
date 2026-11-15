import type { HouseRules, Settings, TeamColorId } from '../types';

export const TEAM_COLORS: Record<TeamColorId, { label: string; hex: string; ink: string }> = {
  sky: { label: 'Sky', hex: '#4cc3ff', ink: '#062a3d' },
  coral: { label: 'Coral', hex: '#ff8a65', ink: '#3d1206' },
  emerald: { label: 'Emerald', hex: '#34d399', ink: '#05301f' },
  violet: { label: 'Violet', hex: '#b9a3ff', ink: '#231047' },
  amber: { label: 'Amber', hex: '#fbbf24', ink: '#3d2a02' },
  rose: { label: 'Rose', hex: '#f472b6', ink: '#3f0a24' },
  teal: { label: 'Teal', hex: '#2dd4bf', ink: '#03302b' },
  lime: { label: 'Lime', hex: '#a3e635', ink: '#1f3003' },
};

export const TEAM_COLOR_IDS = Object.keys(TEAM_COLORS) as TeamColorId[];

export function isTeamColor(value: unknown): value is TeamColorId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TEAM_COLORS, value);
}

export const LIMITS = {
  teamName: 24,
  playerName: 20,
  answerText: 80,
  questionText: 220,
  maxScore: 99999,
  maxPoints: 1000,
  strikes: { min: 1, max: 5 },
  rounds: { min: 1, max: 10 },
  multiplier: { min: 1, max: 10 },
  timerSeconds: { min: 5, max: 300 },
  finalRoundQuestions: { min: 1, max: 3 },
  answerLimit: { min: 3, max: 10 },
  fcQuestions: { min: 3, max: 5 },
  target: { min: 10, max: 2000 },
} as const;

export const TIMER_PRESETS = [15, 20, 30] as const;
export const FC_TIMER_PRESETS = [20, 30, 45, 60] as const;

export const DEFAULT_RULES: HouseRules = {
  maxStrikes: 3,
  faceoffBuzzers: true,
  rounds: 3,
  multipliers: [1, 2, 2],
  revealRemainingOnRoundEnd: true,
  stealAward: 'allPoints',
  allowNegativeScores: false,
  finalRound: {
    enabled: true,
    questionCount: 1,
    multiplier: 3,
    timerSeconds: 0,
    answerLimit: 8,
    revealMode: 'individual',
  },
};

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  teams: [
    { name: 'Team 1', color: 'sky' },
    { name: 'Team 2', color: 'coral' },
  ],
  rules: DEFAULT_RULES,
  timer: { enabled: false, defaultSeconds: 20 },
  audio: { enabled: true, volume: 0.6 },
  visuals: { animations: true, motion: 'system', celebrations: true, showHiddenPoints: false },
  questions: { activeSetId: null, order: 'shuffle', avoidRepeats: true, avoidRecentGames: 3 },
  finalChallenge: {
    enabled: true,
    questionCount: 5,
    player1Seconds: 30,
    player2Seconds: 35,
    targetScore: 200,
    duplicatePolicy: 'countBoth',
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = toFiniteNumber(value);
  if (n === null) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = toFiniteNumber(value);
  if (n === null) return fallback;
  return Math.min(max, Math.max(min, n));
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === 'string' && (options as readonly string[]).includes(value) ? (value as T) : fallback;
}

function cleanName(value: unknown, fallback: string, max: number): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().slice(0, max);
  return trimmed || fallback;
}

export function normalizeMultipliers(list: unknown, rounds: number): number[] {
  const source = Array.isArray(list) ? list : [];
  const out: number[] = [];
  for (let i = 0; i < rounds; i += 1) {
    const fallback = out[i - 1] ?? 1;
    out.push(clampInt(source[i], LIMITS.multiplier.min, LIMITS.multiplier.max, fallback));
  }
  return out;
}

export function multiplierForRound(rules: HouseRules, index: number): number {
  return rules.multipliers[index] ?? rules.multipliers[rules.multipliers.length - 1] ?? 1;
}

export function sanitizeRules(raw: unknown): HouseRules {
  const r = isRecord(raw) ? raw : {};
  const d = DEFAULT_RULES;
  const rounds = clampInt(r.rounds, LIMITS.rounds.min, LIMITS.rounds.max, d.rounds);
  const fr = isRecord(r.finalRound) ? r.finalRound : {};
  return {
    maxStrikes: clampInt(r.maxStrikes, LIMITS.strikes.min, LIMITS.strikes.max, d.maxStrikes),
    faceoffBuzzers: bool(r.faceoffBuzzers, d.faceoffBuzzers),
    rounds,
    multipliers: normalizeMultipliers(r.multipliers ?? d.multipliers, rounds),
    revealRemainingOnRoundEnd: bool(r.revealRemainingOnRoundEnd, d.revealRemainingOnRoundEnd),
    stealAward: oneOf(r.stealAward, ['allPoints', 'answerOnly'] as const, d.stealAward),
    allowNegativeScores: bool(r.allowNegativeScores, d.allowNegativeScores),
    finalRound: {
      enabled: bool(fr.enabled, d.finalRound.enabled),
      questionCount: clampInt(fr.questionCount, LIMITS.finalRoundQuestions.min, LIMITS.finalRoundQuestions.max, d.finalRound.questionCount),
      multiplier: clampInt(fr.multiplier, LIMITS.multiplier.min, LIMITS.multiplier.max, d.finalRound.multiplier),
      timerSeconds: fr.timerSeconds === 0 ? 0 : clampInt(fr.timerSeconds, LIMITS.timerSeconds.min, LIMITS.timerSeconds.max, d.finalRound.timerSeconds),
      answerLimit: clampInt(fr.answerLimit, LIMITS.answerLimit.min, LIMITS.answerLimit.max, d.finalRound.answerLimit),
      revealMode: oneOf(fr.revealMode, ['individual', 'simultaneous'] as const, d.finalRound.revealMode),
    },
  };
}

/** Tolerant merge of whatever is in storage with defaults; never throws. */
export function sanitizeSettings(raw: unknown): Settings {
  const s = isRecord(raw) ? raw : {};
  const d = DEFAULT_SETTINGS;
  const teamsRaw = Array.isArray(s.teams) ? s.teams : [];
  const team = (i: 0 | 1) => {
    const t = isRecord(teamsRaw[i]) ? teamsRaw[i] : {};
    return {
      name: cleanName(t.name, d.teams[i].name, LIMITS.teamName),
      color: isTeamColor(t.color) ? t.color : d.teams[i].color,
    };
  };
  const timer = isRecord(s.timer) ? s.timer : {};
  const audio = isRecord(s.audio) ? s.audio : {};
  const visuals = isRecord(s.visuals) ? s.visuals : {};
  const questions = isRecord(s.questions) ? s.questions : {};
  const fc = isRecord(s.finalChallenge) ? s.finalChallenge : {};
  return {
    version: 1,
    teams: [team(0), team(1)],
    rules: sanitizeRules(s.rules),
    timer: {
      enabled: bool(timer.enabled, d.timer.enabled),
      defaultSeconds: clampInt(timer.defaultSeconds, LIMITS.timerSeconds.min, LIMITS.timerSeconds.max, d.timer.defaultSeconds),
    },
    audio: {
      enabled: bool(audio.enabled, d.audio.enabled),
      volume: clampNumber(audio.volume, 0, 1, d.audio.volume),
    },
    visuals: {
      animations: bool(visuals.animations, d.visuals.animations),
      motion: oneOf(visuals.motion, ['system', 'reduced', 'full'] as const, d.visuals.motion),
      celebrations: bool(visuals.celebrations, d.visuals.celebrations),
      showHiddenPoints: bool(visuals.showHiddenPoints, d.visuals.showHiddenPoints),
    },
    questions: {
      activeSetId: typeof questions.activeSetId === 'string' ? questions.activeSetId : null,
      order: oneOf(questions.order, ['inOrder', 'shuffle'] as const, d.questions.order),
      avoidRepeats: bool(questions.avoidRepeats, d.questions.avoidRepeats),
      avoidRecentGames: clampInt(questions.avoidRecentGames, 0, 20, d.questions.avoidRecentGames),
    },
    finalChallenge: {
      enabled: bool(fc.enabled, d.finalChallenge.enabled),
      questionCount: clampInt(fc.questionCount, LIMITS.fcQuestions.min, LIMITS.fcQuestions.max, d.finalChallenge.questionCount),
      player1Seconds: clampInt(fc.player1Seconds, LIMITS.timerSeconds.min, LIMITS.timerSeconds.max, d.finalChallenge.player1Seconds),
      player2Seconds: clampInt(fc.player2Seconds, LIMITS.timerSeconds.min, LIMITS.timerSeconds.max, d.finalChallenge.player2Seconds),
      targetScore: clampInt(fc.targetScore, LIMITS.target.min, LIMITS.target.max, d.finalChallenge.targetScore),
      duplicatePolicy: oneOf(fc.duplicatePolicy, ['countBoth', 'secondScoresZero'] as const, d.finalChallenge.duplicatePolicy),
    },
  };
}
