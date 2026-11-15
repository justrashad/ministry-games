import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import { TITLE } from '../../../core/title';

const CHECK_EVERY_MS = 60 * 60 * 1000;
const READY_NOTICE_MS = 6000;

/**
 * Registers the service worker so the game installs and plays offline. Updates
 * wait for someone to press Reload, so a new version never interrupts a game
 * (the game in progress survives a reload anyway). `quiet` hides the notices on
 * the TV and buzzer screens.
 */
export function UpdatePrompt({ quiet = false }: { quiet?: boolean }) {
  const t = useT();
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
  const [showReady, setShowReady] = useState(false);

  useEffect(() => {
    if (!offlineReady) return;
    setOfflineReady(false);
    if (quiet) return;
    setShowReady(true);
    const id = window.setTimeout(() => setShowReady(false), READY_NOTICE_MS);
    return () => window.clearTimeout(id);
  }, [offlineReady, quiet, setOfflineReady]);

  if (quiet) return null;
  if (needRefresh) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4" role="status">
        <div className="pointer-events-auto tp-pop flex items-center gap-3 rounded-2xl bg-sea-800 px-4 py-3 shadow-2xl ring-2 ring-ice-300">
          <p className="font-bold">{t('A new version of {title} is ready.', { title: TITLE.name })}</p>
          <button type="button" className="tp-btn tp-btn-sm tp-btn-accent" onClick={() => void updateServiceWorker(true)}>
            <RefreshCw aria-hidden className="h-5 w-5" />
            {t('Reload')}
          </button>
          <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost" onClick={() => setNeedRefresh(false)} aria-label={t('Later')}>
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }
  if (showReady) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4" role="status">
        <p className="tp-pop rounded-2xl bg-sea-800 px-4 py-3 font-bold shadow-2xl ring-2 ring-ice-300">{t('{title} is ready to play offline.', { title: TITLE.name })}</p>
      </div>
    );
  }
  return null;
}
