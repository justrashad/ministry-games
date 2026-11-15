import { noteToMidi } from './instruments';

/**
 * Helpers for writing the theme music from a chord chart. A chart is one entry
 * per 4/4 bar: "F", "Dm", "G7", or two chords sharing the bar: "Bb C".
 */

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToNote(midi: number): string {
  return SHARPS[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
}

export function transpose(note: string, semitones: number): string {
  return midiToNote(noteToMidi(note) + semitones);
}

interface Chord {
  root: string;
  intervals: number[];
}

export function parseChord(symbol: string): Chord {
  const m = /^([A-G][#b]?)(m|dim|sus4)?(7|maj7)?$/.exec(symbol);
  if (!m) throw new Error(`Bad chord ${symbol}`);
  const third = m[2] === 'm' || m[2] === 'dim' ? 3 : m[2] === 'sus4' ? 5 : 4;
  const fifth = m[2] === 'dim' ? 6 : 7;
  const intervals = [0, third, fifth];
  if (m[3] === '7') intervals.push(10);
  if (m[3] === 'maj7') intervals.push(11);
  return { root: m[1], intervals };
}

/** The chord's notes with the root in the given octave. */
export function chordNotes(symbol: string, octave: number): string[] {
  const c = parseChord(symbol);
  const base = noteToMidi(c.root + octave);
  return c.intervals.map((i) => midiToNote(base + i));
}

/** A close voicing kept between about F3 and E5, so chords move smoothly. */
export function voicing(symbol: string): string[] {
  const c = parseChord(symbol);
  let base = noteToMidi(c.root + 4);
  if (base > noteToMidi('E4')) base -= 12;
  return c.intervals.map((i) => midiToNote(base + i));
}

function bars(chart: string[], each: (symbol: string, beats: number) => string): string {
  return chart
    .map((bar) => {
      const chords = bar.trim().split(/\s+/);
      const beats = 4 / chords.length;
      return chords.map((c) => each(c, beats)).join(' ');
    })
    .join(' | ');
}

/** Bass lines. */
export function bassLine(chart: string[], style: 'drive' | 'bounce' | 'walk' | 'long', octave = 2): string {
  return bars(chart, (sym, beats) => {
    const [r, , f] = chordNotes(sym, octave);
    const third = chordNotes(sym, octave)[1];
    const o = transpose(r, 12);
    if (style === 'long') return `${r}:${beats}`;
    if (beats === 2) {
      if (style === 'walk') return `${r}:1 ${f}:1`;
      return `${r}:0.5 ${r}:0.5 -:0.5 ${o}:0.5`;
    }
    if (style === 'drive') return `${r}:0.5 ${r}:0.5 -:0.5 ${r}:0.5 ${f}:0.5 -:0.5 ${r}:0.5 ${o}:0.5`;
    if (style === 'bounce') return `${r}:1 -:0.5 ${r}:0.5 ${f}:1 ${o}:0.5 ${f}:0.5`;
    return `${r}:1 ${third}:1 ${f}:1 ${transpose(f, 2)}:1`;
  });
}

/** Chord hits. "off" lands on the and of 1 and 3; "two-four" on beats 2 and 4. */
export function stabs(chart: string[], style: 'off' | 'two-four' | 'pad' | 'pulse'): string {
  return bars(chart, (sym, beats) => {
    const c = voicing(sym).join('+');
    if (style === 'pad') return `${c}:${beats}`;
    if (style === 'pulse') return Array(beats * 2).fill(`${c}:0.5`).join(' ');
    if (beats === 2) return style === 'off' ? `-:0.5 ${c}:0.5 -:1` : `-:1 ${c}:0.5 -:0.5`;
    return style === 'off' ? `-:0.5 ${c}:0.5 -:1 -:0.5 ${c}:0.5 -:1` : `-:1 ${c}:0.5 -:0.5 -:1 ${c}:0.5 -:0.5`;
  });
}

/** Broken chords in eighth notes, climbing and falling through the chord. */
export function arpeggio(chart: string[], octave = 4, shape: number[] = [0, 1, 2, 3, 4, 3, 2, 1]): string {
  return bars(chart, (sym, beats) => {
    const low = chordNotes(sym, octave);
    const tones = [...low, ...low.map((n) => transpose(n, 12))];
    const steps = beats * 2;
    return Array.from({ length: steps }, (_, i) => `${tones[shape[i % shape.length] % tones.length]}:0.5`).join(' ');
  });
}
