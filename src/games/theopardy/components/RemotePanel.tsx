import { useEffect, useState } from 'react';
import { Smartphone, X } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import { isRoomEnabled, newRoomCode, startRoom, stopRoom, useRemoteStatus } from '../../../core/sync/remote';
import { formatRoomCode } from '../../../core/sync/roomCode';
import { routeUrl } from '../lib/router';

function QrCode({ text, label }: { text: string; label: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then((QR) => QR.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#061A2E', light: '#FFFFFF' } }))
      .then((markup) => alive && setSvg(markup))
      .catch(() => alive && setSvg(null));
    return () => {
      alive = false;
    };
  }, [text]);
  if (!svg) return <div className="aspect-square w-full rounded-xl bg-sea-700" aria-hidden />;
  // The SVG is generated locally from our own address, never from user input.
  return <div className="aspect-square w-full overflow-hidden rounded-xl [&>svg]:h-full [&>svg]:w-full" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** The TV's corner button and panel for connecting phones as buzzers or as the host remote. */
export function RemotePanel() {
  const t = useT();
  const remote = useRemoteStatus();
  const [open, setOpen] = useState(false);
  const active = remote.role === 'room';

  // After a refresh, reopen the room the TV had so phones reconnect without a new code.
  useEffect(() => {
    if (isRoomEnabled()) void startRoom();
  }, []);

  const status = !active
    ? t('Phones are off')
    : remote.phase === 'starting'
      ? t('Getting a room ready…')
      : remote.phones === 0
        ? t('Waiting for a phone')
        : remote.phones === 1
          ? t('1 phone connected')
          : t('{n} phones connected', { n: remote.phones });

  return (
    <div className="fixed bottom-2 right-[3.4vw] z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="tp-panel tp-pop w-[min(22rem,90vw)] shadow-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl">{t('Phone buzzers')}</h2>
            <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost" onClick={() => setOpen(false)} aria-label={t('Close')}>
              <X aria-hidden className="h-5 w-5" />
            </button>
          </div>
          {active && remote.code ? (
            <>
              <QrCode text={routeUrl('/join', { code: remote.code })} label={t('QR code to connect a phone')} />
              <p className="mt-3 text-center text-sm font-semibold tp-muted">{t('Scan the code, or open this site on a phone and enter:')}</p>
              <p className="text-center text-4xl font-extrabold tracking-widest text-white">{formatRoomCode(remote.code)}</p>
              <p className="mt-1 text-center font-semibold" role="status">
                {status}
              </p>
              {remote.error && <p className="mt-2 text-center text-sm text-coral-300">{t(remote.error, remote.errorVars)}</p>}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost" onClick={() => void newRoomCode()}>
                  {t('New code')}
                </button>
                <button type="button" className="tp-btn tp-btn-sm tp-btn-bad" onClick={stopRoom}>
                  {t('Turn phones off')}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="tp-muted">{t('Each team can use a phone as its buzzer, and the host can run the game from a phone.')}</p>
              <button type="button" className="tp-btn tp-btn-primary mt-4 w-full" onClick={() => void startRoom()}>
                {t('Turn phones on')}
              </button>
            </>
          )}
        </div>
      )}
      <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost shadow-lg" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Smartphone aria-hidden className="h-5 w-5" />
        <span>{active && remote.phones > 0 ? status : t('Phone buzzers')}</span>
      </button>
    </div>
  );
}
