import { useSoundLeader } from '../../../core/audio/hooks';
import { useGameSounds } from '../hooks/useGameEffects';
import { useState, type ReactNode } from 'react';
import { Check, Minus, MonitorPlay, Plus, X } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import { ScoreChips, TEAMS } from '../components/parts';
import { activeTile, currentBoard, gameWinner, isLastRound, otherTeam } from '../engine/game';
import { useKeyboardBuzzers } from '../hooks/useGameEffects';
import { navigate, routeUrl } from '../lib/router';
import { dispatchGame, useGameState } from '../sync/gameStore';
import type { ClueQuestion } from '../../../core/questions/types';
import type { GameState, TeamIndex } from '../types';

/** The clue with its answer, for the host's eyes only. */
function HostClue({ clue, label }: { clue: ClueQuestion; label: string }) {
  const t = useT();
  return (
    <div className="tp-panel">
      <p className="tp-label">{label}</p>
      <p className="text-xl font-semibold">{clue.prompt}</p>
      <p className="mt-3 text-sm font-bold uppercase tracking-wide text-sea-300">{t('Answer')}</p>
      <p className="text-3xl font-extrabold text-white">{clue.answer}</p>
      {clue.accept && clue.accept.length > 0 && (
        <p className="mt-1 tp-muted">
          {t('Also accept:')} {clue.accept.join(' · ')}
        </p>
      )}
      {clue.reference && <p className="mt-1 tp-muted">{clue.reference}</p>}
    </div>
  );
}

