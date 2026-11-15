import { t } from '../../../core/i18n/i18n';
import { useState } from 'react';
import { ChevronDown, History, Trash2, Trophy } from 'lucide-react';
import { TEAM_COLORS } from '../engine/defaults';
import { clearHistory, deleteHistoryEntry, useHistory } from '../state/historyStore';
import { Button } from '../../../core/components/ui/Button';
import { useConfirm } from '../../../core/components/ui/Confirm';

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function HistoryScreen() {
  const history = useHistory();
  const confirm = useConfirm();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t('Game history')}</h1>
          <p className="text-night-200">{t('The last 50 games played in this browser.')}</p>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            icon={Trash2}
            onClick={async () => {
              const ok = await confirm({ title: t('Clear game history?'), message: t('All saved game results will be removed from this browser.'), confirmLabel: t('Clear history') });
              if (ok) clearHistory();
            }}
          >
            {t('Clear history')}
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="panel mt-6 flex flex-col items-center gap-3 py-12 text-center">
          <History className="h-10 w-10 text-night-300" aria-hidden />
          <p className="text-night-100">{t('Finished games show up here with their scores and the questions played.')}</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {history.map((entry) => {
            const expanded = open === entry.id;
            return (
              <li key={entry.id} className="panel">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-night-200">
                      {dateFormat.format(new Date(entry.date))} · {entry.setName}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xl text-cream">
                      {entry.teams.map((tm, i) => (
                        <span key={i} className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ background: TEAM_COLORS[tm.color]?.hex ?? '#fff' }} aria-hidden />
                          {tm.name} <b className="tabular-nums">{tm.score}</b>
                          {entry.winner === i && <Trophy className="h-4 w-4 text-gold-300" aria-label={t('winner')} />}
                        </span>
                      ))}
                    </p>
                    <p className="text-sm text-night-200">{entry.winner === 'tie' ? t(t('Tie game')) : t('{name} won', { name: entry.teams[entry.winner].name })}</p>
                    {entry.finalChallenge && (
                      <p className="mt-1 text-sm text-gold-200">
                        {t('Final Challenge: {players}, {n} of {target}', { players: entry.finalChallenge.players.join(' & '), n: entry.finalChallenge.total, target: entry.finalChallenge.target })}
                        {entry.finalChallenge.reached ? ` ${t('(target reached)')}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="subtle" size="sm" icon={ChevronDown} aria-expanded={expanded} onClick={() => setOpen(expanded ? null : entry.id)}>
                      {expanded ? 'Hide' : 'Questions'}
                    </Button>
                    <Button variant="subtle" size="sm" icon={Trash2} aria-label={t('Delete this game')} onClick={() => deleteHistoryEntry(entry.id)} />
                  </div>
                </div>
                {expanded && (
                  <ol className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm">
                    {entry.rounds.length === 0 && <li className="text-night-200">{t('No rounds were played.')}</li>}
                    {[...entry.rounds]
                      .sort((a, b) => a.roundIndex - b.roundIndex)
                      .map((r) => (
                        <li key={r.roundIndex} className="flex justify-between gap-3">
                          <span className="text-night-100">{r.question}</span>
                          <span className="shrink-0 text-night-200">{r.team === null ? t(t('Not scored')) : `${entry.teams[r.team].name} +${r.points}`}</span>
                        </li>
                      ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
