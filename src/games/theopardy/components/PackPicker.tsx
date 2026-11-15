import { useState } from 'react';
import { Download, Store } from 'lucide-react';
import { packRows } from '../../../core/commerce/packChoices';
import { useLang, useT } from '../../../core/i18n/i18n';
import { PACK_CATALOG } from '../commerce/catalog';
import { license, packLibrary } from '../commerce/license';
import { navigate } from '../lib/router';

export const STARTER_ID = 'starter';

/**
 * The question sets a game can draw from: the starter pack, then every paid pack.
 * Packs ready in this language can be switched on and off; owned packs not yet
 * downloaded in this language can be downloaded; the rest point to the Store.
 */
export function PackPicker({ skipped, onToggle, starterName }: { skipped: readonly string[]; onToggle: (id: string) => void; starterName: string }) {
  const t = useT();
  const lang = useLang();
  license.useLicenses();
  const installed = packLibrary.usePacksIn(lang);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rows = packRows(PACK_CATALOG, installed, license);

  const download = async (id: string) => {
    setBusy(id);
    setError(null);
    const result = await packLibrary.download(license, id, lang);
    setBusy(null);
    if (!result.ok) setError(result.error);
  };

  return (
    <fieldset className="tp-panel">
      <legend className="tp-label">{t('Question packs')}</legend>
      <ul className="flex flex-col gap-2">
        <li>
          <label className="flex items-center gap-3 text-lg font-semibold">
            <input type="checkbox" className="h-6 w-6 accent-ice-400" checked={!skipped.includes(STARTER_ID)} onChange={() => onToggle(STARTER_ID)} />
            {starterName}
          </label>
        </li>
        {rows.map((row) => (
          <li key={row.info.id} className="flex flex-wrap items-center justify-between gap-2">
            {row.state === 'installed' ? (
              <label className="flex items-center gap-3 text-lg font-semibold">
                <input type="checkbox" className="h-6 w-6 accent-ice-400" checked={!skipped.includes(row.info.id)} onChange={() => onToggle(row.info.id)} />
                {t(row.info.name)}
              </label>
            ) : (
              <span className="text-lg font-semibold tp-muted">{t(row.info.name)}</span>
            )}
            {row.state === 'download' && (
              <button type="button" className="tp-btn tp-btn-sm tp-btn-primary" disabled={busy !== null} onClick={() => void download(row.info.id)}>
                <Download aria-hidden className="h-5 w-5" />
                {busy === row.info.id ? t('Downloading…') : t('Download')}
              </button>
            )}
            {row.state === 'locked' && (
              <button type="button" className="tp-btn tp-btn-sm tp-btn-ghost" onClick={() => navigate('/store')}>
                <Store aria-hidden className="h-5 w-5" />
                {t('In the Store')}
              </button>
            )}
          </li>
        ))}
      </ul>
      {error && (
        <p className="mt-3 rounded-xl border-2 border-ice-300 p-3 font-semibold text-ice-300" role="alert">
          {t(error)}
        </p>
      )}
    </fieldset>
  );
}
