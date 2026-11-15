import { t } from '../i18n/i18n';
import { Lock, Play } from 'lucide-react';
import { navigate } from '../lib/router';
import { BuyButton } from './BuyButton';
import { LicenseKeyForm } from './LicenseKeyForm';
import { Button } from './ui/Button';

/** Shown in place of features that need the full game. */
export function Paywall({ title, message, showDemo = true }: { title: string; message: string; showDemo?: boolean }) {
  return (
    <section className="panel mx-auto max-w-2xl space-y-5 text-center" aria-labelledby="paywall-title">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold-300 text-ink">
        <Lock className="h-7 w-7" aria-hidden />
      </div>
      <div>
        <h2 id="paywall-title" className="text-2xl font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-night-100">{message}</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        <BuyButton entitlement="game" />
        {showDemo && (
          <Button variant="ghost" size="lg" icon={Play} onClick={() => navigate('/new')}>
            {t('Try the free demo')}
          </Button>
        )}
      </div>
      <p className="text-sm text-night-200">
        {t('Want everything? The')}{' '}
        <button type="button" className="font-bold text-gold-200 underline underline-offset-2" onClick={() => navigate('/store')}>
          {t('Complete Edition')}
        </button>{' '}
        {t('includes the game and every question pack.')}
      </p>
      <div className="mx-auto max-w-lg text-left">
        <p className="mb-2 text-sm font-bold text-night-200">{t('Already bought it?')}</p>
        <LicenseKeyForm />
      </div>
    </section>
  );
}
