import { uid } from '../../../core/lib/ids';
import { shuffle } from '../../../core/lib/random';
import { LEVELS, type ClueQuestion, type Level } from '../../../core/questions/types';
import { GAME_SCHEMA_VERSION, type Board, type GameConfig, type GameState, type TeamConfig, type Tile } from '../types';

export const DEFAULT_TEAMS: [TeamConfig, TeamConfig] = [
  { name: 'Team 1', color: 'sky' },
  { name: 'Team 2', color: 'coral' },
];

export const DEFAULT_CONFIG: Omit<GameConfig, 'teams'> = {
  baseValue: 100,
  bonusMultiplier: 2,
  finalValue: 1000,
};

export const BOARD_LIMITS = {
  rounds: { min: 1, max: 2 },
  categories: { min: 3, max: 6 },
} as const;

export interface CreateGameInput {
  /** Every clue available to this game, from one or more packs. */
  clues: ClueQuestion[];
  /** Clues set aside for the final round. When empty, an unused hard clue is taken from the packs. */
  finals?: ClueQuestion[];
  teams?: [TeamConfig, TeamConfig];
  /** Board rounds to play (1 or 2). Fewer are played when the packs don't hold enough full categories. */
  rounds?: number;
  /** Categories on each board (3 to 6). */
  categoriesPerRound?: number;
  /** Clues played in recent games. They are used only when nothing else fits. */
  avoidIds?: ReadonlySet<string>;
  config?: Partial<Omit<GameConfig, 'teams'>>;
  rng?: () => number;
  now?: number;
}

export type CreateGameResult =
  | { ok: true; game: GameState; warnings: string[] }
  | { ok: false; error: string };

type ByLevel = Record<Level, ClueQuestion[]>;

function clamp(value: number | undefined, min: number, max: number, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Groups clues by category and keeps the categories that have a clue at every level. */
export function fullCategories(clues: ClueQuestion[]): Map<string, ByLevel> {
  const groups = new Map<string, ByLevel>();
  for (const clue of clues) {
    const name = clue.category.trim();
    if (!name) continue;
    let levels = groups.get(name);
    if (!levels) {
      levels = { 1: [], 2: [], 3: [], 4: [], 5: [] };
      groups.set(name, levels);
    }
    levels[clue.level].push(clue);
  }
  for (const [name, levels] of groups) {
    if (LEVELS.some((level) => levels[level].length === 0)) groups.delete(name);
  }
  return groups;
}

function pick<T extends { id: string }>(items: T[], avoid: ReadonlySet<string>, rng: () => number): T {
  const fresh = items.filter((item) => !avoid.has(item.id));
  const pool = fresh.length > 0 ? fresh : items;
  return pool[Math.floor(rng() * pool.length)];
}

function buildBoard(names: string[], groups: Map<string, ByLevel>, multiplier: number, config: Omit<GameConfig, 'teams'>, avoid: ReadonlySet<string>, rng: () => number): Board {
  const categories = names.map((name) => {
    const levels = groups.get(name)!;
    const tiles: Tile[] = LEVELS.map((level) => ({
      clue: pick(levels[level], avoid, rng),
      value: level * config.baseValue * multiplier,
      bonus: false,
      done: false,
      wonBy: null,
    }));
    return { name, tiles };
  });
  // One hidden bonus tile per board, never on the easiest row.
  const category = Math.floor(rng() * categories.length);
  const row = 1 + Math.floor(rng() * (LEVELS.length - 1));
  categories[category].tiles[row].bonus = true;
  return { multiplier, categories };
}

/** Builds a ready-to-play game. The same clues and rng always build the same game. */
export function createGame(input: CreateGameInput): CreateGameResult {
  const rng = input.rng ?? Math.random;
  const avoid = input.avoidIds ?? new Set<string>();
  const config = { ...DEFAULT_CONFIG, ...input.config };
  const warnings: string[] = [];

  const groups = fullCategories(input.clues);
  const wantRounds = clamp(input.rounds, BOARD_LIMITS.rounds.min, BOARD_LIMITS.rounds.max, 2);
  const wantCategories = clamp(input.categoriesPerRound, BOARD_LIMITS.categories.min, BOARD_LIMITS.categories.max, 6);

  if (groups.size < BOARD_LIMITS.categories.min) {
    return {
      ok: false,
      error: `A game needs at least ${BOARD_LIMITS.categories.min} categories that each have a clue at every level from 1 to 5. These questions have ${groups.size}.`,
    };
  }
  const perRound = Math.min(wantCategories, groups.size);
  const rounds = Math.max(1, Math.min(wantRounds, Math.floor(groups.size / perRound)));
  if (perRound < wantCategories) warnings.push(`Only ${perRound} full categories were available, so each board has ${perRound} instead of ${wantCategories}.`);
  if (rounds < wantRounds) warnings.push(`There were not enough full categories for ${wantRounds} rounds, so this game has ${rounds}.`);

  const names = shuffle([...groups.keys()], rng).slice(0, perRound * rounds);
  const boards: Board[] = [];
  for (let r = 0; r < rounds; r += 1) {
    boards.push(buildBoard(names.slice(r * perRound, (r + 1) * perRound), groups, r + 1, config, avoid, rng));
  }

  const onBoard = new Set(boards.flatMap((b) => b.categories.flatMap((c) => c.tiles.map((t) => t.clue.id))));
  const finals = (input.finals ?? []).filter((clue) => !onBoard.has(clue.id));
  // With no dedicated final clues, fall back to an unused hard clue, preferring a category that isn't on a board.
  const usedNames = new Set(names);
  const spare = input.clues.filter((clue) => clue.level >= 4 && !onBoard.has(clue.id));
  const spareOffBoard = spare.filter((clue) => !usedNames.has(clue.category.trim()));
  const finalPool = finals.length > 0 ? finals : spareOffBoard.length > 0 ? spareOffBoard : spare;
  const finalClue = finalPool.length > 0 ? pick(finalPool, avoid, rng) : null;
  if (!finalClue) warnings.push('No clue was left over for the final round, so this game ends after the last board.');

  const now = input.now ?? Date.now();
  const game: GameState = {
    schema: GAME_SCHEMA_VERSION,
    id: uid('game'),
    config: { ...config, teams: input.teams ?? DEFAULT_TEAMS },
    phase: 'intro',
    round: 0,
    boards,
    final: finalClue ? { clue: finalClue, results: [null, null] } : null,
    scores: [0, 0],
    control: 0,
    active: null,
    played: [],
    event: { seq: 0, kind: 'none' },
    startedAt: now,
  };
  return { ok: true, game, warnings };
}
