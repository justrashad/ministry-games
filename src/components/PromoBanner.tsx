import { PartyPopper } from 'lucide-react';
import { usePromo } from '../commerce/pricing';
import { t, useLang } from '../i18n/i18n';

/** Store-wide sale banner. Shows only while a promo is running (the PROMO server setting). */
export function PromoBanner({ className = '' }: { className?: string }) {
  const promo = usePromo();
  const lang = useLang();
  if (!promo) return null;
  const ends = new Date(promo.ends).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { month: 'long', day: 'numeric' });
  return (
    <div role="note" className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-gold-300 px-4 py-3 text-center font-display text-ink shadow-lg ${className}`}>
      <PartyPopper className="h-5 w-5" aria-hidden />
      <span className="text-lg font-bold">{t('{pct}% off everything', { pct: promo.percent })}</span>
      <span className="text-sm font-semibold">
        {t('Applied automatically at checkout, or use code {code}. Ends {date}.', { code: promo.code, date: ends })}
      </span>
    </div>
  );
}
