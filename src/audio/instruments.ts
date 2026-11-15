import { audio, type Bus } from './engine';

/**
 * Synth instruments shared by the sound effects and the music. Each one builds
 * its own short-lived nodes for a single note and cleans up when it stops.
 */

export type InstrumentName = 'bell' | 'marimba' | 'glock' | 'brass' | 'pad' | 'lead' | 'pluck' | 'bass' | 'organ' | 'strings';
export type DrumName = 'kick' | 'snare' | 'hat' | 'openHat' | 'clap' | 'tom' | 'crash' | 'shaker';

export interface Out {
  bus: Bus;
  /** How much of the note goes to the hall reverb, 0 to 1. */
  reverb?: number;
  /** Stereo position, -1 left to 1 right. */
  pan?: number;
  /** Play into this node instead of straight into the bus (the music player fades songs this way). */
  dest?: AudioNode;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const NAMES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "C4" is middle C; "F#5", "Bb3" and so on. */
export function noteToMidi(note: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(note.trim());
  if (!m) throw new Error(`Bad note ${note}`);
  return 12 * (Number(m[3]) + 1) + NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

export function hz(note: string): number {
  return midiToFreq(noteToMidi(note));
}

/** The node a note connects to: its bus, plus a send to the reverb and a pan. */
export function output(ctx: AudioContext, out: Out, _t: number, stopAt: number): AudioNode | null {
  const bus = out.dest ?? audio.bus(out.bus);
  if (!bus) return null;
  const node = ctx.createGain();
  let last: AudioNode = node;
  if (out.pan && typeof ctx.createStereoPanner === 'function') {
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, out.pan));
    node.connect(p);
    last = p;
  }
  last.connect(bus);
  const verb = audio.reverb();
  if (verb && out.reverb) {
    const send = ctx.createGain();
    send.gain.value = out.reverb;
    last.connect(send);
    send.connect(verb);
  }
  // Let the graph go once the note and its tail are done.
  window.setTimeout(
    () => {
      try {
        node.disconnect();
      } catch {
        /* already gone */
      }
    },
    Math.max(0, stopAt - ctx.currentTime) * 1000 + 1500,
  );
  return node;
}

function env(ctx: AudioContext, t: number, peak: number, attack: number, hold: number, release: number): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + Math.max(0.002, attack));
  if (hold > 0) g.gain.setValueAtTime(Math.max(0.0002, peak), t + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  return g;
}

function osc(ctx: AudioContext, type: OscillatorType, freq: number, t: number, stop: number, detune = 0): OscillatorNode {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (detune) o.detune.setValueAtTime(detune, t);
  o.start(t);
  o.stop(stop);
  return o;
}

