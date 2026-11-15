import type { ClueQuestion } from '../../core/questions/types';

/*
 * Theopardy!: two teams, a board of categories, five clues per category.
 * Both teams race to buzz on every clue. A right answer scores the tile's value.
 * A wrong answer costs nothing, and the other team gets a chance at the clue.
 */

export const GAME_SCHEMA_VERSION = 1;

export type TeamIndex = 0 | 1;

export interface TeamConfig {
  name: string;
  /** A color id the screens map to their palette. */
  color: string;
}

export interface GameConfig {
  teams: [TeamConfig, TeamConfig];
  /** Points a tile is worth at level 1 in round 1. Level n is worth n times this; round 2 doubles it. */
  baseValue: number;
  /** A bonus tile is worth this many times its value. There is no wagering. */
  bonusMultiplier: number;
  /** Points for a right answer in the final round. Every team answers; nothing is risked. */
  finalValue: number;
}

export interface Tile {
  clue: ClueQuestion;
  value: number;
  /** The hidden bonus tile of its round. */
  bonus: boolean;
  done: boolean;
  wonBy: TeamIndex | null;
}

export interface BoardCategory {
  name: string;
  /** Five tiles, easiest first. */
  tiles: Tile[];
}

export interface Board {
  /** 1 for the first round, 2 for the second. */
  multiplier: number;
  categories: BoardCategory[];
}

export interface ActiveClue {
  category: number;
  tile: number;
  /** Points on offer, bonus included. */
  value: number;
  bonus: boolean;
  /** Teams that already answered wrong. They can't buzz on this clue again. */
  missed: TeamIndex[];
  /** The team answering now, or null while the buzzers are open. */
  answering: TeamIndex | null;
  /** Set once the clue is settled: who scored, or null when nobody did. */
  winner: TeamIndex | null;
}

export interface FinalRound {
  clue: ClueQuestion;
  /** Per team: true or false once the host has judged that team's answer. */
  results: [boolean | null, boolean | null];
}

export type GamePhase =
  | 'intro'
  /** Waiting for the team in control to pick a tile. */
  | 'board'
  /** Clue on screen, buzzers open. */
  | 'clue'
  /** One team is answering. */
  | 'answering'
  /** Clue settled, answer on screen. */
  | 'reveal'
  | 'roundOver'
  /** Final round: category shown. */
  | 'finalIntro'
  /** Final round: clue shown, every team writes an answer. */
  | 'finalClue'
  /** Final round: answer shown, host marks each team right or wrong. */
  | 'finalReveal'
  | 'gameOver';

export type GameEventKind =
  | 'none'
  | 'start'
  | 'select'
  | 'bonus'
  | 'buzz'
  | 'correct'
  | 'wrong'
  | 'reveal'
  | 'roundOver'
  | 'final'
  | 'gameOver';

/** Display windows watch seq to play each sound and animation exactly once. */
export interface GameEvent {
  seq: number;
  kind: GameEventKind;
  team?: TeamIndex;
  value?: number;
}

export interface PlayedClue {
  round: number;
  questionId: string;
  category: string;
  value: number;
  team: TeamIndex | null;
}

export interface GameState {
  schema: typeof GAME_SCHEMA_VERSION;
  id: string;
  config: GameConfig;
  phase: GamePhase;
  /** Index into boards. */
  round: number;
  boards: Board[];
  final: FinalRound | null;
  scores: [number, number];
  /** The team that picks the next tile. */
  control: TeamIndex;
  active: ActiveClue | null;
  played: PlayedClue[];
  event: GameEvent;
  startedAt: number;
}
