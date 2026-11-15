import { bassLine, stabs } from '../../../core/audio/compose';
import type { Song } from '../../../core/audio/music';

/* Original music for Kingdom Squares: a swinging brass-and-organ theme in G. */

const CHART = ['G', 'Em', 'C', 'D', 'G', 'Em', 'Am D', 'G'];

const MELODY = [
  'D5:0.5 G5:0.5 B5:0.5 G5:0.5 D6:1 B5:1',
  'E5:0.5 G5:0.5 B5:1 A5:0.5 G5:0.5 E5:1',
  'C5:0.5 E5:0.5 G5:0.5 C6:0.5 B5:1 G5:1',
  'A5:0.5 F#5:0.5 D5:1 -:0.5 D5:0.5 A5:1',
  'B5:0.5 D6:0.5 G6:1 F#6:0.5 E6:0.5 D6:1',
  'E6:0.5 D6:0.5 B5:1 G5:1 E5:1',
  'A5:0.5 C6:0.5 E6:1 D6:0.5 C6:0.5 F#5:1',
  'G5:2! -:2',
].join(' | ');

export const THEME: Song = {
  id: 'squares-theme',
  bpm: 112,
  bars: 8,
  loop: true,
  swing: 0.33,
  parts: [
    { inst: 'brass', seq: MELODY, vel: 0.8, reverb: 0.25 },
    { inst: 'glock', seq: MELODY, vel: 0.22, reverb: 0.4, pan: 0.3 },
    { inst: 'organ', seq: stabs(CHART, 'two-four'), vel: 0.6, reverb: 0.2, pan: -0.25 },
    { inst: 'bass', seq: bassLine(CHART, 'walk'), vel: 0.75 },
    { inst: 'drums', seq: '[k+h:1 s+h:0.5 h:0.5 k+h:1 s+h:0.5 h:0.5]x7 k:0.5 t:0.5 t:0.5 t:0.5 s:0.5 s:0.5 x:1', vel: 0.55, reverb: 0.06 },
  ],
};

export const OUTRO: Song = {
  id: 'squares-outro',
  bpm: 112,
  bars: 4,
  swing: 0.33,
  parts: [
    { inst: 'brass', seq: 'D5:0.5 G5:0.5 B5:0.5 D6:0.5 G6:2 | E6:0.5 D6:0.5 C6:0.5 A5:0.5 B5+D6+G6:2! | -:8', vel: 0.9, reverb: 0.3 },
    { inst: 'organ', seq: 'G4+B4+D5:4 | C4+E4+G4:2 D4+F#4+A4:2 | G3+B3+D4+G4:4 | -:4', vel: 0.7, reverb: 0.3 },
    { inst: 'bass', seq: 'G2:1 B2:1 D3:1 B2:1 | C2:2 D2:2 | G1:4 | -:4', vel: 0.8 },
    { inst: 'drums', seq: 'k:1 s:1 k:1 s:1 | k:1 s:1 t:0.5 t:0.5 s:0.5 s:0.5 | k+x:4 | -:4', vel: 0.7 },
  ],
};
