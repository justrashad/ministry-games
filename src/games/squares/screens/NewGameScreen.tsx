import { useState, type FormEvent } from 'react';
import { useLang, useT } from '../../../core/i18n/i18n';
import { DEMO, demoStatements, license } from '../commerce/license';
import { STARTER_PACK } from '../data/starterPack';
import { STARTER_PACK_ES } from '../data/starterPackEs';
import { createGame, DEFAULT_TEAMS } from '../engine/createGame';
import { navigate, routeUrl } from '../lib/router';
import { cleanTeamName, recentStatementsStore, rememberStatements, setupStore } from '../state/setupStore';
import { dispatchGame, getGameState } from '../sync/gameStore';

export function NewGameScreen() {
  const t = useT();
  const lang = useLang();
  const unlocked = license.useGameUnlocked();
  const saved = setupStore.useValue();
  const [names, setNames] = useState<[string, string]>(saved.teamNames);
  const [gamesToWin, setGamesToWin] = useState(saved.gamesToWin);
  const [openTv, setOpenTv] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const running = getGameState();
  const inProgress = !!running && running.phase !== 'matchOver';

  const lengths = [
    { wins: 1, label: t('One game') },
    { wins: 2, label: t('Best of three') },
    { wins: 3, label: t('Best of five') },
  ];

  const start = (e: FormEvent) => {
    e.preventDefault();
    const teamNames: [string, string] = [cleanTeamName(names[0]), cleanTeamName(names[1])];
    const pack = lang === 'es' ? STARTER_PACK_ES : STARTER_PACK;
    // Statements from the match being replaced count as recent, so the new one starts with fresh ones.
    if (running) rememberStatements(running.played.map((p) => p.questionId));
    const result = createGame({
      statements: unlocked ? pack.statements : demoStatements(pack),
      gamesToWin: unlocked ? gamesToWin : DEMO.gamesToWin,
      avoidIds: new Set(recentStatementsStore.get()),
      teams: [
        { ...DEFAULT_TEAMS[0], name: teamNames[0] || t('Team 1') },
        { ...DEFAULT_TEAMS[1], name: teamNames[1] || t('Team 2') },
      ],
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setupStore.set(unlocked ? { teamNames, gamesToWin } : { ...saved, teamNames });
    dispatchGame({ type: 'NEW_GAME', game: result.game });
    if (openTv) window.open(routeUrl('/game'), 'kingdom-squares-game');
    navigate('/host');
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={start}>
      <h1 className="text-4xl">{unlocked ? t('New game') : t('Free demo')}</h1>
      {inProgress && <p className="ks-alert">{t('A game is in progress. Starting a new one replaces it.')}</p>}

      <div className="ks-panel grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i}>
            <label className="ks-label" htmlFor={`team-${i}`}>
              {i === 0 ? t('Team 1 name') : t('Team 2 name')}
            </label>
            <input
              id={`team-${i}`}
              className="ks-input"
              maxLength={24}
              placeholder={i === 0 ? t('Team 1') : t('Team 2')}
              value={names[i]}
              onChange={(e) => setNames(i === 0 ? [e.target.value, names[1]] : [names[0], e.target.value])}
            />
          </div>
        ))}
      </div>

      {unlocked ? (
        <fieldset className="ks-panel">
          <legend className="ks-label float-left w-full">{t('Match length')}</legend>
          <div className="flex flex-wrap gap-2">
            {lengths.map((l) => (
              <button key={l.wins} type="button" className={`ks-btn flex-1 ${gamesToWin === l.wins ? 'ks-btn-primary' : 'ks-btn-ghost'}`} aria-pressed={gamesToWin === l.wins} onClick={() => setGamesToWin(l.wins)}>
                {l.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm ks-muted">{t('The team that picks second in one game picks first in the next.')}</p>
        </fieldset>
      ) : (
        <div className="ks-panel flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-lg">{t('The demo is one game with statements from two categories. The full game plays one game, best of three or best of five, with all 60 statements.')}</p>
          <button type="button" className="ks-btn ks-btn-outline" onClick={() => navigate('/store')}>
            {t('Unlock the full game')}
          </button>
        </div>
      )}

      <label className="flex items-center gap-3 text-lg font-semibold">
        <input type="checkbox" className="h-6 w-6 accent-ks-accent" checked={openTv} onChange={(e) => setOpenTv(e.target.checked)} />
        {t('Open the game screen in a new window for the TV')}
      </label>

      {error && (
        <p className="ks-alert" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="ks-btn ks-btn-xl ks-btn-primary">
        {unlocked ? t('Start game') : t('Start the free demo')}
      </button>
    </form>
  );
}
