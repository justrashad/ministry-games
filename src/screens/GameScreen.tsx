import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BellRing, Maximize, Minimize, Pause, Smartphone, Volume2 } from 'lucide-react';
import type { GameState, TeamIndex } from '../types';
import { TEAM_COLORS } from '../engine/defaults';
import { gameWinner } from '../engine/events';
import { buzzersOpen } from '../engine/game';
import { dispatchGame } from '../sync/gameStore';
import { fcTotal } from '../engine/finalChallenge';
import { fireConfetti } from '../lib/confetti';
import { sound } from '../lib/sound';
import { useGameState } from '../sync/gameStore';
import { startDisplayPresence } from '../sync/presence';
import { useSettings } from '../state/settingsStore';
import { useCelebrations, useReducedMotion } from '../hooks/useMotion';
import { useGameEvents, useGameSounds, useTimerDriver } from '../hooks/useGameEffects';
import { useCountUp } from '../hooks/useCountUp';
import { Wordmark } from '../components/game/Wordmark';
import { TeamScore } from '../components/game/TeamScore';
import { AnswerBoard } from '../components/game/AnswerBoard';
import { StrikeDisplay, StrikeOverlay } from '../components/game/StrikeDisplay';
import { RoundHeader } from '../components/game/RoundHeader';
import { TimerDisplay } from '../components/game/TimerDisplay';
import { FinalChallengeDisplay } from './final/FinalChallengeDisplay';
import { t as tt, useT } from '../i18n/i18n';
import { RemotePanel, requestRemotePanel } from '../components/game/RemotePanel';
import { useRemoteStatus } from '../sync/remote';

