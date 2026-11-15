import { arpeggio, bassLine, stabs } from '../../../core/audio/compose';
import type { Song } from '../../../core/audio/music';

/* Original music for Are You Smarter Than a Spiritual Babe?: a playful glockenspiel-and-claps theme in D, and a ticking loop for Search the Scriptures. */

const CHART = ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G A', 'D'];

const MELODY = [
  'F#5:0.5 A5:0.5 D6:0.5 A5:0.5 F#5:0.5 A5:0.5 B5:1',
  'B5:0.5 D6:0.5 F#6:1 E6:0.5 D6:0.5 B5:1',
  'G5:0.5 B5:0.5 D6:0.5 E6:0.5 D6:1 B5:1',
  'A5:0.5 C#6:0.5 E6:1 C#6:0.5 A5:0.5 E5:1',
  'F#5:0.5 A5:0.5 D6:0.5 F#6:0.5 E6:0.5 D6:0.5 A5:1',
  'B5:0.5 A5:0.5 F#5:1 D6:0.5 C#6:0.5 B5:1',
  'G5:0.5 B5:0.5 D6:1 E6:0.5 F#6:0.5 G6:1',
  'F#6:1! D6:1 -:2',
].join(' | ');

export const THEME: Song = {
  id: 'babe-theme',
  bpm: 128,
  bars: 8,
  loop: true,
  parts: [
    { inst: 'glock', seq: MELODY, vel: 0.85, reverb: 0.3 },
    { inst: 'marimba', seq: MELODY.replace(/([A-G][#b]?)(\d)/g, (_, n, o) => `${n}${Number(o) - 1}`), vel: 0.55, reverb: 0.2 },
    { inst: 'pluck', seq: stabs(CHART, 'off'), vel: 0.5, reverb: 0.2, pan: -0.25 },
    { inst: 'pad', seq: stabs(CHART, 'pad'), vel: 0.35, reverb: 0.4 },
    { inst: 'bass', seq: bassLine(CHART, 'bounce'), vel: 0.75 },
    { inst: 'drums', seq: '[k:1 c+h:1 k:0.5 k:0.5 c+h:1]x7 k:0.5 c:0.5 c:0.5 c:0.5 t:0.5 t:0.5 x:1', vel: 0.6, reverb: 0.08 },
  ],
};

const THINK_CHART = ['D', 'G', 'Bm', 'A'];

/** A light ticking loop while a team searches the Scriptures. */
export const THINK: Song = {
  id: 'babe-think',
  bpm: 100,
  bars: 4,
  loop: true,
  parts: [
    { inst: 'marimba', seq: arpeggio(THINK_CHART, 4, [0, 1, 2, 3, 2, 1, 2, 1]), vel: 0.5, reverb: 0.25 },
    { inst: 'pad', seq: stabs(THINK_CHART, 'pad'), vel: 0.4, reverb: 0.45 },
    { inst: 'bass', seq: bassLine(THINK_CHART, 'long'), vel: 0.4 },
    { inst: 'drums', seq: '[h:1 m:0.5 m:0.5 h:1 m:0.5 m:0.5]x4', vel: 0.4 },
  ],
};

export const OUTRO: Song = {
  id: 'babe-outro',
  bpm: 128,
  bars: 4,
  parts: [
    { inst: 'glock', seq: 'F#5:0.5 A5:0.5 D6:0.5 F#6:0.5 A6:2 | G6:0.5 F#6:0.5 E6:0.5 C#6:0.5 D6:2! | -:8', vel: 0.9, reverb: 0.4 },
    { inst: 'bell', seq: '-:4 | -:2 D6+F#6+A6:2 | D5+F#5+A5+D6:4 | -:4', vel: 0.5, reverb: 0.5 },
    { inst: 'pad', seq: 'D4+F#4+A4:4 | G4+B4+D5:2 A4+C#5+E5:2 | D4+F#4+A4+D5:4 | -:4', vel: 0.6, reverb: 0.4 },
    { inst: 'bass', seq: 'D2:4 | G2:2 A2:2 | D2:4 | -:4', vel: 0.8 },
    { inst: 'drums', seq: 'k:1 c:1 k:1 c:1 | k:1 c:1 c:0.5 c:0.5 c:0.5 c:0.5 | k+x:4 | -:4', vel: 0.75 },
    { inst: 'glock', seq: '-:8 | ' + arpeggio(['D', 'D'], 6), vel: 0.35, reverb: 0.6 },
  ],
};
