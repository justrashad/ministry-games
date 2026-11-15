import { t } from '../i18n/i18n';
import { useEffect, useRef, useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { activateKey, type ActivateResult } from '../commerce/licenseStore';
import { useToast } from './ui/Toast';

/** Lemon Squeezy's customer order lookup: sign in with the checkout email to see keys. */
export const LOST_KEY_URL = 'https://app.lemonsqueezy.com/my-orders';

/** Paste-a-key form. The key decides what it unlocks (the game or a pack). */
export function LicenseKeyForm({
  onActivated,
  compact = false,
  initialKey = '',
  autoActivate = false,
}: {
  onActivated?: (result: Extract<ActivateResult, { ok: true }>) => void;
  compact?: boolean;
  /** Pre-fills the key (for example from the purchase confirmation link). */
  initialKey?: string;
  /** Activates the pre-filled key once, right away. */
  autoActivate?: boolean;
}) {
  const toast = useToast();
  const [key, setKey] = useState(initialKey);
  const autoRan = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await activateKey(key);
    setBusy(false);
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    setKey('');
    toast.show(
      ['owner', 'mega-pack', 'complete'].includes(result.entitlement)
        ? `${t('{name} is unlocked on this device.', { name: t(result.label) })}${result.addedPacks ? ` ${t('{n} question packs added to your questions.', { n: result.addedPacks })}` : ''}`
        : result.entitlement === 'game'
        ? t('Ministry Showdown is unlocked on this device. Enjoy!')
        : result.installed
          ? t('{name} is unlocked and added to your questions.', { name: t(result.label) })
          : t('{name} is unlocked.', { name: t(result.label) }),
    );
    onActivated?.(result);
  };

  useEffect(() => {
    if (!autoActivate || autoRan.current || !initialKey.trim()) return;
    autoRan.current = true;
    void submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoActivate, initialKey]);

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label htmlFor="license-key" className={compact ? 'sr-only' : 'field-label'}>
        {t('License key')}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="license-key"
          className="input flex-1 font-mono text-sm"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setError(null);
          }}
          placeholder={t('Paste the key from your purchase email')}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'license-key-error' : undefined}
        />
        <button type="submit" className="btn btn-gold btn-md" disabled={busy || !key.trim()}>
          {busy ? <Loader2 className="btn-icon animate-spin" aria-hidden /> : <KeyRound className="btn-icon" aria-hidden />}
          <span>{busy ? t('Checking…') : t('Activate')}</span>
        </button>
      </div>
      <p className="text-xs text-night-200">
        {t('Lost your key?')}{' '}
        <a className="font-bold text-gold-200 underline underline-offset-2" href={LOST_KEY_URL} target="_blank" rel="noopener noreferrer">
          {t('Find it in your orders')}
        </a>{' '}
        {t('using the email you bought with.')}
      </p>
      {error && (
        <p id="license-key-error" role="alert" className="text-sm font-bold text-rose-300">
          {error}
        </p>
      )}
    </form>
  );
}
