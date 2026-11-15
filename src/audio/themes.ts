import { arpeggio, bassLine, stabs } from './compose';
import type { Song } from './music';

/* Original music for Ministry Showdown: a bright brass-and-drums theme in F. */

const CHART = ['F', 'Dm', 'Bb', 'C', 'F', 'Dm', 'Bb C', 'F'];

const MELODY = [
  'C5:0.5 F5:0.5 A5:1 G5:0.5 F5:0.5 -:1',
  'D5:0.5 F5:0.5 A5:1 C6:1 A5:1',
  'Bb5:1 A5:0.5 G5:0.5 F5:1 D5:1',
  'E5:0.5 F5:0.5 G5:2 -:1',
  'C5:0.5 F5:0.5 A5:1 G5:0.5 F5:0.5 -:1',
  'D6:0.5 C6:0.5 A5:1 F5:1 A5:1',
  'Bb5:1 A5:0.5 Bb5:0.5 C6:1 E5:1',
  'F5:2! -:2',
].join(' | ');

const BEAT = '[k:0.5 h:0.5 s+h:0.5 h:0.5 k:0.5 k+h:0.5 s+h:0.5 o:0.5]x7 k+x:0.5 h:0.5 s:0.5 s:0.5 s:0.5 s:0.5 s:0.25 s:0.25 s:0.25 s:0.25';

export const THEME: Song = {
  id: 'showdown-theme',
  bpm: 124,
  bars: 8,
  loop: true,
  parts: [
    { inst: 'lead', seq: MELODY, vel: 0.75, reverb: 0.2 },
    { inst: 'brass', seq: MELODY.replace(/([A-G][#b]?)(\d)/g, (_, n, o) => `${n}${Number(o) - 1}`), vel: 0.45, reverb: 0.25 },
    { inst: 'brass', seq: stabs(CHART, 'off'), vel: 0.6, reverb: 0.2 },
    { inst: 'bass', seq: bassLine(CHART, 'drive'), vel: 0.8, reverb: 0.02 },
    { inst: 'drums', seq: 'x:0.5 -:3.5 | -:28', vel: 0.6 },
    { inst: 'drums', seq: BEAT, vel: 0.7, reverb: 0.06 },
  ],
};

export const OUTRO: Song = {
  id: 'showdown-outro',
  bpm: 124,
  bars: 4,
  parts: [
    { inst: 'brass', seq: 'F4+A4+C5:0.5 F4+A4+C5:0.5 -:0.5 F4+A4+C5:0.5 G4+Bb4+D5:1 A4+C5+F5:1 | Bb4+D5+F5:1 C5+E5+G5:1 A4+C5+F5:2! | -:8', vel: 0.85, reverb: 0.3 },
    { inst: 'lead', seq: 'C5:0.5 F5:0.5 A5:1 C6:2 | D6:1 E6:1 F6:2! | -:8', vel: 0.7, reverb: 0.3 },
    { inst: 'bass', seq: 'F2:2 C2:2 | Bb1:1 C2:1 F2:2 | F1:4 | -:4', vel: 0.9 },
    { inst: 'drums', seq: 'k+x:1 s:1 k:1 s:1 | k:1 s:1 k+x:0.5 t:0.5 t:0.5 t:0.5 | k+x:4 | -:4', vel: 0.8 },
    { inst: 'glock', seq: '-:8 | ' + arpeggio(['F', 'F'], 5), vel: 0.4, reverb: 0.5 },
  ],
};
