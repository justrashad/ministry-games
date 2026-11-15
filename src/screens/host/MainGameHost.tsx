import { langStore, t } from '../../i18n/i18n';
import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowRight,
  Check,
  CircleSlash,
  Crown,
  Eye,
  EyeOff,
  Flag,
  Minus,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Sparkles,
  Swords,
  Timer as TimerIcon,
  Trophy,
  Undo2,
  X,
  BellRing,
} from 'lucide-react';
import type { GameState, TeamIndex } from '../../types';
import { TEAM_COLORS, LIMITS, TIMER_PRESETS } from '../../engine/defaults';
import { otherTeam, gameWinner } from '../../engine/events';
import { canOpenFinalChallenge } from '../../engine/finalChallenge';
import { buzzersOpen, hiddenAnswerCount, isAnswerScored } from '../../engine/game';
import { createGame } from '../../engine/createGame';
import { isTimerRunning } from '../../engine/timer';
import { navigate } from '../../lib/router';
import { dispatchGame } from '../../sync/gameStore';
import { getSet } from '../../state/libraryStore';
import { recentQuestionIds } from '../../state/historyStore';
import { createDemoGame } from '../../commerce/demo';
import { BuyButton } from '../../components/BuyButton';
import type { Settings } from '../../types';
import { updateSettings, useSettings } from '../../state/settingsStore';
import { Button } from '../../components/ui/Button';
import { useConfirm } from '../../components/ui/Confirm';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { ColorPicker } from '../../components/ui/ColorPicker';
import { StrikeDisplay } from '../../components/game/StrikeDisplay';
import { TimerDisplay } from '../../components/game/TimerDisplay';

const now = () => Date.now();

export function MainGameHost({ state }: { state: GameState }) {
  if (state.phase === 'gameOver') return <GameOverHost state={state} />;
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <PhasePanel state={state} />
        {state.round && state.phase !== 'intro' && state.phase !== 'roundIntro' && <BoardPanel state={state} />}
        {state.round && (state.phase === 'playing' || state.phase === 'steal') && <StrikePanel state={state} />}
      </div>
      <div className="space-y-4">
        <ScorePanel state={state} />
        <TimerPanel state={state} />
        <GamePanel state={state} />
      </div>
      {state.round && (state.phase === 'playing' || state.phase === 'steal') && <QuickBar state={state} />}
    </div>
  );
}

/** Phone and tablet: the most-used round controls stay pinned to the bottom of the screen. */
function QuickBar({ state }: { state: GameState }) {
  const round = state.round!;
  const max = state.config.rules.maxStrikes;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-night-950/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-3 gap-2">
        <Button
          variant="danger"
          size="lg"
          icon={X}
          disabled={state.phase !== 'playing' || round.strikes >= max}
          onClick={() => dispatchGame({ type: 'ADD_STRIKE' })}
          aria-label={t('Strike, {n} of {max} so far', { n: round.strikes, max })}
          className="whitespace-nowrap"
        >
          {t('Strike')}
        </Button>
        <Button variant="ghost" size="lg" icon={Undo2} disabled={round.strikes === 0 && state.phase !== 'steal'} onClick={() => dispatchGame({ type: 'REMOVE_STRIKE' })} aria-label={state.phase === 'steal' ? t('Cancel steal') : t('Undo strike')}>
          {t('Undo')}
        </Button>
        <Button variant="ghost" size="lg" icon={Swords} disabled={state.phase !== 'playing' || round.controllingTeam === null} onClick={() => dispatchGame({ type: 'START_STEAL' })}>
          {t('Steal')}
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function TeamButton({ state, team, onClick, selected, children, size = 'lg' }: { state: GameState; team: TeamIndex; onClick: () => void; selected?: boolean; children: ReactNode; size?: 'md' | 'lg' }) {
  const c = TEAM_COLORS[state.teams[team].color];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`btn btn-${size} min-w-0 flex-1 !justify-start`}
      style={{
        background: selected ? c.hex : `${c.hex}26`,
        color: selected ? c.ink : '#fff7e6',
        boxShadow: `inset 0 0 0 2px ${c.hex}`,
      }}
    >
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: selected ? c.ink : c.hex }} aria-hidden />
      <span className="truncate">{children}</span>
    </button>
  );
}

