import { t, useLang } from '../i18n/i18n';
import { useState } from 'react';
import { BookOpen, CheckCircle2, Crown, Download, Gamepad2, Layers, Loader2, Package, Trash2 } from 'lucide-react';
import { PACK_CATALOG } from '../commerce/catalog';
import { deactivatePurchase, listPurchases, ownsPack, packKey, redownloadPack, useLicenses, type Purchase } from '../commerce/licenseStore';
import { getHashParam, navigate } from '../lib/router';
import { useLibrary } from '../state/libraryStore';
import { BuyButton } from '../components/BuyButton';
import { SavingsNote } from '../components/SavingsNote';
import { PromoBanner } from '../components/PromoBanner';
import { LicenseKeyForm } from '../components/LicenseKeyForm';
import { Button } from '../components/ui/Button';
import { useConfirm } from '../components/ui/Confirm';
import { useToast } from '../components/ui/Toast';

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export function StoreScreen() {
  const licenses = useLicenses();
  const lang = useLang();
  const { sets } = useLibrary();
  const toast = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState<string | null>(null);
  const ownsGame = licenses.game !== null;
  // The Lemon Squeezy confirmation button can link here with ?key=[license_key], so buyers never copy and paste.
  const [linkedKey] = useState(() => (getHashParam('key') ?? '').trim());

  const reinstall = async (packId: string) => {
    setBusy(packId);
    const result = await redownloadPack(packId);
    setBusy(null);
    if (!result.ok) toast.show(t(result.error), 'error');
    else toast.show(result.alreadyInstalled ? t('{name} is already in your questions.', { name: result.set.name }) : t('{name} added to your questions.', { name: result.set.name }));
  };

  const remove = async (purchase: Purchase) => {
    const ok = await confirm({
      title: t('Remove {name} from this device?', { name: t(purchase.name) }),
      message: t('This frees up the key so you can use it on another device. You can activate it here again later with the same key. Question sets already added stay in your library.'),
      confirmLabel: t('Remove from this device'),
    });
    if (!ok) return;
    setBusy(purchase.token);
    const result = await deactivatePurchase(purchase.token);
    setBusy(null);
    toast.show(result.ok ? t('{name} removed from this device.', { name: t(purchase.name) }) : t(result.error), result.ok ? 'success' : 'error');
  };

  const purchases = listPurchases(licenses);
  // True when a bundle (or the owner key) covers every pack in the store today.
  const ownsAllPacks = PACK_CATALOG.every((p) => ownsPack(licenses, p.id));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <h1 className="text-3xl font-semibold">{t('Store')}</h1>
      <p className="mt-1 text-night-200">{t('One-time purchases. No subscriptions, no ads.')}</p>

      <PromoBanner className="mt-4" />

      <section className="panel mt-6 grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" aria-labelledby="game-title">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-300 text-ink">
              <Gamepad2 className="h-6 w-6" aria-hidden />
            </span>
            <h2 id="game-title" className="text-2xl font-semibold">
              {t('Ministry Showdown')}
            </h2>
          </div>
          <ul className="mt-4 space-y-1.5 text-night-100">
            <li>{t('The full game: rounds, steals, the final round and the Final Challenge')}</li>
            <li>{t('The 32-question Mixed Family Worship starter set')}</li>
            <li>{t('Unlimited questions and question sets of your own')}</li>
            <li>{t('Phone remote, team buzzers, sharing and printable host cards')}</li>
            <li>{t('Works offline once activated')}</li>
          </ul>
        </div>
        <div className="flex flex-col justify-center gap-3">
          {ownsGame ? (
            <p className="flex items-center gap-2 rounded-2xl bg-emerald-400/15 p-4 font-bold text-emerald-200">
              <CheckCircle2 className="h-5 w-5" aria-hidden /> {t('Unlocked on this device')}
            </p>
          ) : (
            <>
              <BuyButton entitlement="game" block size="xl" />
              <p className="text-center text-sm text-night-200">{t('Your key arrives by email right after checkout.')}</p>
            </>
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2" aria-label={t('Bundles')}>
        <div className="panel flex flex-col gap-3 ring-2 ring-gold-300/70">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-300 text-ink">
              <Crown className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-semibold">{t('Complete Edition')}</h2>
              <p className="text-xs font-bold text-gold-200">{t('Best value for new families')}</p>
            </div>
          </div>
          <p className="flex-1 text-sm text-night-100">
            {t('The full game plus all {n} question packs available today. One purchase, everything unlocked.', { n: PACK_CATALOG.length })}
          </p>
          {!(ownsGame && ownsAllPacks) && !ownsGame && <SavingsNote bundle="complete" />}
          {ownsGame && ownsAllPacks ? (
            <p className="flex items-center gap-2 font-bold text-emerald-200">
              <CheckCircle2 className="h-5 w-5" aria-hidden /> {t('You have everything')}
            </p>
          ) : ownsGame ? (
            <p className="text-sm text-night-200">{t('You already own the game, so the Mega Pack is the better deal for you.')}</p>
          ) : (
            <BuyButton entitlement="complete" block />
          )}
        </div>
        <div className="panel flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-night-500 text-cream">
              <Layers className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-semibold">{t('Mega Pack')}</h2>
              <p className="text-xs font-bold text-night-200">{t('For families who own the game')}</p>
            </div>
          </div>
          <p className="flex-1 text-sm text-night-100">
            {t('All {n} question packs available today ({q} questions).', { n: PACK_CATALOG.length, q: PACK_CATALOG.reduce((n, p) => n + p.questionCount, 0) })}
          </p>
          {!ownsAllPacks && <SavingsNote bundle="mega-pack" />}
          {ownsAllPacks ? (
            <p className="flex items-center gap-2 font-bold text-emerald-200">
              <CheckCircle2 className="h-5 w-5" aria-hidden /> {t('Every pack is unlocked')}
            </p>
          ) : (
            <BuyButton entitlement="mega-pack" block />
          )}
        </div>
        <p className="text-xs text-night-200 md:col-span-2">
          {t('Bundles include every pack available on the day you buy. Packs released later are sold separately.')}{' '}
          <button type="button" className="font-bold text-gold-200 underline underline-offset-2" onClick={() => navigate('/gift')}>
            {t('Buying for another family? Make a gift card.')}
          </button>
        </p>
      </section>

      <section className="panel mt-4" aria-labelledby="key-title">
        <h2 id="key-title" className="panel-title">
          {t('Enter a license key')}
        </h2>
        <p className="mb-3 text-sm text-night-200">{t('Works for the game and for question packs. Each key can be used on a few devices, such as the TV laptop and a phone.')}</p>
        {linkedKey && <p className="mb-2 text-sm font-bold text-gold-200">{t('Activating the key from your purchase…')}</p>}
        <LicenseKeyForm initialKey={linkedKey} autoActivate={!!linkedKey} />
      </section>

      <section className="mt-8" aria-labelledby="packs-title">
        <h2 id="packs-title" className="flex items-center gap-2 text-2xl font-semibold">
          <Package className="h-6 w-6 text-gold-300" aria-hidden /> {t('Question packs')}
        </h2>
        <p className="mt-1 text-night-200">
          {t('Themed packs designed for family worship. Each includes round questions, a final round question and Final Challenge questions. New to the Bible? Start with the beginner friendly packs.')}
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[...PACK_CATALOG.filter((p) => p.beginner), ...PACK_CATALOG.filter((p) => !p.beginner)].map((pack) => {
            const record = ownsPack(licenses, pack.id);
            // In Spanish, a pack without a Spanish version yet counts as added once its English copy is there.
            const inLibrary = sets.some((s) => s.packId === packKey(pack.id, lang) || (lang === 'es' && !pack.es && s.packId === pack.id));
            return (
              <li key={pack.id} className="panel flex flex-col gap-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold text-cream">{t(pack.name)}</h3>
                    <div className="flex shrink-0 gap-1">
                      {pack.beginner && <span className="chip !bg-sky-400/15 text-sky-200">{t('Beginner friendly')}</span>}
                      {lang === 'es' && !pack.es && <span className="chip text-night-200">{t('English only for now')}</span>}
                      {record && <span className="chip !bg-emerald-400/15 text-emerald-200">{t('Owned')}</span>}
                    </div>
                  </div>
                  <p className="text-sm text-night-100">{t(pack.description)}</p>
                  <p className="mt-1 text-xs text-night-200">
                    {t('{n} questions, including {f} for the Final Challenge', { n: pack.questionCount, f: pack.finalChallengeCount })}
                  </p>
                </div>
                {record ? (
                  inLibrary ? (
                    <Button variant="ghost" icon={BookOpen} onClick={() => navigate('/questions')}>
                      {t('In your questions')}
                    </Button>
                  ) : (
                    <Button variant="gold" icon={busy === pack.id ? Loader2 : Download} disabled={busy !== null} onClick={() => void reinstall(pack.id)}>
                      {t('Add to my questions')}
                    </Button>
                  )
                ) : (
                  <BuyButton entitlement={pack.id} size="md" />
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {purchases.length > 0 && (
        <section className="panel mt-8" aria-labelledby="owned-title">
          <h2 id="owned-title" className="panel-title">
            {t('Activated on this device')}
          </h2>
          <ul className="divide-y divide-white/10">
            {purchases.map((purchase) => (
              <li key={purchase.token} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-cream">{purchase.name}</p>
                  <p className="text-xs text-night-200">
                    Key ending in {purchase.keyHint || '????'} · activated {dateFormat.format(new Date(purchase.activatedAt))}
                  </p>
                </div>
                <Button size="sm" variant="subtle" icon={busy === purchase.token ? Loader2 : Trash2} disabled={busy !== null} onClick={() => void remove(purchase)}>
                  {t('Remove from this device')}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-xs text-night-200">
        {t('7-day refunds on every purchase.')}{' '}
        <button type="button" className="font-bold underline underline-offset-2" onClick={() => navigate('/legal')}>
          {t('Support, refunds, terms and privacy')}
        </button>
        {'. '}
        {t('Payments are processed by Lemon Squeezy, which handles checkout, receipts and sales tax. Activating a key sends the key and a short device name (like “Chrome on Windows”) to check the purchase. Your questions, scores and history never leave this device.')}
      </p>
    </div>
  );
}
