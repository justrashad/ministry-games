import type { CSSProperties } from 'react';
import type { TeamIndex, TeamState } from '../../types';
import { TEAM_COLORS } from '../../engine/defaults';
import { useCountUp } from '../../../../core/hooks/useCountUp';
import { useT } from '../../../../core/i18n/i18n';

interface TeamScoreProps {
  team: TeamState;
  index: TeamIndex;
  playing?: boolean;
  stealing?: boolean;
  reduced: boolean;
  align?: 'left' | 'right';
}

export function TeamScore({ team, index, playing, stealing, reduced, align = 'left' }: TeamScoreProps) {
  const shown = useCountUp(team.score, reduced);
  const t = useT();
  const color = TEAM_COLORS[team.color];
  const highlighted = playing || stealing;
  return (
    <div
      className={`relative flex min-w-0 flex-col rounded-[22px] px-[clamp(0.8rem,1.6vw,1.8rem)] py-[clamp(0.5rem,1.2vh,1rem)] transition-shadow ${
        align === 'right' ? 'items-end text-right' : 'items-start text-left'
      }`}
      style={
        {
          '--team': color.hex,
          background: `linear-gradient(180deg, ${color.hex}38, transparent 85%), #1c1456`,
          boxShadow: highlighted ? `0 0 0 4px ${color.hex}, 0 0 40px -6px ${color.hex}` : `inset 0 0 0 2px ${color.hex}73`,
        } as CSSProperties
      }
      aria-label={`${team.name}: ${t('{n} points', { n: team.score })}${playing ? `, ${t('playing this round')}` : ''}${stealing ? `, ${t('trying to steal')}` : ''}`}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: color.hex }} aria-hidden />
        <span className="text-[clamp(0.7rem,1vw,1rem)] font-bold text-night-200">{t('Team {n}', { n: index + 1 })}</span>
        {playing && (
          <span className="rounded-full px-2 py-0.5 text-[clamp(0.6rem,0.85vw,0.85rem)] font-extrabold" style={{ background: color.hex, color: color.ink }}>
            {t('Playing')}
          </span>
        )}
        {stealing && (
          <span className="rounded-full px-2 py-0.5 text-[clamp(0.6rem,0.85vw,0.85rem)] font-extrabold" style={{ background: color.hex, color: color.ink }}>
            {t('Stealing')}
          </span>
        )}
      </div>
      <p className="max-w-full truncate font-display text-[clamp(1.1rem,2.2vw,2.4rem)] font-semibold text-cream">{team.name}</p>
      <p key={team.score} className={`font-display text-[clamp(2rem,5.5vw,6rem)] font-bold leading-none tabular-nums ${reduced ? '' : 'score-bump'}`} style={{ color: color.hex }} aria-hidden>
        {shown}
      </p>
    </div>
  );
}
