import { useEffect, useState, type ReactNode } from 'react';
import { EyeOff, Trophy } from 'lucide-react';
import type { FinalChallengeState, GameState, PlayerIndex } from '../../types';
import { fcCellPoints, fcCellRevealed, fcPlayerTotal, fcTotal } from '../../engine/finalChallenge';
import { dispatchGame } from '../../sync/gameStore';
import { useCountUp } from '../../../../core/hooks/useCountUp';
import { TimerDisplay } from '../../components/game/TimerDisplay';
import { FcAnswerInput } from './FcAnswerInput';
import { useT } from '../../../../core/i18n/i18n';

interface Props {
  state: GameState;
  fc: FinalChallengeState;
  reduced: boolean;
}

function Title() {
  const t = useT();
  return (
    <p className="font-display text-[clamp(1.2rem,2.6vw,2.6rem)] font-bold text-gold-300" style={{ textShadow: '0 3px 0 #3c2fa6' }}>
      {t('Final Challenge')}
    </p>
  );
}

export function FinalChallengeDisplay({ state, fc, reduced }: Props) {
  return <FinalChallengeView state={state} fc={fc} reduced={reduced} />;
}

function FinalChallengeView({ state, fc, reduced }: Props) {
  const t = useT();
  switch (fc.phase) {
    case 'setup':
      return (
        <Center>
          <Title />
          <p className="pop-in font-display text-[clamp(2.4rem,6vw,6rem)] font-bold text-cream">{t('Choose two players')}</p>
          <p className="text-[clamp(1rem,1.8vw,1.8rem)] text-night-200">
            {fc.team !== null ? `${t('{name} is up.', { name: state.teams[fc.team].name })} ` : ''}
            {t('{n} quick questions, one answer each. Try to reach {target} points together.', { n: fc.questions.length, target: fc.targetScore })}
          </p>
        </Center>
      );
    case 'ready':
      return (
        <Center>
          <Title />
          {fc.activePlayer === 1 && <p className="font-display text-[clamp(1.2rem,2.4vw,2.4rem)] text-cream">{t("Now it's Player 2's turn")}</p>}
          <p className="pop-in font-display text-[clamp(3rem,10vw,10rem)] font-bold leading-none text-cream" key={fc.activePlayer}>
            {fc.players[fc.activePlayer]}
          </p>
          <p className="max-w-3xl text-[clamp(1rem,1.9vw,1.9rem)] text-night-100">
            {fc.activePlayer === 0
              ? t('{n} questions, {s} seconds. Answer quickly; say "pass" to come back to one later.', { n: fc.questions.length, s: fc.seconds[0] })
              : t('Try to match the most popular answers. You will get the same {n} questions and {s} seconds.', { n: fc.questions.length, s: fc.seconds[1] })}
          </p>
          <p className="text-[clamp(0.9rem,1.4vw,1.4rem)] text-night-200">{t('The host will start the clock.')}</p>
        </Center>
      );
    case 'answering':
      return <Answering fc={fc} state={state} />;
    case 'handoff':
      return (
        <Center>
          <Title />
          <EyeOff aria-hidden className="h-[clamp(3rem,7vw,7rem)] w-[clamp(3rem,7vw,7rem)] text-gold-300" />
          <p className="pop-in font-display text-[clamp(2.2rem,6vw,6rem)] font-bold text-cream">{t('{name} is done!', { name: fc.players[0] })}</p>
          <p className="max-w-3xl text-[clamp(1rem,2vw,2rem)] text-night-100">
            {t('Their answers are hidden. Please make sure {name} did not see or hear them, then bring {name} to the screen.', { name: fc.players[1] })}
          </p>
        </Center>
      );
    case 'review':
      return (
        <Center>
          <Title />
          <p className="pop-in font-display text-[clamp(2.2rem,5vw,5rem)] font-bold text-cream">{t('Checking the answers')}</p>
          <p className="text-[clamp(1rem,1.8vw,1.8rem)] text-night-200">{t('The host is matching answers to the board.')}</p>
        </Center>
      );
    case 'reveal':
    case 'complete':
      return <RevealBoard fc={fc} reduced={reduced} />;
    default:
      return null;
  }
}

function Center({ children }: { children: ReactNode }) {
  return <div className="flex h-full min-h-[100dvh] flex-col items-center justify-center gap-[3vh] p-8 text-center">{children}</div>;
}

function Answering({ fc, state }: { fc: FinalChallengeState; state: GameState }) {
  const t = useT();
  const q = fc.current;
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (fc.repeatSeq === 0) return;
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 950);
    return () => window.clearTimeout(id);
  }, [fc.repeatSeq]);
  if (q === null) return null;
  const answeredCount = fc.responses[fc.activePlayer].filter((r) => r.answered).length;
  const question = fc.questions[q];
  return (
    <div className="grid h-full min-h-[100dvh] grid-rows-[auto_1fr_auto] gap-[2vh] p-[clamp(1rem,3vh,2.5rem)]">
      <header className="flex items-center justify-between gap-4">
        <Title />
        <p className="font-display text-[clamp(1.6rem,4vw,4rem)] font-bold text-cream">{fc.players[fc.activePlayer]}</p>
      </header>
      <div className="flex flex-col items-center justify-center gap-[3vh] text-center">
        <p className="font-display text-[clamp(1rem,1.8vw,1.8rem)] font-semibold text-night-200">
          {t('Question {n} of {total}', { n: q + 1, total: fc.questions.length })}
        </p>
        <div className="flex gap-2" aria-label={t('{n} of {total} answered', { n: answeredCount, total: fc.questions.length })}>
          {fc.questions.map((_, i) => {
            const answered = fc.responses[fc.activePlayer][i]?.answered;
            return <span key={i} className={`h-[clamp(0.7rem,1.2vw,1.1rem)] w-[clamp(2rem,4vw,4rem)] rounded-full ${i === q ? 'bg-gold-300' : answered ? 'bg-emerald-400' : 'bg-night-700'}`} aria-hidden />;
          })}
        </div>
        <h1 className={`max-w-5xl text-balance rounded-3xl px-6 py-4 font-display text-[clamp(1.8rem,4.4vw,4.6rem)] font-semibold leading-tight text-cream ${flash ? 'flash-question' : ''}`} key={question.id}>
          {question.question}
        </h1>
        <div className="w-full max-w-3xl">
          <FcAnswerInput questionKey={`${fc.activePlayer}-${q}`} size="tv" autoFocus={false} onSubmit={(text) => dispatchGame({ type: 'FC_SUBMIT', text, now: Date.now() })} />
        </div>
      </div>
      <footer className="flex justify-center">
        <TimerDisplay timer={state.timer} size="hero" />
      </footer>
    </div>
  );
}

