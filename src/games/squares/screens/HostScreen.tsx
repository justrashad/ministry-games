import { useState, type ReactNode } from 'react';
import { Check, MonitorPlay, Shuffle, X } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import type { TrueFalseQuestion } from '../../../core/questions/types';
import { TeamCards, TeamMark } from '../components/parts';
import { matchDecided, matchWinner, otherTeam, wouldWin } from '../engine/game';
import { useKeyboardCalls } from '../hooks/useGameEffects';
import { navigate, routeUrl } from '../lib/router';
import { dispatchGame, useGameState } from '../sync/gameStore';
import type { GameState, TeamIndex } from '../types';

/** The statement with its answer, for the host's eyes only. */
function HostStatement({ question, label }: { question: TrueFalseQuestion; label: string }) {
  const t = useT();
  return (
    <div className="ks-panel">
      <p className="ks-label">{label}</p>
      <p className="text-xl font-semibold">{question.statement}</p>
      <p className="mt-3 text-sm font-bold uppercase tracking-wide text-ks-muted">{t('Answer')}</p>
      <p className="text-3xl font-extrabold text-ks-accent">{question.isTrue ? t('True') : t('False')}</p>
      {!question.isTrue && question.correction && <p className="mt-1 text-lg font-semibold">{question.correction}</p>}
      {question.reference && <p className="mt-1 ks-muted">{question.reference}</p>}
    </div>
  );
}

