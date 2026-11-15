import { t } from '../../i18n/i18n';
import { useEffect, useState } from 'react';
import { CircleHelp, Home, MonitorPlay, Pause, Play, Plus, Unplug, Volume2, VolumeX } from 'lucide-react';
import type { GameState } from '../../types';
import { navigate, openGameScreen } from '../../lib/router';
import { sound } from '../../lib/sound';
import { dispatchGame, useGameState } from '../../sync/gameStore';
import { useDisplayConnected } from '../../sync/presence';
import { leaveRoom, useRemoteStatus, type RemoteStatus } from '../../sync/remote';
import { RemoteReconnecting } from '../../components/RemoteReconnecting';
import { formatRoomCode } from '../../sync/roomCode';
import { updateSettings, useSettings } from '../../state/settingsStore';
import { useGameSounds, useTimerDriver } from '../../hooks/useGameEffects';
import { useHistoryRecorder } from '../../hooks/useHistoryRecorder';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { HostHelpModal } from './HostHelp';
import { useHostShortcuts } from './useHostShortcuts';
import { MainGameHost } from './MainGameHost';
import { FinalChallengeHost } from '../final/FinalChallengeHost';

export function HostScreen() {
  const state = useGameState();
  const displayConnected = useDisplayConnected();
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    document.title = t('Ministry Showdown | Host Controls');
  }, []);
  // Sounds play on the TV window when it is open; otherwise here.
  useGameSounds(state, !displayConnected);
  useTimerDriver(state, !displayConnected);
  useHistoryRecorder(state);
  useHostShortcuts(state);

  const remote = useRemoteStatus();
  const overlay = <RemoteReconnecting />;

  if (!state)
    return (
      <>
        <NoGame remote={remote} />
        {overlay}
      </>
    );

  return (
    <div className="mx-auto max-w-7xl px-3 pb-32 pt-4 sm:px-6 lg:pb-24">
      {overlay}
      <HostToolbar state={state} displayConnected={displayConnected} onHelp={() => setHelpOpen(true)} />
      {state.phase === 'finalChallenge' && state.finalChallenge ? <FinalChallengeHost state={state} fc={state.finalChallenge} /> : <MainGameHost state={state} />}
      <HostHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function NoGame({ remote }: { remote: RemoteStatus }) {
  const asRemote = remote.role === 'remote';
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">{t('No game in progress')}</h1>
      <p className="text-night-200">
        {asRemote
          ? t('This phone is connected to the TV. Start a new game here and it appears on the TV right away.')
          : t('Start a new game to use the host controls. Your teams, questions and house rules are chosen on the next screen.')}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="gold" size="lg" icon={Plus} onClick={() => navigate('/new')}>
          {t('Start new game')}
        </Button>
        <Button variant="ghost" size="lg" icon={Home} onClick={() => navigate('/')}>
          {t('Home')}
        </Button>
      </div>
    </div>
  );
}

function HostToolbar({ state, displayConnected, onHelp }: { state: GameState; displayConnected: boolean; onHelp: () => void }) {
  const { audio } = useSettings();
  const toast = useToast();
  const remote = useRemoteStatus();
  const asRemote = remote.role === 'remote';
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="mr-auto min-w-0">
        <h1 className="truncate text-2xl font-semibold">{t('Host controls')}</h1>
        <p className="truncate text-sm text-night-200">
          {state.config.setName} ·{' '}
          {asRemote ? t('Remote for TV {code}', { code: remote.code ? formatRoomCode(remote.code) : '' }) : displayConnected ? t('Game screen connected') : t('Game screen not open')}
          <span className={`ml-2 inline-block h-2 w-2 rounded-full align-middle ${displayConnected ? 'bg-emerald-400' : 'bg-night-300'}`} aria-hidden />
        </p>
      </div>
      {asRemote ? (
        <>
          <Button variant="ghost" onClick={() => navigate('/remote')}>
            {t('Switch role')}
          </Button>
          <Button variant="ghost" icon={Unplug} onClick={() => leaveRoom()}>
            {t('Disconnect')}
          </Button>
        </>
      ) : (
        <>
          <Button
            variant={displayConnected ? 'ghost' : 'gold'}
            icon={MonitorPlay}
            onClick={() => {
              if (!openGameScreen()) toast.show(t('Your browser blocked the new window. Allow pop-ups for this page, or open the Game Screen link in a new tab.'), 'error');
            }}
          >
            {displayConnected ? t('Focus game screen') : t('Open game screen')}
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        icon={state.paused ? Play : Pause}
        aria-pressed={state.paused}
        onClick={() => dispatchGame({ type: 'SET_PAUSED', paused: !state.paused, now: Date.now() })}
      >
        {state.paused ? 'Resume' : 'Pause'}
      </Button>
      <Button
        variant="ghost"
        icon={audio.enabled ? Volume2 : VolumeX}
        aria-pressed={audio.enabled}
        aria-label={audio.enabled ? t('Sound on. Turn sound off') : t('Sound off. Turn sound on')}
        onClick={() => {
          updateSettings('audio', { enabled: !audio.enabled });
          void sound.unlock();
        }}
      />
      <Button variant="ghost" icon={CircleHelp} onClick={onHelp} aria-label={t('Host help')} />
    </div>
  );
}
