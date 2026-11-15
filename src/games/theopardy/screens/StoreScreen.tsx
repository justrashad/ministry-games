import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, KeyRound, ShoppingCart } from 'lucide-react';
import { withDiscount, type StoreProduct, type StorePromo } from '../../../core/commerce/licenseClient';
import { packRows } from '../../../core/commerce/packChoices';
import { useLang, useT } from '../../../core/i18n/i18n';
import { PACK_CATALOG } from '../commerce/catalog';
import { grantName, license, packLibrary } from '../commerce/license';
import { getHashParam, navigate } from '../lib/router';

function useStoreInfo(): { product: StoreProduct | null; products: StoreProduct[]; promo: StorePromo | null; loaded: boolean } {
  const [info, setInfo] = useState<{ product: StoreProduct | null; products: StoreProduct[]; promo: StorePromo | null; loaded: boolean }>({ product: null, products: [], promo: null, loaded: false });
  useEffect(() => {
    let alive = true;
    void Promise.all([license.loadStoreCatalog(), license.loadPromo()]).then(([products, promo]) => {
      if (alive) setInfo({ product: products?.find((p) => p.entitlement === 'game') ?? null, products: products ?? [], promo, loaded: true });
    });
    return () => {
      alive = false;
    };
  }, []);
  return info;
}

export function StoreScreen() {
  const t = useT();
  const licenses = license.useLicenses();
  const unlocked = licenses.game !== null;
  const { product, products, promo, loaded } = useStoreInfo();
  const lang = useLang();
  const installed = packLibrary.usePacksIn(lang);
  const rows = packRows(PACK_CATALOG, installed, license);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const autoTried = useRef(false);

  const activate = async (value: string) => {
    setBusy(true);
    setError(null);
    const result = await license.activateKey(value);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setKey('');
    setJustUnlocked(true);
  };

  // Arriving from the purchase email's button: the key is in the address, so unlock straight away.
  useEffect(() => {
    if (autoTried.current) return;
    autoTried.current = true;
    const fromLink = getHashParam('key')?.trim();
    if (!fromLink) return;
    window.history.replaceState(null, '', `${window.location.pathname}#/store`);
    void activate(fromLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void activate(key);
  };

  const remove = async (token: string) => {
    setRemoving(token);
    setError(null);
    const result = await license.deactivatePurchase(token);
    setRemoving(null);
    if (!result.ok) setError(result.error);
    else setJustUnlocked(false);
  };

  const purchases = license.listPurchases(licenses);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-4xl">{t('Store')}</h1>

      {unlocked ? (
        <div className="tp-panel flex flex-wrap items-center justify-between gap-4" role="status">
          <p className="flex items-center gap-3 text-xl font-bold">
            <Check aria-hidden className="h-7 w-7" />
            {justUnlocked ? t('Unlocked on this device. Enjoy the game!') : t('The full game is unlocked on this device.')}
          </p>
          <button type="button" className="tp-btn tp-btn-accent" onClick={() => navigate('/new')}>
            {t('New game')}
          </button>
        </div>
      ) : (
        <div className="tp-panel">
          <h2 className="text-2xl">{t('Theopardy! full game')}</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-lg text-sea-100">
            <li>{t('Two rounds with up to six categories on each board')}</li>
            <li>{t('The final round')}</li>
            <li>{t('The starter pack: 12 categories and 60 clues, in English and Spanish')}</li>
            <li>{t('One purchase, no subscription')}</li>
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {product ? (
              <a className="tp-btn tp-btn-xl tp-btn-accent" href={withDiscount(product.checkoutUrl, promo)} target="_blank" rel="noreferrer">
                <ShoppingCart aria-hidden className="h-7 w-7" />
                {product.price ? t('Buy the full game for {price}', { price: product.price }) : t('Buy the full game')}
              </a>
            ) : (
              <button type="button" className="tp-btn tp-btn-xl tp-btn-ghost" disabled>
                {loaded ? t('Store opening soon') : t('Loading the store…')}
              </button>
            )}
            {promo && product && <p className="font-semibold text-ice-300">{t('{percent}% off is applied at checkout with code {code}.', { percent: promo.percent, code: promo.code })}</p>}
          </div>
        </div>
      )}

      <section className="tp-panel">
        <h2 className="text-2xl">{t('Question packs')}</h2>
        <p className="mt-1 tp-muted">{t('Each pack adds a new set of categories and clues, in English and Spanish.')}</p>
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((row) => {
            const buy = products.find((p) => p.entitlement === row.info.id) ?? null;
            return (
              <li key={row.info.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sea-900 p-3">
                <div className="max-w-xl">
                  <p className="text-lg font-bold">{t(row.info.name)}</p>
                  <p className="tp-muted">{t(row.info.description)}</p>
                </div>
                {row.state !== 'locked' ? (
                  <p className="flex items-center gap-2 font-bold">
                    <Check aria-hidden className="h-5 w-5" />
                    {t('Owned')}
                  </p>
                ) : buy ? (
                  <a className="tp-btn tp-btn-sm tp-btn-accent" href={withDiscount(buy.checkoutUrl, promo)} target="_blank" rel="noreferrer">
                    <ShoppingCart aria-hidden className="h-5 w-5" />
                    {buy.price ? t('Buy for {price}', { price: buy.price }) : t('Buy')}
                  </a>
                ) : (
                  <span className="font-semibold tp-muted">{loaded ? t('Coming soon') : t('Loading the store…')}</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <form className="tp-panel flex flex-col gap-3" onSubmit={submit}>
        <h2 className="flex items-center gap-2 text-2xl">
          <KeyRound aria-hidden className="h-6 w-6" />
          {t('I have a key')}
        </h2>
        <p className="tp-muted">{t('Your license key is in your purchase email.')}</p>
        <div>
          <label className="tp-label" htmlFor="license-key">
            {t('License key')}
          </label>
          <input id="license-key" className="tp-input" autoComplete="off" autoCapitalize="off" spellCheck={false} value={key} onChange={(e) => setKey(e.target.value)} />
        </div>
        {error && (
          <p className="rounded-xl border-2 border-ice-300 p-3 font-semibold text-ice-300" role="alert">
            {t(error)}
          </p>
        )}
        <button type="submit" className="tp-btn tp-btn-primary self-start" disabled={busy || !key.trim()}>
          {busy ? t('Checking the key…') : t('Unlock')}
        </button>
      </form>

      {purchases.length > 0 && (
        <section className="tp-panel">
          <h2 className="text-2xl">{t('Activated on this device')}</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {purchases.map((p) => (
              <li key={p.token} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sea-900 p-3">
                <div>
                  <p className="text-lg font-bold">{t(grantName(p.grant))}</p>
                  <p className="tp-muted">{t('Key ending in {hint}', { hint: p.keyHint })}</p>
                </div>
                <button type="button" className="tp-btn tp-btn-sm tp-btn-bad" disabled={removing === p.token} onClick={() => void remove(p.token)}>
                  {removing === p.token ? t('Removing…') : t('Remove from this device')}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm tp-muted">{t('Removing a key frees it so you can use it on another device.')}</p>
        </section>
      )}
    </div>
  );
}
