import { createGameStore } from '../../../core/sync/createGameStore';
import { sendRemoteRequest } from '../../../core/sync/remote';
import type { GameAction } from '../engine/game';
import { babeDefinition, type RemoteAction } from '../engine/syncDefinition';
import type { GameState, TeamIndex } from '../types';

/* The game store: the shared replicated store bound to this title's rules. */

const store = createGameStore<GameState, GameAction, RemoteAction>(babeDefinition);

export const dispatchGame = store.dispatchGame;
export const getGameState = store.getGameState;
export const useGameState = store.useGameState;

/** A team's phone picks a question from its board. Returns false when the phone is not connected. */
export function sendPick(team: TeamIndex, stage: number, slot: number): boolean {
  return sendRemoteRequest({ type: 'PICK', team, stage, slot } satisfies RemoteAction);
}

/** A team's phone uses Search the Scriptures or Swap. Returns false when the phone is not connected. */
export function sendHelp(team: TeamIndex, help: 'lookup' | 'swap'): boolean {
  return sendRemoteRequest({ type: 'HELP', team, help } satisfies RemoteAction);
}
