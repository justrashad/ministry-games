import { MonitorPlay, Play, Smartphone } from 'lucide-react';
import { useT } from '../../../core/i18n/i18n';
import { Wordmark } from '../components/parts';
import { navigate, routeUrl } from '../lib/router';
import { useGameState } from '../sync/gameStore';

export function HomeScreen() {
  const t = useT();
  const state = useGameState();
  const inProgress = !!state && state.phase !== 'gameOver';

  return (
    <div className="flex flex-col gap-6">
      <div className="py-6 text-center">
        <h1>
          <Wordmark className="text-[clamp(3rem,12vw,6.5rem)]" />
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl font-semibold text-sea-200">{t('A Bible clue board for two teams. Pick a category, race to buzz, and learn something every round.')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {inProgress && (
          <button type="button" className="tp-btn tp-btn-xl tp-btn-accent sm:col-span-2" onClick={() => navigate('/host')}>
            <Play aria-hidden className="h-7 w-7" />
            {t('Back to the game in progress')}
          </button>
        )}
        <button type="button" className={`tp-btn tp-btn-xl ${inProgress ? 'tp-btn-ghost' : 'tp-btn-accent'}`} onClick={() => navigate('/new')}>
          {t('New game')}
        </button>
        <a className="tp-btn tp-btn-xl tp-btn-ghost" href={routeUrl('/game')} target="theopardy-game" rel="noreferrer">
          <MonitorPlay aria-hidden className="h-7 w-7" />
          {t('Open the game screen')}
        </a>
        <button type="button" className="tp-btn tp-btn-xl tp-btn-ghost sm:col-span-2" onClick={() => navigate('/join')}>
          <Smartphone aria-hidden className="h-7 w-7" />
          {t('Use this phone as a buzzer or remote')}
        </button>
      </div>

      <section className="tp-panel">
        <h2 className="text-2xl">{t('How it works')}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-lg text-sea-100">
          <li>{t('Put the game screen on the TV and keep the host controls on your laptop or phone.')}</li>
          <li>{t('The team in control picks a category and a value. The host reads the clue.')}</li>
          <li>{t('Both teams race to buzz. A right answer scores the tile and that team picks next.')}</li>
          <li>{t('A wrong answer costs nothing, and the other team gets a try.')}</li>
          <li>{t('One hidden tile on each board is worth double.')}</li>
          <li>{t('The final round is one clue for both teams, with nothing at risk.')}</li>
        </ol>
      </section>
    </div>
  );
}
