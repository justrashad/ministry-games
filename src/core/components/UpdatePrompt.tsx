import { t } from '../i18n/i18n';
import { TITLE } from '../title';
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { useToast } from './ui/Toast';

const CHECK_EVERY_MS = 60 * 60 * 1000;

/**
 * Registers the service worker. Updates wait for the host to press Reload,
 * so a new version never interrupts a game (the game in progress survives a reload anyway).
 */
export function UpdatePrompt({ quiet = false }: { quiet?: boolean }) {
  const toast = useToast();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      window.setInterval(() => {
        if (navigator.onLine) void registration.update().catch(() => undefined);
      }, CHECK_EVERY_MS);
    },
  });

  useEffect(() => {
    if (!offlineReady || quiet) return;
    toast.show(t('{title} is ready to play offline.', { title: TITLE.name }), 'info');
    setOfflineReady(false);
  }, [offlineReady, quiet, toast, setOfflineReady]);

  if (!needRefresh || quiet) return null;
  return (
    <div className="fixed inset-x-0 top-16 z-[65] flex justify-center px-4" role="status">
      <div className="pop-in flex items-center gap-3 rounded-2xl bg-night-800 px-4 py-3 text-cream shadow-2xl ring-1 ring-gold-300/50">
        <p className="text-sm font-bold">{t('A new version of {title} is ready.', { title: TITLE.name })}</p>
        <button type="button" className="btn btn-gold btn-sm" onClick={() => void updateServiceWorker(true)}>
          <RefreshCw className="btn-icon" aria-hidden />
          <span>{t('Reload')}</span>
        </button>
        <button type="button" className="btn btn-subtle btn-sm" onClick={() => setNeedRefresh(false)} aria-label={t('Later')}>
          <X className="btn-icon" aria-hidden />
        </button>
      </div>
    </div>
  );
}
