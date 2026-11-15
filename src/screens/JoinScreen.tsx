import { useEffect, useState } from 'react';
import { Loader2, Smartphone, Unplug } from 'lucide-react';
import { getHashParam, navigate } from '../lib/router';
import { sound } from '../lib/sound';
import { clearRemoteError, getPhoneRole, joinRoom, leaveRoom, retryJoin, useRemoteStatus } from '../sync/remote';
import { formatRoomCode, isValidRoomCode, normalizeRoomCode, ROOM_CODE_LENGTH } from '../sync/roomCode';
import { Button } from '../components/ui/Button';
import { useT } from '../i18n/i18n';

/** Phone-side: enter the code shown on the TV to become the host remote. */
export function JoinScreen() {
  const t = useT();
  const remote = useRemoteStatus();
  const [code, setCode] = useState(() => normalizeRoomCode(getHashParam('code') ?? ''));
  const cleaned = normalizeRoomCode(code);
  const valid = isValidRoomCode(cleaned);

  // Arriving from the TV's QR code: connect straight away.
  useEffect(() => {
    const fromQr = normalizeRoomCode(getHashParam('code') ?? '');
    if (isValidRoomCode(fromQr) && remote.role !== 'remote') void joinRoom(fromQr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (remote.role !== 'remote' || remote.phase !== 'connected') return;
    const role = getPhoneRole();
    navigate(role === 'host' ? '/host' : role === 'buzzer' ? '/buzzer' : role === 'player' ? '/player' : '/remote');
  }, [remote.role, remote.phase]);

  const connecting = remote.role === 'remote' && (remote.phase === 'starting' || remote.phase === 'reconnecting');

  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-8">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gold-300 text-ink">
        <Smartphone className="h-8 w-8" aria-hidden />
      </div>
      <h1 className="text-3xl font-semibold">{t('Use this phone as the remote')}</h1>
      <p className="mt-2 text-night-100">
        {t("On the TV's game screen, choose Phone remote. Scan the QR code, or type the code it shows.")}
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          void sound.unlock();
          void joinRoom(cleaned);
        }}
      >
        <div>
          <label htmlFor="room-code" className="field-label">
            {t('Room code')}
          </label>
          <input
            id="room-code"
            className="input text-center font-display !text-4xl tracking-[0.2em] uppercase"
            value={code}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={ROOM_CODE_LENGTH + 2}
            placeholder="ABC 23"
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              clearRemoteError();
            }}
            aria-describedby="room-code-help"
            aria-invalid={remote.phase === 'error' && remote.role === 'none' ? true : undefined}
          />
          <p id="room-code-help" className="field-help">
            {t('{n} letters and numbers', { n: ROOM_CODE_LENGTH })}{valid ? `: ${formatRoomCode(cleaned)}` : ''}
          </p>
        </div>
        <Button type="submit" variant="gold" size="xl" block icon={connecting ? Loader2 : Smartphone} disabled={!valid || connecting} className={connecting ? '[&_.btn-icon]:animate-spin' : ''}>
          {connecting ? t('Connecting…') : t('Connect to the TV')}
        </Button>
      </form>

      {remote.error && (
        <div role="alert" className="mt-4 rounded-xl bg-rose-950/70 p-3 text-sm text-rose-100 ring-1 ring-rose-400/40">
          <p>{t(remote.error, remote.errorVars)}</p>
          {remote.role === 'remote' && (
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="ghost" onClick={retryJoin}>
                {t('Try again')}
              </Button>
              <Button size="sm" variant="subtle" icon={Unplug} onClick={() => leaveRoom()}>
                {t('Cancel')}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 space-y-2 text-sm text-night-200">
        <p>{t('The phone and TV find each other through a free connection service, then talk directly. Your questions and scores are not stored anywhere else.')}</p>
        <p>{t('You can start a new game from the phone with the question sets saved on the phone, or let someone start it on the TV computer first.')}</p>
      </div>
    </div>
  );
}
