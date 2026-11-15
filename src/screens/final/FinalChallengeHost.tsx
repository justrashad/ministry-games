import { t } from '../../i18n/i18n';
import { useState } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, FastForward, Pause, Play, Plus, Repeat, RotateCcw, SkipForward, Sparkles, Square, Trophy, Wand2 } from 'lucide-react';
import type { FinalChallengeState, GameState, PlayerIndex } from '../../types';
import { LIMITS } from '../../engine/defaults';
import { fcCellPoints, fcCellRevealed, fcPlayerTotal, fcTotal, fcTotalCells } from '../../engine/finalChallenge';
import { isTimerRunning } from '../../engine/timer';
import { dispatchGame } from '../../sync/gameStore';
import { Button } from '../../components/ui/Button';
import { useConfirm } from '../../components/ui/Confirm';
import { TimerDisplay } from '../../components/game/TimerDisplay';
import { FcAnswerInput } from './FcAnswerInput';

const now = () => Date.now();

interface Props {
  state: GameState;
  fc: FinalChallengeState;
}

export function FinalChallengeHost({ state, fc }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        {fc.phase === 'setup' && <SetupPanel state={state} fc={fc} />}
        {fc.phase === 'ready' && <ReadyPanel fc={fc} />}
        {fc.phase === 'answering' && <AnsweringPanel state={state} fc={fc} />}
        {fc.phase === 'handoff' && <HandoffPanel fc={fc} />}
        {(fc.phase === 'review' || fc.phase === 'reveal' || fc.phase === 'complete') && <ReviewPanel fc={fc} />}
      </div>
      <div className="space-y-4">
        <StatusPanel fc={fc} />
        <ChallengeControls fc={fc} />
      </div>
    </div>
  );
}

function SetupPanel({ state, fc }: Props) {
  const [p1, setP1] = useState(fc.players[0]);
  const [p2, setP2] = useState(fc.players[1]);
  const team = fc.team !== null ? state.teams[fc.team] : null;
  return (
    <section className="panel">
      <h2 className="panel-title">
        <Sparkles className="h-5 w-5 text-gold-300" aria-hidden /> {t('Final Challenge: choose two players')}
      </h2>
      <p className="mb-4 text-night-100">
        {team ? `${t('Pick two players from {name}.', { name: team.name })} ` : `${t('The game ended in a tie, so pick any two players.')} `}
        {t('Player 2 should leave the room or cover their ears while Player 1 answers.')}
      </p>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          dispatchGame({ type: 'FC_START', players: [p1, p2] });
        }}
      >
        <div>
          <label className="field-label" htmlFor="fc-p1">
            {t('Player 1')}
          </label>
          <input id="fc-p1" className="input" value={p1} maxLength={LIMITS.playerName} placeholder={t('Player 1')} onChange={(e) => setP1(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="field-label" htmlFor="fc-p2">
            {t('Player 2')}
          </label>
          <input id="fc-p2" className="input" value={p2} maxLength={LIMITS.playerName} placeholder={t('Player 2')} onChange={(e) => setP2(e.target.value)} />
        </div>
        <Button type="submit" variant="gold" size="xl" icon={Play} className="sm:col-span-2">
          {t('Start')}
        </Button>
      </form>
    </section>
  );
}

function ReadyPanel({ fc }: { fc: FinalChallengeState }) {
  const player = fc.players[fc.activePlayer];
  return (
    <section className="panel">
      <h2 className="panel-title">{fc.activePlayer === 0 ? t('Player 1 is up') : t("Now it's Player 2's turn")}</h2>
      <p className="mb-4 text-night-100">
        {t('{name} will get {n} questions and {s} seconds. Read each question aloud, type the answer they say, and press Enter. If they say “pass,” tap Pass to come back to it later.', { name: player, n: fc.questions.length, s: fc.seconds[fc.activePlayer] })}
      </p>
      <p className="mb-4 rounded-xl bg-night-950/50 p-3 text-sm text-night-100">
        {t('Players can also type their own answers: connect their phone to the TV and choose Final Challenge player. Answers typed here and on their phone both work.')}
      </p>
      <Button variant="gold" size="xl" block icon={Play} onClick={() => dispatchGame({ type: 'FC_BEGIN_TURN', now: now() })}>
        {t("Start {name}'s clock", { name: player })}
      </Button>
    </section>
  );
}

