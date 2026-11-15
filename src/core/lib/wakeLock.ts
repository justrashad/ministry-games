/*
 * Keeps a phone's screen on while it is being used as a remote or buzzer.
 *
 * A phone that locks its screen stops running the page, the TV stops hearing
 * from it and drops the connection, and the next buzz is lost while it
 * reconnects. Browsers release a wake lock whenever the page is hidden, so it
 * is requested again each time the page comes back. Where the feature is
 * missing or refused (older browsers, Low Power Mode), nothing happens and the
 * remote falls back to reconnecting quickly.
 */

interface Sentinel {
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
}

type WakeLockNavigator = Navigator & { wakeLock?: { request(type: 'screen'): Promise<Sentinel> } };

let wanted = false;
let sentinel: Sentinel | null = null;
let requesting = false;
let listening = false;

async function acquire(): Promise<void> {
  if (!wanted || sentinel || requesting) return;
  if (typeof document === 'undefined' || document.visibilityState !== 'visible') return;
  const wakeLock = (navigator as WakeLockNavigator).wakeLock;
  if (!wakeLock) return;
  requesting = true;
  try {
    const held = await wakeLock.request('screen');
    held.addEventListener('release', () => {
      if (sentinel === held) sentinel = null;
    });
    if (wanted) sentinel = held;
    else void held.release().catch(() => undefined);
  } catch {
    /* refused: the screen may sleep, and the remote will reconnect when it wakes */
  } finally {
    requesting = false;
  }
}

/** Turns the screen wake lock on or off. Safe to call repeatedly with the same value. */
export function keepScreenAwake(on: boolean): void {
  if (typeof document === 'undefined') return;
  if (!listening) {
    listening = true;
    document.addEventListener('visibilitychange', () => void acquire());
  }
  if (wanted === on) return;
  wanted = on;
  if (on) {
    void acquire();
    return;
  }
  const held = sentinel;
  sentinel = null;
  if (held) void held.release().catch(() => undefined);
}

/** For tests and diagnostics. */
export function screenWakeState(): { wanted: boolean; held: boolean } {
  return { wanted, held: sentinel !== null };
}
