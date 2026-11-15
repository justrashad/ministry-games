import { describe, expect, it } from 'vitest';
import { songProblems, type Song } from './music';
import * as songs from './themes';

describe('Ministry Showdown music', () => {
  it('every part fills its song exactly and every note is valid', () => {
    const all = Object.values(songs) as Song[];
    expect(all.flatMap(songProblems)).toEqual([]);
  });
});