export function GameScreen() {
  const state = useGameState();
  const reduced = useReducedMotion();
  const celebrate = useCelebrations();
  const [strikeFlash, setStrikeFlash] = useState<{ key: number; count: number } | null>(null);
  const [shake, setShake] = useState(false);
  const [buzzFlash, setBuzzFlash] = useState<{ key: number; team: TeamIndex } | null>(null);

  // Keyboard buzzers on the TV computer: A for Team 1, L for Team 2.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.target instanceof HTMLInputElement) return;
      const key = e.key.toLowerCase();
      if (key !== 'a' && key !== 'l') return;
      const s = getLatest.current;
      if (!s || !buzzersOpen(s)) return;
      dispatchGame({ type: 'BUZZ', team: key === 'a' ? 0 : 1 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const getLatest = useRef(state);
  getLatest.current = state;

  useEffect(() => startDisplayPresence(), []);
  useEffect(() => {
    document.title = tt('Ministry Showdown | Game Screen');
  }, []);
  useGameSounds(state, true);
  useTimerDriver(state, true);

  useGameEvents(state, (event, s) => {
    if (event.kind === 'strike') {
      setStrikeFlash({ key: event.seq, count: event.value ?? 1 });
      window.setTimeout(() => setStrikeFlash((f) => (f?.key === event.seq ? null : f)), 1000);
      if (!reduced) {
        setShake(true);
        window.setTimeout(() => setShake(false), 450);
      }
    }
    if (event.kind === 'buzz' && event.team !== undefined) {
      setBuzzFlash({ key: event.seq, team: event.team });
      window.setTimeout(() => setBuzzFlash((f) => (f?.key === event.seq ? null : f)), 2200);
    }
    if (!celebrate) return;
    if (event.kind === 'stealSuccess' || event.kind === 'fcTargetReached') fireConfetti();
    if (event.kind === 'gameOver' && gameWinner(s) !== 'tie') fireConfetti({ count: 180 });
    if (event.kind === 'gameOver' && gameWinner(s) === 'tie') fireConfetti({ count: 100 });
  });

  let content;
  if (!state) content = <WaitingView />;
  else if (state.phase === 'finalChallenge' && state.finalChallenge) content = <FinalChallengeDisplay state={state} fc={state.finalChallenge} reduced={reduced} />;
  else if (state.phase === 'intro') content = <IntroView state={state} />;
  else if (state.phase === 'gameOver') content = <GameOverView state={state} reduced={reduced} />;
  else if (state.round) content = <RoundView state={state} reduced={reduced} shake={shake} />;
  else content = <WaitingView />;

  return (
    <main className="tv-root" aria-label={tt("Game screen")}>
      {content}
      {strikeFlash && !reduced && <StrikeOverlay key={strikeFlash.key} count={strikeFlash.count} />}
      {buzzFlash && state && <BuzzBanner key={buzzFlash.key} name={state.teams[buzzFlash.team].name} color={state.teams[buzzFlash.team].color} />}
      {state?.paused && <PausedOverlay />}
      <DisplayCorner />
      <RemotePanel />
    </main>
  );
}

function DisplayCorner() {
  const t = useT();
  const { audio } = useSettings();
  const [locked, setLocked] = useState(() => audio.enabled && sound.isLocked());
  const [full, setFull] = useState(() => !!document.fullscreenElement);

  useEffect(() => sound.onStateChange(() => setLocked(sound.isLocked())), []);
  useEffect(() => {
    setLocked(audio.enabled && sound.isLocked());
  }, [audio.enabled]);
  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' && !(e.target instanceof HTMLInputElement)) toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenEnabled) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else void document.documentElement.requestFullscreen().catch(() => undefined);
  };

  return (
    <div className="absolute bottom-3 right-3 z-40 flex items-center gap-2">
      {audio.enabled && locked && (
        <button type="button" className="btn btn-gold btn-sm" onClick={() => void sound.unlock()}>
          <Volume2 className="btn-icon" aria-hidden />
          <span>{t('Click to turn on sound')}</span>
        </button>
      )}
      {document.fullscreenEnabled && (
        <button
          type="button"
          className="btn btn-subtle btn-sm opacity-40 hover:opacity-100 focus-visible:opacity-100"
          onClick={toggleFullscreen}
          aria-label={full ? t('Exit full screen') : t('Full screen (F)')}
          title={full ? t('Exit full screen') : t('Full screen (F)')}
        >
          {full ? <Minimize className="btn-icon" aria-hidden /> : <Maximize className="btn-icon" aria-hidden />}
        </button>
      )}
    </div>
  );
}

function WaitingView() {
  const t = useT();
  const remote = useRemoteStatus();
  const phoneConnected = remote.role === 'room' && remote.phase === 'connected';
  return (
    <div className="flex h-full min-h-[100dvh] flex-col items-center justify-center gap-8 p-8 text-center">
      <Wordmark size="xl" />
      <div className="max-w-xl">
        <p className="font-display text-[clamp(1.2rem,2.4vw,2.2rem)] text-cream">{t('Waiting for the host to start a game.')}</p>
        <p className="mt-3 text-[clamp(0.95rem,1.4vw,1.25rem)] text-night-200">
          {phoneConnected
            ? t('Your phone is connected. Start a new game from the phone.')
            : t('Keep this window on the TV. Start the game from the Host Controls on this computer, or connect a phone as the remote.')}
        </p>
      </div>
      {!phoneConnected && (
        <button type="button" className="btn btn-gold btn-lg" onClick={requestRemotePanel}>
          <Smartphone className="btn-icon" aria-hidden />
          <span>{t('Use a phone as the remote')}</span>
        </button>
      )}
    </div>
  );
}

function IntroView({ state }: { state: GameState }) {
  const t = useT();
  const [a, b] = state.teams;
  return (
    <div className="flex h-full min-h-[100dvh] flex-col items-center justify-center gap-[5vh] p-8 text-center">
      <div className="pop-in">
        <Wordmark size="xl" />
      </div>
      <div className="rise-in flex flex-wrap items-center justify-center gap-[3vw]" style={{ animationDelay: '300ms' }}>
        <TeamName name={a.name} color={a.color} />
        <span className="grid h-[clamp(3rem,6vw,6rem)] w-[clamp(3rem,6vw,6rem)] place-items-center rounded-full bg-gold-300 font-display text-[clamp(1.2rem,2.4vw,2.4rem)] font-bold text-ink">{t('vs')}</span>
        <TeamName name={b.name} color={b.color} />
      </div>
      <p className="rise-in font-display text-[clamp(1rem,1.8vw,1.8rem)] text-night-200" style={{ animationDelay: '600ms' }}>
        {t('Get ready!')}
      </p>
    </div>
  );
}

function TeamName({ name, color }: { name: string; color: GameState['teams'][0]['color'] }) {
  const c = TEAM_COLORS[color];
  return (
    <span className="rounded-3xl px-[2.5vw] py-[1.5vh] font-display text-[clamp(1.8rem,5vw,5rem)] font-bold" style={{ background: c.hex, color: c.ink }}>
      {name}
    </span>
  );
}

function RoundView({ state, reduced, shake }: { state: GameState; reduced: boolean; shake: boolean }) {
  const { visuals } = useSettings();
  const round = state.round!;
  const regularRounds = state.roundPlan.filter((p) => !p.isFinal).length;
  const phase = state.phase;
  const playing = phase === 'playing' || phase === 'roundIntro';
  const bank = useCountUp(round.bank, reduced);
  const t = useT();

  return (
    <div className={`tv-stage ${shake ? 'shake' : ''} ${round.isFinal ? 'is-final' : ''}`}>
      <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Wordmark size="sm" />
        <RoundHeader roundIndex={round.index} totalRounds={regularRounds} isFinal={round.isFinal} multiplier={round.multiplier} />
        <div className="flex justify-end">{state.timer.durationMs > 0 && phase !== 'roundIntro' && <TimerDisplay timer={state.timer} />}</div>
      </header>

      <section className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]" aria-label={tt("Scores")}>
        <TeamScore team={state.teams[0]} index={0} reduced={reduced} playing={playing && round.controllingTeam === 0} stealing={phase === 'steal' && round.stealingTeam === 0} />
        <div className="flex flex-col items-center justify-center rounded-[22px] bg-night-950/50 px-[2vw] py-2 ring-1 ring-inset ring-white/10" aria-label={`${t('Round points')}: ${round.bank}`}>
          <span className="text-[clamp(0.75rem,1vw,1.05rem)] font-bold text-night-200">{t('Round points')}</span>
          <span className="font-display text-[clamp(2rem,5vw,5.5rem)] font-bold leading-none tabular-nums text-gold-300" aria-hidden>
            {bank}
          </span>
          {round.multiplier > 1 && <span className="text-[clamp(0.75rem,1vw,1.05rem)] font-bold text-gold-200">{t('× {n} when awarded', { n: round.multiplier })}</span>}
        </div>
        <TeamScore team={state.teams[1]} index={1} reduced={reduced} align="right" playing={playing && round.controllingTeam === 1} stealing={phase === 'steal' && round.stealingTeam === 1} />
      </section>

      {phase === 'roundIntro' ? (
        <RoundIntroCard state={state} />
      ) : (
        <>
          <h1 className="rise-in text-balance rounded-[22px] bg-night-950/40 px-[3vw] py-[1.4vh] text-center font-display text-[clamp(1.2rem,2.7vw,3.2rem)] font-semibold leading-tight text-cream" key={round.question.id}>
            {round.question.question}
          </h1>
          <div className="marquee min-h-0 flex-1">
            <AnswerBoard round={round} showHiddenPoints={visuals.showHiddenPoints} />
          </div>
        </>
      )}

      <footer className="relative flex min-h-[clamp(3rem,6vw,5.5rem)] items-center justify-center">
        {buzzersOpen(state) ? (
          <p className="pop-in flex items-center gap-3 rounded-full bg-gold-300 px-[2.5vw] py-[1vh] font-display text-[clamp(1.1rem,2.2vw,2.4rem)] font-bold text-ink" role="status">
            <BellRing aria-hidden className="h-[1.1em] w-[1.1em]" /> {t('Buzzers ready. First to buzz plays!')}
          </p>
        ) : (
          phase !== 'roundIntro' && <StrikeDisplay strikes={round.strikes} max={state.config.rules.maxStrikes} />
        )}
      </footer>

      {phase === 'steal' && round.stealingTeam !== null && <StealBanner state={state} team={round.stealingTeam} />}
      {phase === 'roundOver' && round.result && <RoundResultBanner state={state} />}
    </div>
  );
}

