import { Timer as TimerIcon } from 'lucide-react';
import type { TimerState } from '../../types';
import { isTimerRunning, secondsLeft } from '../../engine/timer';
import { useNow } from '../../hooks/useNow';
import { useT } from '../../i18n/i18n';

interface TimerDisplayProps {
  timer: TimerState;
  size?: 'tv' | 'hero' | 'compact';
  label?: string;
}

export function TimerDisplay({ timer, size = 'tv', label }: TimerDisplayProps) {
  const t = useT();
  const running = isTimerRunning(timer);
  const now = useNow(running, 200);
  if (timer.durationMs <= 0) return null;
  const secs = secondsLeft(timer, now);
  const warn = secs <= 5;
  const done = secs <= 0;
  const fraction = timer.durationMs > 0 ? Math.min(1, (secs * 1000) / timer.durationMs) : 0;

  if (size === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-display text-2xl font-bold tabular-nums ${warn ? 'text-rose-300' : 'text-cream'}`} aria-label={t('{n} seconds left', { n: secs })}>
        <TimerIcon className="h-5 w-5" aria-hidden />
        {done ? t('Time!') : secs}
      </span>
    );
  }

  const dimension = size === 'hero' ? 'clamp(9rem, 22vw, 20rem)' : 'clamp(4.2rem, 8vw, 7.5rem)';
  const r = 45;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center" role="timer" aria-label={`${label ?? t('Time left')}: ${done ? t('time is up') : t('{n} seconds', { n: secs })}`}>
      <div className={`relative ${warn && running ? 'timer-warn' : ''}`} style={{ width: dimension, height: dimension }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="#130d3d" stroke="rgba(179,173,243,0.2)" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={warn ? '#ff6b6b' : '#ffcf4d'}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - fraction)}
            style={{ transition: 'stroke-dashoffset 200ms linear, stroke 300ms' }}
          />
        </svg>
        <span
          className={`absolute inset-0 grid place-items-center font-display font-bold tabular-nums ${warn ? 'text-rose-300' : 'text-cream'}`}
          style={{ fontSize: size === 'hero' ? 'clamp(3.5rem, 9vw, 8rem)' : 'clamp(1.6rem, 3.2vw, 3rem)' }}
          aria-hidden
        >
          {done ? t('Time!') : secs}
        </span>
      </div>
      {size === 'hero' && <span className="mt-2 font-display text-[clamp(1rem,1.6vw,1.6rem)] text-night-200">{done ? '' : running ? t('seconds') : t('paused')}</span>}
    </div>
  );
}
