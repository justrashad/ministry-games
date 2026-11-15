import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { LANGS, setLang, useLang, useT } from '../../../core/i18n/i18n';
import { msg } from '../../../core/i18n/msg';
import { ladderHeight, rungs } from '../engine/game';
import type { Board, GameState, HelpName, TeamIndex } from '../types';

export const TEAMS: readonly TeamIndex[] = [0, 1];

/** Stage names, translated where they are shown. */
export const STAGE_NAMES = [msg('Newborn'), msg('Toddler'), msg('Child'), msg('Youth'), msg('Mature')] as const;

/** Each help's rainbow color. */
export const HELP_COLORS: Record<HelpName, string> = { lookup: 'var(--sb-box-5)', secondTry: 'var(--sb-box-3)', swap: 'var(--sb-box-8)' };

export const HELP_NAMES: Record<HelpName, string> = {
  lookup: msg('Search the Scriptures'),
  secondTry: msg('Second Try'),
  swap: msg('Swap'),
};

/** Letters colored through the rainbow, one color per letter. */
export function RainbowWord({ text }: { text: string }) {
  let n = 0;
  return (
    <span>
      {[...text].map((ch, i) => (
        <span key={i} style={ch.trim() ? { color: `var(--sb-box-${n++ % 10})` } : undefined}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/** The rainbow color for a question box on a board with `perStage` boxes per stage. */
export function boxColor(stage: number, slot: number, perStage: number): string {
  return `var(--sb-box-${(stage * perStage + slot) % 10})`;
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-extrabold leading-[1.05] tracking-tight text-sb-text ${className}`}>
      Are You Smarter Than a <RainbowWord text="Spiritual Babe?" />
    </span>
  );
}

/** One team's ladder, bottom rung first. `active` outlines the team whose turn it is. */
export function Ladder({ state, team, active, size = 'md' }: { state: GameState; team: TeamIndex; active: boolean; size?: 'md' | 'tv' }) {
  const t = useT();
  const tv = size === 'tv';
  const height = ladderHeight(state);
  const climbed = rungs(state, team);
  return (
    <div className={`flex flex-col ${tv ? 'w-[min(11vw,9rem)] gap-[0.7vh]' : 'w-28 gap-1'}`}>
      <div className={`sb-team-${team} rounded-xl text-center font-extrabold leading-tight ${tv ? 'px-[0.6vw] py-[0.8vh] text-[clamp(0.9rem,1.7vw,2rem)]' : 'px-2 py-1.5 text-base'} ${active ? 'sb-ring' : ''}`}>
        <span className="block truncate">{state.config.teams[team].name}</span>
      </div>
      <p className={`text-center font-bold text-sb-muted ${tv ? 'text-[clamp(0.75rem,1.1vw,1.3rem)]' : 'text-xs'}`}>{t('{n} of {total}', { n: climbed, total: height })}</p>
      <div className={`flex flex-col-reverse ${tv ? 'gap-[0.6vh]' : 'gap-1'}`} aria-hidden>
        {Array.from({ length: height }, (_, i) => (
          <div
            key={i}
            className={`flex items-center justify-center rounded-lg border-2 font-bold ${tv ? 'h-[3.2vh] text-[clamp(0.7rem,1vw,1.2rem)]' : 'h-5 text-xs'} ${i < climbed ? 'text-white' : 'bg-sb-panel text-sb-muted'}`}
            style={i < climbed ? { backgroundColor: `var(--sb-box-${i % 10})`, borderColor: `var(--sb-box-${i % 10})` } : { borderColor: `var(--sb-team-${team})` }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Ladders({ state, active, size = 'md' }: { state: GameState; active: TeamIndex | null; size?: 'md' | 'tv' }) {
  return (
    <div className={`flex ${size === 'tv' ? 'gap-[1.2vw]' : 'gap-3'}`}>
      {TEAMS.map((team) => (
        <Ladder key={team} state={state} team={team} active={active === team} size={size} />
      ))}
    </div>
  );
}

/** Both teams' rung counts in one line, for the host. */
export function RungChips({ state, active }: { state: GameState; active: TeamIndex | null }) {
  const t = useT();
  const height = ladderHeight(state);
  return (
    <div className="flex flex-wrap gap-2">
      {TEAMS.map((team) => (
        <div key={team} className={`sb-team-${team} flex items-center gap-3 rounded-xl px-4 py-2 ${active === team ? 'sb-ring' : ''}`}>
          <span className="font-bold">{state.config.teams[team].name}</span>
          <span className="text-xl font-extrabold tabular-nums">{t('{n} of {total}', { n: rungs(state, team), total: height })}</span>
        </div>
      ))}
    </div>
  );
}

/** A team's board: one row per stage, one box per question. With `onPick`, open questions are buttons. */
export function BoardView({ board, size, onPick, current }: { board: Board; size: 'tv' | 'md'; onPick?: (stage: number, slot: number) => void; current?: { stage: number; slot: number } | null }) {
  const t = useT();
  const tv = size === 'tv';
  const box = tv ? 'min-h-0 flex-1 rounded-[1vw] text-[clamp(0.9rem,1.9vw,2.3rem)]' : 'min-h-[3.25rem] flex-1 rounded-xl px-2 text-base';
  return (
    <div className={`flex flex-col ${tv ? 'min-h-0 flex-1 gap-[1.4vh]' : 'gap-2'}`}>
      {board.stages.map((slots, stage) => (
        <div key={stage} className={`flex items-stretch ${tv ? 'min-h-0 flex-1 gap-[1vw]' : 'gap-2'}`}>
          <p className={`flex shrink-0 items-center font-extrabold uppercase tracking-wide text-sb-muted ${tv ? 'w-[11vw] text-[clamp(0.75rem,1.4vw,1.7rem)]' : 'w-24 text-xs'}`}>{t(STAGE_NAMES[stage])}</p>
          {slots.map((slot, i) => {
            const isCurrent = current?.stage === stage && current.slot === i;
            if (slot.result !== null) {
              return (
                <div key={i} className={`flex items-center justify-center gap-2 bg-sb-sunk font-bold text-sb-muted ${box}`}>
                  <span className="truncate">{slot.question.category}</span>
                  {slot.result === 'right' ? <Check aria-label={t('Right')} className="h-[1em] w-[1em] shrink-0" /> : <X aria-label={t('Wrong')} className="h-[1em] w-[1em] shrink-0" />}
                </div>
              );
            }
            const cls = `sb-open sb-box-${(stage * slots.length + i) % 10} flex items-center justify-center text-center font-bold ${box} ${isCurrent ? 'sb-ring' : ''}`;
            return onPick ? (
              <button key={i} type="button" className={cls} onClick={() => onPick(stage, i)} aria-label={t('{stage}: {subject}', { stage: t(STAGE_NAMES[stage]), subject: slot.question.category })}>
                {slot.question.category}
              </button>
            ) : (
              <div key={i} className={cls}>
                {slot.question.category}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Seconds left until `until` (ms since 1970), updated four times a second. */
export function useSecondsLeft(until: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (until === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [until]);
  if (until === null) return null;
  return Math.max(0, Math.ceil((until - now) / 1000));
}

export function formatSeconds(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Which helps a team has left, as small chips. */
export function HelpChips({ state, team, size = 'md' }: { state: GameState; team: TeamIndex; size?: 'md' | 'tv' }) {
  const t = useT();
  const tv = size === 'tv';
  return (
    <div className={`flex flex-wrap ${tv ? 'gap-[0.6vw]' : 'gap-1.5'}`}>
      {(Object.keys(HELP_NAMES) as HelpName[]).map((help) => {
        const left = state.helps[team][help];
        return (
          <span
            key={help}
            className={`rounded-full border-2 font-bold ${tv ? 'px-[0.8vw] py-[0.2vh] text-[clamp(0.7rem,1.1vw,1.3rem)]' : 'px-2.5 py-0.5 text-xs'} ${left ? 'text-white' : 'border-sb-line text-sb-muted line-through'}`}
            style={left ? { backgroundColor: HELP_COLORS[help], borderColor: HELP_COLORS[help] } : undefined}
          >
            {t(HELP_NAMES[help])}
          </span>
        );
      })}
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
          className={`sb-btn sb-btn-sm ${lang === l.id ? 'sb-btn-primary' : 'sb-btn-ghost'}`}
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
