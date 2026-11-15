import type { ReactNode } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { navigate } from '../../lib/router';
import { savePhoneRole } from '../../../../core/sync/remote';
import { RemoteReconnecting } from '../../components/RemoteReconnecting';
import { useT } from '../../../../core/i18n/i18n';

/** Full-screen shell for single-purpose phone screens (buzzer, player). */
export function PhoneFrame({ title, children, accent }: { title: string; children: ReactNode; accent?: string }) {
  const t = useT();
  return (
    <main className="flex min-h-[100dvh] flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]" style={accent ? { background: `radial-gradient(ellipse at 50% 0%, ${accent}33, transparent 70%)` } : undefined}>
      <RemoteReconnecting />
      <header className="flex items-center justify-between gap-3">
        <p className="font-display text-lg font-semibold text-cream">{title}</p>
        <button
          type="button"
          className="btn btn-subtle btn-sm"
          onClick={() => {
            savePhoneRole(null);
            navigate('/remote');
          }}
        >
          <ArrowLeftRight className="btn-icon" aria-hidden />
          <span>{t('Switch')}</span>
        </button>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </main>
  );
}