function RoundIntroCard({ state }: { state: GameState }) {
  const t = useT();
  const round = state.round!;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" key={`${round.index}-${round.question.id}`}>
      <p className="pop-in font-display text-[clamp(3rem,10vw,10rem)] font-bold leading-none text-gold-300" style={{ textShadow: '0 6px 0 #3c2fa6' }}>
        {round.isFinal ? t('Final round') : t('Round {n}', { n: round.index + 1 })}
      </p>
      <p className="rise-in font-display text-[clamp(1.4rem,3.6vw,3.6rem)] font-semibold text-cream" style={{ animationDelay: '250ms' }}>
        {t('{n}× points', { n: round.multiplier })}
      </p>
      <p className="rise-in text-[clamp(1rem,1.6vw,1.6rem)] text-night-200" style={{ animationDelay: '450ms' }}>
        {t('Category: {name}', { name: round.question.category })}
      </p>
    </div>
  );
}

function StealBanner({ state, team }: { state: GameState; team: TeamIndex }) {
  const tr = useT();
  const t = state.teams[team];
  const color = TEAM_COLORS[t.color];
  return (
    <div
      className="steal-banner absolute bottom-[clamp(0.5rem,2vh,2rem)] left-1/2 z-20 rounded-[28px] px-[4vw] py-[2vh] text-center"
      style={{ '--team': color.hex, background: color.hex, color: color.ink, transform: 'translate(-50%, 0)', boxShadow: `0 0 0 4px ${color.hex}, 0 20px 60px rgba(0,0,0,.5)` } as CSSProperties}
      role="status"
    >
      <p className="font-display text-[clamp(3rem,9vw,9rem)] font-bold leading-none">{tr('Steal!')}</p>
      <p className="mt-1 font-display text-[clamp(1.1rem,2.4vw,2.4rem)] font-semibold">{tr('{name}, one guess for the points', { name: t.name })}</p>
    </div>
  );
}

