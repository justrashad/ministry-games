import { LANGS, setLang, useLang, useT } from '../../../core/i18n/i18n';
import { squaresHeld } from '../engine/game';
import type { GameState, Owner, TeamIndex } from '../types';

export const TEAMS: readonly TeamIndex[] = [0, 1];

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-extrabold leading-none tracking-tight text-ks-text ${className}`}>
      <span className="text-ks-accent">Kingdom</span> <span className="text-ks-red">Squares</span>
    </span>
  );
}

/** Team 1 plays a ring and team 2 a diamond, so the teams differ by shape as well as color. */
export function TeamMark({ team, className = '' }: { team: TeamIndex; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      {team === 0 ? (
        <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="14" />
      ) : (
        <rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)" fill="none" stroke="currentColor" strokeWidth="14" />
      )}
    </svg>
  );
}

/** The 3 by 3 board. `rings` marks squares to circle: the one in play, or the winning line. */
export function BoardGrid({ squares, rings = [], teamNames, size }: { squares: readonly Owner[]; rings?: readonly number[]; teamNames: readonly string[]; size: 'tv' | 'side' | 'small' }) {
  const tv = size !== 'small';
  const box = size === 'tv' ? 'h-full max-h-full max-w-full gap-[1.6vh]' : size === 'side' ? 'w-full gap-[1.6vh]' : 'w-full gap-2';
  return (
    <div className={`grid aspect-square grid-cols-3 grid-rows-3 ${box}`}>
      {squares.map((owner, i) => {
        const ring = rings.includes(i) ? 'ks-ring' : '';
        if (owner === null) {
          return (
            <div key={i} className={`ks-open ${ring} ${tv ? 'text-[clamp(1.4rem,6vh,5rem)]' : 'text-xl'}`}>
              {i + 1}
            </div>
          );
        }
        return (
          <div key={i} className={`ks-team-${owner} flex items-center justify-center rounded-2xl ${ring}`} role="img" aria-label={teamNames[owner]}>
            <TeamMark team={owner} className="h-[62%] w-[62%]" />
          </div>
        );
      })}
    </div>
  );
}

/** One team's name, mark, games won and squares held. `active` outlines the team whose turn it is. */
export function TeamCard({ state, team, active, size = 'md' }: { state: GameState; team: TeamIndex; active: boolean; size?: 'md' | 'tv' }) {
  const t = useT();
  const tv = size === 'tv';
  return (
    <div className={`ks-team-${team} flex items-center rounded-2xl ${tv ? 'gap-[1vw] px-[1.4vw] py-[0.8vw]' : 'gap-3 px-4 py-2'} ${active ? 'ks-ring' : ''}`}>
      <TeamMark team={team} className={tv ? 'h-[clamp(1.6rem,3.4vw,4rem)] w-[clamp(1.6rem,3.4vw,4rem)]' : 'h-8 w-8'} />
      <div className="flex flex-col">
        <span className={`font-extrabold leading-tight ${tv ? 'text-[clamp(1rem,1.9vw,2.3rem)]' : 'text-lg'}`}>{state.config.teams[team].name}</span>
        <span className={`font-semibold ${tv ? 'text-[clamp(0.8rem,1.15vw,1.4rem)]' : 'text-sm'}`}>
          {t('Games won: {games} · Squares: {squares}', { games: state.wins[team], squares: squaresHeld(state.squares, team) })}
        </span>
      </div>
    </div>
  );
}

export function TeamCards({ state, active, size = 'md' }: { state: GameState; active: TeamIndex | null; size?: 'md' | 'tv' }) {
  return (
    <div className={`flex ${size === 'tv' ? 'gap-[1.2vw]' : 'flex-wrap gap-3'}`}>
      {TEAMS.map((team) => (
        <TeamCard key={team} state={state} team={team} active={active === team} size={size} />
      ))}
    </div>
  );
}

export function LangToggle() {
  const lang = useLang();
  const t = useT();
  return (
    <div className="flex gap-1" role="group" aria-label={t('Language')}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          className={`ks-btn ks-btn-sm ${lang === l.id ? 'ks-btn-primary' : 'ks-btn-ghost'}`}
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
