import type { ClueQuestion } from '../../core/questions/types';

/*
 * Are You Smarter Than a Spiritual Babe?: two teams, each with its own board of
 * questions in five growth stages, Newborn to Mature (question levels 1 to 5).
 * Teams take turns. On its turn a team picks any question left on its board, the
 * host reads it and marks the answer right or wrong. A right answer climbs the
 * team one rung. A wrong answer costs nothing and uses the question up. Each team
 * has three helps, once each: Search the Scriptures (shows the verse reference and
 * starts a timer), Second Try (one more answer after a miss) and Swap (a different
 * question at the same stage). After both boards, a bonus question for both teams
 * is worth one more rung. The team with more rungs wins.
 */

export const GAME_SCHEMA_VERSION = 1;

export type TeamIndex = 0 | 1;

/** Stage 0 is Newborn (level 1) through stage 4, Mature (level 5). */
export type StageIndex = 0 | 1 | 2 | 3 | 4;

export const STAGE_COUNT = 5;

export type HelpName = 'lookup' | 'secondTry' | 'swap';

export const HELPS: readonly HelpName[] = ['lookup', 'secondTry', 'swap'];

export interface TeamConfig {
  name: string;
  /** A color id the screens map to their palette. */
  color: string;
}

export interface GameConfig {
  teams: [TeamConfig, TeamConfig];
  /** Questions per stage on each team's board: 2 for the full game, 1 for the demo. */
  perStage: 1 | 2;
  /** Seconds Search the Scriptures gives to look the verse up. */
  lookupSeconds: number;
}

export interface Slot {
  question: ClueQuestion;
  result: 'right' | 'wrong' | null;
}

/** One team's board: stages[stage][slot]. */
export interface Board {
  stages: Slot[][];
}

export interface HelpsLeft {
  lookup: boolean;
  secondTry: boolean;
  swap: boolean;
}

export interface ActiveQuestion {
  team: TeamIndex;
  stage: StageIndex;
  slot: number;
  /** When Search the Scriptures runs out, in ms since 1970, or null when it isn't in use. */
  lookupUntil: number | null;
  /** True once Second Try has been used on this question. */
  retry: boolean;
  result: 'right' | 'wrong' | null;
}

export interface BonusRound {
  question: ClueQuestion;
  /** Each team's result once the host marks it. */
  results: [boolean | null, boolean | null];
}

export type GamePhase =
  | 'intro'
  /** The team whose turn it is picks a question from its board. */
  | 'pick'
  /** Question on screen, the team is answering. Helps can be used. */
  | 'question'
  /** The answer was wrong and the team still has Second Try. */
  | 'missed'
  /** The answer is on screen. */
  | 'reveal'
  | 'bonusIntro'
  | 'bonusQuestion'
  | 'bonusReveal'
  | 'gameOver';

export type GameEventKind = 'none' | 'start' | 'pick' | 'lookup' | 'swap' | 'right' | 'wrong' | 'secondTry' | 'bonus' | 'gameOver';

/** Display windows watch seq to play each sound and animation exactly once. */
export interface GameEvent {
  seq: number;
  kind: GameEventKind;
  team?: TeamIndex;
}

export interface GameState {
  schema: typeof GAME_SCHEMA_VERSION;
  id: string;
  config: GameConfig;
  phase: GamePhase;
  boards: [Board, Board];
  turn: TeamIndex;
  helps: [HelpsLeft, HelpsLeft];
  /** Unused questions for Swap, by stage. */
  spares: ClueQuestion[][];
  active: ActiveQuestion | null;
  bonus: BonusRound | null;
  event: GameEvent;
  startedAt: number;
}