function ControlPicker({ state }: { state: GameState }) {
  const round = state.round!;
  return (
    <div>
      <p className="field-label">{t('Which team is playing?')}</p>
      <div className="flex gap-2">
        {([0, 1] as const).map((tm) => (
          <TeamButton key={tm} state={state} team={tm} selected={round.controllingTeam === tm} onClick={() => dispatchGame({ type: 'SET_CONTROL', team: round.controllingTeam === tm ? null : tm })}>
            {state.teams[tm].name}
          </TeamButton>
        ))}
      </div>
    </div>
  );
}

function PhasePanel({ state }: { state: GameState }) {
  const confirm = useConfirm();
  const round = state.round;
  const lastRound = round ? round.index >= state.roundPlan.length - 1 : false;
  const regularRounds = state.roundPlan.filter((p) => !p.isFinal).length;

  if (state.phase === 'intro') {
    return (
      <section className="panel" aria-labelledby="phase-title">
        <h2 id="phase-title" className="panel-title">
          <Sparkles className="h-5 w-5 text-gold-300" aria-hidden /> {t('Ready to play')}
        </h2>
        {state.config.demo && <p className="mb-3 rounded-xl bg-gold-300/15 p-3 text-sm text-gold-100">{t('Free demo: one round with sample questions.')}</p>}
        <p className="mb-4 text-night-100">
          {state.teams[0].name} vs {state.teams[1].name}. {regularRounds} round{regularRounds === 1 ? '' : 's'}
          {state.roundPlan.length > regularRounds ? ' plus a final round' : ''}. The TV is showing the title card.
        </p>
        <Button variant="gold" size="xl" block icon={Play} onClick={() => dispatchGame({ type: 'NEXT_ROUND', now: now() })}>
          {t('Start round 1')}
        </Button>
      </section>
    );
  }
  if (!round) return null;

  const header = (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className={`chip ${round.isFinal ? '!bg-gold-300 !text-ink' : ''}`}>{round.isFinal ? t('Final round') : t('Round {n} of {total}', { n: round.index + 1, total: regularRounds })}</span>
      <span className="chip">{t('{n}× points', { n: round.multiplier })}</span>
      <span className="chip">{round.question.category}</span>
    </div>
  );

  if (state.phase === 'roundIntro') {
    return (
      <section className="panel">
        {header}
        <p className="mb-1 text-sm font-bold text-night-200">{t('Question (only you can see this yet)')}</p>
        <p className="mb-4 font-display text-2xl text-cream">{round.question.question}</p>
        {round.question.notes && <p className="mb-4 rounded-xl bg-night-950/50 p-3 text-sm text-night-100">Note: {round.question.notes}</p>}
        <div className="mb-4">
          <ControlPicker state={state} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="gold" size="xl" className="flex-1" icon={Eye} onClick={() => dispatchGame({ type: 'SHOW_QUESTION' })}>
            {t('Show question')}
          </Button>
          <Button variant="ghost" size="xl" icon={Shuffle} onClick={() => dispatchGame({ type: 'SKIP_QUESTION' })}>
            {t('Different question')}
          </Button>
        </div>
      </section>
    );
  }

  if (state.phase === 'playing') {
    return (
      <section className="panel">
        {header}
        <p className="mb-4 font-display text-xl text-cream">{round.question.question}</p>
        <FaceoffStatus state={state} />
        <ControlPicker state={state} />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {([0, 1] as const).map((tm) => (
            <Button
              key={tm}
              variant="ghost"
              icon={Crown}
              onClick={() => dispatchGame({ type: 'AWARD_ROUND', team: tm, now: now() })}
              aria-label={t('End round and award {n} points to {name}', { n: round.bank * round.multiplier, name: state.teams[tm].name })}
            >
              {t('Award {n} to {name}', { n: round.bank * round.multiplier, name: state.teams[tm].name })}
            </Button>
          ))}
        </div>
      </section>
    );
  }

  if (state.phase === 'steal' && round.stealingTeam !== null && round.controllingTeam !== null) {
    const stealer = state.teams[round.stealingTeam];
    const holder = state.teams[round.controllingTeam];
    const c = TEAM_COLORS[stealer.color];
    return (
      <section className="panel" style={{ boxShadow: `0 0 0 3px ${c.hex}` } as CSSProperties} aria-live="polite">
        {header}
        <h2 className="panel-title">
          <Swords className="h-5 w-5" style={{ color: c.hex }} aria-hidden /> {t('Steal: {name}', { name: stealer.name })}
        </h2>
        <p className="mb-4 text-night-100">
          {t("{name} gets one guess. If it's on the board, tap Steal it next to that answer.", { name: stealer.name })}{' '}
          {state.config.rules.stealAward === 'allPoints' ? t('They win all the round points.') : t('They win that answer’s points.')}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="danger" size="lg" icon={CircleSlash} onClick={() => dispatchGame({ type: 'STEAL_FAIL', now: now() })}>
            {t('Steal missed: {name} keeps {n}', { name: holder.name, n: round.bank * round.multiplier })}
          </Button>
          <Button variant="success" size="lg" icon={Check} onClick={() => dispatchGame({ type: 'STEAL_SUCCESS', now: now() })}>
            {t('Award steal (no new answer)')}
          </Button>
        </div>
        <Button variant="subtle" className="mt-3" icon={Undo2} onClick={() => dispatchGame({ type: 'CANCEL_STEAL' })}>
          {t('Cancel steal, back to {name}', { name: holder.name })}
        </Button>
      </section>
    );
  }

  if (state.phase === 'roundOver' && round.result) {
    const winner = state.teams[round.result.team];
    const hidden = hiddenAnswerCount(round);
    return (
      <section className="panel" aria-live="polite">
        {header}
        <h2 className="panel-title">
          <Trophy className="h-5 w-5 text-gold-300" aria-hidden />
          {winner.name} {round.result.via === 'steal' ? 'stole' : 'won'} {round.result.points} points
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="gold" size="xl" className="flex-1" icon={lastRound ? Flag : ArrowRight} onClick={() => dispatchGame({ type: 'NEXT_ROUND', now: now() })}>
            {lastRound ? t('Finish game') : state.roundPlan[round.index + 1]?.isFinal ? t('Go to final round') : t('Next round')}
          </Button>
          {hidden > 0 && (
            <Button variant="ghost" size="xl" icon={Eye} onClick={() => dispatchGame({ type: 'REVEAL_NEXT' })}>
              {t('Reveal next ({n})', { n: hidden })}
            </Button>
          )}
        </div>
        <Button
          variant="subtle"
          className="mt-3"
          icon={RotateCcw}
          onClick={async () => {
            const ok = await confirm({
              title: t('Replay this round?'),
              message: t('This takes back the {n} points from {name} and resets the board for the same question.', { n: round.result!.points, name: winner.name }),
              confirmLabel: t('Replay round'),
            });
            if (ok) dispatchGame({ type: 'RESET_ROUND' });
          }}
        >
          {t('Replay this round')}
        </Button>
      </section>
    );
  }
  return null;
}