/** Plays one pitched note. `dur` is how long the key is held, in seconds. */
export function note(inst: InstrumentName, out: Out, t: number, freq: number, dur: number, vel = 0.8, opts: { glideTo?: number } = {}): void {
  const ctx = audio.context();
  if (!ctx) return;
  const v = Math.max(0.01, Math.min(1, vel));
  switch (inst) {
    case 'bell': {
      // FM bell: a sine carrier with a decaying, slightly inharmonic modulator.
      const stop = t + dur + 2.2;
      const o = output(ctx, out, t, stop);
      if (!o) return;
      const carrier = osc(ctx, 'sine', freq, t, stop);
      const mod = osc(ctx, 'sine', freq * 3.5, t, stop);
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(freq * 2.2, t);
      modGain.gain.exponentialRampToValueAtTime(freq * 0.05, t + 1.4);
      mod.connect(modGain).connect(carrier.frequency);
      const e = env(ctx, t, 0.32 * v, 0.004, 0, dur + 2);
      carrier.connect(e).connect(o);
      const shimmer = osc(ctx, 'sine', freq * 2.76, t, stop);
      const e2 = env(ctx, t, 0.06 * v, 0.003, 0, 0.9);
      shimmer.connect(e2).connect(o);
      break;
    }
    case 'glock': {
      const stop = t + 1.4;
      const o = output(ctx, out, t, stop);
      if (!o) return;
      const a = osc(ctx, 'sine', freq, t, stop);
      a.connect(env(ctx, t, 0.3 * v, 0.002, 0, 1.2)).connect(o);
      const b = osc(ctx, 'sine', freq * 4.07, t, stop);
      b.connect(env(ctx, t, 0.08 * v, 0.002, 0, 0.35)).connect(o);
      const c = osc(ctx, 'triangle', freq * 2, t, stop);
      c.connect(env(ctx, t, 0.05 * v, 0.002, 0, 0.5)).connect(o);
      break;
    }
    case 'marimba': {
      const stop = t + 0.9;
      const o = output(ctx, out, t, stop);
      if (!o) return;
      const a = osc(ctx, 'sine', freq, t, stop);
      a.connect(env(ctx, t, 0.38 * v, 0.003, 0, Math.min(0.8, 0.25 + dur))).connect(o);
      const b = osc(ctx, 'sine', freq * 3.93, t, stop);
      b.connect(env(ctx, t, 0.12 * v, 0.002, 0, 0.08)).connect(o);
      const c = osc(ctx, 'triangle', freq * 10, t, stop);
      c.connect(env(ctx, t, 0.03 * v, 0.001, 0, 0.02)).connect(o);
      break;
    }
    case 'pluck': {
      const stop = t + dur + 0.6;
      const o = output(ctx, out, t, stop);
      if (!o) return;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.Q.value = 2;
      f.frequency.setValueAtTime(freq * 8, t);
      f.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 1.2), t + 0.35);
      const a = osc(ctx, 'sawtooth', freq, t, stop);
      const b = osc(ctx, 'square', freq, t, stop, 7);
      const e = env(ctx, t, 0.18 * v, 0.003, 0, dur + 0.45);
      a.connect(f);
      b.connect(f);
      f.connect(e).connect(o);
      break;
    }
    case 'brass': {
      const stop = t + dur + 0.4;
      const o = output(ctx, out, t, stop);
      if (!o) return;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.Q.value = 1.4;
      f.frequency.setValueAtTime(freq * 1.2, t);
      f.frequency.exponentialRampToValueAtTime(Math.min(9000, freq * 7), t + 0.07);
      f.frequency.exponentialRampToValueAtTime(Math.min(6000, freq * 3.5), t + 0.3);
      f.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 1.5), t + dur + 0.3);
      for (const d of [-9, 0, 8]) osc(ctx, 'sawtooth', freq, t, stop, d).connect(f);
      // A little scoop up into the note, like a horn section.
      const e = env(ctx, t, 0.13 * v, 0.03, Math.max(0, dur - 0.05), 0.28);
      f.connect(e).connect(o);
      break;
    }
    case 'strings': {
      const stop = t + dur + 0.9;
      const o = output(ctx, out, t, stop);
      if (!o) return;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = Math.min(7000, freq * 5);
      const lfo = osc(ctx, 'sine', 5.2, t, stop);
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 6;
      lfo.connect(lfoGain);
      for (const d of [-12, -4, 5, 13]) {
        const s = osc(ctx, 'sawtooth', freq, t, stop, d);
        lfoGain.connect(s.detune);
        s.connect(f);
      }
      const e = env(ctx, t, 0.07 * v, 0.18, Math.max(0, dur - 0.18), 0.7);
      f.connect(e).connect(o);
      break;
    }
    case 'pad': {
      const stop = t + dur + 1.4;
      const o = output(ctx, out, t, stop);
      if (!o) return;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.Q.value = 0.8;
      f.frequency.setValueAtTime(600, t);
      f.frequency.linearRampToValueAtTime(Math.min(4000, freq * 4), t + Math.min(1.5, dur));
      for (const d of [-14, 0, 12]) osc(ctx, 'sawtooth', freq, t, stop, d).connect(f);
      osc(ctx, 'triangle', freq / 2, t, stop).connect(f);
      const e = env(ctx, t, 0.07 * v, Math.min(0.6, dur * 0.4), Math.max(0, dur * 0.6), 1.2);
      f.connect(e).connect(o);
      break;
    }
    case 'organ': {
      const stop = t + dur + 0.2;
      const o = output(ctx, out, t, stop);
      if (!o) return;
      const e = env(ctx, t, 0.09 * v, 0.01, Math.max(0, dur - 0.02), 0.12);
      for (const [mult, g] of [
        [1, 1],
        [2, 0.6],
        [3, 0.35],
        [4, 0.25],
        [6, 0.12],
      ] as const) {
        const s = osc(ctx, 'sine', freq * mult, t, stop);
        const gg = ctx.createGain();
        gg.gain.value = g;
        s.connect(gg).connect(e);
      }
      e.connect(o);
      break;
    }
    case 'lead': {
      const stop = t + dur + 0.3;
      const o = output(ctx, out, t, stop);
      if (!o) return;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.Q.value = 3;
      f.frequency.setValueAtTime(Math.min(8000, freq * 6), t);
      f.frequency.exponentialRampToValueAtTime(Math.min(5000, freq * 3), t + dur);
      const a = osc(ctx, 'square', freq, t, stop);
      const b = osc(ctx, 'sawtooth', freq, t, stop, 6);
      if (opts.glideTo) {
        a.frequency.exponentialRampToValueAtTime(opts.glideTo, t + dur);
        b.frequency.exponentialRampToValueAtTime(opts.glideTo, t + dur);
      }
      const lfo = osc(ctx, 'sine', 5.5, t + 0.15, stop);
      const lg = ctx.createGain();
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(14, t + 0.4);
      lfo.connect(lg);
      lg.connect(a.detune);
      lg.connect(b.detune);
      a.connect(f);
      b.connect(f);
      const e = env(ctx, t, 0.085 * v, 0.01, Math.max(0, dur - 0.04), 0.16);
      f.connect(e).connect(o);
      break;
    }
    case 'bass': {
      const stop = t + dur + 0.25;
      const o = output(ctx, out, t, stop);
      if (!o) return;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.Q.value = 4;
      f.frequency.setValueAtTime(freq * 9, t);
      f.frequency.exponentialRampToValueAtTime(freq * 2.2, t + 0.18);
      osc(ctx, 'sawtooth', freq, t, stop).connect(f);
      const sub = osc(ctx, 'sine', freq, t, stop);
      const e = env(ctx, t, 0.22 * v, 0.006, Math.max(0, dur - 0.08), 0.12);
      f.connect(e);
      const se = env(ctx, t, 0.3 * v, 0.006, Math.max(0, dur - 0.08), 0.12);
      sub.connect(se).connect(o);
      e.connect(o);
      break;
    }
  }
}

