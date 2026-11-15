import type { GameEvent, GameEventKind, GameState, TeamIndex, TeamState } from '../types';
import { LIMITS } from './defaults';

export function otherTeam(team: TeamIndex): TeamIndex {
  return team === 0 ? 1 : 0;
}

/**
 * Every visible "moment" (reveal, strike, steal...) bumps a sequence number.
 * Display windows watch the sequence to trigger sounds and animations once.
 */
export function withEvent(
  state: GameState,
  kind: GameEventKind,
  extra: Omit<GameEvent, 'seq' | 'kind'> = {},
): GameState {
  const event: GameEvent = { seq: state.event.seq + 1, kind };
  if (extra.team !== undefined) event.team = extra.team;
  if (extra.answerId !== undefined) event.answerId = extra.answerId;
  if (extra.value !== undefined) event.value = extra.value;
  return { ...state, event };
}

export function sanitizeScore(value: number, allowNegative: boolean): number {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value);
  const floor = allowNegative ? -LIMITS.maxScore : 0;
  return Math.min(LIMITS.maxScore, Math.max(floor, rounded));
}

export function withTeamScore(
  teams: [TeamState, TeamState],
  team: TeamIndex,
  score: number,
  allowNegative: boolean,
): [TeamState, TeamState] {
  const next: [TeamState, TeamState] = [teams[0], teams[1]];
  next[team] = { ...teams[team], score: sanitizeScore(score, allowNegative) };
  return next;
}

export function gameWinner(state: Pick<GameState, 'teams'>): TeamIndex | 'tie' {
  const [a, b] = state.teams;
  if (a.score === b.score) return 'tie';
  return a.score > b.score ? 0 : 1;
}
