import { MonitorPlay, Play, Smartphone } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import { license } from '../commerce/license';
import { Wordmark } from '../components/parts';
import { navigate, routeUrl } from '../lib/router';
import { useGameState } from '../sync/gameStore';

export function HomeScreen() {
  const t = useT();
  const state = useGameState();
  const inProgress = !!state && state.phase !== 'gameOver';
  const unlocked = license.useGameUnlocked();

  return (
    <div className="flex flex-col gap-6">
      <div className="py-6 text-center">
        <h1>
          <Wordmark className="text-[clamp(2.2rem,8vw,4.8rem)]" />
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl font-semibold sb-muted">{t('A Bible quiz for two teams. Climb from Newborn questions to Mature ones, use your helps wisely, and see who comes out on top.')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {inProgress && (
          <button type="button" className="sb-btn sb-btn-xl sb-btn-primary sm:col-span-2" onClick={() => navigate('/host')}>
            <Play aria-hidden className="h-7 w-7" />
            {t('Back to the game in progress')}
          </button>
        )}
        <button type="button" className={`sb-btn sb-btn-xl ${inProgress ? 'sb-btn-ghost' : 'sb-btn-primary'}`} onClick={() => navigate('/new')}>
          {unlocked ? t('New game') : t('Try the free demo')}
        </button>
        {!unlocked && (
          <button type="button" className="sb-btn sb-btn-xl sb-btn-outline" onClick={() => navigate('/store')}>
            {t('Unlock the full game')}
          </button>
        )}
        <a className="sb-btn sb-btn-xl sb-btn-ghost" href={routeUrl('/game')} target="spiritual-babe-game" rel="noreferrer">
          <MonitorPlay aria-hidden className="h-7 w-7" />
          {t('Open the game screen')}
        </a>
        <button type="button" className={`sb-btn sb-btn-xl sb-btn-ghost ${unlocked ? 'sm:col-span-2' : ''}`} onClick={() => navigate('/join')}>
          <Smartphone aria-hidden className="h-7 w-7" />
          {t('Use this phone for a team or as the remote')}
        </button>
      </div>

      <section className="sb-panel">
        <h2 className="text-2xl">{t('How it works')}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-lg">
          <li>{t('Put the game screen on the TV and keep the host controls on your laptop or phone.')}</li>
          <li>{t('Each team has its own board of 10 questions, 2 at each stage: Newborn, Toddler, Child, Youth and Mature.')}</li>
          <li>{t('Teams take turns picking a subject from their board. A right answer climbs one rung. A wrong answer costs nothing.')}</li>
          <li>{t('Each team can use three helps, once each: Search the Scriptures, Second Try and Swap.')}</li>
          <li>{t('After both boards, a bonus question for both teams is worth one more rung.')}</li>
          <li>{t('The team that climbs the most rungs wins.')}</li>
        </ol>
      </section>
    </div>
  );
}
