import { describe, expect, it } from 'vitest';
import { songProblems, type Song } from '../../../core/audio/music';
import * as songs from './music';

describe('theopardy music', () => {
  it('every part fills its song exactly and every note is valid', () => {
    const all = Object.values(songs) as Song[];
    expect(all.length).toBeGreaterThan(1);
    expect(all.flatMap(songProblems)).toEqual([]);
    expect(new Set(all.map((s) => s.id)).size).toBe(all.length);
  });
});
