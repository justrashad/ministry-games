import { useEffect, useState, type FormEvent } from 'react';
import { BookOpen, Shuffle } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import { clearRemoteError, joinRoom, leaveRoom, retryJoin, useRemoteStatus } from '../../../core/sync/remote';
import { formatRoomCode, isValidRoomCode, normalizeRoomCode, ROOM_CODE_LENGTH } from '../../../core/sync/roomCode';
import { BoardView, formatSeconds, HelpChips, STAGE_NAMES, TEAMS, useSecondsLeft } from '../components/parts';
import { activeQuestion, canUseHelp, rungs } from '../engine/game';
import { getHashParam, navigate } from '../lib/router';
import { sendHelp, sendPick, useGameState } from '../sync/gameStore';
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
      <p className="sb-muted text-lg">{t("On the TV's game screen, choose Team phones. Scan the QR code, or type the code it shows.")}</p>
      <div>
        <label className="sb-label" htmlFor="room-code">
          {t('Room code')}
        </label>
        <input
          id="room-code"
          className="sb-input text-center text-3xl font-extrabold uppercase tracking-widest"
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
        <div className="rounded-xl border-2 border-sb-alert p-3 text-sb-alert" role="alert">
          <p className="font-semibold">{t(remote.error, remote.errorVars)}</p>
          {remote.role === 'remote' && (
            <button type="button" className="sb-btn sb-btn-sm sb-btn-ghost mt-2" onClick={retryJoin}>
              {t('Try again')}
            </button>
          )}
        </div>
      )}
      <button type="submit" className="sb-btn sb-btn-xl sb-btn-primary" disabled={!isValidRoomCode(cleaned) || busy}>
        {busy ? t('Connecting…') : t('Connect')}
      </button>
    </form>
  );
}

function NotConnected() {
  const t = useT();
  return (
    <div className="sb-panel mx-auto max-w-md text-center">
      <h1 className="text-3xl">{t('Not connected to a TV')}</h1>
      <p className="mt-2 sb-muted">{t('Connect to the TV first, then choose what this phone is for.')}</p>
      <button type="button" className="sb-btn sb-btn-primary mt-5" onClick={() => navigate('/join')}>
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
      <p className="font-bold sb-muted">{t('Connected to TV {code}', { code: remote.code ? formatRoomCode(remote.code) : '' })}</p>
      <h1 className="text-4xl">{t('What is this phone for?')}</h1>
      {TEAMS.map((team) => (
        <button key={team} type="button" className={`sb-btn sb-btn-xl sb-team-${team}`} onClick={() => navigate('/team', { team: String(team) })}>
          {t('Phone for {team}', { team: teamName(team) })}
        </button>
      ))}
      <button type="button" className="sb-btn sb-btn-xl sb-btn-ghost" onClick={() => navigate('/host')}>
        {t('Host controls')}
      </button>
      <button
        type="button"
        className="sb-btn sb-btn-sm sb-btn-danger self-center"
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

/** Phone side: one team's board and helps, live only on that team's turn. */
export function TeamPhoneScreen() {
  const t = useT();
  const remote = useRemoteStatus();
  const state = useGameState();
  const team: TeamIndex = getHashParam('team') === '1' ? 1 : 0;
  const [sent, setSent] = useState(false);
  const a = state?.active ?? null;
  const left = useSecondsLeft(a?.team === team ? a.lookupUntil : null);

  const myPick = state?.phase === 'pick' && state.turn === team;
  useEffect(() => setSent(false), [myPick, a?.stage, a?.slot, state?.phase]);

  if (remote.role !== 'remote') return <NotConnected />;
  const connected = remote.phase === 'connected';
  const name = state?.config.teams[team].name ?? (team === 0 ? t('Team 1') : t('Team 2'));
  const myQuestion = !!state && !!a && a.team === team && (state.phase === 'question' || state.phase === 'missed');
  const question = state ? activeQuestion(state) : null;

  let message: string;
  if (!connected) message = t('Reconnecting to the TV…');
  else if (!state) message = t('Waiting for the host to start a game.');
  else if (myPick) message = sent ? t('Sent to the TV') : t('Your turn: pick a subject');
  else if (myQuestion && a) message = t('{stage} · {subject}', { stage: t(STAGE_NAMES[a.stage]), subject: question?.category ?? '' });
  else if (state.phase === 'pick' || state.phase === 'question' || state.phase === 'missed') message = t('The other team is playing');
  else if (state.phase.startsWith('bonus')) message = t('Bonus question: write down your answer');
  else message = t('Look at the TV');

  const pick = (stage: number, slot: number) => {
    if (!myPick || !connected || sent) return;
    setSent(true);
    if (!sendPick(team, stage, slot)) setSent(false);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-3">
        <p className={`sb-team-${team} rounded-xl px-3 py-1.5 text-xl font-extrabold`}>{name}</p>
        <button type="button" className="sb-btn sb-btn-sm sb-btn-ghost" onClick={() => navigate('/remote')}>
          {t('Switch')}
        </button>
      </header>
      <p className="text-center text-2xl font-extrabold" aria-live="polite">
        {message}
      </p>
      {state && myPick && <BoardView board={state.boards[team]} size="md" onPick={connected && !sent ? pick : undefined} />}
      {state && myQuestion && a && (
        <div className="flex flex-1 flex-col gap-3">
          {left !== null && (
            <p className="sb-panel flex items-center gap-3 text-xl font-bold" role="timer">
              <BookOpen aria-hidden className="h-6 w-6 text-sb-accent" />
              {question?.reference ? t('Look up {reference}', { reference: question.reference }) : t('Search the Scriptures')} · {left > 0 ? formatSeconds(left) : t("Time's up")}
            </p>
          )}
          <button type="button" className="sb-btn sb-btn-xl sb-btn-teal min-h-[5.5rem]" disabled={!connected || !canUseHelp(state, 'lookup')} onClick={() => sendHelp(team, 'lookup')}>
            <BookOpen aria-hidden className="h-7 w-7" />
            {t('Search the Scriptures')}
          </button>
          <button type="button" className="sb-btn sb-btn-xl sb-btn-teal min-h-[5.5rem]" disabled={!connected || !canUseHelp(state, 'swap')} onClick={() => sendHelp(team, 'swap')}>
            <Shuffle aria-hidden className="h-7 w-7" />
            {t('Swap')}
          </button>
          <p className="text-center sb-muted">{t('Say your answer to the host. The host uses Second Try for you after a miss.')}</p>
        </div>
      )}
      {state && (
        <div className="mt-auto flex flex-col items-center gap-2">
          <HelpChips state={state} team={team} />
          <p className="text-center text-lg font-semibold sb-muted" role="status">
            {t('Rungs climbed: {a} {ra}, {b} {rb}', { a: state.config.teams[0].name, ra: rungs(state, 0), b: state.config.teams[1].name, rb: rungs(state, 1) })}
          </p>
        </div>
      )}
    </main>
  );
}
