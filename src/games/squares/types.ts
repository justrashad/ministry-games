import type { TrueFalseQuestion } from '../../core/questions/types';

/*
 * Kingdom Squares: two teams, a 3 by 3 board, true or false statements.
 * Teams take turns picking a square. The host reads that square's statement and
 * the team says whether it is true or false. A right call claims the square. A
 * wrong call gives the square to the other team, unless that would win the game
 * for them; then the square stays open. Three in a row, or any five squares,
 * wins the game. The first team to win the agreed number of games wins the match.
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
  /** Games a team must win to take the match: 1, 2 (best of three) or 3 (best of five). */
  gamesToWin: number;
}

/** Who holds a square, or null while it is open. */
export type Owner = TeamIndex | null;

/** What a call did to the square: claimed by the team, given to the other team, or left open. */
export type Outcome = 'claimed' | 'given' | 'blocked';

export interface ActiveSquare {
  square: number;
  question: TrueFalseQuestion;
  /** The team's call, once made. */
  answer: boolean | null;
  outcome: Outcome | null;
}

export type GamePhase =
  | 'intro'
  /** The team whose turn it is picks a square. */
  | 'pick'
  /** Statement on screen, waiting for the team's call. */
  | 'question'
  /** Call made, the answer and its correction on screen. */
  | 'reveal'
  /** A team won this game. */
  | 'gameWon'
  | 'matchOver';

export type GameEventKind = 'none' | 'start' | 'pick' | 'correct' | 'wrong' | 'blocked' | 'gameWon' | 'matchOver';

/** Display windows watch seq to play each sound and animation exactly once. */
export interface GameEvent {
  seq: number;
  kind: GameEventKind;
  team?: TeamIndex;
  square?: number;
}

export interface PlayedStatement {
  game: number;
  questionId: string;
  team: TeamIndex;
  correct: boolean;
}

export interface GameState {
  schema: typeof GAME_SCHEMA_VERSION;
  id: string;
  config: GameConfig;
  phase: GamePhase;
  /** Index of the game within the match, from 0. */
  game: number;
  /** Nine squares, row by row from the top left. */
  squares: Owner[];
  /** The team picking or answering now. */
  turn: TeamIndex;
  /** The team that picked first in this game. The other team starts the next one. */
  starter: TeamIndex;
  /** Every statement this match can use, in the order they are drawn. */
  deck: TrueFalseQuestion[];
  /** How many statements have been drawn. Past the end, the deck starts over. */
  next: number;
  active: ActiveSquare | null;
  wins: [number, number];
  /** Set while a game's result is on screen. */
  gameWinner: TeamIndex | null;
  /** The winning three in a row, or null for a five-square win. */
  winLine: number[] | null;
  played: PlayedStatement[];
  event: GameEvent;
  startedAt: number;
}
