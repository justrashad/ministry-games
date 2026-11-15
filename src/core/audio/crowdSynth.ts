
/**
 * Synthesis for the studio audience (see crowd.ts). Pure number crunching with no
 * browser audio APIs, so it can run in a Web Worker.
 *
 * The studio audience: applause, cheers, an "aww" for wrong answers and an
 * "ooh" for tense moments. Like everything else, it is synthesized, not
 * recorded: dozens of simulated clappers and voices (a buzzing vocal source
 * shaped into vowels by formant filters) are written straight into audio
 * buffers the first time each sound is needed, then reused.
 */

export type CrowdSound = 'applause' | 'applauseShort' | 'cheer' | 'bigCheer' | 'aww' | 'ooh';

export const RATE = 32000;

export type Stereo = [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** A resonant band-pass filter (RBJ cookbook), run sample by sample. */
class BandPass {
  private b0 = 0;
  private b2 = 0;
  private a1 = 0;
  private a2 = 0;
  private x1 = 0;
  private x2 = 0;
  private y1 = 0;
  private y2 = 0;

  constructor(freq: number, q: number) {
    this.set(freq, q);
  }

  set(freq: number, q: number): void {
    const w = (2 * Math.PI * Math.min(freq, RATE * 0.45)) / RATE;
    const alpha = Math.sin(w) / (2 * q);
    const a0 = 1 + alpha;
    this.b0 = alpha / a0;
    this.b2 = -alpha / a0;
    this.a1 = (-2 * Math.cos(w)) / a0;
    this.a2 = (1 - alpha) / a0;
  }

  run(x: number): number {
    const y = this.b0 * x + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

function stereo(seconds: number): Stereo {
  const n = Math.ceil(seconds * RATE);
  return [new Float32Array(n), new Float32Array(n)];
}

function normalize(buf: Stereo, peak: number): Stereo {
  let max = 0;
  for (const ch of buf) for (let i = 0; i < ch.length; i++) max = Math.max(max, Math.abs(ch[i]));
  if (max > 0) for (const ch of buf) for (let i = 0; i < ch.length; i++) ch[i] *= peak / max;
  return buf;
}

function mix(into: Stereo, from: Stereo, gain: number, offset = 0): void {
  const start = Math.floor(offset * RATE);
  for (let c = 0; c < 2; c++) {
    const a = into[c];
    const b = from[c];
    for (let i = 0; i < b.length && start + i < a.length; i++) a[start + i] += b[i] * gain;
  }
}

/** Overall loudness: a quick swell, a hold, then the crowd settles down. */
function swell(u: number, attack: number, releaseFrom: number): number {
  if (u < attack) return u / attack;
  if (u > releaseFrom) return Math.max(0, 1 - (u - releaseFrom) / (1 - releaseFrom)) ** 1.6;
  return 1;
}

/** A one-pole low-pass, for distance and for softening the vocal source. */
class LowPass {
  private k: number;
  private y = 0;

  constructor(freq: number) {
    this.k = 1 - Math.exp((-2 * Math.PI * freq) / RATE);
  }

  run(x: number): number {
    this.y += this.k * (x - this.y);
    return this.y;
  }
}

/**
 * Hand claps after the physical model of clapping (Peltola et al.): each clap
 * is a sharp burst of noise ringing through the resonance of the air pocket
 * between the palms. Cupped hands ring low and long, flat hands high and short,
 * and every person keeps their own hand shape and their own tempo.
 */
interface Clapper {
  freq: number;
  q: number;
  decay: number;
  crack: number;
  rate: number;
  loud: number;
  pan: number;
}

function makeClapper(distance: number): Clapper {
  const cupped = Math.random() < 0.4;
  return {
    freq: cupped ? rand(550, 1000) : rand(1000, 2300),
    q: cupped ? rand(3, 7) : rand(1.5, 4),
    decay: (cupped ? rand(0.009, 0.016) : rand(0.005, 0.01)) * RATE,
    crack: cupped ? rand(0.15, 0.3) : rand(0.3, 0.55),
    rate: rand(3.6, 5.6),
    loud: rand(0.55, 1) * distance,
    pan: Math.random(),
  };
}

function clapLayer(buf: Stereo, seconds: number, count: number, distance: number, cutoff: number, attack: number, release: number): void {
  const n = buf[0].length;
  const clapLen = Math.floor(0.08 * RATE);
  for (let c = 0; c < count; c++) {
    const p = makeClapper(distance);
    const gl = Math.cos((p.pan * Math.PI) / 2);
    const gr = Math.sin((p.pan * Math.PI) / 2);
    const body = new BandPass(p.freq, p.q);
    const air = new LowPass(cutoff);
    const stop = seconds * rand(release * 0.85, release * 1.1);
    let tempo = p.rate;
    let t = rand(0, attack);
    while (t < stop) {
      const start = Math.floor(t * RATE);
      // Each clap lands a little differently: force, timing and hand position all wobble.
      const force = p.loud * rand(0.75, 1.15) * envelope(t / seconds, attack / seconds, stop / seconds);
      const ring = p.freq * rand(0.94, 1.06);
      body.set(ring, p.q);
      for (let i = 0; i < clapLen && start + i < n; i++) {
        const atk = i < 8 ? i / 8 : 1;
        const noise = Math.random() * 2 - 1;
        const e = Math.exp(-i / p.decay);
        const crackE = Math.exp(-i / (p.decay * 0.35));
        const v = air.run(body.run(noise * e) * 2.2 + noise * crackE * p.crack) * atk * force;
        buf[0][start + i] += v * gl;
        buf[1][start + i] += v * gr;
      }
      tempo += rand(-0.15, 0.15);
      tempo = Math.min(6.2, Math.max(3.2, tempo));
      t += (1 / tempo) * rand(0.9, 1.1);
    }
  }
}

/** Loudness of the whole room over time: a burst, a hold, then it dies away. */
function envelope(u: number, attack: number, end: number): number {
  if (u < attack) return 0.4 + 0.6 * (u / attack);
  const fade = end * 0.6;
  if (u > fade) return Math.max(0, 1 - (u - fade) / (end - fade)) ** 1.3;
  return 1;
}

/** An audience: a few people close by, a crowd in the middle and more at the back. */
function applause(seconds: number, size: number): Stereo {
  const buf = stereo(seconds);
  clapLayer(buf, seconds, Math.round(6 * size), 1, 9000, 0.12, 0.95);
  clapLayer(buf, seconds, Math.round(22 * size), 0.55, 5000, 0.25, 0.9);
  clapLayer(buf, seconds, Math.round(50 * size), 0.32, 2800, 0.4, 0.85);
  return normalize(buf, 0.85);
}

interface Vowel {
  f: [number, number, number];
}

const VOWELS: Record<string, Vowel> = {
  ah: { f: [750, 1180, 2600] },
  aw: { f: [580, 880, 2450] },
  eh: { f: [560, 1780, 2550] },
  ee: { f: [320, 2250, 2950] },
  oo: { f: [330, 880, 2250] },
  oh: { f: [480, 900, 2500] },
};

interface VoiceShape {
  seconds: number;
  count: number;
  /** Pitch multiplier over the voice's life, u from 0 to 1. */
  pitch: (u: number) => number;
  /** Vowels to move through over the voice's life. */
  vowels: string[];
  /** Loudness over the voice's life. */
  env: (u: number) => number;
  onsetSpread: number;
  length: [number, number];
  breath?: number;
}

/** A crowd of voices: buzzing vocal cords shaped into vowels by three formant filters each. */
function voices(shape: VoiceShape): Stereo {
  const buf = stereo(shape.seconds);
  const n = buf[0].length;
  for (let v = 0; v < shape.count; v++) {
    const female = Math.random() < 0.55;
    const base = female ? rand(185, 270) : rand(98, 150);
    const pan = Math.random();
    const gl = Math.cos((pan * Math.PI) / 2);
    const gr = Math.sin((pan * Math.PI) / 2);
    const onset = rand(0, shape.onsetSpread);
    const len = shape.seconds * rand(shape.length[0], shape.length[1]);
    const start = Math.floor(onset * RATE);
    const total = Math.min(n - start, Math.floor(len * RATE));
    const vibRate = rand(4.5, 6.5);
    const vibDepth = rand(0.008, 0.025);
    const shift = female ? 1.12 : 1;
    const bands = [0, 1, 2].map(() => new BandPass(500, 5));
    const tilt = new LowPass(base * 3);
    const gains = [1, 0.55, 0.22];
    const loud = rand(0.5, 1);
    let phase = Math.random();
    for (let i = 0; i < total; i++) {
      const u = i / total;
      if (i % 64 === 0) {
        const pos = u * (shape.vowels.length - 1);
        const k = Math.min(shape.vowels.length - 2, Math.floor(pos));
        const frac = shape.vowels.length > 1 ? pos - k : 0;
        const a = VOWELS[shape.vowels[Math.max(0, k)]].f;
        const b = VOWELS[shape.vowels[Math.min(shape.vowels.length - 1, k + 1)]].f;
        for (let j = 0; j < 3; j++) {
          const f = (a[j] + (b[j] - a[j]) * frac) * shift;
          bands[j].set(f, f / (60 + j * 40));
        }
      }
      const t = i / RATE;
      const f0 = base * shape.pitch(u) * (1 + vibDepth * Math.sin(2 * Math.PI * vibRate * t)) * (1 + (Math.random() - 0.5) * 0.01);
      phase += f0 / RATE;
      if (phase >= 1) phase -= 1;
      // A glottal-ish pulse: a sawtooth with a little breath noise mixed in.
      const src = tilt.run(2 * phase - 1) * 1.6 + (Math.random() * 2 - 1) * (shape.breath ?? 0.12);
      let s = 0;
      for (let j = 0; j < 3; j++) s += bands[j].run(src) * gains[j];
      const amp = loud * shape.env(u) * Math.min(1, i / (0.04 * RATE));
      buf[0][start + i] += s * amp * gl;
      buf[1][start + i] += s * amp * gr;
    }
  }
  return normalize(buf, 0.8);
}

/** Two-finger whistles from the back row. */
function whistles(seconds: number, count: number): Stereo {
  const buf = stereo(seconds);
  for (let w = 0; w < count; w++) {
    const pan = Math.random();
    const gl = Math.cos((pan * Math.PI) / 2);
    const gr = Math.sin((pan * Math.PI) / 2);
    const start = Math.floor(rand(0.1, seconds * 0.5) * RATE);
    const len = Math.floor(rand(0.35, 0.8) * RATE);
    const f1 = rand(1700, 2300);
    const f2 = f1 * rand(1.15, 1.45);
    let phase = 0;
    for (let i = 0; i < len && start + i < buf[0].length; i++) {
      const u = i / len;
      const f = u < 0.35 ? f1 + (f2 - f1) * (u / 0.35) : f2 - (f2 - f1 * 0.9) * ((u - 0.35) / 0.65);
      phase += f / RATE;
      const amp = Math.sin(Math.PI * u) ** 0.6 * 0.5;
      const v = Math.sin(2 * Math.PI * phase) * amp + (Math.random() * 2 - 1) * 0.04 * amp;
      buf[0][start + i] += v * gl;
      buf[1][start + i] += v * gr;
    }
  }
  return buf;
}

export function build(name: CrowdSound): Stereo {
  switch (name) {
    case 'applause':
      return applause(3.6, 1);
    case 'applauseShort':
      return applause(1.8, 0.7);
    case 'cheer':
    case 'bigCheer': {
      const big = name === 'bigCheer';
      const seconds = big ? 5 : 3.2;
      const out = applause(seconds, big ? 1.3 : 1);
      for (const ch of out) for (let i = 0; i < ch.length; i++) ch[i] *= 0.75;
      const yeah = voices({
        seconds,
        count: big ? 34 : 24,
        pitch: (u) => (u < 0.18 ? 1 + 0.7 * (u / 0.18) : 1.7 - 0.25 * Math.min(1, (u - 0.18) / 0.5)),
        vowels: ['eh', 'ah', 'ah', 'aw'],
        env: (u) => swell(u, 0.08, 0.5),
        onsetSpread: big ? 0.6 : 0.35,
        length: [0.35, big ? 0.8 : 0.65],
        breath: 0.22,
      });
      mix(out, yeah, 0.7);
      // A second wave of "woo"s, higher and later.
      const woo = voices({
        seconds,
        count: big ? 14 : 8,
        pitch: (u) => 1.6 + 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.4)),
        vowels: ['oo', 'oo', 'oh'],
        env: (u) => swell(u, 0.15, 0.6),
        onsetSpread: big ? 1.6 : 0.9,
        length: [0.2, 0.4],
        breath: 0.2,
      });
      mix(out, woo, 0.45);
      mix(out, whistles(seconds, big ? 5 : 2), 0.35);
      return normalize(out, 0.9);
    }
    case 'aww':
      return voices({
        seconds: 1.9,
        count: 26,
        pitch: (u) => 1.55 - 0.65 * Math.min(1, u / 0.75) ** 0.8,
        vowels: ['ah', 'aw', 'aw', 'oh'],
        env: (u) => swell(u, 0.12, 0.55),
        onsetSpread: 0.18,
        length: [0.7, 0.92],
        breath: 0.16,
      });
    case 'ooh':
      return voices({
        seconds: 1.8,
        count: 26,
        pitch: (u) => (u < 0.4 ? 1.05 + 0.45 * (u / 0.4) : 1.5 - 0.3 * ((u - 0.4) / 0.6)),
        vowels: ['oo', 'oo', 'oh'],
        env: (u) => swell(u, 0.15, 0.6),
        onsetSpread: 0.15,
        length: [0.7, 0.95],
        breath: 0.1,
      });
  }
}

