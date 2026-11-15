import { Music, Users, Volume2, VolumeX } from 'lucide-react';
import { useT } from '../i18n/i18n';
import { audio } from './engine';
import { useSoundLeader, useSoundLocked } from './hooks';
import { soundPrefs } from './prefs';

/**
 * Sound controls for a game or host screen: effects and music switches, and,
 * while the browser is still holding audio back, a big "tap to turn on sound"
 * button. Each title passes its own button classes.
 */
export function SoundCorner({
  role,
  buttonClass,
  promptClass,
  className = 'fixed bottom-3 right-3 z-40 flex items-center gap-2',
}: {
  /** The game screen on the TV, or the host controls. */
  role: 'display' | 'host';
  buttonClass: string;
  promptClass: string;
  className?: string;
}) {
  const t = useT();
  const prefs = soundPrefs.useValue();
  const active = useSoundLeader(role);
  const locked = useSoundLocked(active);
  if (!audio.isSupported()) return null;
  return (
    <div className={className}>
      {locked && (
        <button type="button" className={promptClass} onClick={() => void audio.unlock()}>
          <Volume2 aria-hidden className="h-6 w-6" />
          <span>{t('Tap to turn on sound')}</span>
        </button>
      )}
      <button
        type="button"
        className={`${buttonClass} ${prefs.sfx ? '' : 'opacity-50'}`}
        aria-pressed={prefs.sfx}
        aria-label={prefs.sfx ? t('Sound effects on') : t('Sound effects off')}
        title={prefs.sfx ? t('Sound effects on') : t('Sound effects off')}
        onClick={() => soundPrefs.set((p) => ({ ...p, sfx: !p.sfx }))}
      >
        {prefs.sfx ? <Volume2 aria-hidden className="h-5 w-5" /> : <VolumeX aria-hidden className="h-5 w-5" />}
      </button>
      <button
        type="button"
        className={`${buttonClass} ${prefs.music ? '' : 'opacity-50 line-through'}`}
        aria-pressed={prefs.music}
        aria-label={prefs.music ? t('Music on') : t('Music off')}
        title={prefs.music ? t('Music on') : t('Music off')}
        onClick={() => soundPrefs.set((p) => ({ ...p, music: !p.music }))}
      >
        <Music aria-hidden className="h-5 w-5" />
      </button>
      <button
        type="button"
        className={`${buttonClass} ${prefs.crowd ? '' : 'opacity-50 line-through'}`}
        aria-pressed={prefs.crowd}
        aria-label={prefs.crowd ? t('Studio audience on') : t('Studio audience off')}
        title={prefs.crowd ? t('Studio audience on') : t('Studio audience off')}
        onClick={() => soundPrefs.set((p) => ({ ...p, crowd: !p.crowd }))}
      >
        <Users aria-hidden className="h-5 w-5" />
      </button>
    </div>
  );
}
