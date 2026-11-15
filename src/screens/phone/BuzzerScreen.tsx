import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { TeamIndex } from '../../types';
import { TEAM_COLORS } from '../../engine/defaults';
import { buzzersOpen } from '../../engine/game';
import { useGameState } from '../../sync/gameStore';
import { sendRemoteAction } from '../../sync/gameStore';
import { PhoneFrame } from './PhoneFrame';
import { useT } from '../../i18n/i18n';

const TEAM_KEY = 'survey-showdown:buzzer-team';

function savedTeam(): TeamIndex | null {
  try {
    const v = window.sessionStorage.getItem(TEAM_KEY);
    return v === '0' ? 0 : v === '1' ? 1 : null;
  } catch {
    return null;
  }
}

/** A team captain's phone: one giant button that lights up when the buzzers are open. */
export function BuzzerScreen() {
  const t = useT();
  const state = useGameState();
  const [team, setTeam] = useState<TeamIndex | null>(savedTeam);
  const [pressed, setPressed] = useState(false);
  const lastSeq = useRef<number | null>(null);

  useEffect(() => {
    document.title = `${t('Team buzzer')} | Ministry Showdown`;
  }, [t]);

  // Clear the "sent" state whenever the round moves on.
  const seq = state?.event.seq ?? 0;
  useEffect(() => {
    if (lastSeq.current !== null && state?.event.kind === 'buzz' && state.event.team === team && navigator.vibrate) navigator.vibrate([60, 40, 120]);
    if (state?.event.kind !== 'buzz') setPressed(false);
    lastSeq.current = seq;
  }, [seq, state?.event.kind, state?.event.team, team]);

  const choose = (t: TeamIndex | null) => {
    setTeam(t);
    try {
      if (t === null) window.sessionStorage.removeItem(TEAM_KEY);
      else window.sessionStorage.setItem(TEAM_KEY, String(t));
    } catch {
      /* ignore */
    }
  };

  if (!state) {
    return (
      <PhoneFrame title={t('Team buzzer')}>
        <p className="m-auto max-w-xs text-center text-lg text-night-100">{t('Waiting for the host to start a game.')}</p>
      </PhoneFrame>
    );
  }

  if (team === null) {
    return (
      <PhoneFrame title={t('Team buzzer')}>
        <div className="m-auto w-full max-w-sm space-y-3">
          <h1 className="mb-4 text-center text-2xl font-semibold">{t('Which team are you buzzing for?')}</h1>
          {([0, 1] as const).map((t) => {
            const c = TEAM_COLORS[state.teams[t].color];
            return (
              <button key={t} type="button" className="btn btn-xl w-full" style={{ background: c.hex, color: c.ink }} onClick={() => choose(t)}>
                {state.teams[t].name}
              </button>
            );
          })}
        </div>
      </PhoneFrame>
    );
  }

  const me = state.teams[team];
  const color = TEAM_COLORS[me.color];
  const round = state.round;
  const open = buzzersOpen(state);
  const winner = round?.faceoff?.team ?? null;
  const control = round?.controllingTeam ?? null;

  let message = t('Wait for the next question');
  if (state.phase === 'roundIntro') message = t('Get ready. The question is coming up.');
  if (open) message = pressed ? t('Sent!') : t('Buzz now!');
  else if (state.phase === 'playing' || state.phase === 'steal') {
    if (winner === team) message = t('You buzzed first!');
    else if (winner !== null) message = t('{name} was faster', { name: state.teams[winner].name });
    else if (control === team) message = t('Your team is playing');
    else if (control !== null) message = t('{name} is playing', { name: state.teams[control].name });
  }
  if (state.phase === 'gameOver' || state.phase === 'finalChallenge') message = t('Buzzers are off for now');

  const buzz = () => {
    if (!open || pressed) return;
    setPressed(true);
    if (navigator.vibrate) navigator.vibrate(30);
    if (!sendRemoteAction({ type: 'BUZZ', team })) setPressed(false);
  };

  return (
    <PhoneFrame title={me.name} accent={color.hex}>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        <p className="text-center font-display text-2xl font-semibold text-cream" role="status" aria-live="assertive">
          {message}
        </p>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            buzz();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              buzz();
            }
          }}
          disabled={!open}
          aria-label={open ? t('Buzz for {name}', { name: me.name }) : t('Buzzer is not open yet')}
          className="grid aspect-square w-[min(78vw,22rem)] select-none place-items-center rounded-full font-display text-5xl font-bold uppercase transition-transform active:scale-95 disabled:cursor-not-allowed"
          style={
            {
              background: open ? `radial-gradient(circle at 35% 30%, #fff7e6 0%, ${color.hex} 42%)` : '#241b6e',
              color: open ? color.ink : '#8279e6',
              boxShadow: open ? `0 0 0 10px ${color.hex}55, 0 0 60px ${color.hex}` : 'inset 0 0 0 6px #32268f',
              touchAction: 'manipulation',
            } as CSSProperties
          }
        >
          {open ? t('Buzz') : winner === team ? t('First!') : t('Wait')}
        </button>
        <button type="button" className="btn btn-subtle btn-sm" onClick={() => choose(null)}>
          {t('Change team')}
        </button>
      </div>
    </PhoneFrame>
  );
}