function FaceoffStatus({ state }: { state: GameState }) {
  const round = state.round!;
  if (state.config.rules.faceoffBuzzers === false) return null;
  const open = buzzersOpen(state);
  const winner = round.faceoff?.team ?? null;
  const untouched = round.bank === 0 && round.strikes === 0;
  if (!open && winner === null && !untouched) return null;
  return (
    <div className={`mb-4 flex flex-wrap items-center gap-3 rounded-xl p-3 ${open ? 'bg-gold-300/15 ring-1 ring-gold-300/60' : 'bg-night-950/40'}`} role="status" aria-live="polite">
      <BellRing className="h-5 w-5 shrink-0 text-gold-300" aria-hidden />
      <p className="min-w-0 flex-1 text-sm text-night-100">
        {open
          ? t('Buzzers are open. The first team to buzz plays, or pick a team below.')
          : winner !== null
            ? t('{name} buzzed first and is playing.', { name: state.teams[winner].name })
            : t('Buzzers are closed.')}
      </p>
      {!open && untouched && (
        <Button size="sm" variant="ghost" icon={BellRing} onClick={() => dispatchGame({ type: 'ARM_BUZZERS' })}>
          {winner !== null ? t('Face-off again') : t('Open buzzers')}
        </Button>
      )}
    </div>
  );
}

