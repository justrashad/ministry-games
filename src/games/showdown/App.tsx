import { Fragment } from 'react';
import { LANGS, msg, setLang, t, useApplyLangAttribute, useLang } from '../../core/i18n/i18n';
import { useEffect, useRef, useState } from 'react';
import { BookOpen, CircleHelp, History, Home, Menu, MonitorPlay, Settings as SettingsIcon, ShoppingBag, SlidersHorizontal, Smartphone, X } from 'lucide-react';
import { FULL_BLEED_ROUTES, navigate, openGameScreen, useRoute, type Route } from './lib/router';
import { useApplyMotionAttribute } from './hooks/useMotion';
import { ConfirmProvider } from '../../core/components/ui/Confirm';
import { ToastProvider, useToast } from '../../core/components/ui/Toast';
import { Wordmark } from './components/game/Wordmark';
import { HomeScreen } from './screens/HomeScreen';
import { NewGameScreen } from './screens/NewGameScreen';
import { GameScreen } from './screens/GameScreen';
import { HostScreen } from './screens/host/HostScreen';
import { QuestionsScreen } from './screens/questions/QuestionsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HowToPlayScreen } from './screens/HowToPlayScreen';
import { JoinScreen } from './screens/JoinScreen';
import { RoleScreen } from './screens/phone/RoleScreen';
import { BuzzerScreen } from './screens/phone/BuzzerScreen';
import { PlayerScreen } from './screens/phone/PlayerScreen';
import { ImportLinkScreen } from './screens/ImportLinkScreen';
import { PrintScreen } from './screens/PrintScreen';
import { StoreScreen } from './screens/StoreScreen';
import { LegalScreen } from './screens/LegalScreen';
import { LandingScreen } from './screens/LandingScreen';
import { GiftScreen } from './screens/GiftScreen';
import { FreePrintableScreen } from './screens/FreePrintableScreen';
import { installNewBundlePacks, revalidateIfDue } from './commerce/licenseStore';
import { UpdatePrompt } from '../../core/components/UpdatePrompt';
import { resumeRemoteSession, useRemoteStatus } from '../../core/sync/remote';

const NAV: { route: Route; label: string; icon: typeof Home }[] = [
  { route: '/', label: msg('Home'), icon: Home },
  { route: '/host', label: msg('Host'), icon: SlidersHorizontal },
  { route: '/questions', label: msg('Questions'), icon: BookOpen },
  { route: '/settings', label: msg('Settings'), icon: SettingsIcon },
  { route: '/history', label: msg('History'), icon: History },
  { route: '/store', label: msg('Store'), icon: ShoppingBag },
  { route: '/how-to-play', label: msg('How to play'), icon: CircleHelp },
];

function Screen({ route }: { route: Route }) {
  switch (route) {
    case '/new':
      return <NewGameScreen />;
    case '/host':
      return <HostScreen />;
    case '/questions':
      return <QuestionsScreen />;
    case '/settings':
      return <SettingsScreen />;
    case '/history':
      return <HistoryScreen />;
    case '/how-to-play':
      return <HowToPlayScreen />;
    case '/join':
      return <JoinScreen />;
    case '/remote':
      return <RoleScreen />;
    case '/import':
      return <ImportLinkScreen />;
    case '/store':
      return <StoreScreen />;
    case '/legal':
      return <LegalScreen />;
    case '/about':
      return <LandingScreen />;
    case '/gift':
      return <GiftScreen />;
    case '/free-printable':
      return <FreePrintableScreen />;
    default:
      return <HomeScreen />;
  }
}

