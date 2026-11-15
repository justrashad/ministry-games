import { useState, type FormEvent } from 'react';
import { useLang, useT } from '../../../core/i18n/i18n';
import { DEMO, license } from '../commerce/license';
import { STARTER_PACK } from '../data/starterPack';
import { STARTER_PACK_ES } from '../data/starterPackEs';
import { createGame, DEFAULT_TEAMS, questionIds } from '../engine/createGame';
import { navigate, routeUrl } from '../lib/router';
import { cleanTeamName, recentQuestionsStore, rememberQuestions, setupStore } from '../state/setupStore';
import { dispatchGame, getGameState } from '../sync/gameStore';

export function NewGameScreen() {
  const t = useT();
  const lang = useLang();
  const unlocked = license.useGameUnlocked();
  const saved = setupStore.useValue();
  const [names, setNames] = useState<[string, string]>(saved.teamNames);
  const [openTv, setOpenTv] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const running = getGameState();
  const inProgress = !!running && running.phase !== 'gameOver';

  const start = (e: FormEvent) => {
    e.preventDefault();
    const teamNames: [string, string] = [cleanTeamName(names[0]), cleanTeamName(names[1])];
    const pack = lang === 'es' ? STARTER_PACK_ES : STARTER_PACK;
    const result = createGame({
      questions: pack.questions,
      bonus: unlocked ? pack.bonus : [],
      perStage: unlocked ? 2 : DEMO.perStage,
      avoidIds: new Set(recentQuestionsStore.get()),
      teams: [
        { ...DEFAULT_TEAMS[0], name: teamNames[0] || t('Team 1') },
        { ...DEFAULT_TEAMS[1], name: teamNames[1] || t('Team 2') },
      ],
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setupStore.set({ teamNames });
    rememberQuestions(questionIds(result.game));
    dispatchGame({ type: 'NEW_GAME', game: result.game });
    if (openTv) window.open(routeUrl('/game'), 'spiritual-babe-game');
    navigate('/host');
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={start}>
      <h1 className="text-4xl">{unlocked ? t('New game') : t('Free demo')}</h1>
      {inProgress && <p className="sb-alert">{t('A game is in progress. Starting a new one replaces it.')}</p>}

      <div className="sb-panel grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i}>
            <label className="sb-label" htmlFor={`team-${i}`}>
              {i === 0 ? t('Team 1 name') : t('Team 2 name')}
            </label>
            <input
              id={`team-${i}`}
              className="sb-input"
              maxLength={24}
              placeholder={i === 0 ? t('Team 1') : t('Team 2')}
              value={names[i]}
              onChange={(e) => setNames(i === 0 ? [e.target.value, names[1]] : [names[0], e.target.value])}
            />
          </div>
        ))}
      </div>

      {!unlocked && (
        <div className="sb-panel flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-lg">{t('The demo gives each team one question at each stage, with no bonus question. The full game has 10 questions on each board and the bonus question.')}</p>
          <button type="button" className="sb-btn sb-btn-outline" onClick={() => navigate('/store')}>
            {t('Unlock the full game')}
          </button>
        </div>
      )}

      <label className="flex items-center gap-3 text-lg font-semibold">
        <input type="checkbox" className="h-6 w-6 accent-sb-accent" checked={openTv} onChange={(e) => setOpenTv(e.target.checked)} />
        {t('Open the game screen in a new window for the TV')}
      </label>

      {error && (
        <p className="sb-alert" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="sb-btn sb-btn-xl sb-btn-primary">
        {unlocked ? t('Start game') : t('Start the free demo')}
      </button>
    </form>
  );
}
