import { createPersistentStore } from '../state/persistentStore';
import { audio } from './engine';
import { music } from './music';

/** This device's sound choices, shared by the host and TV windows through storage. */
export interface SoundPrefs {
  sfx: boolean;
  music: boolean;
  /** 0 to 1. */
  volume: number;
}

export const DEFAULT_SOUND_PREFS: SoundPrefs = { sfx: true, music: true, volume: 0.85 };

export function sanitizeSoundPrefs(raw: unknown): SoundPrefs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<SoundPrefs>;
  const volume = typeof r.volume === 'number' && Number.isFinite(r.volume) ? Math.min(1, Math.max(0, r.volume)) : DEFAULT_SOUND_PREFS.volume;
  return {
    sfx: typeof r.sfx === 'boolean' ? r.sfx : DEFAULT_SOUND_PREFS.sfx,
    music: typeof r.music === 'boolean' ? r.music : DEFAULT_SOUND_PREFS.music,
    volume,
  };
}

export const soundPrefs = createPersistentStore<SoundPrefs>('sound.v1', sanitizeSoundPrefs);

function apply(p: SoundPrefs): void {
  audio.setVolume('master', p.volume);
  music.setEnabled(p.music);
}

apply(soundPrefs.get());
soundPrefs.subscribe(() => apply(soundPrefs.get()));