function SquarePicker({ state }: { state: GameState }) {
  const t = useT();
  const name = (team: TeamIndex) => state.config.teams[team].name;
  return (
    <div className="ks-panel">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-bold">{t('{team}, pick a square', { team: name(state.turn) })}</p>
        <button type="button" className="ks-btn ks-btn-sm ks-btn-ghost" onClick={() => dispatchGame({ type: 'SET_TURN', team: otherTeam(state.turn) })}>
          {t('Give the turn to {team}', { team: name(otherTeam(state.turn)) })}
        </button>
      </div>
      <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
        {state.squares.map((owner, i) =>
          owner === null ? (
            <button key={i} type="button" className="ks-open aspect-square text-2xl" aria-label={t('Square {n}', { n: i + 1 })} onClick={() => dispatchGame({ type: 'PICK', square: i })}>
              {i + 1}
            </button>
          ) : (
            <div key={i} className={`ks-team-${owner} flex aspect-square items-center justify-center rounded-2xl`} role="img" aria-label={name(owner)}>
              <TeamMark team={owner} className="h-3/5 w-3/5" />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export function HostScreen() {
  const t = useT();
  const state = useGameState();
  const [confirmEnd, setConfirmEnd] = useState(false);
  useKeyboardCalls();

  if (!state) {
    return (
      <div className="ks-panel text-center">
        <h1 className="text-3xl">{t('No game is running')}</h1>
        <p className="mt-2 ks-muted">{t('Start a new game to get the host controls.')}</p>
        <button type="button" className="ks-btn ks-btn-primary mt-5" onClick={() => navigate('/new')}>
          {t('New game')}
        </button>
      </div>
    );
  }

  const name = (team: TeamIndex) => state.config.teams[team].name;
  const active = state.active;
  const squareLabel = active ? t('Square {n}', { n: active.square + 1 }) : '';

  let controls: ReactNode = null;
  switch (state.phase) {
    case 'intro':
      controls = (
        <button type="button" className="ks-btn ks-btn-xl ks-btn-primary w-full" onClick={() => dispatchGame({ type: 'START' })}>
          {t('Start game')}
        </button>
      );
      break;

    case 'pick':
      controls = <SquarePicker state={state} />;
      break;

    case 'question':
      controls = active && (
        <>
          <HostStatement question={active.question} label={squareLabel} />
          <p className="text-lg font-bold">{t('Call for {team}', { team: name(state.turn) })}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="ks-btn ks-btn-xl ks-btn-primary" onClick={() => dispatchGame({ type: 'ANSWER', team: state.turn, answer: true })}>
              <Check aria-hidden className="h-7 w-7" />
              {t('True')}
            </button>
            <button type="button" className="ks-btn ks-btn-xl ks-btn-outline" onClick={() => dispatchGame({ type: 'ANSWER', team: state.turn, answer: false })}>
              <X aria-hidden className="h-7 w-7" />
              {t('False')}
            </button>
          </div>
          <p className="ks-muted">
            {wouldWin(state.squares, active.square, otherTeam(state.turn))
              ? t('A wrong call leaves this square open, because it would win the game for {team}.', { team: name(otherTeam(state.turn)) })
              : t('A wrong call gives this square to {team}.', { team: name(otherTeam(state.turn)) })}
          </p>
          <button type="button" className="ks-btn ks-btn-ghost w-full" onClick={() => dispatchGame({ type: 'SKIP' })}>
            <Shuffle aria-hidden className="h-5 w-5" />
            {t('Use a different statement')}
          </button>
        </>
      );
      break;

    case 'reveal':
      controls = active && (
        <>
          <HostStatement question={active.question} label={squareLabel} />
          <p className="text-lg font-bold">
            {active.outcome === 'claimed'
              ? t('{team} takes square {n}', { team: name(state.turn), n: active.square + 1 })
              : active.outcome === 'given'
                ? t('Square {n} goes to {team}', { team: name(otherTeam(state.turn)), n: active.square + 1 })
                : t('Square {n} stays open. A wrong call can\'t win the game for {team}.', { team: name(otherTeam(state.turn)), n: active.square + 1 })}
          </p>
          <button type="button" className="ks-btn ks-btn-xl ks-btn-primary w-full" onClick={() => dispatchGame({ type: 'CONTINUE' })}>
            {t('Continue')}
          </button>
        </>
      );
      break;

    case 'gameWon':
      controls = state.gameWinner !== null && (
        <>
          <p className="text-3xl font-extrabold">{t('{team} wins game {n}!', { team: name(state.gameWinner), n: state.game + 1 })}</p>
          <button type="button" className="ks-btn ks-btn-xl ks-btn-primary w-full" onClick={() => dispatchGame({ type: 'NEXT_GAME' })}>
            {matchDecided(state) ? t('Show the match winner') : t('Start game {n}', { n: state.game + 2 })}
          </button>
        </>
      );
      break;

    case 'matchOver': {
      const winner = matchWinner(state);
      controls = (
        <>
          <p className="text-3xl font-extrabold">{winner === 'tie' ? t("It's a tie!") : t('{team} wins the match!', { team: name(winner) })}</p>
          <button type="button" className="ks-btn ks-btn-xl ks-btn-primary w-full" onClick={() => navigate('/new')}>
            {t('New game')}
          </button>
        </>
      );
      break;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TeamCards state={state} active={state.phase === 'pick' || state.phase === 'question' ? state.turn : null} />
        <a className="ks-btn ks-btn-sm ks-btn-ghost" href={routeUrl('/game')} target="_blank" rel="noreferrer">
          <MonitorPlay aria-hidden className="h-5 w-5" />
          {t('Open the game screen')}
        </a>
      </div>
      <p className="ks-muted">
        {state.config.gamesToWin === 1 ? t('One game') : t('Game {n} · First to {wins} wins', { n: state.game + 1, wins: state.config.gamesToWin })} ·{' '}
        {t('Keyboard: 1 to 9 picks a square, T or V calls true, F calls false')}
      </p>
      {controls}
      {state.phase !== 'matchOver' && (
        <div className="flex flex-wrap items-center gap-3">
          {confirmEnd ? (
            <>
              <span className="font-semibold">{t('End this match now?')}</span>
              <button
                type="button"
                className="ks-btn ks-btn-sm ks-btn-danger"
                onClick={() => {
                  setConfirmEnd(false);
                  dispatchGame({ type: 'FINISH' });
                }}
              >
                {t('Yes, end it')}
              </button>
              <button type="button" className="ks-btn ks-btn-sm ks-btn-ghost" onClick={() => setConfirmEnd(false)}>
                {t('Keep playing')}
              </button>
            </>
          ) : (
            <button type="button" className="ks-btn ks-btn-sm ks-btn-ghost" onClick={() => setConfirmEnd(true)}>
              {t('End match')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
