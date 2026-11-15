import { uid } from '../../../core/lib/ids';
import { shuffle } from '../../../core/lib/random';
import { LEVELS, type ClueQuestion } from '../../../core/questions/types';
import { GAME_SCHEMA_VERSION, STAGE_COUNT, type Board, type GameState, type Slot, type TeamConfig } from '../types';

export const DEFAULT_TEAMS: [TeamConfig, TeamConfig] = [
  { name: 'Team 1', color: 'team1' },
  { name: 'Team 2', color: 'team2' },
];

export const LOOKUP_SECONDS = 60;

export interface CreateGameInput {
  questions: ClueQuestion[];
  /** Bonus questions; one is drawn. An empty list plays without the bonus round. */
  bonus: ClueQuestion[];
  /** Questions per stage on each team's board: 2 for the full game, 1 for the demo. */
  perStage?: 1 | 2;
  teams?: [TeamConfig, TeamConfig];
  /** Questions used in recent games. They are drawn last. */
  avoidIds?: ReadonlySet<string>;
  rng?: () => number;
  now?: number;
}

export type CreateGameResult = { ok: true; game: GameState } | { ok: false; error: string };

function valid(q: ClueQuestion): boolean {
  return q.type === 'clue' && LEVELS.includes(q.level) && !!q.prompt.trim() && !!q.answer.trim();
}

/** Fresh questions first, then recently played ones, each group shuffled. */
function ordered(list: ClueQuestion[], avoid: ReadonlySet<string>, rng: () => number): ClueQuestion[] {
  return [...shuffle(list.filter((q) => !avoid.has(q.id)), rng), ...shuffle(list.filter((q) => avoid.has(q.id)), rng)];
}

/** Takes `count` questions for one team's stage, preferring subjects that team doesn't already have at that stage. */
function takeFor(pool: ClueQuestion[], count: number): ClueQuestion[] {
  const picked: ClueQuestion[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = pool.findIndex((q) => !picked.some((p) => p.category === q.category));
    picked.push(pool.splice(i === -1 ? 0 : i, 1)[0]);
  }
  return picked;
}

/** Builds a ready-to-play game. The same questions and rng always build the same game. */
export function createGame(input: CreateGameInput): CreateGameResult {
  const rng = input.rng ?? Math.random;
  const avoid = input.avoidIds ?? new Set<string>();
  const perStage = input.perStage ?? 2;
  const seen = new Set<string>();
  const questions = input.questions.filter((q) => {
    if (!valid(q) || seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });

  const boards: [Board, Board] = [{ stages: [] }, { stages: [] }];
  const spares: ClueQuestion[][] = [];
  for (let stage = 0; stage < STAGE_COUNT; stage += 1) {
    const level = LEVELS[stage];
    const pool = ordered(
      questions.filter((q) => q.level === level),
      avoid,
      rng,
    );
    if (pool.length < perStage * 2) {
      return { ok: false, error: `Each stage needs at least ${perStage * 2} questions. Stage ${stage + 1} has ${pool.length}.` };
    }
    for (const team of [0, 1] as const) {
      boards[team].stages.push(takeFor(pool, perStage).map((question): Slot => ({ question, result: null })));
    }
    spares.push(pool);
  }

  const bonusPool = ordered(input.bonus.filter(valid), avoid, rng);
  const game: GameState = {
    schema: GAME_SCHEMA_VERSION,
    id: uid('game'),
    config: { teams: input.teams ?? DEFAULT_TEAMS, perStage, lookupSeconds: LOOKUP_SECONDS },
    phase: 'intro',
    boards,
    turn: 0,
    helps: [
      { lookup: true, secondTry: true, swap: true },
      { lookup: true, secondTry: true, swap: true },
    ],
    spares,
    active: null,
    bonus: bonusPool.length > 0 ? { question: bonusPool[0], results: [null, null] } : null,
    event: { seq: 0, kind: 'none' },
    startedAt: input.now ?? Date.now(),
  };
  return { ok: true, game };
}

/** Every question id on both boards and the bonus, for remembering what was played. */
export function questionIds(game: GameState): string[] {
  return [...game.boards.flatMap((b) => b.stages.flatMap((stage) => stage.map((slot) => slot.question.id))), ...(game.bonus ? [game.bonus.question.id] : [])];
}