function BoardPanel({ state }: { state: GameState }) {
  const round = state.round!;
  const stealing = state.phase === 'steal';
  const locked = !!round.result;
  const hidden = hiddenAnswerCount(round);
  const total = round.question.answers.reduce((sum, a) => sum + a.points, 0);
  return (
    <section className="panel" aria-labelledby="board-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="board-title" className="panel-title !mb-0">
          {t('Answer board')}
        </h2>
        <p className="text-sm text-night-200">
          {t('Round points')} <b className="text-gold-300">{round.bank}</b>
          {round.multiplier > 1 && <> × {round.multiplier}</>} · {t('board total {n}', { n: total })}
        </p>
      </div>
      {round.holdReveals && !locked && (
        <p className="mb-3 rounded-xl bg-gold-300/15 p-3 text-sm text-gold-100">{t('Simultaneous reveal: correct answers stay hidden on the TV until you tap Reveal all.')}</p>
      )}
      <ol className="space-y-2">
        {round.question.answers.map((a, i) => {
          const entry = round.revealed[a.id];
          const scored = isAnswerScored(entry);
          const visible = !!entry?.visible;
          return (
            <li
              key={a.id}
              className={`flex items-center gap-2 rounded-2xl p-2 pl-3 ring-1 ring-inset ${scored ? 'bg-emerald-400/10 ring-emerald-400/40' : visible ? 'bg-white/5 ring-white/15' : 'bg-night-950/40 ring-white/10'}`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-300 font-display font-bold text-ink" aria-hidden>
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-cream">{a.text}</p>
                <p className="text-xs text-night-200">
                  {t('{n} pts', { n: a.points })} ·{' '}
                  {entry ? (entry.source === 'shown' ? t('shown, no points') : entry.source === 'steal' ? t('stolen') : visible ? t('scored') : t('scored, held')) : t('hidden')}
                </p>
              </div>
              {!locked && !scored && (
                <Button
                  variant={stealing ? 'success' : 'gold'}
                  size="md"
                  icon={stealing ? Swords : Check}
                  onClick={() => dispatchGame({ type: 'SCORE_ANSWER', answerId: a.id, now: now() })}
                  aria-label={stealing ? t('Steal it with {name}, {n} points', { name: a.text, n: a.points }) : t('Correct: {name}, {n} points', { name: a.text, n: a.points })}
                >
                  {stealing ? t('Steal it') : t('Correct')}
                </Button>
              )}
              {!visible && (
                <Button variant="ghost" size="md" icon={Eye} onClick={() => dispatchGame({ type: 'SHOW_ANSWER', answerId: a.id })} aria-label={t('Show {name} without points', { name: a.text })} title={t('Show without points')} />
              )}
              {entry && !locked && (
                <Button variant="subtle" size="md" icon={EyeOff} onClick={() => dispatchGame({ type: 'HIDE_ANSWER', answerId: a.id })} aria-label={t('Undo {name}', { name: a.text })} title={t('Undo')} />
              )}
            </li>
          );
        })}
      </ol>
      {hidden > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" icon={Eye} onClick={() => dispatchGame({ type: 'REVEAL_NEXT' })}>
            {t('Reveal next (no points)')}
          </Button>
          <Button variant="ghost" size="sm" icon={Sparkles} onClick={() => dispatchGame({ type: 'REVEAL_ALL' })}>
            {t('Reveal all')}
          </Button>
        </div>
      )}
    </section>
  );
}

