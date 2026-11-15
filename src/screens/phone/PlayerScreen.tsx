import { useEffect, useState, type ReactNode } from 'react';
import { CheckCircle2, EyeOff, Hourglass } from 'lucide-react';
import type { PlayerIndex } from '../../types';
import { useGameState } from '../../sync/gameStore';
import { sendRemoteAction } from '../../sync/gameStore';
import { TimerDisplay } from '../../components/game/TimerDisplay';
import { FcAnswerInput } from '../final/FcAnswerInput';
import { PhoneFrame } from './PhoneFrame';
import { useT } from '../../i18n/i18n';

const SEAT_KEY = 'survey-showdown:player-seat';

function savedSeat(): PlayerIndex | null {
  try {
    const v = window.sessionStorage.getItem(SEAT_KEY);
    return v === '0' ? 0 : v === '1' ? 1 : null;
  } catch {
    return null;
  }
}

/**
 * A Final Challenge player's own phone. It shows questions only during that
 * player's turn and never shows the other player's answers.
 */
export function PlayerScreen() {
  const t = useT();
  const state = useGameState();
  const [seat, setSeat] = useState<PlayerIndex | null>(savedSeat);
  const [sendError, setSendError] = useState(false);

  useEffect(() => {
    document.title = `${t('Final Challenge player')} | Ministry Showdown`;
  }, [t]);

  const choose = (s: PlayerIndex | null) => {
    setSeat(s);
    try {
      if (s === null) window.sessionStorage.removeItem(SEAT_KEY);
      else window.sessionStorage.setItem(SEAT_KEY, String(s));
    } catch {
      /* ignore */
    }
  };

  const fc = state?.phase === 'finalChallenge' ? state.finalChallenge : null;

  if (!fc || fc.phase === 'setup') {
    return (
      <PhoneFrame title={t('Final Challenge')}>
        <div className="m-auto max-w-xs space-y-3 text-center">
          <Hourglass className="mx-auto h-10 w-10 text-gold-300" aria-hidden />
          <p className="text-lg text-night-100">{t('Waiting for the Final Challenge to begin. Keep this phone handy.')}</p>
          {seat !== null && <p className="text-sm text-night-200">{t("You're set as Player {n}.", { n: seat + 1 })}</p>}
        </div>
      </PhoneFrame>
    );
  }

  if (seat === null) {
    return (
      <PhoneFrame title={t('Final Challenge')}>
        <div className="m-auto w-full max-w-sm space-y-3">
          <h1 className="mb-4 text-center text-2xl font-semibold">{t('Who is using this phone?')}</h1>
          {([0, 1] as const).map((p) => (
            <button key={p} type="button" className="btn btn-gold btn-xl w-full" onClick={() => choose(p)}>
              {fc.players[p]} ({t('Player {n}', { n: p + 1 })})
            </button>
          ))}
        </div>
      </PhoneFrame>
    );
  }

  const myName = fc.players[seat];
  const myTurn = fc.activePlayer === seat;
  const otherName = fc.players[seat === 0 ? 1 : 0];
  const answered = fc.responses[seat].filter((r) => r.answered).length;

  let body;
  if (fc.phase === 'answering' && myTurn && fc.current !== null) {
    const q = fc.current;
    body = (
      <div className="flex flex-1 flex-col gap-5 py-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-night-200">
            {t('Question {n} of {total}', { n: q + 1, total: fc.questions.length })}
          </p>
          <TimerDisplay timer={state!.timer} size="compact" />
        </div>
        <h1 className="text-balance font-display text-3xl font-semibold leading-tight text-cream" key={fc.questions[q].id}>
          {fc.questions[q].question}
        </h1>
        <FcAnswerInput
          questionKey={`${seat}-${q}`}
          onSubmit={(text) => {
            const ok = sendRemoteAction({ type: 'FC_SUBMIT', text, player: seat, question: q });
            setSendError(!ok);
          }}
        />
        {sendError && <p className="text-sm font-bold text-rose-300">{t("That answer didn't send. Check the connection and try again.")}</p>}
        <p className="text-sm text-night-200">{t('Say "pass" to the host to skip and come back to a question.')}</p>
      </div>
    );
  } else if (fc.phase === 'ready' && myTurn) {
    body = (
      <Centered icon={<Hourglass className="h-10 w-10 text-gold-300" aria-hidden />} title={t("You're up, {name}!", { name: myName })}>
        {t("The host will start your clock. You'll have {s} seconds for {n} questions.", { s: fc.seconds[seat], n: fc.questions.length })}
      </Centered>
    );
  } else if ((fc.phase === 'ready' || fc.phase === 'answering') && !myTurn) {
    body = (
      <Centered icon={<EyeOff className="h-10 w-10 text-gold-300" aria-hidden />} title={t("{name}'s turn", { name: otherName })}>
        {seat === 1 ? t('No peeking! Stay out of earshot until the host calls you back.') : t('You finished. Stay quiet so you don’t give anything away.')}
      </Centered>
    );
  } else if (fc.phase === 'handoff') {
    body =
      seat === 0 ? (
        <Centered icon={<CheckCircle2 className="h-10 w-10 text-emerald-300" aria-hidden />} title={t('All done!')}>
          {t('You answered {n} of {total}. Your answers stay hidden until the reveal.', { n: answered, total: fc.questions.length })}
        </Centered>
      ) : (
        <Centered icon={<Hourglass className="h-10 w-10 text-gold-300" aria-hidden />} title={t('Almost your turn')}>
          {t('Head back to the TV. The host will start your clock.')}
        </Centered>
      );
  } else {
    body = (
      <Centered icon={<CheckCircle2 className="h-10 w-10 text-emerald-300" aria-hidden />} title={t('Watch the TV!')}>
        {t('The answers are being revealed on the big screen.')}
      </Centered>
    );
  }

  return (
    <PhoneFrame title={`${myName} (${t('Player {n}', { n: seat + 1 })})`}>
      {body}
      {fc.phase === 'ready' || fc.phase === 'handoff' ? (
        <button type="button" className="btn btn-subtle btn-sm self-center" onClick={() => choose(null)}>
          {t('Not {name}? Change player', { name: myName })}
        </button>
      ) : null}
    </PhoneFrame>
  );
}

function Centered({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="m-auto max-w-xs space-y-3 text-center">
      <div className="flex justify-center">{icon}</div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-night-100">{children}</p>
    </div>
  );
}
