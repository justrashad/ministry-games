import { audio } from './engine';
import { drum, hz, note, type DrumName, type InstrumentName } from './instruments';

/**
 * A small step sequencer for the original theme music.
 *
 * A part is written as a line of tokens, one per note, in beats:
 *   "C5:1 E5:0.5 G5:0.5"   notes and how many beats each lasts
 *   "C4+E4+G4:2"           a chord
 *   "-:1"                  a rest
 *   "G5:1!"  "G5:1~"       accented, or soft
 *   "[C5:1 D5:1]x2"        a repeat
 *   "|"                    a bar line, for reading only
 * Drum parts use k kick, s snare, h hat, o open hat, c clap, t tom, x crash, m shaker:
 *   "k+h:0.5 h:0.5 s+h:0.5 h:0.5"
 * A part shorter than the song repeats to fill it.
 */

export interface Part {
  inst: InstrumentName | 'drums';
  seq: string;
  vel?: number;
  reverb?: number;
  pan?: number;
}

export interface Song {
  id: string;
  bpm: number;
  /** Length in 4/4 bars. */
  bars: number;
  parts: Part[];
  loop?: boolean;
  /** Delays every off-beat eighth by this fraction of a beat, for a swing feel. */
  swing?: number;
}

export interface SeqEvent {
  beat: number;
  len: number;
  inst: InstrumentName | 'drums';
  pitches: string[];
  vel: number;
  reverb: number;
  pan: number;
}

const DRUMS: Record<string, DrumName> = { k: 'kick', s: 'snare', h: 'hat', o: 'openHat', c: 'clap', t: 'tom', x: 'crash', m: 'shaker' };

/** Expands "[...]xN" repeats, innermost first. */
export function expandRepeats(seq: string): string {
  let out = seq;
  const re = /\[([^[\]]*)\]x(\d+)/;
  let m: RegExpExecArray | null;
  while ((m = re.exec(out))) out = out.slice(0, m.index) + Array(Number(m[2])).fill(m[1]).join(' ') + out.slice(m.index + m[0].length);
  return out;
}

interface Token {
  pitches: string[];
  len: number;
  vel: number;
}

export function parseSeq(seq: string): Token[] {
  return expandRepeats(seq)
    .split(/\s+/)
    .filter((tok) => tok && tok !== '|')
    .map((tok) => {
      let vel = 1;
      if (tok.endsWith('!')) {
        vel = 1.25;
        tok = tok.slice(0, -1);
      } else if (tok.endsWith('~')) {
        vel = 0.6;
        tok = tok.slice(0, -1);
      }
      const [head, lenText] = tok.split(':');
      const len = lenText === undefined ? 1 : Number(lenText);
      if (!Number.isFinite(len) || len <= 0) throw new Error(`Bad length in ${tok}`);
      const pitches = head === '-' ? [] : head.split('+');
      return { pitches, len, vel };
    });
}

