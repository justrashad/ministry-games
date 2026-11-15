/**
 * Original, generated UI sounds using the Web Audio API. No audio files and no
 * borrowed game-show sounds. Everything is a no-op if audio is unsupported.
 */

export type SoundName =
  | 'gameStart'
  | 'roundStart'
  | 'finalRound'
  | 'reveal'
  | 'correct'
  | 'strike'
  | 'steal'
  | 'stealSuccess'
  | 'roundWin'
  | 'tick'
  | 'timeUp'
  | 'submit'
  | 'miss'
  | 'celebrate'
  | 'buzz';

type Wave = OscillatorType;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private volume = 0.6;
  private supported: boolean;
  private listeners = new Set<() => void>();

  constructor() {
    this.supported =
      typeof window !== 'undefined' &&
      (typeof window.AudioContext !== 'undefined' ||
        typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined');
  }

  isSupported(): boolean {
    return this.supported;
  }

  private ensure(): AudioContext | null {
    if (!this.supported) return null;
    if (this.ctx) return this.ctx;
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      this.ctx.onstatechange = () => this.listeners.forEach((l) => l());
      return this.ctx;
    } catch {
      this.supported = false;
      return null;
    }
  }

  /** True when the browser is waiting for a click before it will play audio. */
  isLocked(): boolean {
    const ctx = this.ensure();
    return !!ctx && ctx.state === 'suspended';
  }

  onStateChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async unlock(): Promise<void> {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        /* ignore */
      }
    }
    this.listeners.forEach((l) => l());
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
  }

  private tone(freq: number, start: number, duration: number, wave: Wave = 'sine', gain = 0.25, endFreq?: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(env);
    env.connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  private arpeggio(notes: number[], start: number, step: number, duration: number, wave: Wave, gain: number): void {
    notes.forEach((n, i) => this.tone(n, start + i * step, duration, wave, gain));
  }

  play(name: SoundName): void {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }
    const t = ctx.currentTime + 0.02;
    switch (name) {
      case 'gameStart':
        this.arpeggio([523.25, 659.25, 783.99, 1046.5], t, 0.11, 0.35, 'triangle', 0.22);
        break;
      case 'roundStart':
        this.arpeggio([587.33, 880], t, 0.13, 0.3, 'triangle', 0.2);
        break;
      case 'finalRound':
        [261.63, 329.63, 392, 523.25].forEach((f) => this.tone(f, t, 1.3, 'triangle', 0.12));
        this.tone(1046.5, t + 0.35, 0.8, 'sine', 0.1);
        break;
      case 'reveal':
        this.tone(880, t, 0.16, 'sine', 0.22);
        this.tone(1318.5, t + 0.08, 0.28, 'sine', 0.18);
        break;
      case 'correct':
        this.arpeggio([659.25, 880, 1108.7], t, 0.07, 0.28, 'triangle', 0.22);
        break;
      case 'strike':
        // A soft, low "bonk" rather than a harsh buzzer.
        this.tone(196, t, 0.42, 'square', 0.07, 130);
        this.tone(98, t, 0.45, 'sine', 0.28, 80);
        break;
      case 'steal':
        this.tone(330, t, 0.45, 'triangle', 0.2, 880);
        this.tone(440, t + 0.2, 0.45, 'triangle', 0.16, 1175);
        break;
      case 'stealSuccess':
      case 'roundWin':
        this.arpeggio([523.25, 659.25, 783.99], t, 0.1, 0.25, 'triangle', 0.2);
        this.tone(1046.5, t + 0.3, 0.6, 'triangle', 0.22);
        break;
      case 'tick':
        this.tone(1046.5, t, 0.07, 'sine', 0.16);
        break;
      case 'timeUp':
        this.tone(784, t, 0.22, 'triangle', 0.22);
        this.tone(523.25, t + 0.2, 0.45, 'triangle', 0.22);
        break;
      case 'submit':
        this.tone(740, t, 0.1, 'sine', 0.16);
        break;
      case 'miss':
        this.tone(311, t, 0.3, 'sine', 0.18, 262);
        break;
      case 'buzz':
        // A bright two-tone "ding-ding" for the first buzz.
        this.tone(988, t, 0.18, 'square', 0.09);
        this.tone(1319, t + 0.12, 0.3, 'square', 0.09);
        this.tone(1319, t + 0.12, 0.3, 'sine', 0.18);
        break;
      case 'celebrate':
        this.arpeggio([523.25, 659.25, 783.99, 1046.5, 1318.5], t, 0.09, 0.4, 'triangle', 0.18);
        this.tone(1568, t + 0.5, 0.8, 'sine', 0.12);
        break;
      default:
        break;
    }
  }
}

export const sound = new SoundEngine();
