import { createGameStore } from '../../../core/sync/createGameStore';
import { sendRemoteRequest } from '../../../core/sync/remote';
import type { GameAction } from '../engine/game';
import { theopardyDefinition, type RemoteAction } from '../engine/syncDefinition';
import type { GameState, TeamIndex } from '../types';

/* Theopardy!'s game store: the shared replicated store bound to this title's rules. */

const store = createGameStore<GameState, GameAction, RemoteAction>(theopardyDefinition);

export const dispatchGame = store.dispatchGame;
export const getGameState = store.getGameState;
export const useGameState = store.useGameState;

/** Sends a buzz from a phone to the TV. Returns false when the phone is not connected. */
export function sendBuzz(team: TeamIndex): boolean {
  return sendRemoteRequest({ type: 'BUZZ', team } satisfies RemoteAction);
}
