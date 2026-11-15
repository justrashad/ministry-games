import { Loader2, Unplug } from 'lucide-react';
import { leaveRoom, useRemoteStatus } from '../../../core/sync/remote';
import { navigate } from '../lib/router';
import { Button } from '../../../core/components/ui/Button';
import { useT } from '../../../core/i18n/i18n';

/** Covers a phone's controls while it is not connected to the TV, so taps never go nowhere. */
export function RemoteReconnecting() {
  const t = useT();
  const remote = useRemoteStatus();
  if (remote.role !== 'remote' || remote.phase === 'connected') return null;
  return (
    <div className="fixed inset-0 z-[55] grid place-items-center bg-night-950/85 p-6 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="reconnect-title">
      <div className="panel max-w-sm text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-gold-300" aria-hidden />
        <h2 id="reconnect-title" className="mt-3 text-2xl font-semibold">
          {remote.phase === 'starting' ? t('Connecting to the TV') : t('Reconnecting to the TV')}
        </h2>
        <p className="mt-2 text-night-100">
          {remote.error ? t(remote.error, remote.errorVars) : t('Make sure the game screen is still open on the TV and both devices are online. This goes away as soon as it reconnects.')}
        </p>
        <Button
          className="mt-4"
          variant="ghost"
          icon={Unplug}
          onClick={() => {
            leaveRoom();
            navigate('/');
          }}
        >
          {t('Stop using this phone')}
        </Button>
      </div>
    </div>
  );
}
