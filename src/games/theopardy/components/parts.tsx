import { LANGS, setLang, useLang, useT } from '../../../core/i18n/i18n';
import type { GameState, TeamIndex } from '../types';

export const TEAMS: readonly TeamIndex[] = [0, 1];

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-extrabold leading-none tracking-tight text-sea-100 ${className}`}>
      Theopardy<span className="text-ice-400">!</span>
    </span>
  );
}

/** Both teams' scores. `lead` highlights the team in control or answering. */
export function ScoreChips({ state, lead = null, size = 'md' }: { state: GameState; lead?: TeamIndex | null; size?: 'md' | 'tv' }) {
  const tv = size === 'tv';
  return (
    <div className={`flex ${tv ? 'gap-[1vw]' : 'flex-wrap gap-2'}`}>
      {TEAMS.map((team) => (
        <div
          key={team}
          className={`tp-team-${team} flex items-center rounded-xl ${tv ? 'gap-[0.9vw] px-[1.4vw] py-[0.6vw]' : 'gap-3 px-4 py-2'} ${lead === team ? 'ring-4 ring-ice-400 ring-offset-4 ring-offset-sea-950' : ''}`}
        >
          <span className={`font-semibold ${tv ? 'text-[clamp(0.9rem,1.35vw,1.6rem)]' : 'text-base'}`}>{state.config.teams[team].name}</span>
          <span className={`font-extrabold tabular-nums ${tv ? 'text-[clamp(1.3rem,2.4vw,2.8rem)]' : 'text-2xl'}`}>{state.scores[team].toLocaleString()}</span>
        </div>
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
          className={`tp-btn tp-btn-sm ${lang === l.id ? 'tp-btn-primary' : 'tp-btn-ghost'}`}
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
