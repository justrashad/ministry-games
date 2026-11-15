import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Smartphone, X } from 'lucide-react';
import { joinUrl } from '../../lib/router';
import { sound } from '../../../../core/lib/sound';
import { isRoomEnabled, newRoomCode, startRoom, stopRoom, useRemoteStatus } from '../../../../core/sync/remote';
import { formatRoomCode } from '../../../../core/sync/roomCode';
import { useT } from '../../../../core/i18n/i18n';

function QrCode({ text }: { text: string }) {
  const t = useT();
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then((QR) => QR.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1b1446', light: '#fff7e6' } }))
      .then((markup) => alive && setSvg(markup))
      .catch(() => alive && setSvg(null));
    return () => {
      alive = false;
    };
  }, [text]);
  if (!svg) return <div className="aspect-square w-full rounded-2xl bg-cream/10" aria-hidden />;
  // The SVG is generated locally from our own URL, never from user input.
  return <div className="aspect-square w-full overflow-hidden rounded-2xl [&>svg]:h-full [&>svg]:w-full" role="img" aria-label={t('QR code to join as the remote')} dangerouslySetInnerHTML={{ __html: svg }} />;
}

const OPEN_EVENT = 'survey-showdown:open-remote';

/** Lets other parts of the game screen (like the waiting view) open the phone remote panel. */
export function requestRemotePanel(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** TV-side: shows the room code and QR code a phone uses to become the remote. */
export function RemotePanel() {
  const t = useT();
  const remote = useRemoteStatus();
  const [open, setOpen] = useState(false);
  const [justJoined, setJustJoined] = useState(false);
  const lastPhones = useRef(remote.phones);

  // Resume the room after a refresh so a connected phone can find the TV again.
  useEffect(() => {
    if (isRoomEnabled()) void startRoom();
  }, []);

  useEffect(() => {
    if (remote.phones > lastPhones.current) {
      setOpen(false);
      setJustJoined(true);
      const id = window.setTimeout(() => setJustJoined(false), 4000);
      lastPhones.current = remote.phones;
      return () => window.clearTimeout(id);
    }
    lastPhones.current = remote.phones;
  }, [remote.phones]);

  const active = remote.role === 'room';
  const launch = () => {
    void sound.unlock();
    setOpen(true);
    void startRoom();
  };

  useEffect(() => {
    const onOpen = () => launch();
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const statusText =
    remote.phase === 'starting'
      ? t('Getting a room ready…')
      : remote.phase === 'waiting'
        ? t('Waiting for a phone')
        : remote.phase === 'connected'
          ? remote.phones === 1
            ? t('1 phone connected')
            : t('{n} phones connected', { n: remote.phones })
          : remote.error
            ? t(remote.error, remote.errorVars)
            : t('Not connected');

  return (
    <>
      <div className="absolute bottom-3 left-3 z-40 flex items-center gap-2">
        <button
            type="button"
            className={`btn btn-sm ${active ? 'btn-ghost' : 'btn-subtle opacity-50 hover:opacity-100 focus-visible:opacity-100'}`}
            onClick={active ? () => setOpen((v) => !v) : launch}
            aria-expanded={open}
          >
            <Smartphone className="btn-icon" aria-hidden />
            <span>{active && remote.phase === 'connected' ? `${t('Remote connected')}${remote.phones > 1 ? ` (${remote.phones})` : ''}` : t('Phone remote')}</span>
            {active && <span className={`h-2 w-2 rounded-full ${remote.phase === 'connected' ? 'bg-emerald-400' : remote.phase === 'error' ? 'bg-rose-400' : 'bg-gold-300'}`} aria-hidden />}
        </button>
        {justJoined && <span className="pop-in rounded-full bg-emerald-400 px-3 py-1 text-sm font-bold text-emerald-950">{t('Phone connected')}</span>}
      </div>

      {open && active && remote.code && (
        <div className="absolute inset-0 z-[45] grid place-items-center bg-night-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="remote-title">
          <div className="pop-in panel w-full max-w-[min(92vw,56rem)] !bg-night-800">
            <div className="flex items-start justify-between gap-4">
              <h2 id="remote-title" className="font-display text-[clamp(1.4rem,2.6vw,2.6rem)] font-semibold">
                {t('Use a phone as the remote')}
              </h2>
              <button type="button" className="btn btn-subtle btn-sm" onClick={() => setOpen(false)} aria-label={t('Close')}>
                <X className="btn-icon" aria-hidden />
              </button>
            </div>
            <div className="mt-4 grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="mx-auto w-full max-w-[18rem]">
                <QrCode text={joinUrl(remote.code)} />
              </div>
              <div className="space-y-4 text-center md:text-left">
                <p className="text-[clamp(1rem,1.5vw,1.4rem)] text-night-100">{t("Scan with the phone's camera, or open this site on the phone, tap Use this phone as the remote, and enter:")}</p>
                <p className="whitespace-nowrap font-display text-[clamp(2.6rem,5.5vw,5rem)] font-bold leading-none tracking-[0.08em] text-gold-300" aria-label={`${t('Room code')} ${remote.code.split('').join(' ')}`}>
                  {formatRoomCode(remote.code)}
                </p>
                <p className="flex items-center justify-center gap-2 font-bold text-cream md:justify-start" role="status">
                  <span className={`h-2.5 w-2.5 rounded-full ${remote.phase === 'connected' ? 'bg-emerald-400' : remote.phase === 'error' ? 'bg-rose-400' : 'bg-gold-300'}`} aria-hidden />
                  {statusText}
                </p>
                <p className="text-sm text-night-200">
                  {t('Both devices need internet for a moment to find each other. After that, the phone talks to this screen directly. Keep this window open.')}
                </p>
                <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => void newRoomCode()}>
                    <RefreshCw className="btn-icon" aria-hidden />
                    <span>{t('New code (disconnects phones)')}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-subtle btn-sm"
                    onClick={() => {
                      stopRoom();
                      setOpen(false);
                    }}
                  >
                    <span>{t('Turn off phone remote')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
