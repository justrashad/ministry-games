/**
 * The shared audio engine. Every sound and every note of music is synthesized
 * here with the Web Audio API: no audio files and no borrowed recordings.
 *
 * Browsers, and iPads above all, are strict about sound:
 * - Audio stays off until someone touches or clicks the page, so every touch,
 *   click and key press tries to wake it, not only the first one.
 * - On iPad and iPhone, the silent switch mutes Web Audio unless the page asks
 *   for media playback. We ask through navigator.audioSession where Safari has
 *   it, and otherwise keep a silent media element playing.
 * - iOS suspends or interrupts audio when the app goes to the background, a call
 *   comes in or AirPlay changes route, so it is woken again on return.
 */

type Listener = () => void;
export type Bus = 'sfx' | 'music';

interface AudioSessionLike {
  type: string;
}

function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/** A quarter second of silence as a WAV data URI, for the iOS media-session keepalive. */
function silentWav(): string {
  const rate = 8000;
  const samples = 2000;
  const bytes = new Uint8Array(44 + samples);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, s: string) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, 'data');
  view.setUint32(40, samples, true);
  bytes.fill(128, 44);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return 'data:audio/wav;base64,' + btoa(binary);
}

const GESTURES = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'click', 'keydown'] as const;

export class AudioEngine {
  ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private buses: Record<Bus, GainNode> | null = null;
  private reverbIn: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private supported: boolean;
  private installed = false;
  private keepAlive: HTMLAudioElement | null = null;
  private listeners = new Set<Listener>();
  /** How many sounds have started, for tests and troubleshooting. */
  played = 0;
  private volumes: Record<Bus | 'master', number> = { master: 0.85, sfx: 0.9, music: 0.55 };

  constructor() {
    this.supported =
      typeof window !== 'undefined' &&
      (typeof window.AudioContext !== 'undefined' ||
        typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined');
  }

  isSupported(): boolean {
    return this.supported;
  }

  /** Creates the audio graph on first use and starts listening for the touches that wake it. */
  context(): AudioContext | null {
    if (!this.supported) return null;
    this.install();
    if (this.ctx) return this.ctx;
    try {
      const session = (navigator as unknown as { audioSession?: AudioSessionLike }).audioSession;
      if (session) session.type = 'playback';
    } catch {
      /* not every browser lets the page set it */
    }
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor({ latencyHint: 'interactive' });
      this.build(ctx);
      return ctx;
    } catch {
      this.supported = false;
      return null;
    }
  }

  private build(ctx: BaseAudioContext): void {
    this.ctx = ctx as AudioContext;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.2;
    comp.connect(ctx.destination);
    this.out = ctx.createGain();
    this.out.gain.value = this.volumes.master;
    this.out.connect(comp);
    const sfx = ctx.createGain();
    sfx.gain.value = this.volumes.sfx;
    sfx.connect(this.out);
    const music = ctx.createGain();
    music.gain.value = this.volumes.music;
    music.connect(this.out);
    this.buses = { sfx, music };
    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(ctx, 2.4);
    this.reverbIn = ctx.createGain();
    this.reverbIn.gain.value = 0.9;
    this.reverbIn.connect(reverb);
    reverb.connect(this.out);
    ctx.onstatechange = () => this.emit();
  }

  /** Renders into an offline context instead of the speakers (used to make preview recordings). */
  renderInto(ctx: BaseAudioContext): void {
    this.supported = true;
    this.installed = true;
    this.noise = null;
    this.ctx = ctx as AudioContext;
    this.build(ctx);
  }

  private install(): void {
    if (this.installed || typeof window === 'undefined') return;
    this.installed = true;
    const onGesture = () => this.wakeFromGesture();
    for (const name of GESTURES) window.addEventListener(name, onGesture, { capture: true, passive: true });
    const onReturn = () => {
      if (document.visibilityState === 'visible') void this.resume();
    };
    document.addEventListener('visibilitychange', onReturn);
    window.addEventListener('focus', onReturn);
    window.addEventListener('pageshow', onReturn);
  }