/** Plays one drum hit. */
export function drum(name: DrumName, out: Out, t: number, vel = 0.8): void {
  const ctx = audio.context();
  const noise = audio.noiseBuffer();
  if (!ctx || !noise) return;
  const v = Math.max(0.01, Math.min(1, vel));
  const noiseSrc = (stop: number) => {
    const s = ctx.createBufferSource();
    s.buffer = noise;
    s.start(t, Math.random() * 1.5);
    s.stop(stop);
    return s;
  };
  switch (name) {
    case 'kick': {
      const o = output(ctx, out, t, t + 0.5);
      if (!o) return;
      const k = osc(ctx, 'sine', 155, t, t + 0.5);
      k.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      k.connect(env(ctx, t, 0.9 * v, 0.002, 0.02, 0.32)).connect(o);
      const click = osc(ctx, 'triangle', 1200, t, t + 0.03);
      click.connect(env(ctx, t, 0.08 * v, 0.001, 0, 0.012)).connect(o);
      break;
    }
    case 'snare': {
      const o = output(ctx, out, t, t + 0.4);
      if (!o) return;
      const n = noiseSrc(t + 0.3);
      const bp = ctx.createBiquadFilter();
      bp.type = 'highpass';
      bp.frequency.value = 1400;
      n.connect(bp).connect(env(ctx, t, 0.3 * v, 0.001, 0, 0.17)).connect(o);
      const body = osc(ctx, 'triangle', 200, t, t + 0.2);
      body.frequency.exponentialRampToValueAtTime(150, t + 0.1);
      body.connect(env(ctx, t, 0.25 * v, 0.001, 0, 0.1)).connect(o);
      break;
    }
    case 'clap': {
      const o = output(ctx, out, t, t + 0.4);
      if (!o) return;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1300;
      bp.Q.value = 1.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      for (const [dt, peak] of [
        [0, 0.5],
        [0.011, 0.45],
        [0.023, 0.55],
      ] as const) {
        g.gain.setValueAtTime(peak * v, t + dt);
        g.gain.exponentialRampToValueAtTime(0.02, t + dt + 0.009);
      }
      g.gain.setValueAtTime(0.4 * v, t + 0.034);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      noiseSrc(t + 0.3).connect(bp).connect(g).connect(o);
      break;
    }
    case 'hat':
    case 'openHat':
    case 'shaker': {
      const len = name === 'openHat' ? 0.28 : name === 'shaker' ? 0.07 : 0.045;
      const o = output(ctx, out, t, t + len + 0.1);
      if (!o) return;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = name === 'shaker' ? 5500 : 7500;
      const attack = name === 'shaker' ? 0.02 : 0.001;
      noiseSrc(t + len + 0.05).connect(hp).connect(env(ctx, t, (name === 'shaker' ? 0.09 : 0.13) * v, attack, 0, len)).connect(o);
      break;
    }
    case 'tom': {
      const o = output(ctx, out, t, t + 0.5);
      if (!o) return;
      const k = osc(ctx, 'sine', 220, t, t + 0.5);
      k.frequency.exponentialRampToValueAtTime(110, t + 0.25);
      k.connect(env(ctx, t, 0.5 * v, 0.002, 0, 0.35)).connect(o);
      break;
    }
    case 'crash': {
      const o = output(ctx, out, t, t + 2.2);
      if (!o) return;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 4200;
      noiseSrc(t + 2).connect(hp).connect(env(ctx, t, 0.16 * v, 0.002, 0, 1.8)).connect(o);
      break;
    }
  }
}

