import { useEffect } from 'react';
import { SoundCorner } from '../../core/audio/SoundCorner';
import { useApplyLangAttribute, useT } from '../../core/i18n/i18n';
import { resumeRemoteSession, useRemoteStatus } from '../../core/sync/remote';
import { TITLE } from '../../core/title';
import { license } from './commerce/license';
import { UpdatePrompt } from './components/UpdatePrompt';
import { LangToggle, RainbowStripes, Wordmark } from './components/parts';
import { FULL_BLEED_ROUTES, navigate, useRoute, type Route } from './lib/router';
import { GameScreen } from './screens/GameScreen';
import { HomeScreen } from './screens/HomeScreen';
import { HostScreen } from './screens/HostScreen';
import { NewGameScreen } from './screens/NewGameScreen';
import { JoinScreen, RemoteScreen, TeamPhoneScreen } from './screens/PhoneScreens';
import { StoreScreen } from './screens/StoreScreen';

const PHONE_ROUTES: readonly Route[] = ['/remote', '/team', '/host'];

function Screen({ route }: { route: Route }) {
  switch (route) {
    case '/new':
      return <NewGameScreen />;
    case '/host':
      return (
        <>
          <HostScreen />
          <SoundCorner role="host" buttonClass="sb-btn sb-btn-sm sb-btn-ghost" promptClass="sb-btn sb-btn-primary animate-pulse" />
        </>
      );
    case '/game':
      return (
        <>
          <GameScreen />
          <SoundCorner role="display" className="fixed bottom-2 left-[2vw] z-40 flex items-center gap-2" buttonClass="sb-btn sb-btn-sm sb-btn-ghost" promptClass="sb-btn sb-btn-primary animate-pulse" />
        </>
      );
    case '/join':
      return <JoinScreen />;
    case '/remote':
      return <RemoteScreen />;
    case '/team':
      return <TeamPhoneScreen />;
    case '/store':
      return <StoreScreen />;
    default:
      return <HomeScreen />;
  }
}

export default function App() {
  const t = useT();
  const route = useRoute();
  const remote = useRemoteStatus();
  useApplyLangAttribute();

  // A phone that refreshes goes back to the TV it was connected to.
  useEffect(() => {
    if (PHONE_ROUTES.includes(route)) resumeRemoteSession();
    // Refunded keys stop working after the weekly check; being offline never locks anyone out.
    void license.revalidateIfDue();
    // Only on first load: later route changes keep the connection they have.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const titles: Partial<Record<Route, string>> = {
      '/new': t('New game'),
      '/host': t('Host controls'),
      '/game': t('Game screen'),
      '/join': t('Connect to the TV'),
      '/remote': t('Phone remote'),
      '/team': t('Team phone'),
      '/store': t('Store'),
    };
    const title = titles[route];
    document.title = title ? `${title} | ${TITLE.name}` : TITLE.name;
  }, [route, t]);

  if (FULL_BLEED_ROUTES.includes(route)) {
    return (
      <>
        <UpdatePrompt quiet />
        {route !== '/game' && <RainbowStripes top />}
        <Screen route={route} />
      </>
    );
  }

  const reconnecting = remote.role === 'remote' && remote.phase === 'reconnecting';
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col px-4 pb-10 pt-2">
      <RainbowStripes top />
      <header className="flex flex-wrap items-center justify-between gap-3 py-4">
        <button type="button" className="rounded-lg" onClick={() => navigate('/')} aria-label={t('Home')}>
          <Wordmark className="text-3xl" />
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={`sb-btn sb-btn-sm ${route === '/store' ? 'sb-btn-primary' : 'sb-btn-ghost'}`} onClick={() => navigate('/store')}>
            {t('Store')}
          </button>
          <LangToggle />
        </div>
      </header>
      <UpdatePrompt />
      {reconnecting && (
        <p className="sb-alert mb-4" role="status">
          {t('Reconnecting to the TV…')}
        </p>
      )}
      <main className="flex-1">
        <Screen route={route} />
      </main>
      <footer className="pt-8 text-center text-sm sb-muted">{t('Are You Smarter Than a Spiritual Babe? is an independent game and is not affiliated with any organization or television show.')}</footer>
    </div>
  );
}