function RoundResultBanner({ state }: { state: GameState }) {
  const t = useT();
  const result = state.round!.result!;
  const team = state.teams[result.team];
  const color = TEAM_COLORS[team.color];
  const text =
    result.via === 'steal'
      ? t('{name} stole {n} points!', { name: team.name, n: result.points })
      : result.points === 0
        ? t('{name} takes the round', { name: team.name })
        : t('{name} wins {n} points!', { name: team.name, n: result.points });
  return (
    <div className="pop-in absolute inset-x-0 bottom-[clamp(0.75rem,2.2vh,2rem)] z-20 flex justify-center px-4" role="status">
      <p className="rounded-full px-[3vw] py-[1.2vh] font-display text-[clamp(1.2rem,2.6vw,2.8rem)] font-bold shadow-2xl" style={{ background: color.hex, color: color.ink }}>
        {text}
      </p>
    </div>
  );
}

function GameOverView({ state, reduced }: { state: GameState; reduced: boolean }) {
  const t = useT();
  const winner = gameWinner(state);
  const fc = state.finalChallenge;
  return (
    <div className="flex h-full min-h-[100dvh] flex-col items-center justify-center gap-[3vh] p-8 text-center">
      <p className="pop-in font-display text-[clamp(1.4rem,3vw,3rem)] font-semibold text-gold-200">{t('Game complete')}</p>
      {winner === 'tie' ? (
        <div className="pop-in">
          <p className="font-display text-[clamp(3rem,9vw,9rem)] font-bold leading-none text-gold-300" style={{ textShadow: '0 6px 0 #3c2fa6' }}>
            {t("It's a tie!")}
          </p>
          <p className="mt-4 font-display text-[clamp(1.2rem,2.4vw,2.4rem)] text-cream">{t('{n} points each', { n: state.teams[0].score })}</p>
        </div>
      ) : (
        <WinnerCard state={state} team={winner} reduced={reduced} />
      )}
      <div className="rise-in flex flex-wrap justify-center gap-4" style={{ animationDelay: '500ms' }}>
        {state.teams.map((tm, i) => (
          <div key={i} className="rounded-2xl bg-night-800/80 px-6 py-3 ring-1 ring-inset ring-white/10">
            <p className="font-display text-[clamp(1rem,1.6vw,1.6rem)] text-cream">{tm.name}</p>
            <p className="font-display text-[clamp(1.6rem,3vw,3rem)] font-bold tabular-nums" style={{ color: TEAM_COLORS[tm.color].hex }}>
              {tm.score}
            </p>
          </div>
        ))}
      </div>
      {fc && fc.phase === 'complete' && (
        <p className="rise-in rounded-full bg-gold-300 px-6 py-2 font-display text-[clamp(1rem,1.8vw,1.8rem)] font-semibold text-ink" style={{ animationDelay: '700ms' }}>
          {t('Final Challenge: {n} points', { n: fcTotal(fc) })}
        </p>
      )}
      <p className="rise-in font-display text-[clamp(1.2rem,2.4vw,2.4rem)] text-cream" style={{ animationDelay: '800ms' }}>
        {t('Great game, everyone!')}
      </p>
      {state.config.demo && (
        <p className="rise-in text-[clamp(0.95rem,1.4vw,1.4rem)] text-night-200" style={{ animationDelay: '1000ms' }}>
          {t('Thanks for trying the Ministry Showdown demo.')}
        </p>
      )}
    </div>
  );
}

