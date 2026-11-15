import { X } from 'lucide-react';
import { useT } from '../../i18n/i18n';

interface StrikeDisplayProps {
  strikes: number;
  max: number;
  size?: 'tv' | 'compact';
}

export function StrikeDisplay({ strikes, max, size = 'tv' }: StrikeDisplayProps) {
  const t = useT();
  return (
    <div className="flex items-center justify-center gap-[clamp(0.5rem,1.2vw,1.2rem)]" role="img" aria-label={t('{n} of {max} strikes', { n: strikes, max })}>
      {Array.from({ length: max }, (_, i) => {
        const on = i < strikes;
        return (
          <span
            key={i}
            className={`strike-slot ${on ? 'is-on' : ''} ${on && i === strikes - 1 ? 'is-new' : ''} ${size === 'compact' ? '!h-10 !w-10' : ''}`}
            aria-hidden
          >
            <X strokeWidth={4} className={size === 'compact' ? 'h-6 w-6' : 'h-[70%] w-[70%]'} />
          </span>
        );
      })}
    </div>
  );
}

export function StrikeOverlay({ count }: { count: number }) {
  return (
    <div className="strike-overlay" aria-hidden>
      {Array.from({ length: Math.max(1, count) }, (_, i) => (
        <X key={i} strokeWidth={4.5} />
      ))}
    </div>
  );
}
