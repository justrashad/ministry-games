/**
 * Ministry Showdown's sound effects, synthesized live (see core/audio). No audio
 * files and no borrowed game-show sounds. Everything is a no-op if audio is unsupported.
 */
import { audio } from '../audio/engine';
import { crowd } from '../audio/crowd';
import { boom, chord, drum, hz, note, run, sparkle, whoosh } from '../audio/instruments';
import { DRY, playKit, SFX, WET, type SoundKit } from '../audio/sfx';

export type SoundName =
  | 'gameStart'
  | 'roundStart'
  | 'finalRound'
  | 'reveal'
  | 'correct'
  | 'strike'
  | 'steal'
  | 'stealSuccess'
  | 'roundWin'
  | 'tick'
  | 'timeUp'
  | 'submit'
  | 'miss'
  | 'celebrate'
  | 'buzz';

const GLITTER = ['C6', 'E6', 'G6', 'A6', 'C7', 'E7'].map(hz);

function fanfare(t: number, big: boolean): void {
  drum('crash', SFX, t, big ? 0.9 : 0.6);
  drum('kick', SFX, t, 0.9);
  chord('brass', SFX, t, ['F4', 'A4', 'C5'], 0.16, 0.9);
  chord('brass', SFX, t + 0.18, ['F4', 'A4', 'C5'], 0.12, 0.8);
  chord('brass', SFX, t + 0.32, ['G4', 'Bb4', 'D5'], 0.14, 0.85);
  chord('brass', WET, t + 0.5, ['A4', 'C5', 'F5'], big ? 1.2 : 0.7, 1);
  note('bass', SFX, t + 0.5, hz('F2'), big ? 1.1 : 0.6, 0.9);
  drum('crash', WET, t + 0.5, 0.7);
  sparkle(WET, t + 0.55, big ? 14 : 7, GLITTER, big ? 1.2 : 0.6, 0.5);
}

const KIT: SoundKit<SoundName> = {
  gameStart: (t) => {
    crowd('applause', t + 0.7, 0.6);
    whoosh(SFX, t, 0.45, 300, 5000, 0.5);
    fanfare(t + 0.35, true);
  },
  roundStart: (t) => {
    whoosh(SFX, t, 0.35, 400, 4500, 0.45);
    [0, 0.07, 0.14, 0.21].forEach((d, i) => drum('snare', DRY, t + 0.2 + d, 0.4 + i * 0.12));
    chord('brass', WET, t + 0.5, ['C5', 'E5', 'G5'], 0.5, 0.9);
    drum('crash', WET, t + 0.5, 0.6);
  },
  finalRound: (t) => {
    crowd('ooh', t + 0.6, 0.55);
    for (let i = 0; i < 10; i++) drum('tom', DRY, t + i * 0.06, 0.25 + i * 0.06);
    chord('brass', WET, t + 0.65, ['D4', 'F#4', 'A4', 'D5'], 1.4, 1);
    boom(SFX, t + 0.65, 0.9);
    sparkle(WET, t + 0.8, 10, GLITTER, 1, 0.45);
  },
  reveal: (t) => {
    note('bell', WET, t, hz('A5'), 0.3, 0.9);
    note('bell', WET, t + 0.08, hz('E6'), 0.4, 0.7);
    note('glock', SFX, t + 0.16, hz('A6'), 0.2, 0.5);
  },
  correct: (t) => {
    crowd('applauseShort', t + 0.15, 0.5);
    run('bell', WET, t, ['E5', 'A5', 'C#6', 'E6'], 0.065, 0.35, 0.85);
    drum('clap', SFX, t + 0.2, 0.5);
    sparkle(WET, t + 0.25, 4, GLITTER, 0.3, 0.4);
  },
  strike: (t) => {
    crowd('aww', t + 0.1, 0.65);
    // A deep, round "bwomp" rather than a harsh buzzer.
    note('brass', SFX, t, hz('Eb3'), 0.22, 0.9, { glideTo: hz('C3') });
    note('brass', SFX, t + 0.24, hz('B2'), 0.5, 0.9);
    note('bass', SFX, t, hz('Eb2'), 0.7, 0.9);
    drum('kick', SFX, t, 0.7);
  },
  steal: (t) => {
    crowd('ooh', t, 0.55);
    whoosh(SFX, t, 0.9, 200, 6000, 0.6);
    note('lead', SFX, t, hz('A3'), 0.8, 0.7, { glideTo: hz('A4') });
    [0.2, 0.4, 0.6, 0.75].forEach((d) => drum('tom', DRY, t + d, 0.55));
    chord('strings', WET, t + 0.85, ['D4', 'F4', 'A4'], 0.8, 0.9);
  },
  stealSuccess: (t) => {
    crowd('cheer', t + 0.3, 0.65);
    fanfare(t, false);
  },
  roundWin: (t) => {
    crowd('cheer', t + 0.3, 0.65);
    fanfare(t, false);
  },
  tick: (t) => note('marimba', DRY, t, hz('C7'), 0.05, 0.55),
  timeUp: (t) => {
    note('brass', SFX, t, hz('G4'), 0.2, 0.9);
    note('brass', SFX, t + 0.22, hz('C4'), 0.6, 0.9);
    boom(SFX, t + 0.22, 0.6);
  },
  submit: (t) => note('pluck', SFX, t, hz('E6'), 0.08, 0.6),
  miss: (t) => {
    note('marimba', SFX, t, hz('E4'), 0.2, 0.7);
    note('marimba', SFX, t + 0.12, hz('C4'), 0.4, 0.7);
  },
  buzz: (t) => {
    whoosh(DRY, t, 0.18, 2000, 7000, 0.4);
    note('bell', WET, t, hz('B5'), 0.15, 1);
    note('bell', WET, t + 0.11, hz('E6'), 0.4, 1);
    note('lead', SFX, t, hz('E5'), 0.25, 0.6);
  },
  celebrate: (t) => {
    crowd('bigCheer', t + 0.4, 0.75);
    [0, 0.08, 0.16, 0.24, 0.32, 0.4].forEach((d, i) => drum(i % 2 ? 'snare' : 'tom', DRY, t + d, 0.5 + i * 0.07));
    fanfare(t + 0.48, true);
    run('glock', WET, t + 1.3, ['F5', 'A5', 'C6', 'F6', 'A6', 'C7'], 0.06, 0.3, 0.6);
    drum('crash', WET, t + 1.7, 0.8);
    chord('brass', WET, t + 1.7, ['F4', 'A4', 'C5', 'F5'], 1.4, 1);
    sparkle(WET, t + 1.75, 18, GLITTER, 1.6, 0.5);
  },
};

class SoundFacade {
  isSupported(): boolean {
    return audio.isSupported();
  }
  isLocked(): boolean {
    return audio.isLocked();
  }
  onStateChange(listener: () => void): () => void {
    return audio.onStateChange(listener);
  }
  unlock(): Promise<void> {
    return audio.unlock();
  }
  /** Effects volume. */
  setVolume(volume: number): void {
    audio.setVolume('sfx', volume);
  }
  play(name: SoundName): void {
    playKit(KIT, name);
  }
}

export const sound = new SoundFacade();
