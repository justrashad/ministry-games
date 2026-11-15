import type { GameState } from '../types';
import { GAME_SCHEMA_VERSION } from '../types';

/** A game state plus the metadata windows and devices use to agree on the latest version. */
export interface GameEnvelope {
  rev: number;
  origin: string;
  state: GameState | null;
}

/**
 * The only actions a buzzer or player phone may ask the TV to perform. The TV
 * applies them in arrival order (so the first buzz really wins) and stamps its
 * own clock, so a phone with a wrong clock can't cheat the timer.
 */
export type RemoteAction = { type: 'BUZZ'; team: 0 | 1 } | { type: 'FC_SUBMIT'; text: string; player: 0 | 1; question: number };

export type SyncMessage =
  | { type: 'state'; envelope: GameEnvelope; force?: boolean }
  | { type: 'action'; action: RemoteAction }
  | { type: 'hello'; origin: string; wantsSync?: boolean }
  | { type: 'ping' };

export function isGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Partial<GameState>;
  return (
    s.schema === GAME_SCHEMA_VERSION &&
    typeof s.id === 'string' &&
    typeof s.phase === 'string' &&
    Array.isArray(s.teams) &&
    s.teams.length === 2 &&
    typeof s.config === 'object' &&
    Array.isArray(s.roundPlan) &&
    typeof s.event === 'object'
  );
}

export function sanitizeEnvelope(raw: unknown): GameEnvelope | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const e = raw as Partial<GameEnvelope>;
  if (typeof e.rev !== 'number' || !Number.isFinite(e.rev) || typeof e.origin !== 'string') return null;
  if (e.state !== null && e.state !== undefined && !isGameState(e.state)) return null;
  return { rev: e.rev, origin: e.origin, state: e.state ?? null };
}

export function sanitizeMessage(raw: unknown): SyncMessage | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const m = raw as { type?: unknown; envelope?: unknown; origin?: unknown; wantsSync?: unknown; force?: unknown };
  if (m.type === 'ping') return { type: 'ping' };
  if (m.type === 'action') {
    const action = sanitizeRemoteAction((raw as { action?: unknown }).action);
    return action ? { type: 'action', action } : null;
  }
  if (m.type === 'hello' && typeof m.origin === 'string') return { type: 'hello', origin: m.origin, wantsSync: m.wantsSync === true };
  if (m.type === 'state') {
    const envelope = sanitizeEnvelope(m.envelope);
    return envelope ? { type: 'state', envelope, force: m.force === true } : null;
  }
  return null;
}

export function sanitizeRemoteAction(raw: unknown): RemoteAction | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const a = raw as { type?: unknown; team?: unknown; text?: unknown; player?: unknown; question?: unknown };
  if (a.type === 'BUZZ' && (a.team === 0 || a.team === 1)) return { type: 'BUZZ', team: a.team };
  if (
    a.type === 'FC_SUBMIT' &&
    typeof a.text === 'string' &&
    a.text.trim() &&
    (a.player === 0 || a.player === 1) &&
    typeof a.question === 'number' &&
    Number.isInteger(a.question) &&
    a.question >= 0
  ) {
    return { type: 'FC_SUBMIT', text: a.text.slice(0, 80), player: a.player, question: a.question };
  }
  return null;
}

/** Higher revision wins; equal revisions from different windows break the tie by origin id. */
export function isNewer(candidate: GameEnvelope, current: GameEnvelope): boolean {
  if (candidate.rev !== current.rev) return candidate.rev > current.rev;
  return candidate.origin !== current.origin && candidate.origin > current.origin;
}

/**
 * Decides what a replica should hold after receiving an envelope.
 * Forced envelopes come from the TV when a phone joins: the TV's game is the truth,
 * even if the phone has an older game with a higher revision stored locally.
 */
export function mergeEnvelope(current: GameEnvelope, incoming: GameEnvelope, force: boolean): GameEnvelope | null {
  if (force) {
    if (incoming.rev === current.rev && incoming.origin === current.origin && incoming.state === current.state) return null;
    return incoming;
  }
  return isNewer(incoming, current) ? incoming : null;
}
