import { describe, expect, it } from 'vitest';
import { build, RATE, type CrowdSound } from './crowdSynth';

describe('studio audience synthesis', () => {
  it.each(['applause', 'applauseShort', 'cheer', 'bigCheer', 'aww', 'ooh'] as CrowdSound[])('%s is real, stereo, audible and never clips', (name) => {
    const [l, r] = build(name);
    expect(l.length).toBe(r.length);
    expect(l.length / RATE).toBeGreaterThan(1.5);
    let peak = 0;
    let energy = 0;
    for (const ch of [l, r]) {
      for (let i = 0; i < ch.length; i++) {
        expect(Number.isFinite(ch[i])).toBe(true);
        peak = Math.max(peak, Math.abs(ch[i]));
        energy += ch[i] * ch[i];
      }
    }
    expect(peak).toBeLessThanOrEqual(0.95);
    expect(Math.sqrt(energy / (l.length * 2))).toBeGreaterThan(0.02);
  });
});
