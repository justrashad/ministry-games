import { useSoundLeader } from '../../../core/audio/hooks';
import { startDisplayPresence } from '../../../core/sync/presence';
import { useEffect, type ReactNode } from 'react';
import { useT } from '../../../core/i18n/i18n';
import { RemotePanel } from '../components/RemotePanel';
import { BoardGrid, TeamCards, Wordmark } from '../components/parts';
import { matchDecided, matchWinner, otherTeam } from '../engine/game';
import { useGameSounds, useKeyboardCalls } from '../hooks/useGameEffects';
import { useGameState } from '../sync/gameStore';
import type { GameState, TeamIndex } from '../types';

const STATEMENT = 'text-[clamp(1.5rem,4vw,4.6rem)] font-extrabold leading-[1.15]';
const BIG = 'text-[clamp(2rem,6vw,7rem)] font-extrabold leading-none';
const NOTE = 'text-[clamp(1rem,1.6vw,1.9rem)] font-semibold';

function Frame({ state, middle, active, children }: { state: GameState; middle: string; active?: TeamIndex | null; children: ReactNode }) {
  return (
    <main className="flex h-[100dvh] flex-col gap-[2vh] overflow-hidden px-[3vw] pb-[max(3vw,64px)] pt-[2.4vw]">
      <header className="flex items-center justify-between gap-[2vw]">
        <Wordmark className="text-[clamp(1.5rem,3.2vw,3.8rem)]" />
        <p className={`${NOTE} text-center text-ks-muted`}>{middle}</p>
        <TeamCards state={state} active={active ?? null} size="tv" />
      </header>
      {children}
    </main>
  );
}

function TeamBanner({ team, text }: { team: TeamIndex; text: string }) {
  return <p className={`ks-team-${team} ks-pop rounded-2xl px-[2vw] py-[1vw] text-[clamp(1.1rem,2.3vw,2.7rem)] font-extrabold`}>{text}</p>;
}

function Board({ state, rings = [], side = false }: { state: GameState; rings?: number[]; side?: boolean }) {
  return <BoardGrid squares={state.squares} rings={rings} teamNames={state.config.teams.map((team) => team.name)} size={side ? 'side' : 'tv'} />;
}