function ScoreAdjust({ state }: { state: GameState }) {
  const t = useT();
  const step = state.config.baseValue;
  return (
    <details className="tp-panel">
      <summary className="cursor-pointer text-lg font-bold">{t('Fix a score')}</summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {TEAMS.map((team) => (
          <div key={team} className="flex items-center justify-between gap-2 rounded-xl bg-sea-900 p-2">
            <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost" aria-label={t('Take {points} from {team}', { points: step, team: state.config.teams[team].name })} onClick={() => dispatchGame({ type: 'ADJUST_SCORE', team, delta: -step })}>
              <Minus aria-hidden className="h-5 w-5" />
            </button>
            <span className="font-bold">
              {state.config.teams[team].name}: {state.scores[team].toLocaleString()}
            </span>
            <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost" aria-label={t('Give {points} to {team}', { points: step, team: state.config.teams[team].name })} onClick={() => dispatchGame({ type: 'ADJUST_SCORE', team, delta: step })}>
              <Plus aria-hidden className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </details>
  );
}

function BoardPicker({ state }: { state: GameState }) {
  const t = useT();
  const board = currentBoard(state);
  if (!board) return null;
  return (
    <div className="tp-panel">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-bold">{t('{team} picks', { team: state.config.teams[state.control].name })}</p>
        <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost" onClick={() => dispatchGame({ type: 'SET_CONTROL', team: otherTeam(state.control) })}>
          {t('Give the pick to {team}', { team: state.config.teams[otherTeam(state.control)].name })}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {board.categories.map((category, c) => (
          <fieldset key={category.name} className="rounded-xl bg-sea-900 p-3">
            <legend className="px-1 text-sm font-bold uppercase tracking-wide text-sea-200">{category.name}</legend>
            <div className="flex flex-wrap gap-2">
              {category.tiles.map((tile, i) => (
                <button
                  key={tile.clue.id}
                  type="button"
                  className={`tp-btn tp-btn-sm min-w-[4.25rem] flex-1 ${tile.done ? 'tp-btn-ghost' : 'tp-btn-primary'}`}
                  disabled={tile.done}
                  aria-label={t('{category} for {value}', { category: category.name, value: tile.value })}
                  onClick={() => dispatchGame({ type: 'SELECT', category: c, tile: i })}
                >
                  {tile.value}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}

export function HostScreen() {
  const t = useT();
  const state = useGameState();
  useGameSounds(state, useSoundLeader('host'));
  const [confirmEnd, setConfirmEnd] = useState(false);
  useKeyboardBuzzers();

  if (!state) {
    return (
      <div className="tp-panel text-center">
        <h1 className="text-3xl">{t('No game is running')}</h1>
        <p className="mt-2 tp-muted">{t('Start a new game to get the host controls.')}</p>
        <button type="button" className="tp-btn tp-btn-accent mt-5" onClick={() => navigate('/new')}>
          {t('New game')}
        </button>
      </div>
    );
  }

  const name = (team: TeamIndex) => state.config.teams[team].name;
  const tile = activeTile(state);
  const board = currentBoard(state);
  const active = state.active;
  const clueLabel = tile && board && active ? `${board.categories[active.category].name} · ${active.value}${active.bonus ? ` · ${t('Bonus tile: double points')}` : ''}` : '';

  let controls: ReactNode = null;
  switch (state.phase) {
    case 'intro':
      controls = (
        <button type="button" className="tp-btn tp-btn-xl tp-btn-accent w-full" onClick={() => dispatchGame({ type: 'START' })}>
          {t('Start game')}
        </button>
      );
      break;

    case 'board':
      controls = <BoardPicker state={state} />;
      break;

    case 'clue':
      controls = tile && (
        <>
          <HostClue clue={tile.clue} label={clueLabel} />
          <p className="text-lg font-bold">{t('Who buzzed first?')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {TEAMS.map((team) => (
              <button key={team} type="button" className={`tp-btn tp-btn-xl tp-team-${team}`} disabled={active?.missed.includes(team)} onClick={() => dispatchGame({ type: 'BUZZ', team })}>
                {name(team)}
              </button>
            ))}
          </div>
          <button type="button" className="tp-btn tp-btn-ghost w-full" onClick={() => dispatchGame({ type: 'REVEAL' })}>
            {t('Nobody knows: show the answer')}
          </button>
        </>
      );
      break;

    case 'answering':
      controls = tile && active && active.answering !== null && (
        <>
          <HostClue clue={tile.clue} label={clueLabel} />
          <p className="text-lg font-bold">{t('{team} is answering', { team: name(active.answering) })}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="tp-btn tp-btn-xl tp-btn-good" onClick={() => dispatchGame({ type: 'JUDGE', correct: true })}>
              <Check aria-hidden className="h-7 w-7" />
              {t('Right')}
            </button>
            <button type="button" className="tp-btn tp-btn-xl tp-btn-bad" onClick={() => dispatchGame({ type: 'JUDGE', correct: false })}>
              <X aria-hidden className="h-7 w-7" />
              {t('Wrong')}
            </button>
          </div>
          <p className="tp-muted">
            {active.missed.length === 0 ? t('If this is wrong, {team} gets a try. Nobody loses points.', { team: name(otherTeam(active.answering)) }) : t('If this is wrong too, the answer is shown and nobody scores.')}
          </p>
        </>
      );
      break;

    case 'reveal':
      controls = tile && (
        <>
          <HostClue clue={tile.clue} label={clueLabel} />
          <p className="text-lg font-bold">{active && active.winner !== null ? t('{team} +{points}', { team: name(active.winner), points: active.value }) : t('No points this time')}</p>
          <button type="button" className="tp-btn tp-btn-xl tp-btn-accent w-full" onClick={() => dispatchGame({ type: 'CONTINUE' })}>
            {t('Back to the board')}
          </button>
        </>
      );
      break;

    case 'roundOver':
      controls = (
        <button type="button" className="tp-btn tp-btn-xl tp-btn-accent w-full" onClick={() => dispatchGame({ type: 'NEXT_ROUND' })}>
          {!isLastRound(state) ? t('Start round {n}', { n: state.round + 2 }) : state.final ? t('Go to the final round') : t('Show the winner')}
        </button>
      );
      break;

    case 'finalIntro':
      controls = (
        <button type="button" className="tp-btn tp-btn-xl tp-btn-accent w-full" onClick={() => dispatchGame({ type: 'FINAL_SHOW_CLUE' })}>
          {t('Show the final clue')}
        </button>
      );
      break;

    case 'finalClue':
      controls = state.final && (
        <>
          <HostClue clue={state.final.clue} label={t('Final round')} />
          <p className="tp-muted">{t('Give both teams time to write an answer, then show it.')}</p>
          <button type="button" className="tp-btn tp-btn-xl tp-btn-accent w-full" onClick={() => dispatchGame({ type: 'FINAL_REVEAL' })}>
            {t('Show the answer')}
          </button>
        </>
      );
      break;

    case 'finalReveal':
      controls = state.final && (
        <>
          <HostClue clue={state.final.clue} label={t('Final round')} />
          {TEAMS.map((team) => {
            const result = state.final?.results[team];
            return (
              <div key={team} className="tp-panel flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-bold">{t("{team}'s answer", { team: name(team) })}</p>
                <div className="flex gap-2">
                  <button type="button" className={`tp-btn ${result === true ? 'tp-btn-good' : 'tp-btn-ghost'}`} aria-pressed={result === true} onClick={() => dispatchGame({ type: 'FINAL_JUDGE', team, correct: true })}>
                    {t('Right')}
                  </button>
                  <button type="button" className={`tp-btn ${result === false ? 'tp-btn-bad' : 'tp-btn-ghost'}`} aria-pressed={result === false} onClick={() => dispatchGame({ type: 'FINAL_JUDGE', team, correct: false })}>
                    {t('Wrong')}
                  </button>
                </div>
              </div>
            );
          })}
          <button type="button" className="tp-btn tp-btn-xl tp-btn-accent w-full" disabled={state.final.results.includes(null)} onClick={() => dispatchGame({ type: 'FINISH' })}>
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
          <button type="button" className="tp-btn tp-btn-xl tp-btn-accent w-full" onClick={() => navigate('/new')}>
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
        <ScoreChips state={state} lead={active?.answering ?? (state.phase === 'board' ? state.control : null)} />
        <a className="tp-btn tp-btn-sm tp-btn-ghost" href={routeUrl('/game')} target="_blank" rel="noreferrer">
          <MonitorPlay aria-hidden className="h-5 w-5" />
          {t('Open the game screen')}
        </a>
      </div>
      <p className="tp-muted">
        {t('Round {n} of {total}', { n: state.round + 1, total: state.boards.length })} · {t('Keyboard buzzers: A for {a}, L for {b}', { a: name(0), b: name(1) })}
      </p>
      {controls}
      <ScoreAdjust state={state} />
      {state.phase !== 'gameOver' && (
        <div className="flex flex-wrap items-center gap-3">
          {confirmEnd ? (
            <>
              <span className="font-semibold">{t('End this game now?')}</span>
              <button
                type="button"
                className="tp-btn tp-btn-sm tp-btn-bad"
                onClick={() => {
                  setConfirmEnd(false);
                  dispatchGame({ type: 'FINISH' });
                }}
              >
                {t('Yes, end it')}
              </button>
              <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost" onClick={() => setConfirmEnd(false)}>
                {t('Keep playing')}
              </button>
            </>
          ) : (
            <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost" onClick={() => setConfirmEnd(true)}>
              {t('End game')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
