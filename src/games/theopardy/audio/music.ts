import { arpeggio, bassLine, stabs } from '../../../core/audio/compose';
import type { Song } from '../../../core/audio/music';

/* Original music for Theopardy!: a bright marimba-and-bells quiz theme, and a calm thinking loop for the final round. */

const CHART = ['C', 'Am', 'F', 'G', 'C', 'Am', 'F G', 'C'];

const MELODY = [
  'E5:0.5 G5:0.5 C6:0.5 G5:0.5 E5:1 D5:1',
  'C5:0.5 E5:0.5 A5:1 G5:0.5 E5:0.5 C5:1',
  'F5:0.5 A5:0.5 C6:1 A5:0.5 F5:0.5 C5:1',
  'D5:0.5 G5:0.5 B5:1 A5:0.5 G5:0.5 D5:1',
  'E5:0.5 G5:0.5 C6:0.5 E6:0.5 D6:1 C6:1',
  'A5:0.5 C6:0.5 E6:1 D6:0.5 C6:0.5 A5:1',
  'F5:0.5 A5:0.5 C6:0.5 A5:0.5 G5:0.5 B5:0.5 D6:1',
  'C6:2! -:2',
].join(' | ');

export const THEME: Song = {
  id: 'theopardy-theme',
  bpm: 132,
  bars: 8,
  loop: true,
  parts: [
    { inst: 'marimba', seq: MELODY, vel: 0.85, reverb: 0.2 },
    { inst: 'bell', seq: MELODY, vel: 0.28, reverb: 0.35, pan: 0.2 },
    { inst: 'pluck', seq: stabs(CHART, 'two-four'), vel: 0.55, reverb: 0.15, pan: -0.2 },
    { inst: 'strings', seq: stabs(CHART, 'pad'), vel: 0.5, reverb: 0.3 },
    { inst: 'bass', seq: bassLine(CHART, 'bounce'), vel: 0.7 },
    { inst: 'drums', seq: '[k:1 h:0.5 h:0.5 s+h:1 h:0.5 k:0.5]x7 k:1 s:0.5 s:0.5 s:0.5 s:0.5 x:1', vel: 0.55, reverb: 0.05 },
  ],
};

const THINK_CHART = ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E'];

/** A soft, steady thinking loop for the final round. */
export const THINK: Song = {
  id: 'theopardy-think',
  bpm: 92,
  bars: 8,
  loop: true,
  parts: [
    { inst: 'marimba', seq: arpeggio(THINK_CHART, 4, [0, 2, 4, 2, 3, 2, 1, 2]), vel: 0.55, reverb: 0.3 },
    { inst: 'pad', seq: stabs(THINK_CHART, 'pad'), vel: 0.55, reverb: 0.4 },
    { inst: 'bass', seq: bassLine(THINK_CHART, 'long'), vel: 0.45 },
    { inst: 'drums', seq: '[m:0.5 m:0.5 t:0.5 m:0.5 m:0.5 m:0.5 h:0.5 m:0.5]x8', vel: 0.35 },
    { inst: 'bell', seq: '-:4 E6:4 | -:4 D6:4 | -:4 C6:4 | -:4 B5:2 G#5:2', vel: 0.25, reverb: 0.6 },
  ],
};

export const OUTRO: Song = {
  id: 'theopardy-outro',
  bpm: 132,
  bars: 4,
  parts: [
    { inst: 'marimba', seq: 'E5:0.5 G5:0.5 C6:0.5 E6:0.5 G6:2 | F6:0.5 E6:0.5 D6:0.5 B5:0.5 C6:2! | -:8', vel: 0.9, reverb: 0.3 },
    { inst: 'bell', seq: '-:4 | -:2 C6+E6+G6:2 | C5+E5+G5+C6:4 | -:4', vel: 0.6, reverb: 0.5 },
    { inst: 'strings', seq: 'C4+E4+G4:4 | F4+A4+C5:2 G4+B4+D5:2 | C4+E4+G4+C5:4 | -:4', vel: 0.7, reverb: 0.4 },
    { inst: 'bass', seq: 'C2:4 | F2:2 G2:2 | C2:4 | -:4', vel: 0.8 },
    { inst: 'drums', seq: 'k:1 h:1 s:1 h:1 | k:1 s:1 t:0.5 t:0.5 t:0.5 t:0.5 | k+x:4 | -:4', vel: 0.7 },
  ],
};