function Shell({ route }: { route: Route }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toast = useToast();
  const remote = useRemoteStatus();
  const lang = useLang();
  useEffect(() => setMenuOpen(false), [route]);
  useEffect(() => {
    const titles: Partial<Record<Route, string>> = {
      '/join': msg('Phone remote'),
      '/new': msg('New game'),
      '/questions': msg('Questions'),
      '/settings': msg('Settings'),
      '/history': msg('History'),
      '/how-to-play': msg('How to play'),
      '/store': msg('Store'),
      '/legal': msg('Support, terms and privacy'),
      '/gift': msg('Give it as a gift'),
      '/free-printable': msg('Free printable'),
    };
    const title = titles[route];
    document.title = title ? `${t(title)} | Ministry Showdown` : route === '/' || route === '/about' ? t('Ministry Showdown | Family worship game night on your TV') : document.title;
  }, [route, lang]);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-gold-300 focus:px-3 focus:py-2 focus:text-ink">
        {t('Skip to content')}
      </a>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-night-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-6">
          <button type="button" className="rounded-lg px-1" onClick={() => navigate('/')} aria-label={t('Ministry Showdown home')}>
            <Wordmark size="sm" />
          </button>
          <nav aria-label={t('Main')} className="ml-4 hidden flex-1 items-center gap-1 whitespace-nowrap xl:flex">
            {NAV.map(({ route: r, label, icon: Icon }) => (
              <button
                key={r}
                type="button"
                onClick={() => navigate(r)}
                aria-current={route === r ? 'page' : undefined}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors ${route === r ? 'bg-white/10 text-cream' : 'text-night-200 hover:text-cream'}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {t(label)}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitch />
            {remote.role === 'remote' ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/remote')}>
                <Smartphone className="btn-icon" aria-hidden />
                <span className="hidden sm:inline">{remote.phase === 'connected' ? t('Remote connected') : t('Reconnecting…')}</span>
                <span className="sm:hidden">{t('Remote')}</span>
                <span className={`h-2 w-2 rounded-full ${remote.phase === 'connected' ? 'bg-emerald-400' : 'bg-gold-300'}`} aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  if (!openGameScreen()) toast.show(t('Your browser blocked the new window. Allow pop-ups for this page.'), 'error');
                }}
              >
                <MonitorPlay className="btn-icon" aria-hidden />
                <span className="hidden whitespace-nowrap sm:inline">{t('Game screen')}</span>
                <span className="sm:hidden">{t('TV')}</span>
              </button>
            )}
            <button type="button" className="btn btn-subtle btn-sm xl:hidden" aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label={t('Menu')} onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <X className="btn-icon" aria-hidden /> : <Menu className="btn-icon" aria-hidden />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" aria-label={t('Main')} className="border-t border-white/10 px-3 pb-3 xl:hidden">
            <ul className="grid grid-cols-2 gap-1 pt-2">
              {NAV.map(({ route: r, label, icon: Icon }) => (
                <li key={r}>
                  <button
                    type="button"
                    onClick={() => navigate(r)}
                    aria-current={route === r ? 'page' : undefined}
                    className={`flex min-h-[48px] w-full items-center gap-2 rounded-xl px-3 font-bold ${route === r ? 'bg-white/10 text-cream' : 'text-night-200'}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    {t(label)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <main id="main" tabIndex={-1}>
        <Screen route={route} />
      </main>
      <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-night-200">
        <button type="button" className="font-bold text-night-100 underline underline-offset-2 hover:text-cream" onClick={() => navigate('/legal')}>
          {t('Support, refunds, terms and privacy')}
        </button>
        <p className="mt-1">{t("Designed for family worship. Not affiliated with Jehovah's Witnesses.")}</p>
      </footer>
    </div>
  );
}

/**
 * Background license upkeep: re-checks purchases about once a week (never blocking
 * play offline) and adds newly released packs for Mega Pack / Complete Edition owners.
 */
function LicenseMaintenance() {
  const toast = useToast();
  const lang = useLang();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  // Runs once per app load (and again when the device comes back online).
  useEffect(() => {
    const run = async () => {
      await revalidateIfDue();
      const added = await installNewBundlePacks();
      if (added.length > 0) toastRef.current.show(added.length === 1 ? t('New question pack added: {name}', { name: added[0] }) : t('{n} new question packs added to your questions.', { n: added.length }));
    };
    void run();
    const onOnline = () => void run();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
    // Re-runs when the language changes, so bundle owners get packs in the new language.
  }, [lang]);
  return null;
}

function FullBleed({ route }: { route: Route }) {
  if (route === '/buzzer') return <BuzzerScreen />;
  if (route === '/player') return <PlayerScreen />;
  if (route === '/print') return <PrintScreen />;
  return <GameScreen />;
}

/** English / Español. The choice is remembered per device and shared with the TV window. */
function LanguageSwitch() {
  const lang = useLang();
  return (
    <div className="segmented !flex-nowrap !p-0.5" role="group" aria-label={t('Language')}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
          className="!min-h-[32px] !px-2 !text-xs"
          title={l.label}
        >
          {l.id.toUpperCase()}
          <span className="sr-only"> {l.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const route = useRoute();
  const lang = useLang();
  useApplyMotionAttribute();
  useApplyLangAttribute();
  useEffect(() => {
    // A phone that was acting as the remote reconnects after a refresh.
    if (window.location.hash.replace(/^#/, '').split('?')[0] !== '/game') resumeRemoteSession();
  }, []);
  return (
    <ToastProvider>
      <ConfirmProvider>
        {/* Re-render everything in the new language when it changes. */}
        <Fragment key={lang}>{FULL_BLEED_ROUTES.includes(route) ? <FullBleed route={route} /> : <Shell route={route} />}</Fragment>
        {route !== '/game' && <LicenseMaintenance />}
        <UpdatePrompt quiet={FULL_BLEED_ROUTES.includes(route)} />
      </ConfirmProvider>
    </ToastProvider>
  );
}
