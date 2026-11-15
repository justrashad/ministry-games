import { BellRing, Gamepad2, Keyboard, Unplug } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { navigate } from '../../lib/router';
import { leaveRoom, savePhoneRole, useRemoteStatus, type PhoneRole } from '../../../../core/sync/remote';
import { formatRoomCode } from '../../../../core/sync/roomCode';
import { Button } from '../../../../core/components/ui/Button';
import { RemoteReconnecting } from '../../components/RemoteReconnecting';
import { msg, useT } from '../../../../core/i18n/i18n';

const ROLES: { role: PhoneRole; title: string; text: string; icon: LucideIcon; route: '/host' | '/buzzer' | '/player' }[] = [
  { role: 'host', title: msg('Host controls'), text: msg('Run the game: reveal answers, give strikes, keep score.'), icon: Gamepad2, route: '/host' },
  { role: 'buzzer', title: msg('Team buzzer'), text: msg('For a team captain. Buzz first to win control of the round.'), icon: BellRing, route: '/buzzer' },
  { role: 'player', title: msg('Final Challenge player'), text: msg('Type your own answers privately during the Final Challenge.'), icon: Keyboard, route: '/player' },
];

/** After a phone connects, it picks what it will be used for. */
export function RoleScreen() {
  const t = useT();
  const remote = useRemoteStatus();
  if (remote.role !== 'remote') {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="text-3xl font-semibold">{t('Not connected to a TV')}</h1>
        <p className="mt-2 text-night-200">{t('Connect to the TV first, then choose what this phone is for.')}</p>
        <Button className="mt-6" variant="gold" size="lg" onClick={() => navigate('/join')}>
          {t('Connect to the TV')}
        </Button>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-8">
      <RemoteReconnecting />
      <p className="text-sm font-bold text-night-200">{t('Connected to TV {code}', { code: remote.code ? formatRoomCode(remote.code) : '' })}</p>
      <h1 className="mt-1 text-3xl font-semibold">{t('What is this phone for?')}</h1>
      <ul className="mt-6 space-y-3">
        {ROLES.map(({ role, title, text, icon: Icon, route }) => (
          <li key={role}>
            <button
              type="button"
              className="panel flex w-full items-start gap-4 text-left transition hover:ring-2 hover:ring-gold-300 focus-visible:ring-2 focus-visible:ring-gold-300"
              onClick={() => {
                savePhoneRole(role);
                navigate(route);
              }}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-300 text-ink">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span>
                <span className="block font-display text-xl font-semibold text-cream">{t(title)}</span>
                <span className="text-sm text-night-100">{t(text)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Button
        className="mt-6"
        variant="subtle"
        icon={Unplug}
        onClick={() => {
          leaveRoom();
          navigate('/');
        }}
      >
        {t('Disconnect from the TV')}
      </Button>
    </div>
  );
}
