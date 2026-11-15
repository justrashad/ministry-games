import { useSoundLeader } from '../../../core/audio/hooks';
import { startDisplayPresence } from '../../../core/sync/presence';
import { useEffect, type ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import { RemotePanel } from '../components/RemotePanel';
import { BoardView, boxColor, formatSeconds, HelpChips, Ladders, RainbowStripes, RainbowWord, STAGE_NAMES, TEAMS, useSecondsLeft, Wordmark } from '../components/parts';
import { activeQuestion, gameWinner, rungs } from '../engine/game';
import { useGameSounds, useKeyboardJudge } from '../hooks/useGameEffects';
import { useGameState } from '../sync/gameStore';
import type { GameState, TeamIndex } from '../types';

const QUESTION = 'text-[clamp(1.5rem,4vw,4.6rem)] font-extrabold leading-[1.12]';
const BIG = 'text-[clamp(2rem,6vw,7rem)] font-extrabold leading-none';
const NOTE = 'text-[clamp(1rem,1.6vw,1.9rem)] font-semibold';

function Frame({ state, middle, active, children }: { state: GameState; middle: string; active?: TeamIndex | null; children: ReactNode }) {
  return (
    <main className="flex h-[100dvh] flex-col gap-[2vh] overflow-hidden px-[3vw] pb-[max(3vw,64px)] pt-[2.4vw]">
      <header className="flex items-center justify-between gap-[2vw]">
        <Wordmark className="text-[clamp(1.3rem,2.9vw,3.4rem)]" />
        <p className={`${NOTE} shrink-0 text-sb-muted`}>{middle}</p>
      </header>
      <div className="flex min-h-0 flex-1 gap-[2.5vw]">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-[2vh]">{children}</div>
        <Ladders state={state} active={active ?? null} size="tv" />
      </div>
    </main>
  );
}

function TeamBanner({ team, text }: { team: TeamIndex; text: string }) {
  return <p className={`sb-team-${team} sb-pop self-start rounded-2xl px-[2vw] py-[1vh] text-[clamp(1.1rem,2.3vw,2.7rem)] font-extrabold`}>{text}</p>;
}

/** The question card, in the color of the box it came from. The bonus question card is dark with the rainbow band across its top. */
function Card({ label, color, children }: { label: string; color?: string; children: ReactNode }) {
  return (
    <section
      className="sb-pop relative flex min-h-0 flex-1 flex-col justify-center gap-[2.5vh] overflow-hidden rounded-[1.4vw] px-[4vw] py-[3vh] text-white"
      style={{ backgroundColor: color ?? 'var(--sb-text)' }}
    >
      {!color && <RainbowStripes className="absolute inset-x-0 top-0 h-[1.6vh]" />}
      <p className="text-[clamp(0.9rem,1.6vw,1.9rem)] font-bold uppercase tracking-wider">{label}</p>
      {children}
    </section>
  );
}

/** The verse reference and countdown while Search the Scriptures is running. */
function Lookup({ reference, until }: { reference?: string; until: number | null }) {
  const t = useT();
  const left = useSecondsLeft(until);
  if (left === null) return null;
  return (
    <div className="sb-pop flex flex-wrap items-center gap-[1.5vw] rounded-2xl px-[2vw] py-[1vh] text-white" style={{ backgroundColor: 'var(--sb-box-5)' }}>
      <BookOpen aria-hidden className="h-[clamp(1.4rem,2.6vw,3rem)] w-[clamp(1.4rem,2.6vw,3rem)]" />
      <p className="text-[clamp(1.1rem,2.3vw,2.7rem)] font-extrabold">{reference ? t('Look up {reference}', { reference }) : t('Search the Scriptures')}</p>
      <p className="text-[clamp(1.1rem,2.3vw,2.7rem)] font-extrabold tabular-nums" role="timer">
        {left > 0 ? formatSeconds(left) : t("Time's up")}
      </p>
    </div>
  );
}

export function GameScreen() {
  const t = useT();
  const state = useGameState();
  const lead = useSoundLeader('display');
  useEffect(() => startDisplayPresence(), []);
  useGameSounds(state, lead, true);
  useKeyboardJudge();

  if (!state) {
    return (
      <main className="flex h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
        <Wordmark className="text-[clamp(2.5rem,7vw,7rem)]" />
        <p className="text-2xl font-semibold text-sb-muted">{t('Waiting for the host to start a game.')}</p>
        <p className="max-w-xl text-lg text-sb-muted">{t('Keep this window on the TV. Start the game from the host controls on this computer, or connect a phone.')}</p>
        <RainbowStripes top />
        <RemotePanel />
      </main>
    );
  }

  const name = (team: TeamIndex) => state.config.teams[team].name;
  const a = state.active;
  const question = activeQuestion(state);
  const label = a && question ? `${t(STAGE_NAMES[a.stage])} · ${question.category}` : '';
  const color = a ? boxColor(a.stage, a.slot, state.config.perStage) : undefined;

  let view: ReactNode;
  switch (state.phase) {
    case 'intro':
      view = (
        <Frame state={state} middle={t('Get ready')}>
          <div className="flex flex-1 flex-col items-center justify-center gap-[3vh] text-center">
            <p className={`${BIG} sb-pop`}>
              {name(0)} <span className="text-sb-muted">{t('vs')}</span> {name(1)}
            </p>
            <p className={`${NOTE} max-w-[60vw] text-sb-muted`}>{t('Each team climbs its own ladder, one right answer at a time, from Newborn questions to Mature ones.')}</p>
          </div>
        </Frame>
      );
      break;

    case 'pick':
      view = (
        <Frame state={state} middle={t('Board for {team}', { team: name(state.turn) })} active={state.turn}>
          <BoardView board={state.boards[state.turn]} size="tv" />
          <div className="flex flex-wrap items-center justify-between gap-[1vw]">
            <TeamBanner team={state.turn} text={t('{team}, pick a subject', { team: name(state.turn) })} />
            <HelpChips state={state} team={state.turn} size="tv" />
          </div>
        </Frame>
      );
      break;

    case 'question':
    case 'missed':
      view = a && question && (
        <Frame state={state} middle={a.retry ? t('Second Try') : label} active={a.team}>
          <Card label={label} color={color}>
            <p className={QUESTION}>{question.prompt}</p>
          </Card>
          <Lookup reference={question.reference} until={a.lookupUntil} />
          <div className="flex flex-wrap items-center justify-between gap-[1vw]">
            {state.phase === 'missed' ? (
              <p className={`${NOTE} sb-pop text-sb-alert`}>{t('Not quite. {team} can use Second Try.', { team: name(a.team) })}</p>
            ) : (
              <TeamBanner team={a.team} text={a.retry ? t('{team}, one more try', { team: name(a.team) }) : t('{team}, your answer?', { team: name(a.team) })} />
            )}
            <HelpChips state={state} team={a.team} size="tv" />
          </div>
        </Frame>
      );
      break;

    case 'reveal':
      view = a && question && (
        <Frame state={state} middle={label} active={a.team}>
          <Card label={label} color={color}>
            <p className="text-[clamp(1rem,2vw,2.4rem)] font-semibold">{question.prompt}</p>
            <p className={BIG}>{question.answer}</p>
            {question.reference && <p className="text-[clamp(0.9rem,1.7vw,2rem)] font-semibold">{question.reference}</p>}
          </Card>
          {a.result === 'right' ? (
            <TeamBanner team={a.team} text={t('{team} climbs a rung!', { team: name(a.team) })} />
          ) : (
            <p className={`${NOTE} text-sb-muted`}>{t('Not this time. A wrong answer costs nothing.')}</p>
          )}
        </Frame>
      );
      break;

    case 'bonusIntro':
      view = (
        <Frame state={state} middle={t('Bonus question')}>
          <div className="flex flex-1 flex-col items-center justify-center gap-[3vh] text-center">
            <p className={`${BIG} sb-pop`}>
              <RainbowWord text={t('Bonus question')} />
            </p>
            <p className={`${NOTE} max-w-[55vw] text-sb-muted`}>{t('One Mature question for both teams. Talk it over and write down your answer. A right answer is one more rung.')}</p>
          </div>
        </Frame>
      );
      break;

    case 'bonusQuestion':
      view = state.bonus && (
        <Frame state={state} middle={t('Bonus question')}>
          <Card label={t('Bonus question')}>
            <p className={QUESTION}>{state.bonus.question.prompt}</p>
          </Card>
          <p className={`${NOTE} text-sb-accent`}>{t('Both teams, write down your answer.')}</p>
        </Frame>
      );
      break;

    case 'bonusReveal':
      view = state.bonus && (
        <Frame state={state} middle={t('Bonus question')}>
          <Card label={t('Bonus question')}>
            <p className="text-[clamp(1rem,2vw,2.4rem)] font-semibold">{state.bonus.question.prompt}</p>
            <p className={BIG}>{state.bonus.question.answer}</p>
            {state.bonus.question.reference && <p className="text-[clamp(0.9rem,1.7vw,2rem)] font-semibold">{state.bonus.question.reference}</p>}
          </Card>
          <div className="flex flex-wrap gap-[1vw]">
            {TEAMS.map((team) => {
              const result = state.bonus?.results[team];
              if (result === null || result === undefined) return null;
              return <TeamBanner key={team} team={team} text={result ? t('{team} climbs a rung!', { team: name(team) }) : t('{team}: not this time', { team: name(team) })} />;
            })}
          </div>
        </Frame>
      );
      break;

    case 'gameOver': {
      const winner = gameWinner(state);
      view = (
        <Frame state={state} middle={t('Game over')} active={winner === 'tie' ? null : winner}>
          <div className="flex flex-1 flex-col items-center justify-center gap-[3vh] text-center">
            <p className={`${BIG} sb-pop`}>
              <RainbowWord text={winner === 'tie' ? t("It's a tie!") : t('{team} wins!', { team: name(winner) })} />
            </p>
            <p className={`${NOTE} text-sb-muted`}>{t('Rungs climbed: {a} {ra}, {b} {rb}', { a: name(0), ra: rungs(state, 0), b: name(1), rb: rungs(state, 1) })}</p>
            <p className={`${NOTE} text-sb-muted`}>{t('Thanks for playing.')}</p>
          </div>
        </Frame>
      );
      break;
    }
  }

  return (
    <>
      <RainbowStripes top />
      {view}
      <RemotePanel />
    </>
  );
}