function StrikePanel({ state }: { state: GameState }) {
  const round = state.round!;
  const max = state.config.rules.maxStrikes;
  const canSteal = state.phase === 'playing' && round.controllingTeam !== null;
  return (
    <section className="panel" aria-labelledby="strike-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="strike-title" className="panel-title !mb-0">
          {t('Strikes')}
        </h2>
        <StrikeDisplay strikes={round.strikes} max={max} size="compact" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button variant="danger" size="lg" icon={X} disabled={state.phase !== 'playing' || round.strikes >= max} onClick={() => dispatchGame({ type: 'ADD_STRIKE' })}>
          {t('Strike')}
        </Button>
        <Button variant="ghost" size="lg" icon={Undo2} disabled={round.strikes === 0 && state.phase !== 'steal'} onClick={() => dispatchGame({ type: 'REMOVE_STRIKE' })}>
          {t('Undo strike')}
        </Button>
        <Button variant="ghost" size="lg" className="col-span-2 sm:col-span-1" icon={Swords} disabled={!canSteal} onClick={() => dispatchGame({ type: 'START_STEAL' })}>
          {t('Start steal')}
        </Button>
      </div>
      {state.phase === 'playing' && round.strikes >= max && round.controllingTeam === null && (
        <p className="mt-3 rounded-xl bg-gold-300/15 p-3 text-sm text-gold-100">{t('Choose which team was playing above, then start the steal.')}</p>
      )}
      {state.phase === 'playing' && round.controllingTeam !== null && (
        <p className="mt-3 text-sm text-night-200">
          {t('{name} is playing. Strike {n} opens a steal for {other}.', { name: state.teams[round.controllingTeam].name, n: max, other: state.teams[otherTeam(round.controllingTeam)].name })}
        </p>
      )}
    </section>
  );
}

