import { BadgePercent } from 'lucide-react';
import { bundleSavings, formatMoney, useStorePrices } from '../commerce/pricing';
import { t } from '../../../core/i18n/i18n';

/** "Save $79.88 (62%) compared with buying all 13 packs separately ($129.87)." */
export function SavingsNote({ bundle, className = '' }: { bundle: 'complete' | 'mega-pack'; className?: string }) {
  const savings = bundleSavings(bundle, useStorePrices());
  if (!savings) return null;
  const vars = { amount: formatMoney(savings.saved), pct: savings.percent, n: savings.packCount, total: formatMoney(savings.separately) };
  return (
    <p className={`flex items-start gap-2 rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-100 ring-1 ring-inset ring-emerald-400/30 ${className}`}>
      <BadgePercent className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
      <span>
        {bundle === 'complete'
          ? t('Save {amount} ({pct}%) compared with buying the game and all {n} packs separately ({total}).', vars)
          : t('Save {amount} ({pct}%) compared with buying all {n} packs separately ({total}).', vars)}
      </span>
    </p>
  );
}