/** Every note of a song in time order, each part repeated to the song's length. */
export function compileSong(song: Song): SeqEvent[] {
  const total = song.bars * 4;
  const events: SeqEvent[] = [];
  for (const part of song.parts) {
    const tokens = parseSeq(part.seq);
    const partLen = tokens.reduce((sum, tk) => sum + tk.len, 0);
    if (partLen <= 0) continue;
    let beat = 0;
    while (beat < total - 1e-6) {
      for (const tk of tokens) {
        if (beat >= total - 1e-6) break;
        if (tk.pitches.length) {
          for (const p of tk.pitches) {
            if (part.inst === 'drums' ? !DRUMS[p] : !/^[A-G][#b]?-?\d$/.test(p)) throw new Error(`Bad note ${p} in ${song.id}`);
          }
          events.push({ beat, len: tk.len, inst: part.inst, pitches: tk.pitches, vel: (part.vel ?? 0.8) * tk.vel, reverb: part.reverb ?? 0.18, pan: part.pan ?? 0 });
        }
        beat += tk.len;
      }
    }
  }
  return events.sort((a, b) => a.beat - b.beat);
}

const LOOKAHEAD = 0.35;
const TICK_MS = 60;

interface Playing {
  song: Song;
  events: SeqEvent[];
  spb: number;
  start: number;
  next: number;
  gain: GainNode;
  timer: number;
  onEnd?: () => void;
}

class MusicPlayer {
  private current: Playing | null = null;
  private wanted: string | null = null;
  private enabled = true;

  /** Music off means nothing plays, and anything playing fades out. */
  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) this.stop(0.4);
  }

  playing(): string | null {
    return this.current?.song.id ?? null;
  }

  play(song: Song, opts: { fadeIn?: number; onEnd?: () => void; delay?: number } = {}): void {
    if (!this.enabled) return;
    if (this.current?.song.id === song.id || this.wanted === song.id) return;
    this.stop(0.35);
    this.wanted = song.id;
    audio.whenRunning((ctx, t0) => {
      if (this.wanted !== song.id || !this.enabled) return;
      const bus = audio.bus('music');
      if (!bus) return;
      const gain = ctx.createGain();
      const start = t0 + 0.05 + (opts.delay ?? 0);
      const fade = opts.fadeIn ?? 0;
      gain.gain.setValueAtTime(fade > 0 ? 0.0001 : 1, start);
      if (fade > 0) gain.gain.exponentialRampToValueAtTime(1, start + fade);
      gain.connect(bus);
      const playing: Playing = { song, events: compileSong(song), spb: 60 / song.bpm, start, next: 0, gain, timer: 0, onEnd: opts.onEnd };
      playing.timer = window.setInterval(() => this.tick(playing), TICK_MS);
      this.current = playing;
      this.tick(playing);
    }, 4000);
  }

  private tick(p: Playing): void {
    const ctx = audio.ctx;
    if (!ctx || this.current !== p) return;
    const horizon = ctx.currentTime + LOOKAHEAD;
    const songLen = p.song.bars * 4 * p.spb;
    for (;;) {
      if (p.next >= p.events.length) {
        if (p.song.loop) {
          p.start += songLen;
          p.next = 0;
          continue;
        }
        const end = p.start + songLen;
        if (ctx.currentTime > end + 1.5) {
          this.finish(p);
          p.onEnd?.();
        }
        return;
      }
      const ev = p.events[p.next];
      let beat = ev.beat;
      if (p.song.swing && Math.abs((beat % 1) - 0.5) < 1e-6) beat += p.song.swing * 0.5;
      const at = p.start + beat * p.spb;
      if (at > horizon) return;
      p.next += 1;
      // A note that was due while the tab was frozen is skipped rather than played late.
      if (at < ctx.currentTime - 0.05) continue;
      const out = { bus: 'music' as const, dest: p.gain, reverb: ev.reverb, pan: ev.pan };
      if (ev.inst === 'drums') ev.pitches.forEach((d) => drum(DRUMS[d], out, at, ev.vel));
      else ev.pitches.forEach((n) => note(ev.inst as InstrumentName, out, at, hz(n), ev.len * p.spb * 0.92, ev.vel));
    }
  }

  private finish(p: Playing): void {
    window.clearInterval(p.timer);
    if (this.current === p) this.current = null;
    if (this.wanted === p.song.id) this.wanted = null;
  }

  stop(fade = 0.8): void {
    this.wanted = null;
    const p = this.current;
    if (!p) return;
    this.finish(p);
    const ctx = audio.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    try {
      p.gain.gain.cancelScheduledValues(t);
      p.gain.gain.setValueAtTime(Math.max(0.0001, p.gain.gain.value), t);
      p.gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.05, fade));
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      try {
        p.gain.disconnect();
      } catch {
        /* gone */
      }
    }, (fade + 3) * 1000);
  }
}

export const music = new MusicPlayer();

if (typeof window !== 'undefined') (window as unknown as { __gameMusic?: MusicPlayer }).__gameMusic = music;

/** Problems with a song: parts that don't fill it exactly, or bad notes. Used by each title's tests. */
export function songProblems(song: Song): string[] {
  const problems: string[] = [];
  for (const part of song.parts) {
    const len = parseSeq(part.seq).reduce((sum, t) => sum + t.len, 0);
    if (Math.abs(len - song.bars * 4) > 1e-6) problems.push(`${song.id} ${part.inst}: ${len} beats, not ${song.bars * 4}`);
  }
  try {
    if (compileSong(song).length < 10) problems.push(`${song.id}: almost no notes`);
  } catch (e) {
    problems.push(String(e));
  }
  return problems;
}
