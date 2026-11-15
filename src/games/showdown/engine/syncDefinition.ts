import type { GameState } from '../types';
import { GAME_SCHEMA_VERSION } from '../types';
import { STORAGE_KEYS } from '../../../core/lib/storage';
import type { GameDefinition } from '../../../core/sync/definition';
import { reduceGame, type GameAction } from './game';

/**
 * The only actions a buzzer or player phone may ask the TV to perform. The TV
 * applies them in arrival order (so the first buzz really wins) and stamps its
 * own clock, so a phone with a wrong clock can't cheat the timer.
 */
export type RemoteAction = { type: 'BUZZ'; team: 0 | 1 } | { type: 'FC_SUBMIT'; text: string; player: 0 | 1; question: number };

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

/** Ministry Showdown as the shared sync layer sees it. */
export const showdownDefinition: GameDefinition<GameState, GameAction, RemoteAction> = {
  storageKey: STORAGE_KEYS.game,
  // Kept from before the rename so windows on an old cached version still sync with new ones.
  channelName: 'survey-showdown-sync',
  isState: isGameState,
  reduce: reduceGame,
  sanitizeRemoteAction,
  applyRemoteAction(action, state, dispatch, now) {
    if (action.type === 'BUZZ') {
      dispatch({ type: 'BUZZ', team: action.team });
      return;
    }
    // A player's phone may only answer its own turn's current question. If the host
    // already moved on (typed an answer or passed), the late answer is dropped rather
    // than landing on the wrong question.
    const fc = state?.finalChallenge;
    if (!fc || fc.phase !== 'answering' || fc.activePlayer !== action.player || fc.current !== action.question) return;
    dispatch({ type: 'FC_SUBMIT', text: action.text, now });
  },
};