export function GameScreen() {
  const t = useT();
  const state = useGameState();
  const lead = useSoundLeader('display');
  useEffect(() => startDisplayPresence(), []);
  useGameSounds(state, lead, true);
  useKeyboardCalls();

  if (!state) {
    return (
      <main className="flex h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
        <Wordmark className="text-[clamp(3rem,9vw,9rem)]" />
        <p className="text-2xl font-semibold text-ks-muted">{t('Waiting for the host to start a game.')}</p>
        <p className="max-w-xl text-lg text-ks-muted">{t('Keep this window on the TV. Start the game from the host controls on this computer, or connect a phone.')}</p>
        <RemotePanel />
      </main>
    );
  }

  const name = (team: TeamIndex) => state.config.teams[team].name;
  const gameLabel =
    state.config.gamesToWin === 1 ? t('One game') : t('Game {n} · First to {wins} wins', { n: state.game + 1, wins: state.config.gamesToWin });
  const active = state.active;

  let view: ReactNode;
  switch (state.phase) {
    case 'intro':
      view = (
        <Frame state={state} middle={t('Get ready')}>
          <div className="flex flex-1 flex-col items-center justify-center gap-[3vh] text-center">
            <p className={`${BIG} ks-pop`}>
              {name(0)} <span className="text-ks-muted">{t('vs')}</span> {name(1)}
            </p>
            <p className={`${NOTE} max-w-[70vw] text-ks-muted`}>{t('Pick a square and call the statement true or false. Three in a row, or any five squares, wins the game.')}</p>
          </div>
        </Frame>
      );
      break;

    case 'pick':
      view = (
        <Frame state={state} middle={gameLabel} active={state.turn}>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <Board state={state} />
          </div>
          <div className="flex justify-center">
            <TeamBanner team={state.turn} text={t('{team}, pick a square', { team: name(state.turn) })} />
          </div>
        </Frame>
      );
      break;

    case 'question':
      view = active && (
        <Frame state={state} middle={gameLabel} active={state.turn}>
          <div className="flex min-h-0 flex-1 items-stretch gap-[2.5vw]">
            <div className="flex w-[min(40vw,58vh)] shrink-0 items-center">
              <Board state={state} rings={[active.square]} side />
            </div>
            <section className="ks-card ks-pop flex min-w-0 flex-1 flex-col justify-center gap-[2.5vh] rounded-[1.4vw] px-[4vw] py-[3vh]">
              <p className="text-[clamp(0.9rem,1.6vw,1.9rem)] font-bold uppercase tracking-wider">{t('Square {n} · True or false?', { n: active.square + 1 })}</p>
              <p className={STATEMENT}>{active.question.statement}</p>
            </section>
          </div>
          <div className="flex justify-center">
            <TeamBanner team={state.turn} text={t('{team}, true or false?', { team: name(state.turn) })} />
          </div>
        </Frame>
      );
      break;

    case 'reveal': {
      if (!active) break;
      const q = active.question;
      const correct = active.answer === q.isTrue;
      const banner =
        active.outcome === 'claimed'
          ? t('{team} takes square {n}', { team: name(state.turn), n: active.square + 1 })
          : active.outcome === 'given'
            ? t('Square {n} goes to {team}', { team: name(otherTeam(state.turn)), n: active.square + 1 })
            : t('Square {n} stays open. A wrong call can\'t win the game for {team}.', { team: name(otherTeam(state.turn)), n: active.square + 1 });
      const bannerTeam: TeamIndex = active.outcome === 'given' ? otherTeam(state.turn) : state.turn;
      view = (
        <Frame state={state} middle={gameLabel} active={state.turn}>
          <div className="flex min-h-0 flex-1 items-stretch gap-[2.5vw]">
            <div className="flex w-[min(40vw,58vh)] shrink-0 items-center">
              <Board state={state} rings={[active.square]} side />
            </div>
            <section className="ks-card ks-pop flex min-w-0 flex-1 flex-col justify-center gap-[2vh] rounded-[1.4vw] px-[4vw] py-[3vh]">
              <p className="text-[clamp(1rem,1.9vw,2.2rem)] font-semibold">{q.statement}</p>
              <p className={BIG}>{q.isTrue ? t('True') : t('False')}</p>
              {!q.isTrue && q.correction && <p className="text-[clamp(1.1rem,2.3vw,2.7rem)] font-bold leading-snug">{q.correction}</p>}
              {q.reference && <p className="text-[clamp(0.9rem,1.6vw,1.9rem)] font-semibold">{q.reference}</p>}
            </section>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-[1.5vw]">
            <p className={`${NOTE} text-ks-muted`}>{correct ? t('{team} called it right', { team: name(state.turn) }) : t('{team} called it wrong', { team: name(state.turn) })}</p>
            {active.outcome === 'blocked' ? (
              <p className="ks-pop rounded-2xl bg-ks-sunk px-[2vw] py-[1vw] text-[clamp(1.1rem,2.3vw,2.7rem)] font-extrabold">{banner}</p>
            ) : (
              <TeamBanner team={bannerTeam} text={banner} />
            )}
          </div>
        </Frame>
      );
      break;
    }

    case 'gameWon': {
      const winner = state.gameWinner;
      if (winner === null) break;
      view = (
        <Frame state={state} middle={gameLabel} active={winner}>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <Board state={state} rings={state.winLine ?? state.squares.flatMap((owner, i) => (owner === winner ? [i] : []))} />
          </div>
          <div className="flex flex-col items-center gap-[1vh]">
            <TeamBanner team={winner} text={state.winLine ? t('{team} wins with three in a row!', { team: name(winner) }) : t('{team} wins with five squares!', { team: name(winner) })} />
            <p className={`${NOTE} text-ks-muted`}>{matchDecided(state) ? t('That wins the match.') : t('{team} picks first in the next game.', { team: name(otherTeam(state.starter)) })}</p>
          </div>
        </Frame>
      );
      break;
    }

    case 'matchOver': {
      const winner = matchWinner(state);
      view = (
        <Frame state={state} middle={t('Match over')} active={winner === 'tie' ? null : winner}>
          <div className="flex flex-1 flex-col items-center justify-center gap-[3vh] text-center">
            <p className={`${BIG} ks-pop`}>{winner === 'tie' ? t("It's a tie!") : t('{team} wins the match!', { team: name(winner) })}</p>
            <p className={`${NOTE} text-ks-muted`}>{t('Games won: {a} {wa}, {b} {wb}', { a: name(0), wa: state.wins[0], b: name(1), wb: state.wins[1] })}</p>
            <p className={`${NOTE} text-ks-muted`}>{t('Thanks for playing.')}</p>
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
