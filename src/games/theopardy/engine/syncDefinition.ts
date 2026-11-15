import { STORAGE_KEYS } from '../../../core/lib/storage';
import type { GameDefinition } from '../../../core/sync/definition';
import { GAME_SCHEMA_VERSION, type GameState } from '../types';
import { reduceGame, type GameAction } from './game';

/** The only thing a buzzer phone may ask the TV to do. The TV applies buzzes in arrival order, so the first one wins. */
export type RemoteAction = { type: 'BUZZ'; team: 0 | 1 };

export function isGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Partial<GameState>;
  return (
    s.schema === GAME_SCHEMA_VERSION &&
    typeof s.id === 'string' &&
    typeof s.phase === 'string' &&
    Array.isArray(s.boards) &&
    s.boards.length > 0 &&
    Array.isArray(s.scores) &&
    s.scores.length === 2 &&
    typeof s.config === 'object' &&
    s.config !== null &&
    typeof s.event === 'object' &&
    s.event !== null
  );
}

export function sanitizeRemoteAction(raw: unknown): RemoteAction | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const a = raw as { type?: unknown; team?: unknown };
  return a.type === 'BUZZ' && (a.team === 0 || a.team === 1) ? { type: 'BUZZ', team: a.team } : null;
}

/** Theopardy! as the shared sync layer sees it. */
export const theopardyDefinition: GameDefinition<GameState, GameAction, RemoteAction> = {
  storageKey: STORAGE_KEYS.game,
  channelName: 'theopardy-sync',
  isState: isGameState,
  reduce: reduceGame,
  sanitizeRemoteAction,
  applyRemoteAction(action, _state, dispatch) {
    dispatch({ type: 'BUZZ', team: action.team });
  },
};