function WinnerCard({ state, team, reduced }: { state: GameState; team: TeamIndex; reduced: boolean }) {
  const tr = useT();
  const t = state.teams[team];
  const shown = useCountUp(t.score, reduced, 1400);
  const color = TEAM_COLORS[t.color];
  return (
    <div className="pop-in">
      <p className="font-display text-[clamp(2.6rem,8vw,8rem)] font-bold leading-none" style={{ color: color.hex, textShadow: '0 6px 0 #1c1456' }}>
        {t.name}
      </p>
      <p className="mt-3 font-display text-[clamp(2rem,6vw,6rem)] font-bold tabular-nums text-gold-300">{tr('{n} points', { n: shown })}</p>
      <p className="mt-2 font-display text-[clamp(1.1rem,2vw,2rem)] text-cream">{tr('Congratulations!')}</p>
    </div>
  );
}

function BuzzBanner({ name, color }: { name: string; color: GameState['teams'][0]['color'] }) {
  const t = useT();
  const c = TEAM_COLORS[color];
  return (
    <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center" role="status">
      <div className="pop-in rounded-[32px] px-[5vw] py-[3vh] text-center shadow-2xl" style={{ background: c.hex, color: c.ink, boxShadow: `0 0 0 8px ${c.hex}66, 0 0 80px ${c.hex}` }}>
        <p className="font-display text-[clamp(1.2rem,2.6vw,2.8rem)] font-semibold">{t('First to buzz')}</p>
        <p className="font-display text-[clamp(2.6rem,7vw,7rem)] font-bold leading-none">{name}</p>
      </div>
    </div>
  );
}

function PausedOverlay() {
  const t = useT();
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-night-950/80 backdrop-blur-sm" role="status">
      <div className="pop-in flex flex-col items-center gap-4 text-center">
        <Pause className="h-[clamp(3rem,8vw,8rem)] w-[clamp(3rem,8vw,8rem)] text-gold-300" aria-hidden />
        <p className="font-display text-[clamp(2.4rem,6vw,6rem)] font-bold text-cream">{t('Paused')}</p>
        <p className="text-[clamp(1rem,1.6vw,1.6rem)] text-night-200">{t("We'll be right back.")}</p>
      </div>
    </div>
  );
}