  private wakeFromGesture(): void {
    const ctx = this.context();
    if (!ctx) return;
    if (ctx.state !== 'running') void this.resume();
    // A one-sample buffer started inside the touch is what finally unlocks older Safari.
    try {
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, 22050);
      src.connect(ctx.destination);
      src.start(0);
    } catch {
      /* ignore */
    }
    this.startKeepAlive();
  }

  /** Keeps iOS in media playback so the silent switch and AirPlay don't drop the game's audio. */
  private startKeepAlive(): void {
    if (this.keepAlive || !isAppleTouchDevice()) return;
    if ((navigator as unknown as { audioSession?: unknown }).audioSession) return;
    try {
      const el = document.createElement('audio');
      el.src = silentWav();
      el.loop = true;
      el.setAttribute('playsinline', '');
      el.setAttribute('x-webkit-airplay', 'allow');
      el.preload = 'auto';
      this.keepAlive = el;
      void el.play().catch(() => {
        this.keepAlive = null;
      });
    } catch {
      this.keepAlive = null;
    }
  }

  async resume(): Promise<void> {
    const ctx = this.ctx;
    if (!ctx || ctx.state === 'running' || ctx.state === 'closed') return;
    try {
      await ctx.resume();
    } catch {
      /* needs a touch first */
    }
    this.emit();
  }

  /** For a button that turns sound on: same as any touch, but it can be awaited. */
  async unlock(): Promise<void> {
    this.wakeFromGesture();
    await this.resume();
  }

  /** True while the browser is holding audio back until the page is touched. */
  isLocked(): boolean {
    const ctx = this.context();
    return !!ctx && ctx.state !== 'running';
  }

  isRunning(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }

  onStateChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    this.listeners.forEach((l) => l());
  }

  /**
   * Runs `fn` with a start time as soon as audio is running. A sound asked for
   * while the browser is still waking audio up plays the moment it wakes, unless
   * that takes so long the moment has passed.
   */
  whenRunning(fn: (ctx: AudioContext, t: number) => void, maxWaitMs = 1500): void {
    const ctx = this.context();
    if (!ctx) return;
    if (ctx.state === 'running') {
      this.played += 1;
      fn(ctx, ctx.currentTime + 0.015);
      return;
    }
    const asked = Date.now();
    let done = false;
    const off = this.onStateChange(() => {
      if (done || ctx.state !== 'running') return;
      done = true;
      off();
      if (Date.now() - asked <= maxWaitMs) {
        this.played += 1;
        fn(ctx, ctx.currentTime + 0.015);
      }
    });
    void this.resume();
    window.setTimeout(() => {
      if (!done) {
        done = true;
        off();
      }
    }, maxWaitMs + 50);
  }

  bus(name: Bus): GainNode | null {
    this.context();
    return this.buses ? this.buses[name] : null;
  }

  reverb(): GainNode | null {
    this.context();
    return this.reverbIn;
  }

  setVolume(which: Bus | 'master', value: number): void {
    const v = Math.min(1, Math.max(0, value));
    this.volumes[which] = v;
    const node = which === 'master' ? this.out : this.buses?.[which];
    if (node && this.ctx) node.gain.setTargetAtTime(v, this.ctx.currentTime, 0.03);
  }

  /** Two seconds of white noise, shared by every drum and whoosh. */
  noiseBuffer(): AudioBuffer | null {
    const ctx = this.context();
    if (!ctx) return null;
    if (!this.noise) {
      const len = Math.floor(ctx.sampleRate * 2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    return this.noise;
  }

  /** A synthetic hall: decaying stereo noise, a little brighter at the start. */
  private impulse(ctx: BaseAudioContext, seconds: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) * 0.6;
    }
    return buf;
  }
}

export const audio = new AudioEngine();

if (typeof window !== 'undefined') (window as unknown as { __gameAudio?: AudioEngine }).__gameAudio = audio;
