import { useSoundLeader } from '../../../core/audio/hooks';
import { useGameSounds } from '../hooks/useGameEffects';
import { useState, type ReactNode } from 'react';
import { BookOpen, Check, MonitorPlay, Shuffle, X } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import type { ClueQuestion } from '../../../core/questions/types';
import { BoardView, formatSeconds, HelpChips, RungChips, STAGE_NAMES, TEAMS, useSecondsLeft } from '../components/parts';
import { activeQuestion, canUseHelp, gameWinner, openCount, otherTeam } from '../engine/game';
import { useKeyboardJudge } from '../hooks/useGameEffects';
import { navigate, routeUrl } from '../lib/router';
import { dispatchGame, useGameState } from '../sync/gameStore';
import type { TeamIndex } from '../types';

/** The question with its answer, for the host's eyes only. */
function HostQuestion({ question, label }: { question: ClueQuestion; label: string }) {
  const t = useT();
  return (
    <div className="sb-panel">
      <p className="sb-label">{label}</p>
      <p className="text-xl font-semibold">{question.prompt}</p>
      <p className="mt-3 text-sm font-bold uppercase tracking-wide text-sb-muted">{t('Answer')}</p>
      <p className="text-3xl font-extrabold text-sb-accent">{question.answer}</p>
      {question.accept && question.accept.length > 0 && (
        <p className="mt-1 sb-muted">
          {t('Also accept:')} {question.accept.join(' · ')}
        </p>
      )}
      {question.reference && <p className="mt-1 sb-muted">{question.reference}</p>}
    </div>
  );
}

function LookupTimer({ until }: { until: number | null }) {
  const t = useT();
  const left = useSecondsLeft(until);
  if (left === null) return null;
  return (
    <p className="sb-panel flex items-center gap-3 text-xl font-bold" role="timer">
      <BookOpen aria-hidden className="h-6 w-6 text-sb-accent" />
      {left > 0 ? t('Search the Scriptures: {time} left', { time: formatSeconds(left) }) : t("Time's up")}
    </p>
  );
}

