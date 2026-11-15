import { useEffect, useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import { clearRemoteError, joinRoom, leaveRoom, retryJoin, useRemoteStatus } from '../../../core/sync/remote';
import { formatRoomCode, isValidRoomCode, normalizeRoomCode, ROOM_CODE_LENGTH } from '../../../core/sync/roomCode';
import { TeamMark, TEAMS } from '../components/parts';
import { getHashParam, navigate } from '../lib/router';
import { sendCall, useGameState } from '../sync/gameStore';
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
      <p className="ks-muted text-lg">{t("On the TV's game screen, choose Team phones. Scan the QR code, or type the code it shows.")}</p>
      <div>
        <label className="ks-label" htmlFor="room-code">
          {t('Room code')}
        </label>
        <input
          id="room-code"
          className="ks-input text-center text-3xl font-extrabold uppercase tracking-widest"
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
        <div className="rounded-xl border-2 border-ks-alert p-3 text-ks-alert" role="alert">
          <p className="font-semibold">{t(remote.error, remote.errorVars)}</p>
          {remote.role === 'remote' && (
            <button type="button" className="ks-btn ks-btn-sm ks-btn-ghost mt-2" onClick={retryJoin}>
              {t('Try again')}
            </button>
          )}
        </div>
      )}
      <button type="submit" className="ks-btn ks-btn-xl ks-btn-primary" disabled={!isValidRoomCode(cleaned) || busy}>
        {busy ? t('Connecting…') : t('Connect')}
      </button>
    </form>
  );
}

function NotConnected() {
  const t = useT();
  return (
    <div className="ks-panel mx-auto max-w-md text-center">
      <h1 className="text-3xl">{t('Not connected to a TV')}</h1>
      <p className="mt-2 ks-muted">{t('Connect to the TV first, then choose what this phone is for.')}</p>
      <button type="button" className="ks-btn ks-btn-primary mt-5" onClick={() => navigate('/join')}>
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
      <p className="font-bold ks-muted">{t('Connected to TV {code}', { code: remote.code ? formatRoomCode(remote.code) : '' })}</p>
      <h1 className="text-4xl">{t('What is this phone for?')}</h1>
      {TEAMS.map((team) => (
        <button key={team} type="button" className={`ks-btn ks-btn-xl ks-team-${team}`} onClick={() => navigate('/team', { team: String(team) })}>
          <TeamMark team={team} className="h-8 w-8" />
          {t('Phone for {team}', { team: teamName(team) })}
        </button>
      ))}
      <button type="button" className="ks-btn ks-btn-xl ks-btn-ghost" onClick={() => navigate('/host')}>
        {t('Host controls')}
      </button>
      <button
        type="button"
        className="ks-btn ks-btn-sm ks-btn-danger self-center"
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

/** Phone side: one team's True and False buttons, live only on that team's turn. */
export function TeamPhoneScreen() {
  const t = useT();
  const remote = useRemoteStatus();
  const state = useGameState();
  const team: TeamIndex = getHashParam('team') === '1' ? 1 : 0;
  const [sent, setSent] = useState<boolean | null>(null);

  const phase = state?.phase;
  const square = state?.active?.square ?? null;
  const myCall = phase === 'question' && state?.turn === team && square !== null;
  useEffect(() => {
    if (!myCall) setSent(null);
  }, [myCall, square]);

  if (remote.role !== 'remote') return <NotConnected />;
  const connected = remote.phase === 'connected';
  const name = state?.config.teams[team].name ?? (team === 0 ? t('Team 1') : t('Team 2'));
  const live = myCall && connected && sent === null;

  let message: string;
  if (!connected) message = t('Reconnecting to the TV…');
  else if (!state) message = t('Waiting for the host to start a game.');
  else if (myCall && sent !== null) message = sent ? t('You called it true') : t('You called it false');
  else if (myCall) message = t('Square {n}: true or false?', { n: (square ?? 0) + 1 });
  else if (phase === 'pick' && state.turn === team) message = t('Your turn: pick a square');
  else if (phase === 'question' || phase === 'pick') message = t('The other team is playing');
  else if (phase === 'reveal') message = t('Look at the TV');
  else message = t('Wait for the host');

  const call = (answer: boolean) => {
    if (!live || square === null) return;
    setSent(answer);
    if (!sendCall(team, answer, square)) setSent(null);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-3">
        <p className={`ks-team-${team} flex items-center gap-2 rounded-xl px-3 py-1.5 text-xl font-extrabold`}>
          <TeamMark team={team} className="h-6 w-6" />
          {name}
        </p>
        <button type="button" className="ks-btn ks-btn-sm ks-btn-ghost" onClick={() => navigate('/remote')}>
          {t('Switch')}
        </button>
      </header>
      <p className="text-center text-2xl font-extrabold" aria-live="polite">
        {message}
      </p>
      <div className="grid flex-1 grid-rows-2 gap-4">
        <button
          type="button"
          className={`flex items-center justify-center gap-3 rounded-[2rem] text-[clamp(2.2rem,12vw,5rem)] font-extrabold transition-transform active:scale-[0.98] ${live || sent === true ? 'ks-btn-primary' : 'bg-ks-sunk text-ks-muted'}`}
          disabled={!live}
          onClick={() => call(true)}
        >
          <Check aria-hidden className="h-[1em] w-[1em]" />
          {t('True')}
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-3 rounded-[2rem] text-[clamp(2.2rem,12vw,5rem)] font-extrabold transition-transform active:scale-[0.98] ${live || sent === false ? 'ks-btn-red' : 'bg-ks-sunk text-ks-muted'}`}
          disabled={!live}
          onClick={() => call(false)}
        >
          <X aria-hidden className="h-[1em] w-[1em]" />
          {t('False')}
        </button>
      </div>
      {state && (
        <p className="text-center text-lg font-semibold ks-muted" role="status">
          {t('Games won: {a} {wa}, {b} {wb}', { a: state.config.teams[0].name, wa: state.wins[0], b: state.config.teams[1].name, wb: state.wins[1] })}
        </p>
      )}
    </main>
  );
}
