import { audio } from './engine';
import { soundPrefs } from './prefs';
import type { Out } from './instruments';

/** Sound effects go to the effects bus with a touch of hall reverb. */
export const SFX: Out = { bus: 'sfx', reverb: 0.22 };
export const DRY: Out = { bus: 'sfx', reverb: 0.05 };
export const WET: Out = { bus: 'sfx', reverb: 0.45 };

/** A title's sound set: one function per sound, each given its start time. */
export type SoundKit<N extends string> = Record<N, (t: number) => void>;

/**
 * Plays a sound from a kit. Sounds asked for in the second or so before the
 * browser lets audio start still play once it does.
 */
export function playKit<N extends string>(kit: SoundKit<N>, name: N): void {
  if (!soundPrefs.get().sfx) return;
  const fn = kit[name];
  if (!fn) return;
  audio.whenRunning((_ctx, t) => fn(t));
}
