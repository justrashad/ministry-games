import { describe, expect, it } from 'vitest';
import { expandRepeats, parseSeq } from './music';
import { arpeggio, bassLine, chordNotes, stabs, voicing } from './compose';

describe('sequencer', () => {
  it('reads notes, chords, rests, accents and repeats', () => {
    expect(expandRepeats('[a b]x2 c')).toBe('a b a b c');
    const tokens = parseSeq('C5:0.5 C4+E4+G4:2 -:1 G5:1! | A5~');
    expect(tokens.map((t) => t.len)).toEqual([0.5, 2, 1, 1, 1]);
    expect(tokens[1].pitches).toEqual(['C4', 'E4', 'G4']);
    expect(tokens[2].pitches).toEqual([]);
    expect(tokens[3].vel).toBeGreaterThan(1);
    expect(tokens[4].vel).toBeLessThan(1);
  });

  it('builds chords and parts from a chart', () => {
    expect(chordNotes('Dm', 4)).toEqual(['D4', 'F4', 'A4']);
    expect(chordNotes('G7', 3)).toEqual(['G3', 'B3', 'D4', 'F4']);
    expect(voicing('F')).toEqual(['F3', 'A3', 'C4']);
    for (const style of ['drive', 'bounce', 'walk', 'long'] as const) {
      expect(parseSeq(bassLine(['C', 'F G'], style)).reduce((s, t) => s + t.len, 0)).toBe(8);
    }
    expect(parseSeq(stabs(['C', 'F G'], 'off')).reduce((s, t) => s + t.len, 0)).toBe(8);
    expect(parseSeq(arpeggio(['C', 'F G'])).reduce((s, t) => s + t.len, 0)).toBe(8);
  });
});

