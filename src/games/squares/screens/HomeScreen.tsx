import { MonitorPlay, Play, Smartphone } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import { license } from '../commerce/license';
import { Wordmark } from '../components/parts';
import { navigate, routeUrl } from '../lib/router';
import { useGameState } from '../sync/gameStore';

export function HomeScreen() {
  const t = useT();
  const state = useGameState();
  const inProgress = !!state && state.phase !== 'matchOver';
  const unlocked = license.useGameUnlocked();

  return (
    <div className="flex flex-col gap-6">
      <div className="py-6 text-center">
        <h1>
          <Wordmark className="text-[clamp(2.8rem,11vw,6rem)]" />
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl font-semibold ks-muted">{t('A Bible true-or-false game for two teams. Pick a square, call the statement, and get three in a row.')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {inProgress && (
          <button type="button" className="ks-btn ks-btn-xl ks-btn-primary sm:col-span-2" onClick={() => navigate('/host')}>
            <Play aria-hidden className="h-7 w-7" />
            {t('Back to the game in progress')}
          </button>
        )}
        <button type="button" className={`ks-btn ks-btn-xl ${inProgress ? 'ks-btn-ghost' : 'ks-btn-primary'}`} onClick={() => navigate('/new')}>
          {unlocked ? t('New game') : t('Try the free demo')}
        </button>
        {!unlocked && (
          <button type="button" className="ks-btn ks-btn-xl ks-btn-outline" onClick={() => navigate('/store')}>
            {t('Unlock the full game')}
          </button>
        )}
        <a className="ks-btn ks-btn-xl ks-btn-ghost" href={routeUrl('/game')} target="kingdom-squares-game" rel="noreferrer">
          <MonitorPlay aria-hidden className="h-7 w-7" />
          {t('Open the game screen')}
        </a>
        <button type="button" className={`ks-btn ks-btn-xl ks-btn-ghost ${unlocked ? 'sm:col-span-2' : ''}`} onClick={() => navigate('/join')}>
          <Smartphone aria-hidden className="h-7 w-7" />
          {t('Use this phone for a team or as the remote')}
        </button>
      </div>

      <section className="ks-panel">
        <h2 className="text-2xl">{t('How it works')}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-lg">
          <li>{t('Put the game screen on the TV and keep the host controls on your laptop or phone.')}</li>
          <li>{t('Teams take turns picking a square. The host reads that square\'s statement.')}</li>
          <li>{t('The team calls it true or false. A right call takes the square.')}</li>
          <li>{t('A wrong call gives the square to the other team, unless that would win them the game. Then the square stays open.')}</li>
          <li>{t('Three in a row, or any five squares, wins the game.')}</li>
          <li>{t('Play one game, best of three, or best of five.')}</li>
        </ol>
      </section>
    </div>
  );
}
