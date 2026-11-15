import { useState, type FormEvent } from 'react';
import { useLang, useT } from '../../../core/i18n/i18n';
import { DEMO, demoClues, isFinalClue, license, packLibrary } from '../commerce/license';
import { PackPicker, STARTER_ID } from '../components/PackPicker';
import { STARTER_PACK } from '../data/starterPack';
import { STARTER_PACK_ES } from '../data/starterPackEs';
import { BOARD_LIMITS, createGame, DEFAULT_TEAMS } from '../engine/createGame';
import { navigate, routeUrl } from '../lib/router';
import { cleanTeamName, recentCluesStore, rememberClues, setupStore } from '../state/setupStore';
import { dispatchGame, getGameState } from '../sync/gameStore';

const ROUND_CHOICES = [1, 2];
const CATEGORY_CHOICES = [3, 4, 5, 6];

export function NewGameScreen() {
  const t = useT();
  const lang = useLang();
  const unlocked = license.useGameUnlocked();
  const saved = setupStore.useValue();
  const [names, setNames] = useState<[string, string]>(saved.teamNames);
  const [rounds, setRounds] = useState(saved.rounds);
  const [categories, setCategories] = useState(saved.categories);
  const [skipped, setSkipped] = useState<string[]>(saved.skippedPacks);
  const toggle = (id: string) => setSkipped((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const [openTv, setOpenTv] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const running = getGameState();
  const inProgress = !!running && running.phase !== 'gameOver';

  const start = (e: FormEvent) => {
    e.preventDefault();
    const teamNames: [string, string] = [cleanTeamName(names[0]), cleanTeamName(names[1])];
    const pack = lang === 'es' ? STARTER_PACK_ES : STARTER_PACK;
    // The free demo plays one short board from the first categories of the starter pack, with no final round.
    const chosen = unlocked ? packLibrary.packsIn(lang).filter((p) => !skipped.includes(p.id)).flatMap((p) => p.questions) : [];
    const useStarter = !unlocked || !skipped.includes(STARTER_ID);
    const result = createGame({
      clues: unlocked ? [...(useStarter ? pack.clues : []), ...chosen.filter((c) => !isFinalClue(c))] : demoClues(pack),
      finals: unlocked ? [...(useStarter ? pack.finals : []), ...chosen.filter(isFinalClue)] : [],
      rounds: unlocked ? rounds : DEMO.rounds,
      categoriesPerRound: unlocked ? categories : DEMO.categories,
      avoidIds: new Set(recentCluesStore.get()),
      teams: [
        { ...DEFAULT_TEAMS[0], name: teamNames[0] || t('Team 1') },
        { ...DEFAULT_TEAMS[1], name: teamNames[1] || t('Team 2') },
      ],
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setupStore.set(unlocked ? { teamNames, rounds, categories, skippedPacks: skipped } : { ...saved, teamNames });
    const game = result.game;
    rememberClues([...game.boards.flatMap((b) => b.categories.flatMap((c) => c.tiles.map((tile) => tile.clue.id))), ...(game.final ? [game.final.clue.id] : [])]);
    dispatchGame({ type: 'NEW_GAME', game });
    if (openTv) window.open(routeUrl('/game'), 'theopardy-game');
    navigate('/host');
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={start}>
      <h1 className="text-4xl">{unlocked ? t('New game') : t('Free demo')}</h1>
      {inProgress && <p className="rounded-xl border-2 border-ice-300 p-3 font-semibold text-ice-300">{t('A game is in progress. Starting a new one replaces it.')}</p>}

      <div className="tp-panel grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i}>
            <label className="tp-label" htmlFor={`team-${i}`}>
              {i === 0 ? t('Team 1 name') : t('Team 2 name')}
            </label>
            <input
              id={`team-${i}`}
              className="tp-input"
              maxLength={24}
              placeholder={i === 0 ? t('Team 1') : t('Team 2')}
              value={names[i]}
              onChange={(e) => setNames(i === 0 ? [e.target.value, names[1]] : [names[0], e.target.value])}
            />
          </div>
        ))}
      </div>

      {!unlocked && (
        <div className="tp-panel flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-lg">{t('The demo is one short board with three categories. The full game has two rounds, up to six categories on each board, and the final round.')}</p>
          <button type="button" className="tp-btn tp-btn-primary" onClick={() => navigate('/store')}>
            {t('Unlock the full game')}
          </button>
        </div>
      )}

      <div className={`tp-panel grid gap-5 sm:grid-cols-2 ${unlocked ? '' : 'hidden'}`}>
        <fieldset>
          <legend className="tp-label">{t('Rounds')}</legend>
          <div className="flex gap-2">
            {ROUND_CHOICES.filter((n) => n >= BOARD_LIMITS.rounds.min && n <= BOARD_LIMITS.rounds.max).map((n) => (
              <button key={n} type="button" className={`tp-btn flex-1 ${rounds === n ? 'tp-btn-primary' : 'tp-btn-ghost'}`} aria-pressed={rounds === n} onClick={() => setRounds(n)}>
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm tp-muted">{t('The second round is worth double.')}</p>
        </fieldset>
        <fieldset>
          <legend className="tp-label">{t('Categories on each board')}</legend>
          <div className="flex gap-2">
            {CATEGORY_CHOICES.map((n) => (
              <button key={n} type="button" className={`tp-btn flex-1 ${categories === n ? 'tp-btn-primary' : 'tp-btn-ghost'}`} aria-pressed={categories === n} onClick={() => setCategories(n)}>
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm tp-muted">{t('Fewer categories make a shorter game.')}</p>
        </fieldset>
      </div>

      {unlocked && <PackPicker skipped={skipped} onToggle={toggle} starterName={t('Starter Pack')} />}

      <label className="flex items-center gap-3 text-lg font-semibold">
        <input type="checkbox" className="h-6 w-6 accent-ice-400" checked={openTv} onChange={(e) => setOpenTv(e.target.checked)} />
        {t('Open the game screen in a new window for the TV')}
      </label>

      {error && (
        <p className="rounded-xl border-2 border-ice-300 p-3 font-semibold text-ice-300" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="tp-btn tp-btn-xl tp-btn-accent">
        {unlocked ? t('Start game') : t('Start the free demo')}
      </button>
    </form>
  );
}
