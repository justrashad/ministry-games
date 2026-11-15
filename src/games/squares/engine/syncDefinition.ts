import { STORAGE_KEYS } from '../../../core/lib/storage';
import type { GameDefinition } from '../../../core/sync/definition';
import { GAME_SCHEMA_VERSION, type GameState } from '../types';
import { reduceGame, SQUARE_COUNT, type GameAction } from './game';

/**
 * The only thing a team's phone may ask the TV to do: call the statement on the
 * square in play true or false. The TV accepts it only from the team whose turn it is.
 */
export type RemoteAction = { type: 'ANSWER'; team: 0 | 1; answer: boolean; square: number };

export function isGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Partial<GameState>;
  return (
    s.schema === GAME_SCHEMA_VERSION &&
    typeof s.id === 'string' &&
    typeof s.phase === 'string' &&
    Array.isArray(s.squares) &&
    s.squares.length === SQUARE_COUNT &&
    Array.isArray(s.deck) &&
    Array.isArray(s.wins) &&
    s.wins.length === 2 &&
    typeof s.config === 'object' &&
    s.config !== null &&
    typeof s.event === 'object' &&
    s.event !== null
  );
}

export function sanitizeRemoteAction(raw: unknown): RemoteAction | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const a = raw as { type?: unknown; team?: unknown; answer?: unknown; square?: unknown };
  if (a.type !== 'ANSWER' || (a.team !== 0 && a.team !== 1) || typeof a.answer !== 'boolean') return null;
  if (typeof a.square !== 'number' || !Number.isInteger(a.square) || a.square < 0 || a.square >= SQUARE_COUNT) return null;
  return { type: 'ANSWER', team: a.team, answer: a.answer, square: a.square };
}

/** Kingdom Squares as the shared sync layer sees it. */
export const squaresDefinition: GameDefinition<GameState, GameAction, RemoteAction> = {
  storageKey: STORAGE_KEYS.game,
  channelName: 'kingdom-squares-sync',
  isState: isGameState,
  reduce: reduceGame,
  sanitizeRemoteAction,
  applyRemoteAction(action, state, dispatch) {
    // A call only counts for the square in play, from the team whose turn it is. A late or stray tap is dropped.
    if (!state || state.phase !== 'question' || state.turn !== action.team || state.active?.square !== action.square) return;
    dispatch({ type: 'ANSWER', team: action.team, answer: action.answer });
  },
};
