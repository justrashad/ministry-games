import { boom, chord, drum, hz, note, run, sparkle, whoosh } from '../../../core/audio/instruments';
import { crowd } from '../../../core/audio/crowd';
import { DRY, SFX, WET, type SoundKit } from '../../../core/audio/sfx';

/* Theopardy! sounds: marimba and bells, with a different buzz-in voice for each team. */

export type TheoSound = 'start' | 'select' | 'bonus' | 'buzz0' | 'buzz1' | 'correct' | 'wrong' | 'reveal' | 'roundOver' | 'final' | 'gameOver';

const GLITTER = ['C6', 'E6', 'G6', 'B6', 'C7', 'E7'].map(hz);

export const KIT: SoundKit<TheoSound> = {
  start: (t) => {
    crowd('applause', t + 0.6, 0.55);
    whoosh(SFX, t, 0.5, 250, 6000, 0.5);
    run('marimba', SFX, t + 0.3, ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], 0.055, 0.2, 0.85);
    chord('bell', WET, t + 0.65, ['C5', 'E5', 'G5', 'C6'], 1, 0.7);
    chord('strings', WET, t + 0.65, ['C4', 'G4', 'E5'], 1.2, 0.8);
    drum('crash', WET, t + 0.65, 0.6);
    boom(SFX, t + 0.65, 0.5);
    sparkle(WET, t + 0.7, 10, GLITTER, 1, 0.45);
  },
  select: (t) => {
    whoosh(DRY, t, 0.28, 600, 5000, 0.45);
    note('bell', WET, t + 0.18, hz('G5'), 0.2, 0.8);
    note('bell', WET, t + 0.26, hz('D6'), 0.5, 0.65);
    note('pluck', SFX, t + 0.18, hz('G4'), 0.15, 0.5);
  },
  bonus: (t) => {
    crowd('ooh', t + 0.1, 0.6);
    // The bonus tile: a swirl of bells and a brass hit.
    for (let i = 0; i < 12; i++) note('glock', { ...WET, pan: Math.sin(i) * 0.7 }, t + i * 0.045, hz(['C6', 'E6', 'G6', 'B6'][i % 4]) * (1 + Math.floor(i / 4) * 0.5), 0.15, 0.55);
    chord('brass', WET, t + 0.6, ['D4', 'F#4', 'A4', 'D5'], 0.9, 1);
    boom(SFX, t + 0.6, 0.8);
    drum('crash', WET, t + 0.6, 0.8);
  },
  buzz0: (t) => {
    note('bell', WET, t, hz('E6'), 0.25, 1);
    note('lead', SFX, t, hz('E5'), 0.18, 0.7);
    note('glock', SFX, t + 0.07, hz('B6'), 0.2, 0.6);
  },
  buzz1: (t) => {
    note('bell', WET, t, hz('A5'), 0.25, 1);
    note('lead', SFX, t, hz('A4'), 0.18, 0.7);
    note('glock', SFX, t + 0.07, hz('E6'), 0.2, 0.6);
  },
  correct: (t) => {
    crowd('applauseShort', t + 0.15, 0.5);
    run('marimba', SFX, t, ['C6', 'E6', 'G6'], 0.06, 0.2, 0.9);
    chord('bell', WET, t + 0.18, ['C6', 'E6', 'G6'], 0.6, 0.7);
    drum('clap', SFX, t + 0.18, 0.4);
    sparkle(WET, t + 0.25, 5, GLITTER, 0.4, 0.4);
  },
  wrong: (t) => {
    crowd('aww', t + 0.1, 0.65);
    note('brass', SFX, t, hz('D3'), 0.2, 0.85, { glideTo: hz('B2') });
    note('brass', SFX, t + 0.22, hz('Ab2'), 0.45, 0.85);
    note('bass', SFX, t, hz('D2'), 0.6, 0.8);
    note('marimba', DRY, t + 0.22, hz('Ab3'), 0.3, 0.6);
  },
  reveal: (t) => {
    crowd('aww', t, 0.45);
    run('marimba', SFX, t, ['G5', 'E5', 'C5'], 0.09, 0.3, 0.6);
    note('bell', WET, t + 0.27, hz('C5'), 0.6, 0.4);
  },
  roundOver: (t) => {
    crowd('cheer', t + 0.2, 0.6);
    drum('crash', WET, t, 0.6);
    run('marimba', SFX, t, ['C5', 'E5', 'G5', 'C6'], 0.08, 0.25, 0.85);
    chord('brass', WET, t + 0.34, ['F4', 'A4', 'C5'], 0.3, 0.9);
    chord('brass', WET, t + 0.68, ['G4', 'B4', 'D5'], 0.3, 0.9);
    chord('brass', WET, t + 1.0, ['C4', 'E4', 'G4', 'C5'], 1.1, 1);
    drum('crash', WET, t + 1.0, 0.7);
    sparkle(WET, t + 1.05, 12, GLITTER, 1, 0.45);
  },
  final: (t) => {
    crowd('ooh', t + 0.6, 0.55);
    for (let i = 0; i < 14; i++) drum('tom', DRY, t + i * 0.05, 0.2 + i * 0.05);
    boom(SFX, t + 0.72, 1);
    chord('strings', WET, t + 0.72, ['A3', 'E4', 'A4', 'C5', 'E5'], 2, 1);
    chord('bell', WET, t + 0.72, ['A5', 'E6'], 1.5, 0.6);
  },
  gameOver: (t) => {
    crowd('bigCheer', t + 0.3, 0.75);
    [0, 0.08, 0.16, 0.24, 0.32].forEach((d, i) => drum(i % 2 ? 'snare' : 'tom', DRY, t + d, 0.45 + i * 0.1));
    drum('crash', WET, t + 0.42, 0.9);
    sparkle(WET, t + 0.45, 20, GLITTER, 1.8, 0.5);
  },
};
