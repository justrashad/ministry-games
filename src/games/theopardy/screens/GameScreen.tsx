import type { ReactNode } from 'react';
import { useT } from '../../../core/i18n/i18n';
import { RemotePanel } from '../components/RemotePanel';
import { ScoreChips, TEAMS, Wordmark } from '../components/parts';
import { activeTile, currentBoard, gameWinner, isLastRound } from '../engine/game';
import { useGameSounds, useKeyboardBuzzers, useUnlockSound } from '../hooks/useGameEffects';
import { useGameState } from '../sync/gameStore';
import type { GameState, TeamIndex } from '../types';

const CLUE_TEXT = 'text-[clamp(1.6rem,4.3vw,5rem)] font-extrabold leading-[1.12]';
const BIG = 'text-[clamp(2rem,6vw,7rem)] font-extrabold leading-none';
const NOTE = 'text-[clamp(1rem,1.6vw,1.9rem)] font-semibold';

function Frame({ state, middle, lead, children }: { state: GameState; middle: string; lead?: TeamIndex | null; children: ReactNode }) {
  return (
    <main className="flex h-[100dvh] flex-col gap-[1.6vw] overflow-hidden px-[3.4vw] pb-[max(3vw,60px)] pt-[2.4vw]">
      <header className="flex items-center justify-between gap-[2vw]">
        <Wordmark className="text-[clamp(1.5rem,3.6vw,4rem)]" />
        <p className={`${NOTE} text-sea-300`}>{middle}</p>
        <ScoreChips state={state} lead={lead} size="tv" />
      </header>
      {children}
    </main>
  );
}

function Board({ state }: { state: GameState }) {
  const board = currentBoard(state);
  if (!board) return null;
  const columns = board.categories.length;
  return (
    <div className="grid min-h-0 flex-1 gap-[0.8vw]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: 'minmax(0, 0.9fr) repeat(5, minmax(0, 1fr))' }}>
      {board.categories.map((category) => (
        <h2 key={category.name} className="tp-category text-[clamp(0.7rem,1.25vw,1.5rem)]">
          {category.name}
        </h2>
      ))}
      {[0, 1, 2, 3, 4].map((row) =>
        board.categories.map((category) => {
          const tile = category.tiles[row];
          return tile.done ? (
            <div key={`${category.name}-${row}`} className="tp-tile-done" aria-hidden />
          ) : (
            <div key={`${category.name}-${row}`} className="tp-tile text-[clamp(1.4rem,3.6vw,4.2rem)]">
              {tile.value}
            </div>
          );
        }),
      )}
    </div>
  );
}

function Card({ label, children, footer }: { label: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <>
      <section className="tp-pop flex min-h-0 flex-1 flex-col justify-center gap-[2vw] rounded-[1.4vw] bg-sea-500 px-[5.5vw] py-[3vw] text-white">
        <p className="text-[clamp(0.9rem,1.7vw,2rem)] font-bold uppercase tracking-wider">{label}</p>
        {children}
      </section>
      <div className="flex min-h-[4.4vw] items-center justify-between gap-[2vw]">{footer}</div>
    </>
  );
}

function TeamBanner({ team, text }: { team: TeamIndex; text: string }) {
  return <p className={`tp-team-${team} tp-pop rounded-xl px-[2vw] py-[0.9vw] text-[clamp(1.1rem,2.3vw,2.7rem)] font-extrabold`}>{text}</p>;
}

