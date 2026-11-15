import type { GameState } from '../types';
import type { GameAction } from '../engine/game';
import { showdownDefinition, type RemoteAction } from '../engine/syncDefinition';
import { createGameStore } from './createGameStore';
import { sendRemoteRequest } from './remote';

/*
 * Ministry Showdown's game store: the shared replicated store (createGameStore)
 * bound to this title's rules. Screens import the typed helpers below.
 */

const store = createGameStore<GameState, GameAction, RemoteAction>(showdownDefinition);

export const WINDOW_ORIGIN = store.origin;
export const syncMode = store.syncMode;

export const dispatchGame = store.dispatchGame;
export const getGameState = store.getGameState;
export const getEnvelope = store.getEnvelope;
export const useGameState = store.useGameState;
export const applyRemoteAction = store.applyRemoteAction;
export const receiveSyncMessage = store.receiveSyncMessage;
export const registerTransport = store.registerTransport;
export const setAcceptRemoteActions = store.setAcceptRemoteActions;

/** Sends a buzz or a Final Challenge answer to the TV. Returns false when not connected. */
export function sendRemoteAction(action: RemoteAction): boolean {
  return sendRemoteRequest(action);
}
