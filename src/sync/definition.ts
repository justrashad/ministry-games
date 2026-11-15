/**
 * Everything the shared sync layer needs to know about one title.
 *
 * S is the title's game state, A the actions its reducer accepts, and R the
 * small set of requests a buzzer or player phone may send to the TV.
 */
export interface GameDefinition<S, A, R> {
  /** localStorage key (without the app prefix) the live game is saved under. */
  storageKey: string;
  /** BroadcastChannel name used between this title's windows on one device. */
  channelName: string;
  /** True when a stored or received value is a game this version of the title can load. */
  isState(value: unknown): value is S;
  /** The title's pure reducer. Returning the same object means "nothing changed". */
  reduce(state: S | null, action: A): S | null;
  /** Validates a request from a phone. Anything unrecognized must return null. */
  sanitizeRemoteAction(raw: unknown): R | null;
  /**
   * Carries out a phone's request on the TV. The TV stamps its own clock (now),
   * so a phone with a wrong clock can't cheat a timer.
   */
  applyRemoteAction(action: R, state: S | null, dispatch: (action: A) => void, now: number): void;
}
