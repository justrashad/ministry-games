import { t } from '../../../core/i18n/i18n';
import { BookOpen, CircleHelp, History, KeyRound, MonitorPlay, Play, Settings as SettingsIcon, Shield, ShoppingBag, Smartphone } from 'lucide-react';
import { useGameUnlocked } from '../commerce/licenseStore';
import { BuyButton } from '../components/BuyButton';
import { LandingScreen } from './LandingScreen';
import { Wordmark } from '../components/game/Wordmark';
import { Button } from '../../../core/components/ui/Button';
import { navigate, openGameScreen } from '../lib/router';
import { useGameState } from '../sync/gameStore';
import { useToast } from '../../../core/components/ui/Toast';

export function HomeScreen() {
  const game = useGameState();
  const toast = useToast();
  const inProgress = game && game.phase !== 'gameOver';
  const unlocked = useGameUnlocked();
  // New visitors see the sales page; owners (or anyone mid-game) get the app hub.
  if (!unlocked && !inProgress) return <LandingScreen />;
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-20 pt-10 text-center sm:pt-16">
      <div className="pop-in">
        <Wordmark size="xl" />
      </div>
      <h1 className="mt-8 text-3xl font-semibold sm:text-4xl">{t('Welcome to Ministry Showdown')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-night-100">{t('Create a fun family worship game for your family.')}</p>

      {inProgress && (
        <div className="panel mt-8 flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-lg font-semibold text-cream">{t('Game in progress')}</p>
            <p className="text-sm text-night-200">
              {game.teams[0].name} {game.teams[0].score} · {game.teams[1].name} {game.teams[1].score}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="gold" icon={Play} onClick={() => navigate('/host')}>
              {t('Resume hosting')}
            </Button>
            <Button
              variant="ghost"
              icon={MonitorPlay}
              onClick={() => {
                if (!openGameScreen()) toast.show(t('Your browser blocked the new window. Allow pop-ups for this page.'), 'error');
              }}
            >
              {t('Game screen')}
            </Button>
          </div>
        </div>
      )}

      {!unlocked && (
        <div className="panel mt-8 w-full max-w-2xl space-y-4">
          <p className="font-display text-xl text-cream">{t('Try one round free, then unlock the full game.')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="primary" size="lg" icon={Play} onClick={() => navigate('/new')}>
              {t('Try the free demo')}
            </Button>
            <BuyButton entitlement="game" />
          </div>
          <Button variant="subtle" size="sm" icon={KeyRound} onClick={() => navigate('/store')}>
            {t('I already have a license key')}
          </Button>
        </div>
      )}

      <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {unlocked && (
          <Button variant="gold" size="xl" icon={Play} onClick={() => navigate('/new')} className="sm:col-span-2">
            {t('Start new game')}
          </Button>
        )}
        <Button variant="primary" size="lg" icon={BookOpen} onClick={() => navigate('/questions')}>
          {t('Browse questions')}
        </Button>
        <Button variant="primary" size="lg" icon={CircleHelp} onClick={() => navigate('/how-to-play')}>
          {t('How to play')}
        </Button>
        <Button variant="ghost" size="lg" icon={SettingsIcon} onClick={() => navigate('/settings')}>
          {t('Settings')}
        </Button>
        <Button variant="ghost" size="lg" icon={History} onClick={() => navigate('/history')}>
          {t('Game history')}
        </Button>
        <Button variant="ghost" size="lg" icon={ShoppingBag} onClick={() => navigate('/store')}>
          {t('Question packs')}
        </Button>
        <Button variant="ghost" size="lg" icon={Smartphone} onClick={() => navigate('/join')}>
          {t('Use this phone as the remote')}
        </Button>
      </div>

      <p className="mt-10 max-w-2xl text-night-100">
        {t('Ministry Showdown is a family-friendly guessing game inspired by classic survey game shows. Create your own questions or use the included sample questions.')}
      </p>
      <p className="mt-6 flex max-w-2xl items-start gap-2 text-left text-sm text-night-200">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />
        <span>
          {t("Designed for family worship. Not produced by, affiliated with, or endorsed by Jehovah's Witnesses or the Watch Tower Bible and Tract Society.")}{' '}
          {t('Everything you create stays in this browser on this device; nothing is sent to a server.')}
        </span>
      </p>
    </div>
  );
}
