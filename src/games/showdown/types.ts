/* ------------------------------------------------------------------------ */
/* Question library                                                          */
/* ------------------------------------------------------------------------ */

import type { Level } from '../../core/questions/types';

export interface Answer {
  id: string;
  text: string;
  /** Fictional game value. Not a real survey statistic. */
  points: number;
}

export interface AlternateAnswer {
  acceptedAnswer: string;
  matchesAnswerId: string;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  answers: Answer[];
  /** Overrides the round multiplier when this question is played in the main game. */
  multiplier?: number;
  /** Eligible for the big-point final round of the main game. */
  isFinalRound?: boolean;
  /** Used only in the Final Challenge (two-player speed round). */
  isFinalChallenge?: boolean;
  /** Optional per-question countdown (seconds) for main-game rounds. */
  timeLimit?: number;
  /** Extra phrasings that should auto-match an answer in the Final Challenge. */
  alternateAnswers?: AlternateAnswer[];
  notes?: string;
  /** Shared question format (src/questions): difficulty from 1 (easiest) to 5. Not used by the survey rules. */
  level?: Level;
  /** Shared question format: scripture citation, for example "Daniel 1:6". Never verse text. */
  reference?: string;
}

export interface QuestionSet {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
  isSample?: boolean;
  /** Set when this set came from a purchased question pack. */
  packId?: string;
}

export interface QuestionSetExport {
  name: string;
  version: 1;
  description?: string;
  exportedAt?: string;
  questions: Question[];
}

export type QuestionKind = 'round' | 'finalRound' | 'finalChallenge';

/* ------------------------------------------------------------------------ */
/* Settings                                                                  */
/* ------------------------------------------------------------------------ */

export type TeamIndex = 0 | 1;
export type PlayerIndex = 0 | 1;
export type TeamColorId = 'sky' | 'coral' | 'emerald' | 'violet' | 'amber' | 'rose' | 'teal' | 'lime';

export interface TeamConfig {
  name: string;
  color: TeamColorId;
}

export type StealAwardRule = 'allPoints' | 'answerOnly';

export interface FinalRoundRules {
  enabled: boolean;
  questionCount: number;
  multiplier: number;
  /** 0 = no final-round timer. */
  timerSeconds: number;
  answerLimit: number;
  revealMode: 'individual' | 'simultaneous';
}

export interface HouseRules {
  maxStrikes: number;
  /** Arm phone/keyboard buzzers when a question is shown so teams race for control. */
  faceoffBuzzers: boolean;
  rounds: number;
  multipliers: number[];
  revealRemainingOnRoundEnd: boolean;
  stealAward: StealAwardRule;
  allowNegativeScores: boolean;
  finalRound: FinalRoundRules;
}

export interface FinalChallengeSettings {
  enabled: boolean;
  questionCount: number;
  player1Seconds: number;
  player2Seconds: number;
  targetScore: number;
  duplicatePolicy: 'countBoth' | 'secondScoresZero';
}

export interface Settings {
  version: 1;
  teams: [TeamConfig, TeamConfig];
  rules: HouseRules;
  timer: { enabled: boolean; defaultSeconds: number };
  audio: { enabled: boolean; volume: number };
  visuals: {
    animations: boolean;
    motion: 'system' | 'reduced' | 'full';
    celebrations: boolean;
    showHiddenPoints: boolean;
  };
  questions: {
    activeSetId: string | null;
    order: 'inOrder' | 'shuffle';
    avoidRepeats: boolean;
    /** Push questions played in this many recent games to the back of the deck (0 = off). */
    avoidRecentGames: number;
  };
  finalChallenge: FinalChallengeSettings;
}

/* ------------------------------------------------------------------------ */
/* Live game (temporary state, synced between windows)                       */
/* ------------------------------------------------------------------------ */

export interface TimerState {
  durationMs: number;
  remainingMs: number;
  /** Wall-clock ms when the timer last started; null while stopped. */
  runningSince: number | null;
  expired: boolean;
}

export type GamePhase =
  | 'intro'
  | 'roundIntro'
  | 'playing'
  | 'steal'
  | 'roundOver'
  | 'gameOver'
  | 'finalChallenge';

export interface RevealEntry {
  /** scored = guessed by the playing team, steal = the steal answer, shown = displayed for no points. */
  source: 'scored' | 'shown' | 'steal';
  /** False while a final-round answer is locked in but held for a simultaneous reveal. */
  visible: boolean;
}