export function HostScreen() {
  const t = useT();
  const state = useGameState();
  useGameSounds(state, useSoundLeader('host'));
  const [confirmEnd, setConfirmEnd] = useState(false);
  useKeyboardJudge();

  if (!state) {
    return (
      <div className="sb-panel text-center">
        <h1 className="text-3xl">{t('No game is running')}</h1>
        <p className="mt-2 sb-muted">{t('Start a new game to get the host controls.')}</p>
        <button type="button" className="sb-btn sb-btn-primary mt-5" onClick={() => navigate('/new')}>
          {t('New game')}
        </button>
      </div>
    );
  }

  const name = (team: TeamIndex) => state.config.teams[team].name;
  const a = state.active;
  const question = activeQuestion(state);
  const label = a && question ? `${t(STAGE_NAMES[a.stage])} · ${question.category}` : '';

  let controls: ReactNode = null;
  switch (state.phase) {
    case 'intro':
      controls = (
        <button type="button" className="sb-btn sb-btn-xl sb-btn-primary w-full" onClick={() => dispatchGame({ type: 'START' })}>
          {t('Start game')}
        </button>
      );
      break;

    case 'pick': {
      const other = otherTeam(state.turn);
      controls = (
        <div className="sb-panel">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-bold">{t('{team}, pick a subject', { team: name(state.turn) })}</p>
            {openCount(state.boards[other]) > 0 && (
              <button type="button" className="sb-btn sb-btn-sm sb-btn-ghost" onClick={() => dispatchGame({ type: 'SET_TURN', team: other })}>
                {t('Give the turn to {team}', { team: name(other) })}
              </button>
            )}
          </div>
          <BoardView board={state.boards[state.turn]} size="md" onPick={(stage, slot) => dispatchGame({ type: 'PICK', stage, slot })} />
        </div>
      );
      break;
    }

    case 'question':
      controls = a && question && (
        <>
          <HostQuestion question={question} label={a.retry ? `${label} · ${t('Second Try')}` : label} />
          <LookupTimer until={a.lookupUntil} />
          <p className="text-lg font-bold">{t('Answer from {team}', { team: name(a.team) })}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="sb-btn sb-btn-xl sb-btn-primary" onClick={() => dispatchGame({ type: 'JUDGE', correct: true })}>
              <Check aria-hidden className="h-7 w-7" />
              {t('Right')}
            </button>
            <button type="button" className="sb-btn sb-btn-xl sb-btn-outline" onClick={() => dispatchGame({ type: 'JUDGE', correct: false })}>
              <X aria-hidden className="h-7 w-7" />
              {t('Wrong')}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="sb-btn sb-btn-teal" disabled={!canUseHelp(state, 'lookup')} onClick={() => dispatchGame({ type: 'LOOKUP', at: Date.now() })}>
              <BookOpen aria-hidden className="h-5 w-5" />
              {t('Search the Scriptures')}
            </button>
            <button type="button" className="sb-btn sb-btn-teal" disabled={!canUseHelp(state, 'swap')} onClick={() => dispatchGame({ type: 'SWAP' })}>
              <Shuffle aria-hidden className="h-5 w-5" />
              {t('Swap')}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{t('Helps left for {team}:', { team: name(a.team) })}</span>
            <HelpChips state={state} team={a.team} />
          </div>
        </>
      );
      break;

    case 'missed':
      controls = a && question && (
        <>
          <HostQuestion question={question} label={label} />
          <p className="text-lg font-bold">{t('{team} still has Second Try. Use it now?', { team: name(a.team) })}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="sb-btn sb-btn-xl sb-btn-teal" onClick={() => dispatchGame({ type: 'SECOND_TRY' })}>
              {t('Use Second Try')}
            </button>
            <button type="button" className="sb-btn sb-btn-xl sb-btn-ghost" onClick={() => dispatchGame({ type: 'SHOW_ANSWER' })}>
              {t('Show the answer')}
            </button>
          </div>
        </>
      );
      break;

    case 'reveal':
      controls = a && question && (
        <>
          <HostQuestion question={question} label={label} />
          <p className="text-lg font-bold">{a.result === 'right' ? t('{team} climbs a rung!', { team: name(a.team) }) : t('Not this time. A wrong answer costs nothing.')}</p>
          <button type="button" className="sb-btn sb-btn-xl sb-btn-primary w-full" onClick={() => dispatchGame({ type: 'CONTINUE' })}>
            {t('Continue')}
          </button>
        </>
      );
      break;

    case 'bonusIntro':
      controls = (
        <button type="button" className="sb-btn sb-btn-xl sb-btn-primary w-full" onClick={() => dispatchGame({ type: 'BONUS_SHOW' })}>
          {t('Show the bonus question')}
        </button>
      );
      break;

    case 'bonusQuestion':
      controls = state.bonus && (
        <>
          <HostQuestion question={state.bonus.question} label={t('Bonus question')} />
          <p className="sb-muted">{t('Give both teams time to write an answer, then show it.')}</p>
          <button type="button" className="sb-btn sb-btn-xl sb-btn-primary w-full" onClick={() => dispatchGame({ type: 'BONUS_REVEAL' })}>
            {t('Show the answer')}
          </button>
        </>
      );
      break;

    case 'bonusReveal':
      controls = state.bonus && (
        <>
          <HostQuestion question={state.bonus.question} label={t('Bonus question')} />
          {TEAMS.map((team) => {
            const result = state.bonus?.results[team];
            return (
              <div key={team} className="sb-panel flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-bold">{t('Answer from {team}', { team: name(team) })}</p>
                <div className="flex gap-2">
                  <button type="button" className={`sb-btn ${result === true ? 'sb-btn-primary' : 'sb-btn-ghost'}`} aria-pressed={result === true} onClick={() => dispatchGame({ type: 'BONUS_JUDGE', team, correct: true })}>
                    {t('Right')}
                  </button>
                  <button type="button" className={`sb-btn ${result === false ? 'sb-btn-outline' : 'sb-btn-ghost'}`} aria-pressed={result === false} onClick={() => dispatchGame({ type: 'BONUS_JUDGE', team, correct: false })}>
                    {t('Wrong')}
                  </button>
                </div>
              </div>
            );
          })}
          <button type="button" className="sb-btn sb-btn-xl sb-btn-primary w-full" disabled={state.bonus.results.includes(null)} onClick={() => dispatchGame({ type: 'FINISH' })}>
            {t('Show the winner')}
          </button>
        </>
      );
      break;

    case 'gameOver': {
      const winner = gameWinner(state);
      controls = (
        <>
          <p className="text-3xl font-extrabold">{winner === 'tie' ? t("It's a tie!") : t('{team} wins!', { team: name(winner) })}</p>
          <button type="button" className="sb-btn sb-btn-xl sb-btn-primary w-full" onClick={() => navigate('/new')}>
            {t('New game')}
          </button>
        </>
      );
      break;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <RungChips state={state} active={state.phase === 'pick' ? state.turn : (a?.team ?? null)} />
        <a className="sb-btn sb-btn-sm sb-btn-ghost" href={routeUrl('/game')} target="_blank" rel="noreferrer">
          <MonitorPlay aria-hidden className="h-5 w-5" />
          {t('Open the game screen')}
        </a>
      </div>
      <p className="sb-muted">{t('Keyboard: R marks right, W marks wrong')}</p>
      {controls}
      {state.phase !== 'gameOver' && (
        <div className="flex flex-wrap items-center gap-3">
          {confirmEnd ? (
            <>
              <span className="font-semibold">{t('End this game now?')}</span>
              <button
                type="button"
                className="sb-btn sb-btn-sm sb-btn-danger"
                onClick={() => {
                  setConfirmEnd(false);
                  dispatchGame({ type: 'END_GAME' });
                }}
              >
                {t('Yes, end it')}
              </button>
              <button type="button" className="sb-btn sb-btn-sm sb-btn-ghost" onClick={() => setConfirmEnd(false)}>
                {t('Keep playing')}
              </button>
            </>
          ) : (
            <button type="button" className="sb-btn sb-btn-sm sb-btn-ghost" onClick={() => setConfirmEnd(true)}>
              {t('End game')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