function RevealBoard({ fc, reduced }: { fc: FinalChallengeState; reduced: boolean }) {
  const t = useT();
  const revealedTotal = fcTotal(fc, true);
  const shownTotal = useCountUp(revealedTotal, reduced, 900);
  const p1 = useCountUp(fcPlayerTotal(fc, 0, true), reduced);
  const p2 = useCountUp(fcPlayerTotal(fc, 1, true), reduced);
  const complete = fc.phase === 'complete';
  const reached = complete && fcTotal(fc) >= fc.targetScore;
  const progress = Math.min(1, revealedTotal / Math.max(1, fc.targetScore));

  return (
    <div className="grid h-full min-h-[100dvh] grid-rows-[auto_1fr_auto] gap-[2vh] p-[clamp(1rem,3vh,2.5rem)]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Title />
        <p className="font-display text-[clamp(1rem,1.8vw,1.8rem)] text-night-200">
          {t('Target:')} <span className="font-bold text-gold-300">{fc.targetScore}</span>
        </p>
      </header>

      <div className="marquee overflow-auto">
        <table className="w-full border-separate border-spacing-[clamp(0.3rem,0.6vw,0.6rem)] text-left">
          <caption className="sr-only">{t('Final Challenge answers and points')}</caption>
          <thead>
            <tr className="font-display text-[clamp(1rem,2vw,2.2rem)] text-cream">
              <th scope="col" className="w-[4ch] text-center text-night-200">
                <span className="sr-only">{t('Question')}</span>#
              </th>
              <th scope="col">{fc.players[0]}</th>
              <th scope="col">{fc.players[1]}</th>
            </tr>
          </thead>
          <tbody>
            {fc.questions.map((q, i) => (
              <tr key={q.id}>
                <th scope="row" className="text-center font-display text-[clamp(1rem,2vw,2rem)] text-gold-300">
                  {i + 1}
                </th>
                <Cell fc={fc} q={i} p={0} />
                <Cell fc={fc} q={i} p={1} />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-display text-[clamp(1.2rem,2.6vw,2.8rem)] font-bold text-gold-300">
              <th scope="row" className="text-center text-night-200">
                <span className="sr-only">{t('Totals')}</span>=
              </th>
              <td className="px-3 tabular-nums">{p1}</td>
              <td className="px-3 tabular-nums">{p2}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <footer className="flex flex-col items-center gap-3 text-center">
        <div className="h-4 w-full max-w-4xl overflow-hidden rounded-full bg-night-950 ring-1 ring-inset ring-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={fc.targetScore} aria-valuenow={revealedTotal} aria-label={t('Progress toward target')}>
          <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-200 transition-[width] duration-700" style={{ width: `${progress * 100}%` }} />
        </div>
        {complete ? (
          reached ? (
            <div className="pop-in flex items-center gap-4">
              <Trophy aria-hidden className="h-[clamp(2.4rem,5vw,5rem)] w-[clamp(2.4rem,5vw,5rem)] text-gold-300" />
              <p className="font-display text-[clamp(2rem,5vw,5rem)] font-bold text-gold-300">{t('Target reached! {n} points', { n: shownTotal })}</p>
            </div>
          ) : (
            <p className="pop-in font-display text-[clamp(2rem,5vw,5rem)] font-bold text-cream">{t('Great job! Final score {n} points', { n: shownTotal })}</p>
          )
        ) : (
          <p className="font-display text-[clamp(1.6rem,4vw,4rem)] font-bold text-cream">
            <span className="tabular-nums">{shownTotal}</span> <span className="text-night-200">/ {fc.targetScore}</span>
          </p>
        )}
      </footer>
    </div>
  );
}

function Cell({ fc, q, p }: { fc: FinalChallengeState; q: number; p: PlayerIndex }) {
  const t = useT();
  const revealed = fcCellRevealed(fc, q, p);
  const response = fc.responses[p][q];
  const points = fcCellPoints(fc, q, p);
  return (
    <td className="p-0" aria-label={revealed ? `${response.text || t('No answer')}, ${t('{n} points', { n: points })}` : t('Hidden')}>
      <div className={`answer-card h-[clamp(2.6rem,8.5vh,6rem)] ${revealed ? 'is-revealed' : ''}`}>
        <div className="answer-inner">
          <div className="answer-face answer-front" aria-hidden />
          <div className="answer-face answer-back" aria-hidden>
            <span className="answer-text !text-[clamp(0.9rem,1.8vw,2rem)]">{response.text || t('No answer')}</span>
            <span className={`answer-points ${points === 0 ? 'is-zero' : ''}`}>{points}</span>
          </div>
        </div>
      </div>
    </td>
  );
}
