/*
 * Sync messages shared by every title. Nothing here knows the rules of a game:
 * each title supplies its own state check and remote-action check through a
 * GameDefinition (see ./definition), and createCodec turns those into the
 * validators the transports use.
 */

/** A game state plus the metadata windows and devices use to agree on the latest version. */
export interface GameEnvelope<S = unknown> {
  rev: number;
  origin: string;
  state: S | null;
}

export type SyncMessage<S = unknown, R = unknown> =
  | { type: 'state'; envelope: GameEnvelope<S>; force?: boolean }
  | { type: 'action'; action: R }
  | { type: 'hello'; origin: string; wantsSync?: boolean }
  | { type: 'ping' };

export interface Codec<S, R> {
  sanitizeEnvelope(raw: unknown): GameEnvelope<S> | null;
  sanitizeMessage(raw: unknown): SyncMessage<S, R> | null;
}

/** Builds the validators for one title from its state check and remote-action check. */
export function createCodec<S, R>(checks: {
  isState(value: unknown): value is S;
  sanitizeRemoteAction(raw: unknown): R | null;
}): Codec<S, R> {
  function sanitizeEnvelope(raw: unknown): GameEnvelope<S> | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const e = raw as Partial<GameEnvelope<unknown>>;
    if (typeof e.rev !== 'number' || !Number.isFinite(e.rev) || typeof e.origin !== 'string') return null;
    if (e.state !== null && e.state !== undefined && !checks.isState(e.state)) return null;
    return { rev: e.rev, origin: e.origin, state: (e.state as S | null | undefined) ?? null };
  }

  function sanitizeMessage(raw: unknown): SyncMessage<S, R> | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const m = raw as { type?: unknown; envelope?: unknown; origin?: unknown; wantsSync?: unknown; force?: unknown };
    if (m.type === 'ping') return { type: 'ping' };
    if (m.type === 'action') {
      const action = checks.sanitizeRemoteAction((raw as { action?: unknown }).action);
      return action ? { type: 'action', action } : null;
    }
    if (m.type === 'hello' && typeof m.origin === 'string') return { type: 'hello', origin: m.origin, wantsSync: m.wantsSync === true };
    if (m.type === 'state') {
      const envelope = sanitizeEnvelope(m.envelope);
      return envelope ? { type: 'state', envelope, force: m.force === true } : null;
    }
    return null;
  }

  return { sanitizeEnvelope, sanitizeMessage };
}

/** Higher revision wins; equal revisions from different windows break the tie by origin id. */
export function isNewer<S>(candidate: GameEnvelope<S>, current: GameEnvelope<S>): boolean {
  if (candidate.rev !== current.rev) return candidate.rev > current.rev;
  return candidate.origin !== current.origin && candidate.origin > current.origin;
}

/**
 * Decides what a replica should hold after receiving an envelope.
 * Forced envelopes come from the TV when a phone joins: the TV's game is the truth,
 * even if the phone has an older game with a higher revision stored locally.
 */
export function mergeEnvelope<S>(current: GameEnvelope<S>, incoming: GameEnvelope<S>, force: boolean): GameEnvelope<S> | null {
  if (force) {
    if (incoming.rev === current.rev && incoming.origin === current.origin && incoming.state === current.state) return null;
    return incoming;
  }
  return isNewer(incoming, current) ? incoming : null;
}
