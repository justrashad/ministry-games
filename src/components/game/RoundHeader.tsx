import { Sparkles } from 'lucide-react';
import { useT } from '../../i18n/i18n';

interface RoundHeaderProps {
  roundIndex: number;
  totalRounds: number;
  isFinal: boolean;
  multiplier: number;
}

export function RoundHeader({ roundIndex, totalRounds, isFinal, multiplier }: RoundHeaderProps) {
  const t = useT();
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full px-[clamp(0.9rem,1.6vw,1.6rem)] py-[clamp(0.3rem,0.7vh,0.6rem)] font-display font-semibold ${
        isFinal ? 'bg-gold-300 text-ink' : 'bg-night-700 text-cream ring-1 ring-inset ring-night-300/40'
      }`}
    >
      {isFinal && <Sparkles aria-hidden className="h-[1.1em] w-[1.1em]" />}
      <span className="text-[clamp(0.9rem,1.5vw,1.6rem)]">{isFinal ? t('Final round') : t('Round {n} of {total}', { n: roundIndex + 1, total: totalRounds })}</span>
      <span aria-hidden className="opacity-50">|</span>
      <span className="text-[clamp(0.9rem,1.5vw,1.6rem)]">{t('{n}× points', { n: multiplier })}</span>
    </div>
  );
}
