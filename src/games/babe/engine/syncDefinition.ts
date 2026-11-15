import { STORAGE_KEYS } from '../../../core/lib/storage';
import type { GameDefinition } from '../../../core/sync/definition';
import { GAME_SCHEMA_VERSION, STAGE_COUNT, type GameState } from '../types';
import { canUseHelp, reduceGame, type GameAction } from './game';

/**
 * What a team's phone may ask the TV to do, only on that team's own turn: pick a
 * question from its board, or use Search the Scriptures or Swap on the question in
 * play. Marking answers and Second Try stay with the host.
 */
export type RemoteAction =
  | { type: 'PICK'; team: 0 | 1; stage: number; slot: number }
  | { type: 'HELP'; team: 0 | 1; help: 'lookup' | 'swap' };

export function isGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Partial<GameState>;
  return (
    s.schema === GAME_SCHEMA_VERSION &&
    typeof s.id === 'string' &&
    typeof s.phase === 'string' &&
    Array.isArray(s.boards) &&
    s.boards.length === 2 &&
    s.boards.every((b) => typeof b === 'object' && b !== null && Array.isArray(b.stages) && b.stages.length === STAGE_COUNT) &&
    Array.isArray(s.helps) &&
    s.helps.length === 2 &&
    Array.isArray(s.spares) &&
    typeof s.config === 'object' &&
    s.config !== null &&
    typeof s.event === 'object' &&
    s.event !== null
  );
}

export function sanitizeRemoteAction(raw: unknown): RemoteAction | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const a = raw as { type?: unknown; team?: unknown; stage?: unknown; slot?: unknown; help?: unknown };
  if (a.team !== 0 && a.team !== 1) return null;
  if (a.type === 'PICK') {
    if (typeof a.stage !== 'number' || !Number.isInteger(a.stage) || a.stage < 0 || a.stage >= STAGE_COUNT) return null;
    if (typeof a.slot !== 'number' || !Number.isInteger(a.slot) || a.slot < 0 || a.slot > 1) return null;
    return { type: 'PICK', team: a.team, stage: a.stage, slot: a.slot };
  }
  if (a.type === 'HELP' && (a.help === 'lookup' || a.help === 'swap')) return { type: 'HELP', team: a.team, help: a.help };
  return null;
}

/** The game as the shared sync layer sees it. */
export const babeDefinition: GameDefinition<GameState, GameAction, RemoteAction> = {
  storageKey: STORAGE_KEYS.game,
  channelName: 'spiritual-babe-sync',
  isState: isGameState,
  reduce: reduceGame,
  sanitizeRemoteAction,
  applyRemoteAction(action, state, dispatch, now) {
    // A phone only acts for its own team, on that team's turn. A late or stray tap is dropped.
    if (!state) return;
    if (action.type === 'PICK') {
      if (state.phase === 'pick' && state.turn === action.team) dispatch({ type: 'PICK', stage: action.stage, slot: action.slot });
      return;
    }
    if (state.active?.team !== action.team || !canUseHelp(state, action.help)) return;
    // The TV stamps the time, so every screen counts down from the same clock.
    dispatch(action.help === 'lookup' ? { type: 'LOOKUP', at: now } : { type: 'SWAP' });
  },
};
