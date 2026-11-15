import { uid } from '../../../core/lib/ids';
import { shuffle } from '../../../core/lib/random';
import type { TrueFalseQuestion } from '../../../core/questions/types';
import { GAME_SCHEMA_VERSION, type GameConfig, type GameState, type TeamConfig } from '../types';
import { emptyBoard, SQUARE_COUNT } from './game';

export const DEFAULT_TEAMS: [TeamConfig, TeamConfig] = [
  { name: 'Team 1', color: 'team1' },
  { name: 'Team 2', color: 'team2' },
];

export const MATCH_LIMITS = { gamesToWin: { min: 1, max: 3 } } as const;

/** One game can draw more statements than it has squares, since wrong calls can leave a square open. */
export const MIN_STATEMENTS = SQUARE_COUNT;

export interface CreateGameInput {
  statements: TrueFalseQuestion[];
  teams?: [TeamConfig, TeamConfig];
  /** Games a team must win to take the match (1 to 3). */
  gamesToWin?: number;
  /** Statements used in recent matches. They go to the back of the deck. */
  avoidIds?: ReadonlySet<string>;
  rng?: () => number;
  now?: number;
}

export type CreateGameResult = { ok: true; game: GameState } | { ok: false; error: string };

/** Builds a ready-to-play match. The same statements and rng always build the same match. */
export function createGame(input: CreateGameInput): CreateGameResult {
  const rng = input.rng ?? Math.random;
  const avoid = input.avoidIds ?? new Set<string>();
  const seen = new Set<string>();
  const statements = input.statements.filter((q) => {
    if (q.type !== 'truefalse' || typeof q.isTrue !== 'boolean' || !q.statement.trim() || seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
  if (statements.length < MIN_STATEMENTS) {
    return { ok: false, error: `A game needs at least ${MIN_STATEMENTS} true or false statements. These questions have ${statements.length}.` };
  }
  const raw = input.gamesToWin ?? 2;
  const gamesToWin = Number.isFinite(raw) ? Math.min(MATCH_LIMITS.gamesToWin.max, Math.max(MATCH_LIMITS.gamesToWin.min, Math.round(raw))) : 2;
  // Fresh statements first, then the recently played ones, each group shuffled.
  const deck = [...shuffle(statements.filter((q) => !avoid.has(q.id)), rng), ...shuffle(statements.filter((q) => avoid.has(q.id)), rng)];
  const config: GameConfig = { teams: input.teams ?? DEFAULT_TEAMS, gamesToWin };
  const game: GameState = {
    schema: GAME_SCHEMA_VERSION,
    id: uid('match'),
    config,
    phase: 'intro',
    game: 0,
    squares: emptyBoard(),
    turn: 0,
    starter: 0,
    deck,
    next: 0,
    active: null,
    wins: [0, 0],
    gameWinner: null,
    winLine: null,
    played: [],
    event: { seq: 0, kind: 'none' },
    startedAt: input.now ?? Date.now(),
  };
  return { ok: true, game };
}
