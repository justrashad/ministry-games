import { audio } from './engine';
import { output, type Out } from './instruments';
import { soundPrefs } from './prefs';
import { build, RATE, type CrowdSound, type Stereo } from './crowdSynth';

/**
 * The studio audience: applause, cheers, an "aww" for wrong answers and an
 * "ooh" for tense moments, synthesized in crowdSynth.ts. The sounds are built in
 * a background worker once audio starts, so the game never stalls to make them.
 */

export type { CrowdSound };

const VARIANTS = 2;
const ALL: CrowdSound[] = ['applauseShort', 'aww', 'applause', 'cheer', 'ooh', 'bigCheer'];

const cache = new Map<CrowdSound, AudioBuffer[]>();
const next = new Map<CrowdSound, number>();
let worker: Worker | null = null;

function toBuffer(ctx: BaseAudioContext, data: Stereo): AudioBuffer {
  const b = ctx.createBuffer(2, data[0].length, RATE);
  b.copyToChannel(data[0], 0);
  b.copyToChannel(data[1], 1);
  return b;
}

function store(ctx: BaseAudioContext, name: CrowdSound, data: Stereo): void {
  const list = cache.get(name) ?? [];
  if (list.length < VARIANTS) list.push(toBuffer(ctx, data));
  cache.set(name, list);
}

/** Starts building every crowd sound in the background. */
export function warmCrowd(): void {
  const ctx = audio.ctx;
  if (!ctx || worker || typeof Worker === 'undefined') return;
  try {
    worker = new Worker(new URL('./crowdWorker.ts', import.meta.url), { type: 'module' });
  } catch {
    worker = null;
    return;
  }
  worker.onmessage = (e: MessageEvent<{ name: CrowdSound; left: Float32Array<ArrayBuffer>; right: Float32Array<ArrayBuffer> }>) => {
    const c = audio.ctx;
    if (c) store(c, e.data.name, [e.data.left, e.data.right]);
  };
  worker.onerror = () => {
    worker = null;
  };
  for (let v = 0; v < VARIANTS; v++) for (const name of ALL) worker.postMessage(name);
}

const CROWD_OUT: Out = { bus: 'sfx', reverb: 0.3 };

/** Plays a crowd sound at time t (inside a sound kit). Off when the studio audience is switched off. */
export function crowd(name: CrowdSound, t: number, vel = 0.7): void {
  const prefs = soundPrefs.get();
  if (!prefs.crowd || !prefs.sfx) return;
  const ctx = audio.context();
  if (!ctx) return;
  let list = cache.get(name);
  // Not built yet (the worker is still going, or there is none): build one now.
  if (!list || list.length === 0) {
    store(ctx, name, build(name));
    list = cache.get(name) as AudioBuffer[];
  }
  const i = (next.get(name) ?? Math.floor(Math.random() * list.length)) % list.length;
  next.set(name, i + 1);
  const buf = list[i];
  const o = output(ctx, CROWD_OUT, t, t + buf.duration);
  if (!o) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = vel;
  src.connect(g).connect(o);
  src.start(Math.max(t, ctx.currentTime));
}

let warmed = false;
audio.onStateChange(() => {
  if (!warmed && audio.isRunning()) {
    warmed = true;
    warmCrowd();
  }
});

if (typeof window !== 'undefined') (window as unknown as { __crowdReady?: () => string[] }).__crowdReady = () => [...cache.entries()].map(([k, v]) => `${k}:${v.length}`);