export type RoundResultVia = 'play' | 'steal' | 'stealFailed' | 'manual';

export interface RoundResult {
  team: TeamIndex;
  raw: number;
  points: number;
  via: RoundResultVia;
}

export interface RoundPlanEntry {
  isFinal: boolean;
  multiplier: number;
}

export interface FaceoffState {
  armed: boolean;
  team: TeamIndex | null;
}

export interface RoundState {
  index: number;
  isFinal: boolean;
  multiplier: number;
  question: Question;
  revealed: Record<string, RevealEntry>;
  /** Raw (un-multiplied) points found this round. */
  bank: number;
  strikes: number;
  controllingTeam: TeamIndex | null;
  stealingTeam: TeamIndex | null;
  result: RoundResult | null;
  holdReveals: boolean;
  /** Optional so games saved before buzzers existed still load. */
  faceoff?: FaceoffState;
}

export interface PlayedRound {
  roundIndex: number;
  questionId: string;
  question: string;
  category: string;
  team: TeamIndex | null;
  points: number;
  via: RoundResultVia | 'none';
}

export interface TeamState {
  name: string;
  color: TeamColorId;
  score: number;
}

export type GameEventKind =
  | 'none'
  | 'gameStart'
  | 'roundStart'
  | 'finalRound'
  | 'questionShown'
  | 'correct'
  | 'reveal'
  | 'revealAll'
  | 'strike'
  | 'strikeRemoved'
  | 'steal'
  | 'stealCancelled'
  | 'stealSuccess'
  | 'roundWin'
  | 'roundReset'
  | 'buzzersArmed'
  | 'buzz'
  | 'timeUp'
  | 'gameOver'
  | 'fcOpen'
  | 'fcStart'
  | 'fcSubmit'
  | 'fcRepeat'
  | 'fcTurnEnd'
  | 'fcCellReveal'
  | 'fcTargetReached'
  | 'fcComplete';

export interface GameEvent {
  seq: number;
  kind: GameEventKind;
  team?: TeamIndex;
  answerId?: string;
  value?: number;
}

export interface GameConfig {
  rules: HouseRules;
  timerEnabled: boolean;
  timerSeconds: number;
  avoidRepeats: boolean;
  setId: string;
  setName: string;
  finalChallenge: FinalChallengeSettings;
  /** True for the free one-round demo. */
  demo?: boolean;
}

export type FcPhase = 'setup' | 'ready' | 'answering' | 'handoff' | 'review' | 'reveal' | 'complete';

export interface FcResponse {
  text: string;
  matchId: string | null;
  autoMatched: boolean;
  pointsOverride: number | null;
  answered: boolean;
}

export interface FinalChallengeState {
  phase: FcPhase;
  players: [string, string];
  activePlayer: PlayerIndex;
  team: TeamIndex | null;
  questions: Question[];
  responses: [FcResponse[], FcResponse[]];
  /** Question indexes still waiting for an answer this turn (skipped ones go to the back). */
  pending: number[];
  current: number | null;
  confirmed: boolean[];
  /** Cells revealed so far: Player 1's column top-to-bottom, then Player 2's. */
  revealStep: number;
  targetScore: number;
  duplicatePolicy: FinalChallengeSettings['duplicatePolicy'];
  seconds: [number, number];
  repeatSeq: number;
}

export const GAME_SCHEMA_VERSION = 1;

export interface GameState {
  schema: typeof GAME_SCHEMA_VERSION;
  id: string;
  createdAt: number;
  endedAt: number | null;
  phase: GamePhase;
  teams: [TeamState, TeamState];
  config: GameConfig;
  roundPlan: RoundPlanEntry[];
  pools: { regular: Question[]; final: Question[]; finalChallenge: Question[] };
  usedQuestionIds: string[];
  round: RoundState | null;
  played: PlayedRound[];
  timer: TimerState;
  paused: boolean;
  event: GameEvent;
  finalChallenge: FinalChallengeState | null;
  fcAttempts: number;
  recorded: { game: boolean; finalChallenge: boolean };
}

/* ------------------------------------------------------------------------ */
/* History                                                                   */
/* ------------------------------------------------------------------------ */

export interface HistoryEntry {
  id: string;
  date: number;
  setName: string;
  teams: [TeamState, TeamState];
  winner: TeamIndex | 'tie';
  rounds: PlayedRound[];
  finalChallenge?: {
    players: [string, string];
    playerTotals: [number, number];
    total: number;
    target: number;
    reached: boolean;
    questionIds?: string[];
  };
}
