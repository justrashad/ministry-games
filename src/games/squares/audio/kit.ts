import { boom, chord, drum, hz, note, run, sparkle, whoosh } from '../../../core/audio/instruments';
import { DRY, SFX, WET, type SoundKit } from '../../../core/audio/sfx';

/* Kingdom Squares sounds: brass and organ, with a blue voice and a red voice for the two teams. */

export type SquaresSound = 'start' | 'pick' | 'mark0' | 'mark1' | 'wrong' | 'blocked' | 'gameWon' | 'matchOver';

const GLITTER = ['G5', 'B5', 'D6', 'G6', 'B6', 'D7'].map(hz);

export const KIT: SoundKit<SquaresSound> = {
  start: (t) => {
    [0, 0.09, 0.18].forEach((d) => drum('snare', DRY, t + d, 0.5));
    chord('brass', SFX, t + 0.27, ['G4', 'B4', 'D5'], 0.14, 0.9);
    chord('brass', SFX, t + 0.45, ['G4', 'B4', 'D5'], 0.14, 0.9);
    chord('brass', WET, t + 0.63, ['C5', 'E5', 'G5'], 0.2, 0.9);
    chord('brass', WET, t + 0.86, ['B4', 'D5', 'G5'], 1.1, 1);
    chord('organ', WET, t + 0.86, ['G3', 'D4', 'G4'], 1.1, 0.8);
    drum('crash', WET, t + 0.86, 0.7);
    boom(SFX, t + 0.86, 0.6);
  },
  pick: (t) => {
    whoosh(DRY, t, 0.22, 800, 4500, 0.4);
    chord('organ', SFX, t + 0.12, ['D5', 'G5'], 0.16, 1);
    note('bell', WET, t + 0.12, hz('D6'), 0.4, 0.8);
    note('glock', WET, t + 0.12, hz('A6'), 0.3, 0.7);
    drum('tom', DRY, t + 0.12, 0.6);
  },
  mark0: (t) => {
    // Blue claims a square: bright bells climbing.
    drum('kick', SFX, t, 0.6);
    run('bell', WET, t, ['D5', 'G5', 'B5', 'D6'], 0.06, 0.4, 0.85);
    chord('organ', SFX, t, ['G4', 'B4', 'D5'], 0.35, 0.7);
    sparkle(WET, t + 0.2, 4, GLITTER, 0.3, 0.4);
  },
  mark1: (t) => {
    // Red claims a square: punchy brass.
    drum('kick', SFX, t, 0.6);
    drum('clap', SFX, t, 0.5);
    chord('brass', SFX, t, ['D4', 'F#4', 'A4'], 0.12, 0.9);
    chord('brass', WET, t + 0.14, ['G4', 'B4', 'D5'], 0.5, 1);
    note('bass', SFX, t + 0.14, hz('G2'), 0.4, 0.8);
  },
  wrong: (t) => {
    note('organ', SFX, t, hz('F4'), 0.18, 0.8);
    note('organ', SFX, t + 0.2, hz('C#4'), 0.5, 0.8);
    note('bass', SFX, t, hz('F2'), 0.7, 0.8);
    note('brass', SFX, t + 0.2, hz('C#3'), 0.5, 0.6, { glideTo: hz('A2') });
  },
  blocked: (t) => {
    drum('tom', DRY, t, 0.7);
    run('marimba', SFX, t, ['A4', 'F4', 'D4'], 0.08, 0.3, 0.6);
    boom(SFX, t + 0.1, 0.35);
  },
  gameWon: (t) => {
    // Three in a row: a climb, then a big chord.
    run('glock', WET, t, ['G5', 'A5', 'B5', 'C6', 'D6', 'E6', 'F#6', 'G6'], 0.05, 0.2, 0.7);
    chord('brass', WET, t + 0.42, ['G4', 'B4', 'D5', 'G5'], 1.2, 1);
    chord('organ', WET, t + 0.42, ['G3', 'D4', 'B4'], 1.2, 0.8);
    drum('crash', WET, t + 0.42, 0.9);
    boom(SFX, t + 0.42, 0.7);
    sparkle(WET, t + 0.5, 14, GLITTER, 1.2, 0.5);
  },
  matchOver: (t) => {
    [0, 0.07, 0.14, 0.21, 0.28, 0.35].forEach((d, i) => drum(i % 2 ? 'snare' : 'tom', DRY, t + d, 0.4 + i * 0.1));
    drum('crash', WET, t + 0.45, 1);
    sparkle(WET, t + 0.5, 20, GLITTER, 1.8, 0.5);
  },
};
