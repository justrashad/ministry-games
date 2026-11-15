import { boom, chord, drum, hz, note, run, sparkle, whoosh } from '../../../core/audio/instruments';
import { DRY, SFX, WET, type SoundKit } from '../../../core/audio/sfx';

/* Spiritual Babe sounds: glockenspiel, marimba and claps, with a rising note for every rung climbed. */

export type BabeSound = 'start' | 'pick' | 'lookup' | 'swap' | 'right' | 'wrong' | 'secondTry' | 'bonus' | 'bonusRight' | 'gameOver';

const RAINBOW = ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6', 'B6', 'D7'];
const GLITTER = RAINBOW.slice(4).map(hz);

/** The ladder's scale: rung 1 starts low, rung 11 is near the top. */
export function rungNote(rung: number): string {
  return RAINBOW[Math.max(0, Math.min(RAINBOW.length - 1, rung - 1))];
}

export const KIT: SoundKit<BabeSound> & { climb: (t: number, rung: number) => void } = {
  start: (t) => {
    run('glock', WET, t, RAINBOW.slice(0, 8), 0.06, 0.25, 0.8);
    chord('bell', WET, t + 0.5, ['D5', 'F#5', 'A5', 'D6'], 1, 0.7);
    chord('pad', WET, t + 0.5, ['D4', 'A4', 'F#5'], 1.2, 0.8);
    drum('clap', SFX, t + 0.5, 0.6);
    drum('crash', WET, t + 0.5, 0.5);
    sparkle(WET, t + 0.55, 12, GLITTER, 1, 0.45);
  },
  pick: (t) => {
    whoosh(DRY, t, 0.25, 900, 6000, 0.4);
    run('glock', WET, t + 0.12, ['A5', 'D6', 'F#6'], 0.05, 0.2, 0.7);
    note('marimba', SFX, t + 0.12, hz('D5'), 0.2, 0.6);
  },
  lookup: (t) => {
    // A page turn and a gentle chime.
    whoosh(DRY, t, 0.18, 3000, 9000, 0.35);
    whoosh(DRY, t + 0.12, 0.22, 2000, 7000, 0.3);
    chord('bell', WET, t + 0.25, ['A5', 'D6', 'F#6'], 0.8, 0.8);
    note('marimba', SFX, t + 0.25, hz('D5'), 0.3, 0.7);
  },
  swap: (t) => {
    whoosh(SFX, t, 0.35, 5000, 400, 0.45);
    whoosh(SFX, t + 0.3, 0.35, 400, 5000, 0.45);
    run('marimba', SFX, t + 0.55, ['F#5', 'A5', 'D6'], 0.06, 0.2, 0.85);
    note('bell', WET, t + 0.67, hz('D6'), 0.5, 0.6);
  },
  right: (t) => {
    run('marimba', SFX, t, ['D5', 'F#5', 'A5', 'D6'], 0.055, 0.2, 0.85);
    drum('clap', SFX, t + 0.2, 0.5);
  },
  climb: (t, rung) => {
    // The team's new rung rings out higher every time it climbs.
    run('marimba', SFX, t, ['D5', 'F#5', 'A5'], 0.05, 0.18, 0.8);
    note('bell', WET, t + 0.17, hz(rungNote(rung)), 0.8, 1);
    note('glock', WET, t + 0.17, hz(rungNote(rung)) * 2, 0.5, 0.45);
    drum('clap', SFX, t + 0.17, 0.55);
    sparkle(WET, t + 0.25, 3 + Math.min(8, rung), GLITTER, 0.5, 0.4);
  },
  wrong: (t) => {
    note('marimba', SFX, t, hz('F#4'), 0.25, 0.8);
    note('marimba', SFX, t + 0.15, hz('D4'), 0.25, 0.8);
    note('marimba', SFX, t + 0.3, hz('A3'), 0.5, 0.8);
    note('bass', SFX, t + 0.3, hz('A1'), 0.5, 0.6);
  },
  secondTry: (t) => {
    // Hopeful: a little rising harp figure and a held chord.
    run('glock', WET, t, ['A5', 'B5', 'D6', 'E6'], 0.08, 0.3, 0.9);
    run('marimba', SFX, t, ['A4', 'B4', 'D5', 'E5'], 0.08, 0.25, 0.8);
    chord('bell', WET, t + 0.34, ['E5', 'A5', 'C#6'], 0.8, 0.7);
  },
  bonus: (t) => {
    for (let i = 0; i < 16; i++) drum(i % 4 === 3 ? 'tom' : 'snare', DRY, t + i * 0.045, 0.2 + i * 0.04);
    boom(SFX, t + 0.75, 0.9);
    chord('bell', WET, t + 0.75, ['D5', 'F#5', 'A5', 'D6'], 1.4, 0.8);
    chord('pad', WET, t + 0.75, ['D4', 'A4', 'F#5'], 1.6, 0.9);
    drum('crash', WET, t + 0.75, 0.8);
    sparkle(WET, t + 0.8, 14, GLITTER, 1.2, 0.5);
  },
  bonusRight: (t) => {
    run('glock', WET, t, RAINBOW, 0.04, 0.2, 0.75);
    chord('bell', WET, t + 0.45, ['D6', 'F#6', 'A6'], 1, 0.8);
    drum('crash', WET, t + 0.45, 0.7);
  },
  gameOver: (t) => {
    [0, 0.07, 0.14, 0.21, 0.28].forEach((d) => drum('clap', SFX, t + d, 0.6));
    drum('crash', WET, t + 0.38, 0.9);
    sparkle(WET, t + 0.4, 22, GLITTER, 2, 0.5);
  },
};
