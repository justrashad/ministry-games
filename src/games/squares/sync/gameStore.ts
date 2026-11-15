import { createGameStore } from '../../../core/sync/createGameStore';
import { sendRemoteRequest } from '../../../core/sync/remote';
import type { GameAction } from '../engine/game';
import { squaresDefinition, type RemoteAction } from '../engine/syncDefinition';
import type { GameState, TeamIndex } from '../types';

/* Kingdom Squares' game store: the shared replicated store bound to this title's rules. */

const store = createGameStore<GameState, GameAction, RemoteAction>(squaresDefinition);

export const dispatchGame = store.dispatchGame;
export const getGameState = store.getGameState;
export const useGameState = store.useGameState;

/** Sends a team's true or false call from its phone to the TV. Returns false when the phone is not connected. */
export function sendCall(team: TeamIndex, answer: boolean, square: number): boolean {
  return sendRemoteRequest({ type: 'ANSWER', team, answer, square } satisfies RemoteAction);
}