/** A filtered noise sweep. Rising when `to` is above `from`. */
export function whoosh(out: Out, t: number, dur: number, from: number, to: number, vel = 0.7): void {
  const ctx = audio.context();
  const noise = audio.noiseBuffer();
  if (!ctx || !noise) return;
  const o = output(ctx, out, t, t + dur + 0.2);
  if (!o) return;
  const s = ctx.createBufferSource();
  s.buffer = noise;
  s.start(t, Math.random());
  s.stop(t + dur + 0.1);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 2.5;
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.6 * vel, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(bp).connect(g).connect(o);
}

/** A low impact with a rumbling tail, for big moments. */
export function boom(out: Out, t: number, vel = 0.8): void {
  const ctx = audio.context();
  const noise = audio.noiseBuffer();
  if (!ctx || !noise) return;
  const o = output(ctx, out, t, t + 1.6);
  if (!o) return;
  const k = osc(ctx, 'sine', 90, t, t + 1.4);
  k.frequency.exponentialRampToValueAtTime(32, t + 0.6);
  k.connect(env(ctx, t, 0.9 * vel, 0.003, 0.05, 1.1)).connect(o);
  const s = ctx.createBufferSource();
  s.buffer = noise;
  s.start(t);
  s.stop(t + 1.2);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(2400, t);
  lp.frequency.exponentialRampToValueAtTime(120, t + 0.8);
  s.connect(lp).connect(env(ctx, t, 0.4 * vel, 0.002, 0, 0.9)).connect(o);
}

/** A run of bright random notes from a scale: glitter for celebrations. */
export function sparkle(out: Out, t: number, count: number, scale: number[], spread = 0.6, vel = 0.5): void {
  for (let i = 0; i < count; i++) {
    const f = scale[Math.floor(Math.random() * scale.length)];
    note('glock', { ...out, pan: Math.random() * 1.6 - 0.8 }, t + Math.random() * spread, f, 0.2, vel * (0.6 + Math.random() * 0.4));
  }
}

/** Notes played together, each with the same instrument. */
export function chord(inst: InstrumentName, out: Out, t: number, notes: string[], dur: number, vel = 0.7): void {
  notes.forEach((n, i) => note(inst, { ...out, pan: notes.length > 1 ? (i / (notes.length - 1)) * 0.6 - 0.3 : 0 }, t, hz(n), dur, vel));
}

/** Notes one after another. */
export function run(inst: InstrumentName, out: Out, t: number, notes: string[], step: number, dur: number, vel = 0.7): number {
  notes.forEach((n, i) => note(inst, out, t + i * step, hz(n), dur, vel));
  return t + notes.length * step;
}