function AnsweringPanel({ state, fc }: Props) {
  const q = fc.current;
  const running = isTimerRunning(state.timer);
  const [showPrevious, setShowPrevious] = useState(false);
  if (q === null) return null;
  const question = fc.questions[q];
  const mine = fc.responses[fc.activePlayer];
  return (
    <section className="panel" aria-live="polite">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title !mb-0">
          {fc.players[fc.activePlayer]}: question {q + 1} of {fc.questions.length}
        </h2>
        <TimerDisplay timer={state.timer} size="compact" />
      </div>
      <p className="mb-4 font-display text-2xl text-cream">{question.question}</p>
      <FcAnswerInput questionKey={`${fc.activePlayer}-${q}`} onSubmit={(text) => dispatchGame({ type: 'FC_SUBMIT', text, now: now() })} />
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button variant="ghost" icon={SkipForward} disabled={fc.pending.length < 2} onClick={() => dispatchGame({ type: 'FC_SKIP' })}>
          {t('Pass')}
        </Button>
        <Button variant="ghost" icon={Repeat} onClick={() => dispatchGame({ type: 'FC_REPEAT' })}>
          {t('Repeat')}
        </Button>
        <Button variant="ghost" icon={running ? Pause : Play} onClick={() => dispatchGame(running ? { type: 'TIMER_PAUSE', now: now() } : { type: 'TIMER_START', now: now() })}>
          {running ? 'Pause' : 'Resume'}
        </Button>
        <Button variant="ghost" icon={Plus} onClick={() => dispatchGame({ type: 'TIMER_ADD', seconds: 5, now: now() })}>
          {t('5 seconds')}
        </Button>
      </div>
      <div className="mt-4 border-t border-white/10 pt-3">
        <button type="button" className="flex items-center gap-2 text-sm font-bold text-night-200 hover:text-cream" aria-expanded={showPrevious} onClick={() => setShowPrevious((v) => !v)}>
          {showPrevious ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          {showPrevious ? 'Hide' : 'Show'} this player&apos;s answers so far ({mine.filter((r) => r.answered).length})
        </button>
        {showPrevious && (
          <ol className="mt-2 space-y-1 text-sm">
            {fc.questions.map((qq, i) =>
              mine[i]?.answered ? (
                <li key={qq.id} className="text-night-100">
                  <b>{i + 1}.</b> {mine[i].text}
                </li>
              ) : null,
            )}
          </ol>
        )}
      </div>
    </section>
  );
}

function HandoffPanel({ fc }: { fc: FinalChallengeState }) {
  return (
    <section className="panel">
      <h2 className="panel-title">
        <EyeOff className="h-5 w-5 text-gold-300" aria-hidden /> {t('{name} is complete', { name: fc.players[0] })}
      </h2>
      <p className="mb-4 text-night-100">
        {fc.players[0]}&apos;s answers are hidden on the TV. Make sure {fc.players[1]} didn&apos;t see or hear them, then bring {fc.players[1]} back.
      </p>
      <Button variant="gold" size="xl" block icon={FastForward} onClick={() => dispatchGame({ type: 'FC_READY_NEXT' })}>
        {t('Ready for {name}', { name: fc.players[1] })}
      </Button>
    </section>
  );
}

function MatchSelect({ fc, q, p }: { fc: FinalChallengeState; q: number; p: PlayerIndex }) {
  const response = fc.responses[p][q];
  const question = fc.questions[q];
  const points = fcCellPoints(fc, q, p);
  const editable = fc.phase === 'review' || fc.phase === 'reveal';
  const duplicate = p === 1 && response.matchId !== null && fc.responses[0][q].matchId === response.matchId;
  const id = `match-${q}-${p}`;
  return (
    <div className="rounded-xl bg-night-950/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-night-200">{fc.players[p]}</p>
        <p className="font-display text-xl font-bold text-gold-300" aria-label={`${points} points`}>
          {points}
        </p>
      </div>
      <p className="mb-2 font-display text-lg text-cream">{response.answered ? `“${response.text}”` : <span className="text-night-300">{t('No answer')}</span>}</p>
      <label htmlFor={id} className="sr-only">
        {t('Match for {name}', { name: fc.players[p] })}
      </label>
      <select
        id={id}
        className="input !min-h-[40px] !py-1.5 text-sm"
        value={response.matchId ?? ''}
        disabled={!editable}
        onChange={(e) => dispatchGame({ type: 'FC_SET_MATCH', question: q, player: p, answerId: e.target.value || null })}
      >
        <option value="">{t('No match (0)')}</option>
        {question.answers.map((a, i) => (
          <option key={a.id} value={a.id}>
            {t('Match #{n}: {name} ({pts})', { n: i + 1, name: a.text, pts: a.points })}
          </option>
        ))}
      </select>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {response.autoMatched && response.matchId && (
          <span className="chip !bg-emerald-400/15 text-emerald-200">
            <Wand2 className="h-3 w-3" aria-hidden /> {t('Auto-matched')}
          </span>
        )}
        {duplicate && <span className="chip">{fc.duplicatePolicy === 'countBoth' ? t('Same as Player 1, counts for both') : 'Same as Player 1, scores 0'}</span>}
        {response.pointsOverride !== null && <span className="chip !bg-gold-300/20 text-gold-100">{t('Points set by host')}</span>}
        {editable && <PointsOverride fc={fc} q={q} p={p} />}
      </div>
    </div>
  );
}

function PointsOverride({ fc, q, p }: { fc: FinalChallengeState; q: number; p: PlayerIndex }) {
  const response = fc.responses[p][q];
  const [value, setValue] = useState(response.pointsOverride === null ? '' : String(response.pointsOverride));
  const commit = () => {
    if (value.trim() === '') {
      if (response.pointsOverride !== null) dispatchGame({ type: 'FC_SET_POINTS', question: q, player: p, points: null });
      return;
    }
    const n = Number(value);
    if (Number.isFinite(n)) dispatchGame({ type: 'FC_SET_POINTS', question: q, player: p, points: n });
    else setValue('');
  };
  return (
    <label className="ml-auto flex items-center gap-1 text-night-200">
      {t('Points')}
      <input
        className="input !min-h-[32px] !w-20 !px-2 !py-1 text-sm"
        type="number"
        inputMode="numeric"
        min={0}
        max={LIMITS.maxPoints}
        placeholder={t('auto')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        aria-label={t('Points override for {name}, question {n}. Leave blank to use the match.', { name: fc.players[p], n: q + 1 })}
      />
    </label>
  );
}

function ReviewPanel({ fc }: { fc: FinalChallengeState }) {
  const total = fcTotalCells(fc);
  const allConfirmed = fc.confirmed.every(Boolean);
  return (
    <section className="panel">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-title !mb-0">{fc.phase === 'review' ? t('Review answers') : fc.phase === 'reveal' ? t('Reveal the answers') : t('Final Challenge complete')}</h2>
        {fc.phase === 'reveal' && (
          <p className="text-sm text-night-200">
            {fc.revealStep} of {total} revealed
          </p>
        )}
      </div>
      {fc.phase === 'review' && <p className="mb-3 text-sm text-night-200">{t('Check each match. The TV is showing a holding screen, so nothing here is visible to the players.')}</p>}
      <ol className="space-y-3">
        {fc.questions.map((question, i) => (
          <li key={question.id} className={`rounded-2xl p-3 ring-1 ring-inset ${fc.confirmed[i] ? 'ring-emerald-400/40' : 'ring-white/10'}`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="font-bold text-cream">
                {i + 1}. {question.question}
              </p>
              {fc.phase === 'review' && (
                <Button size="sm" variant={fc.confirmed[i] ? 'success' : 'ghost'} icon={Check} aria-pressed={fc.confirmed[i]} onClick={() => dispatchGame({ type: 'FC_CONFIRM', question: i, confirmed: !fc.confirmed[i] })}>
                  {fc.confirmed[i] ? 'Confirmed' : 'Confirm'}
                </Button>
              )}
              {fc.phase !== 'review' && (
                <span className="chip">
                  {fcCellRevealed(fc, i, 0) ? 'P1 shown' : 'P1 hidden'} · {fcCellRevealed(fc, i, 1) ? 'P2 shown' : 'P2 hidden'}
                </span>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <MatchSelect fc={fc} q={i} p={0} />
              <MatchSelect fc={fc} q={i} p={1} />
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {fc.phase === 'review' && (
          <Button variant="gold" size="xl" className="flex-1" icon={Eye} onClick={() => dispatchGame({ type: 'FC_BEGIN_REVEAL' })}>
            {allConfirmed ? t('Start the reveal') : t('Start the reveal (confirms all)')}
          </Button>
        )}
        {fc.phase === 'reveal' && (
          <>
            <Button variant="gold" size="xl" className="flex-1" icon={Eye} onClick={() => dispatchGame({ type: 'FC_REVEAL_NEXT' })}>
              {t('Reveal next answer')}
            </Button>
            <Button variant="ghost" size="xl" icon={Sparkles} onClick={() => dispatchGame({ type: 'FC_REVEAL_ALL' })}>
              {t('Reveal all')}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

function StatusPanel({ fc }: { fc: FinalChallengeState }) {
  const total = fcTotal(fc);
  const reached = total >= fc.targetScore;
  const hostCanSee = fc.phase === 'review' || fc.phase === 'reveal' || fc.phase === 'complete';
  return (
    <section className="panel">
      <h2 className="panel-title">
        <Trophy className="h-5 w-5 text-gold-300" aria-hidden /> {t('Score')}
      </h2>
      {hostCanSee ? (
        <>
          <dl className="grid grid-cols-2 gap-2 text-center">
            {([0, 1] as const).map((p) => (
              <div key={p} className="rounded-xl bg-night-950/40 p-3">
                <dt className="truncate text-sm text-night-200">{fc.players[p]}</dt>
                <dd className="font-display text-3xl font-bold text-cream">{fcPlayerTotal(fc, p)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-center font-display text-2xl text-cream">
            {t('Total {n} of {target}', { n: total, target: fc.targetScore })}
          </p>
          {fc.phase === 'complete' && <p className="mt-2 text-center font-bold text-gold-200">{reached ? t('Target reached!') : t('Great job, everyone!')}</p>}
        </>
      ) : (
        <p className="panel-hint">{t('Scores appear after both players have answered. Target: {n} points.', { n: fc.targetScore })}</p>
      )}
    </section>
  );
}

function ChallengeControls({ fc }: { fc: FinalChallengeState }) {
  const confirm = useConfirm();
  return (
    <section className="panel">
      <h2 className="panel-title">{t('Challenge controls')}</h2>
      <div className="grid gap-2">
        {fc.phase === 'answering' && (
          <Button
            variant="ghost"
            icon={Square}
            onClick={async () => {
              const ok = await confirm({ title: `End ${fc.players[fc.activePlayer]}'s turn?`, message: t('Unanswered questions will score zero.'), confirmLabel: t('End turn'), tone: 'primary' });
              if (ok) dispatchGame({ type: 'FC_END_TURN', now: now() });
            }}
          >
            {t('End this turn')}
          </Button>
        )}
        <Button
          variant="ghost"
          icon={RotateCcw}
          onClick={async () => {
            const ok = await confirm({ title: t('Restart the Final Challenge?'), message: t('All answers so far are cleared. New questions are used when the set has enough.'), confirmLabel: t('Restart challenge') });
            if (ok) dispatchGame({ type: 'FC_RESTART', now: now() });
          }}
        >
          {t('Restart challenge')}
        </Button>
        <Button
          variant={fc.phase === 'complete' ? 'gold' : 'ghost'}
          icon={ArrowLeft}
          onClick={async () => {
            const ok =
              fc.phase === 'complete' ||
              (await confirm({ title: t('Leave the Final Challenge?'), message: t('The challenge will be discarded and you will return to the game results.'), confirmLabel: t('Leave challenge') }));
            if (ok) dispatchGame({ type: 'FC_EXIT', now: now() });
          }}
        >
          {fc.phase === 'complete' ? t('Finish and return to results') : t('Return to main game')}
        </Button>
      </div>
    </section>
  );
}
