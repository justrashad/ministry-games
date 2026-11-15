import { useEffect, useState, type FormEvent } from 'react';
import { useT } from '../../../core/i18n/i18n';
import { clearRemoteError, joinRoom, leaveRoom, retryJoin, useRemoteStatus } from '../../../core/sync/remote';
import { formatRoomCode, isValidRoomCode, normalizeRoomCode, ROOM_CODE_LENGTH } from '../../../core/sync/roomCode';
import { TEAMS } from '../components/parts';
import { getHashParam, navigate } from '../lib/router';
import { sendBuzz, useGameState } from '../sync/gameStore';
import type { TeamIndex } from '../types';

/** Phone side: enter the code shown on the TV. */
export function JoinScreen() {
  const t = useT();
  const remote = useRemoteStatus();
  const [code, setCode] = useState(() => normalizeRoomCode(getHashParam('code') ?? ''));
  const cleaned = normalizeRoomCode(code);

  // Arriving from the TV's QR code: connect straight away.
  useEffect(() => {
    const fromQr = normalizeRoomCode(getHashParam('code') ?? '');
    if (isValidRoomCode(fromQr)) void joinRoom(fromQr);
  }, []);

  useEffect(() => {
    if (remote.role === 'remote' && remote.phase === 'connected') navigate('/remote');
  }, [remote.role, remote.phase]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    clearRemoteError();
    void joinRoom(cleaned);
  };
  const busy = remote.role === 'remote' && (remote.phase === 'starting' || remote.phase === 'reconnecting');

  return (
    <form className="mx-auto flex max-w-md flex-col gap-4" onSubmit={submit}>
      <h1 className="text-4xl">{t('Connect to the TV')}</h1>
      <p className="tp-muted text-lg">{t("On the TV's game screen, choose Phone buzzers. Scan the QR code, or type the code it shows.")}</p>
      <div>
        <label className="tp-label" htmlFor="room-code">
          {t('Room code')}
        </label>
        <input
          id="room-code"
          className="tp-input text-center text-3xl font-extrabold uppercase tracking-widest"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={ROOM_CODE_LENGTH + 1}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      {remote.error && (
        <div className="rounded-xl border-2 border-ice-300 p-3 text-ice-300" role="alert">
          <p className="font-semibold">{t(remote.error, remote.errorVars)}</p>
          {remote.role === 'remote' && (
            <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost mt-2" onClick={retryJoin}>
              {t('Try again')}
            </button>
          )}
        </div>
      )}
      <button type="submit" className="tp-btn tp-btn-xl tp-btn-accent" disabled={!isValidRoomCode(cleaned) || busy}>
        {busy ? t('Connecting…') : t('Connect')}
      </button>
    </form>
  );
}

function NotConnected() {
  const t = useT();
  return (
    <div className="tp-panel mx-auto max-w-md text-center">
      <h1 className="text-3xl">{t('Not connected to a TV')}</h1>
      <p className="mt-2 tp-muted">{t('Connect to the TV first, then choose what this phone is for.')}</p>
      <button type="button" className="tp-btn tp-btn-accent mt-5" onClick={() => navigate('/join')}>
        {t('Connect to the TV')}
      </button>
    </div>
  );
}

/** Phone side: choose what this phone does. */
export function RemoteScreen() {
  const t = useT();
  const remote = useRemoteStatus();
  const state = useGameState();
  if (remote.role !== 'remote') return <NotConnected />;
  const teamName = (team: TeamIndex) => state?.config.teams[team].name ?? (team === 0 ? t('Team 1') : t('Team 2'));

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <p className="font-bold tp-muted">{t('Connected to TV {code}', { code: remote.code ? formatRoomCode(remote.code) : '' })}</p>
      <h1 className="text-4xl">{t('What is this phone for?')}</h1>
      {TEAMS.map((team) => (
        <button key={team} type="button" className={`tp-btn tp-btn-xl tp-team-${team}`} onClick={() => navigate('/buzzer', { team: String(team) })}>
          {t('Buzzer for {team}', { team: teamName(team) })}
        </button>
      ))}
      <button type="button" className="tp-btn tp-btn-xl tp-btn-ghost" onClick={() => navigate('/host')}>
        {t('Host controls')}
      </button>
      <button
        type="button"
        className="tp-btn tp-btn-sm tp-btn-bad self-center"
        onClick={() => {
          leaveRoom();
          navigate('/');
        }}
      >
        {t('Disconnect from the TV')}
      </button>
    </div>
  );
}

/** Phone side: one big button for one team. */
export function BuzzerScreen() {
  const t = useT();
  const remote = useRemoteStatus();
  const state = useGameState();
  const team: TeamIndex = getHashParam('team') === '1' ? 1 : 0;
  const [pressed, setPressed] = useState(false);

  const phase = state?.phase;
  const active = state?.active ?? null;
  const open = phase === 'clue' && !!active && !active.missed.includes(team);
  useEffect(() => {
    if (!open) setPressed(false);
  }, [open, active?.category, active?.tile]);

  if (remote.role !== 'remote') return <NotConnected />;
  const connected = remote.phase === 'connected';
  const name = state?.config.teams[team].name ?? (team === 0 ? t('Team 1') : t('Team 2'));
  const answering = active?.answering ?? null;

  let message: string;
  if (!connected) message = t('Reconnecting to the TV…');
  else if (!state) message = t('Waiting for the host to start a game.');
  else if (phase === 'answering' && answering === team) message = active && active.missed.length > 0 ? t('Your turn to answer!') : t('You buzzed first!');
  else if (phase === 'answering') message = t('The other team is answering');
  else if (open) message = pressed ? t('Buzzed!') : t('Buzz!');
  else if (phase === 'clue') message = t('You already tried this one');
  else message = t('Wait for the next clue');

  const buzz = () => {
    if (!open || !connected) return;
    setPressed(true);
    if (!sendBuzz(team)) setPressed(false);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-3">
        <p className="text-xl font-extrabold">{name}</p>
        <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost" onClick={() => navigate('/remote')}>
          {t('Switch')}
        </button>
      </header>
      <button
        type="button"
        className={`flex flex-1 items-center justify-center rounded-[2rem] text-[clamp(2.5rem,14vw,6rem)] font-extrabold transition-transform active:scale-[0.98] ${open && connected ? `tp-team-${team}` : 'bg-sea-800 text-sea-300'}`}
        disabled={!open || !connected}
        onPointerDown={buzz}
        onClick={buzz}
        aria-live="polite"
      >
        {message}
      </button>
      {state && (
        <p className="text-center text-lg font-semibold tp-muted" role="status">
          {state.config.teams[0].name} {state.scores[0].toLocaleString()} · {state.config.teams[1].name} {state.scores[1].toLocaleString()}
        </p>
      )}
    </main>
  );
}