function ScorePanel({ state }: { state: GameState }) {
  const [editing, setEditing] = useState<TeamIndex | null>(null);
  return (
    <section className="panel" aria-labelledby="score-title">
      <h2 id="score-title" className="panel-title">
        {t('Teams and scores')}
      </h2>
      <div className="space-y-3">
        {([0, 1] as const).map((tm) => {
          const team = state.teams[tm];
          const c = TEAM_COLORS[team.color];
          return (
            <div key={tm} className="rounded-2xl p-3" style={{ background: `${c.hex}1f`, boxShadow: `inset 0 0 0 2px ${c.hex}66` }}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: c.hex }} aria-hidden />
                <p className="min-w-0 flex-1 truncate font-display text-lg font-semibold text-cream">{team.name}</p>
                <p className="font-display text-3xl font-bold tabular-nums" style={{ color: c.hex }} aria-label={`${team.score} points`}>
                  {team.score}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" icon={Minus} onClick={() => dispatchGame({ type: 'ADJUST_SCORE', team: tm, delta: -10 })} aria-label={t('Subtract 10 points from {name}', { name: team.name })}>
                  10
                </Button>
                <Button size="sm" variant="ghost" icon={Plus} onClick={() => dispatchGame({ type: 'ADJUST_SCORE', team: tm, delta: 10 })} aria-label={t('Add 10 points to {name}', { name: team.name })}>
                  10
                </Button>
                <Button size="sm" variant="subtle" icon={Pencil} onClick={() => setEditing(tm)} className="ml-auto">
                  {t('Edit')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {editing !== null && <TeamEditor state={state} team={editing} onClose={() => setEditing(null)} />}
    </section>
  );
}

function TeamEditor({ state, team, onClose }: { state: GameState; team: TeamIndex; onClose: () => void }) {
  const current = state.teams[team];
  const [name, setName] = useState(current.name);
  const [score, setScore] = useState(String(current.score));
  const [color, setColor] = useState(current.color);
  const [allowNegative, setAllowNegative] = useState(false);
  const parsed = Number(score);
  const scoreValid = score.trim() !== '' && Number.isFinite(parsed) && Number.isInteger(parsed) && (allowNegative || parsed >= 0) && Math.abs(parsed) <= LIMITS.maxScore;
  const save = () => {
    if (!scoreValid || !name.trim()) return;
    dispatchGame({ type: 'RENAME_TEAM', team, name });
    dispatchGame({ type: 'SET_TEAM_COLOR', team, color });
    dispatchGame({ type: 'SET_SCORE', team, score: parsed, allowNegative });
    onClose();
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${current.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button variant="gold" onClick={save} disabled={!scoreValid || !name.trim()}>
            {t('Save team')}
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div>
          <label className="field-label" htmlFor="team-name">
            {t('Team name')}
          </label>
          <input id="team-name" className="input" value={name} maxLength={LIMITS.teamName} onChange={(e) => setName(e.target.value)} aria-invalid={!name.trim()} />
        </div>
        <ColorPicker label={t('Team color')} value={color} onChange={setColor} disabledColor={state.teams[otherTeam(team)].color} />
        <div>
          <label className="field-label" htmlFor="team-score">
            {t('Score')}
          </label>
          <input id="team-score" className="input" type="number" inputMode="numeric" value={score} onChange={(e) => setScore(e.target.value)} aria-invalid={!scoreValid} aria-describedby="team-score-help" />
          <p id="team-score-help" className={scoreValid ? 'field-help' : 'mt-1 text-xs font-bold text-rose-300'}>
            {scoreValid ? t('Set the score directly. Use this to fix mistakes.') : allowNegative ? t('Enter a whole number.') : t('Enter a whole number of 0 or more.')}
          </p>
          <label className="mt-2 flex items-center gap-2 text-sm text-night-100">
            <input type="checkbox" checked={allowNegative} onChange={(e) => setAllowNegative(e.target.checked)} className="h-4 w-4 accent-gold-300" />
            {t('Allow a score below zero')}
          </label>
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

function TimerPanel({ state }: { state: GameState }) {
  const { timer: timerSettings } = useSettings();
  const [custom, setCustom] = useState(String(state.config.timerSeconds));
  const running = isTimerRunning(state.timer);
  const active = state.timer.durationMs > 0;
  const inRound = state.phase === 'playing' || state.phase === 'roundIntro' || state.phase === 'steal';
  const setEnabled = (enabled: boolean, seconds = state.config.timerSeconds) => {
    dispatchGame({ type: 'SET_TIMER_ENABLED', enabled, seconds });
    updateSettings('timer', { enabled, defaultSeconds: seconds });
  };
  return (
    <section className="panel" aria-labelledby="timer-title">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="timer-title" className="panel-title !mb-0">
          <TimerIcon className="h-5 w-5 text-gold-300" aria-hidden /> {t('Timer')}
        </h2>
        {active && <TimerDisplay timer={state.timer} size="compact" />}
      </div>
      <div className="segmented mb-3" role="group" aria-label={t('Timer length')}>
        <button type="button" aria-pressed={!state.config.timerEnabled} onClick={() => setEnabled(false)}>
          {t('Off')}
        </button>
        {TIMER_PRESETS.map((s) => (
          <button key={s} type="button" aria-pressed={state.config.timerEnabled && state.config.timerSeconds === s} onClick={() => setEnabled(true, s)}>
            {s}s
          </button>
        ))}
      </div>
      <form
        className="mb-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Math.round(Number(custom));
          if (Number.isFinite(n) && n >= LIMITS.timerSeconds.min && n <= LIMITS.timerSeconds.max) setEnabled(true, n);
          else setCustom(String(state.config.timerSeconds));
        }}
      >
        <div className="flex-1">
          <label htmlFor="custom-timer" className="field-label">
            {t('Custom seconds')}
          </label>
          <input id="custom-timer" className="input" type="number" inputMode="numeric" min={LIMITS.timerSeconds.min} max={LIMITS.timerSeconds.max} value={custom} onChange={(e) => setCustom(e.target.value)} />
        </div>
        <Button type="submit" variant="ghost">
          {t('Use')}
        </Button>
      </form>
      {active && inRound ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={running ? 'ghost' : 'gold'}
            icon={running ? Pause : Play}
            disabled={state.phase === 'roundIntro'}
            onClick={() => dispatchGame(running ? { type: 'TIMER_PAUSE', now: now() } : { type: 'TIMER_START', now: now() })}
          >
            {running ? t('Pause') : t('Start')}
          </Button>
          <Button variant="ghost" icon={RefreshCw} onClick={() => dispatchGame({ type: 'TIMER_RESET' })}>
            {t('Reset')}
          </Button>
          <Button variant="ghost" icon={Plus} onClick={() => dispatchGame({ type: 'TIMER_ADD', seconds: 10, now: now() })}>
            10s
          </Button>
        </div>
      ) : (
        <p className="text-sm text-night-200">
          {state.config.timerEnabled || timerSettings.enabled ? t('The timer appears on the TV once the question is shown.') : t('Turn on a timer to give each team a time limit.')}
          {state.round?.isFinal && state.config.rules.finalRound.timerSeconds > 0 ? ` ${t('The final round uses {n}s.', { n: state.config.rules.finalRound.timerSeconds })}` : ''}
        </p>
      )}
    </section>
  );
}

function GamePanel({ state }: { state: GameState }) {
  const confirm = useConfirm();
  const round = state.round;
  const canReset = round && ['playing', 'steal', 'roundOver'].includes(state.phase);
  return (
    <section className="panel" aria-labelledby="game-title">
      <h2 id="game-title" className="panel-title">
        {t('Game')}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="ghost"
          icon={Shuffle}
          disabled={!round || !!round.result || state.phase === 'intro'}
          onClick={async () => {
            const ok =
              !round || (round.bank === 0 && round.strikes === 0) ||
              (await confirm({ title: t('Use a different question?'), message: t('The board, strikes and round points for this round will be cleared.'), confirmLabel: t('Change question') }));
            if (ok) dispatchGame({ type: 'SKIP_QUESTION' });
          }}
        >
          {t('Different question')}
        </Button>
        <Button
          variant="ghost"
          icon={RotateCcw}
          disabled={!canReset}
          onClick={async () => {
            const ok = await confirm({
              title: t('Reset this round?'),
              message: round?.result ? t('Points awarded this round will be taken back and the board cleared.') : t('The board, strikes and round points will be cleared.'),
              confirmLabel: t('Reset round'),
            });
            if (ok) dispatchGame({ type: 'RESET_ROUND' });
          }}
        >
          {t('Reset round')}
        </Button>
        <Button
          variant="ghost"
          icon={ArrowRight}
          disabled={state.phase === 'intro' || state.phase === 'roundOver'}
          onClick={async () => {
            const ok = await confirm({
              title: t('Skip to the next round?'),
              message: t('This round ends without awarding any points.'),
              confirmLabel: t('Skip round'),
            });
            if (ok) dispatchGame({ type: 'NEXT_ROUND', now: now() });
          }}
        >
          {t('Skip round')}
        </Button>
        <Button
          variant="ghost"
          icon={Flag}
          onClick={async () => {
            const ok = await confirm({ title: t('End the game now?'), message: t('Current scores become the final scores.'), confirmLabel: t('End game') });
            if (ok) dispatchGame({ type: 'END_GAME', now: now() });
          }}
        >
          {t('End game')}
        </Button>
      </div>
      <RestartButtons state={state} />
    </section>
  );
}

/** Same teams, questions dealt again. Demo games stay demos. */
function rebuildGame(state: GameState, settings: Settings) {
  if (state.config.demo) return createDemoGame(settings, [state.teams[0], state.teams[1]], langStore.get());
  const set = getSet(state.config.setId);
  if (!set) return { ok: false as const, error: t('That question set no longer exists. Start a new game and pick a set.') };
  return createGame({ settings, set, teams: [state.teams[0], state.teams[1]], recentQuestionIds: recentQuestionIds(settings.questions.avoidRecentGames) });
}

function RestartButtons({ state }: { state: GameState }) {
  const confirm = useConfirm();
  const toast = useToast();
  const settings = useSettings();
  const restart = async () => {
    const ok = await confirm({
      title: t('Restart this game?'),
      message: t('Scores go back to zero and the questions are dealt again. Team names and colors stay the same.'),
      confirmLabel: t('Restart game'),
    });
    if (!ok) return;
    const result = rebuildGame(state, settings);
    if (!result.ok) {
      toast.show(result.error, 'error');
      return;
    }
    dispatchGame({ type: 'NEW_GAME', game: result.game });
    toast.show(t('Game restarted'));
  };
  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
      <Button variant="subtle" size="sm" icon={RotateCcw} onClick={restart}>
        {t('Restart game')}
      </Button>
      <Button
        variant="subtle"
        size="sm"
        icon={Plus}
        onClick={async () => {
          const ok = state.phase === 'gameOver' || (await confirm({ title: t('Start a new game?'), message: t('The current game will end without being saved to history.'), confirmLabel: t('New game') }));
          if (ok) navigate('/new');
        }}
      >
        {t('New game')}
      </Button>
    </div>
  );
}

function GameOverHost({ state }: { state: GameState }) {
  const toast = useToast();
  const settings = useSettings();
  const winner = gameWinner(state);
  const fcAvailable = canOpenFinalChallenge(state);
  const fcDone = state.finalChallenge?.phase === 'complete';
  const playAgain = () => {
    const result = rebuildGame(state, settings);
    if (!result.ok) {
      toast.show(result.error, 'error');
      navigate('/new');
      return;
    }
    dispatchGame({ type: 'NEW_GAME', game: result.game });
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <section className="panel">
        <h2 className="panel-title">
          <Trophy className="h-5 w-5 text-gold-300" aria-hidden /> {t('Game complete')}
        </h2>
        <p className="mb-4 font-display text-2xl text-cream">
          {winner === 'tie' ? t("It's a tie at {n}!", { n: state.teams[0].score }) : t('{name} wins with {n} points.', { name: state.teams[winner].name, n: state.teams[winner].score })}
        </p>
        {state.config.demo && (
          <div className="mb-4 space-y-3 rounded-2xl bg-gold-300/15 p-4 ring-1 ring-gold-300/50">
            <p className="font-display text-lg text-cream">{t('That was the free demo!')}</p>
            <p className="text-sm text-night-100">
              {t('The full game adds up to 10 rounds with multipliers, a big-point final round, the two-player Final Challenge, a 32-question starter set, your own questions, and question packs.')}
            </p>
            <BuyButton entitlement="game" />
          </div>
        )}
        <div className="grid gap-2">
          {fcAvailable && (
            <Button variant="gold" size="xl" icon={Sparkles} onClick={() => dispatchGame({ type: 'FC_OPEN', now: now() })}>
              {fcDone ? t('Play the Final Challenge again') : t('Play the Final Challenge')}
            </Button>
          )}
          {!fcAvailable && settings.finalChallenge.enabled && (
            <p className="rounded-xl bg-night-950/50 p-3 text-sm text-night-200">
              {t('Add questions marked “Use for Final Challenge” to this set to unlock the Final Challenge.')}
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-3">
            <Button variant={fcAvailable ? 'ghost' : 'gold'} size="lg" icon={RotateCcw} onClick={playAgain}>
              {t('Play again')}
            </Button>
            <Button variant="ghost" size="lg" icon={Shuffle} onClick={() => navigate('/new')}>
              {t('New questions')}
            </Button>
            <Button variant="ghost" size="lg" icon={ArrowRight} onClick={() => navigate('/')}>
              {t('Home')}
            </Button>
          </div>
        </div>
      </section>
      <section className="panel">
        <h2 className="panel-title">{t('Rounds played')}</h2>
        {state.played.length === 0 ? (
          <p className="panel-hint">{t('No rounds were played.')}</p>
        ) : (
          <ol className="space-y-2">
            {[...state.played]
              .sort((a, b) => a.roundIndex - b.roundIndex)
              .map((p) => (
                <li key={p.roundIndex} className="rounded-xl bg-night-950/40 p-3 text-sm">
                  <p className="font-bold text-cream">{p.question}</p>
                  <p className="text-night-200">{p.team === null ? t('Not scored') : `${state.teams[p.team].name} +${p.points}${p.via === 'steal' ? ` (${t('steal')})` : ''}`}</p>
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
  );
}