export function GameScreen() {
  const t = useT();
  const state = useGameState();
  useGameSounds(state);
  useUnlockSound();
  useKeyboardBuzzers();

  if (!state) {
    return (
      <main className="flex h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
        <Wordmark className="text-[clamp(3rem,9vw,9rem)]" />
        <p className="text-2xl font-semibold text-sea-300">{t('Waiting for the host to start a game.')}</p>
        <p className="max-w-xl text-lg text-sea-300">{t('Keep this window on the TV. Start the game from the host controls on this computer, or connect a phone.')}</p>
        <RemotePanel />
      </main>
    );
  }

  const name = (team: TeamIndex) => state.config.teams[team].name;
  const roundLabel = t('Round {n} of {total}', { n: state.round + 1, total: state.boards.length });
  const tile = activeTile(state);
  const board = currentBoard(state);
  const active = state.active;
  const clueLabel = tile && board && active ? `${board.categories[active.category].name} · ${active.value}` : '';

  let view: ReactNode;
  switch (state.phase) {
    case 'intro':
      view = (
        <Frame state={state} middle={t('Get ready')}>
          <div className="flex flex-1 flex-col items-center justify-center gap-[2vw] text-center">
            <p className={`${BIG} tp-pop`}>
              {name(0)} <span className="text-sea-300">{t('vs')}</span> {name(1)}
            </p>
            <p className={`${NOTE} text-sea-300`}>{t('Both teams race to buzz. A wrong answer costs nothing.')}</p>
          </div>
        </Frame>
      );
      break;

    case 'board':
      view = (
        <Frame state={state} middle={`${roundLabel} · ${t('{team} picks', { team: name(state.control) })}`} lead={state.control}>
          <Board state={state} />
        </Frame>
      );
      break;

    case 'clue':
    case 'answering':
      view = (
        <Frame state={state} middle={roundLabel} lead={active?.answering ?? null}>
          <Card
            label={active?.bonus ? `${clueLabel} · ${t('Bonus tile: double points')}` : clueLabel}
            footer={
              active && active.answering !== null ? (
                <>
                  <TeamBanner team={active.answering} text={active.missed.length > 0 ? t('{team}, your turn to answer', { team: name(active.answering) }) : t('{team} buzzed in', { team: name(active.answering) })} />
                  {active.missed.length === 0 && <p className={`${NOTE} text-sea-300`}>{t('A wrong answer costs nothing.')}</p>}
                </>
              ) : (
                <p className={`${NOTE} text-ice-300`}>{t('Buzzers are open')}</p>
              )
            }
          >
            <p className={CLUE_TEXT}>{tile?.clue.prompt}</p>
          </Card>
        </Frame>
      );
      break;

    case 'reveal':
      view = (
        <Frame state={state} middle={roundLabel} lead={active?.winner ?? null}>
          <Card
            label={clueLabel}
            footer={
              active && active.winner !== null ? (
                <TeamBanner team={active.winner} text={t('{team} +{points}', { team: name(active.winner), points: active.value })} />
              ) : (
                <p className={`${NOTE} text-sea-300`}>{t('No points this time')}</p>
              )
            }
          >
            <p className="text-[clamp(1rem,2vw,2.4rem)] font-semibold text-sea-100">{tile?.clue.prompt}</p>
            <p className={BIG}>{tile?.clue.answer}</p>
            {tile?.clue.reference && <p className="text-[clamp(0.9rem,1.7vw,2rem)] font-semibold text-sea-100">{tile.clue.reference}</p>}
          </Card>
        </Frame>
      );
      break;

    case 'roundOver':
      view = (
        <Frame state={state} middle={roundLabel}>
          <div className="flex flex-1 flex-col items-center justify-center gap-[2vw] text-center">
            <p className={`${BIG} tp-pop`}>{t('End of round {n}', { n: state.round + 1 })}</p>
            <p className={`${NOTE} text-sea-300`}>{isLastRound(state) ? (state.final ? t('The final round is next.') : t('That was the last board.')) : t('Round {n} is worth double.', { n: state.round + 2 })}</p>
          </div>
        </Frame>
      );
      break;

    case 'finalIntro':
      view = (
        <Frame state={state} middle={t('Final round')}>
          <div className="flex flex-1 flex-col items-center justify-center gap-[2vw] text-center">
            <p className={`${BIG} tp-pop`}>{t('Final round')}</p>
            <p className={`${NOTE} max-w-[60vw] text-sea-300`}>{t('One clue for both teams. A right answer is worth {points} points, and nothing is at risk.', { points: state.config.finalValue.toLocaleString() })}</p>
          </div>
        </Frame>
      );
      break;

    case 'finalClue':
      view = (
        <Frame state={state} middle={t('Final round')}>
          <Card label={t('Final round')} footer={<p className={`${NOTE} text-ice-300`}>{t('Talk it over and write down your answer.')}</p>}>
            <p className={CLUE_TEXT}>{state.final?.clue.prompt}</p>
          </Card>
        </Frame>
      );
      break;

    case 'finalReveal':
      view = (
        <Frame state={state} middle={t('Final round')}>
          <Card
            label={t('Final round')}
            footer={
              <div className="flex flex-wrap gap-[1vw]">
                {TEAMS.map((team) => {
                  const result = state.final?.results[team];
                  if (result === null || result === undefined) return null;
                  return <TeamBanner key={team} team={team} text={result ? t('{team} +{points}', { team: name(team), points: state.config.finalValue.toLocaleString() }) : t('{team}: not this time', { team: name(team) })} />;
                })}
              </div>
            }
          >
            <p className="text-[clamp(1rem,2vw,2.4rem)] font-semibold text-sea-100">{state.final?.clue.prompt}</p>
            <p className={BIG}>{state.final?.clue.answer}</p>
            {state.final?.clue.reference && <p className="text-[clamp(0.9rem,1.7vw,2rem)] font-semibold text-sea-100">{state.final.clue.reference}</p>}
          </Card>
        </Frame>
      );
      break;

    case 'gameOver': {
      const winner = gameWinner(state);
      view = (
        <Frame state={state} middle={t('Game over')} lead={winner === 'tie' ? null : winner}>
          <div className="flex flex-1 flex-col items-center justify-center gap-[2vw] text-center">
            <p className={`${BIG} tp-pop`}>{winner === 'tie' ? t("It's a tie!") : t('{team} wins!', { team: name(winner) })}</p>
            <p className={`${NOTE} text-sea-300`}>{t('Thanks for playing.')}</p>
          </div>
        </Frame>
      );
      break;
    }
  }

  return (
    <>
      {view}
      <RemotePanel />
    </>
  );
}
