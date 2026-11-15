import { useEffect, useMemo, useState } from 'react';
import { Gift, Printer } from 'lucide-react';
import { BuyButton } from '../components/BuyButton';
import { Button } from '../../../core/components/ui/Button';
import { TextField, TextArea } from '../../../core/components/ui/Fields';
import { Wordmark } from '../components/game/Wordmark';
import { t } from '../../../core/i18n/i18n';

const SITE = 'https://ministryshowdown.live';
const KEY_PATTERN = /^[A-Za-z0-9-]{8,80}$/;

/**
 * Give Ministry Showdown as a gift: buy it, then turn the emailed key into a
 * printable card with a QR code that unlocks the game on the recipient's device.
 * Everything here stays in the browser; the key is never sent anywhere from this page.
 */
export function GiftScreen() {
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [note, setNote] = useState('');
  const [key, setKey] = useState('');
  const [qr, setQr] = useState('');
  const cleanKey = key.trim();
  const keyOk = KEY_PATTERN.test(cleanKey);
  const link = useMemo(() => (keyOk ? `${SITE}/?key=${encodeURIComponent(cleanKey)}` : SITE), [cleanKey, keyOk]);

  useEffect(() => {
    document.body.classList.add('print-isolate');
    return () => document.body.classList.remove('print-isolate');
  }, []);

  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then((QR) => QR.toString(link, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1b1446', light: '#ffffff' } }))
      .then((svg) => alive && setQr(svg))
      .catch(() => alive && setQr(''));
    return () => {
      alive = false;
    };
  }, [link]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-24 pt-6 sm:px-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-semibold">
          <Gift className="h-8 w-8 text-gold-300" aria-hidden /> {t('Give it as a gift')}
        </h1>
        <p className="mt-2 max-w-3xl text-night-100">
          {t('A thoughtful gift for newlyweds, a family new to the congregation, or anyone you study with. Buy it here, then turn the key from your receipt into a card they can scan to start playing.')}
        </p>
      </div>

      <ol className="grid gap-4 md:grid-cols-3">
        <li className="panel space-y-3">
          <p className="font-display text-xl font-semibold text-cream">{t('1. Buy it')}</p>
          <p className="text-sm text-night-100">{t('The Complete Edition is the easiest gift: the game plus every pack available today, nothing else to buy.')}</p>
          <BuyButton entitlement="complete" block size="md" />
          <BuyButton entitlement="game" block size="md" variant="ghost" />
        </li>
        <li className="panel space-y-3">
          <p className="font-display text-xl font-semibold text-cream">{t('2. Copy the key')}</p>
          <p className="text-sm text-night-100">
            {t("Your receipt email has the license key. Don't activate it yourself; the key is for them. Paste it below.")}
          </p>
        </li>
        <li className="panel space-y-3">
          <p className="font-display text-xl font-semibold text-cream">{t('3. Print or send the card')}</p>
          <p className="text-sm text-night-100">{t('Print it, save it as a PDF, or just forward the email. Scanning the QR code unlocks the game on their device.')}</p>
        </li>
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form className="panel space-y-4" onSubmit={(e) => e.preventDefault()} aria-label={t('Gift card details')}>
          <TextField label={t('To')} value={to} onChange={setTo} placeholder={t('The Rivera family')} maxLength={60} />
          <TextField label={t('From')} value={from} onChange={setFrom} placeholder={t('Your name')} maxLength={60} />
          <TextArea label={t('Message (optional)')} value={note} onChange={setNote} rows={3} maxLength={220} placeholder={t('Enjoy many fun family worship nights!')} />
          <TextField
            label={t('License key from the receipt')}
            value={key}
            onChange={setKey}
            placeholder="38b1460a-5104-4067-…"
            maxLength={80}
            error={cleanKey && !keyOk ? t("That doesn't look like a license key. Copy it from your purchase email and try again.") : undefined}
          />
          <Button variant="gold" size="lg" icon={Printer} disabled={!keyOk} onClick={() => window.print()} block>
            {t('Print or save as PDF')}
          </Button>
          <p className="text-xs text-night-200">{t('The key stays on this page. Nothing you type here is sent anywhere.')}</p>
        </form>

        <div className="print-area overflow-hidden rounded-3xl bg-[#fff7e6] text-[#1b1446] shadow-2xl ring-4 ring-gold-300" aria-label={t('Gift card preview')}>
          <div className="bg-[#1b1446] px-6 py-5 text-center">
            <Wordmark size="sm" />
          </div>
          <div className="space-y-4 px-6 py-6 text-center">
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#8a6d1c]">{t('A gift for you')}</p>
            <p className="font-display text-3xl font-bold">{to.trim() || t('The Rivera family')}</p>
            {note.trim() && <p className="mx-auto max-w-sm text-lg italic">“{note.trim()}”</p>}
            <p className="text-base">{t('Family worship game night, on your TV.')}</p>
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white p-4 sm:flex-row sm:text-left">
              <div className="h-32 w-32 shrink-0" aria-hidden dangerouslySetInnerHTML={{ __html: qr }} />
              <div className="space-y-1 text-sm">
                <p className="font-bold">{t('Scan to start playing')}</p>
                <p>{t('Or go to ministryshowdown.live, open the Store, and enter this key:')}</p>
                <p className="break-all font-mono text-xs font-bold">{keyOk ? cleanKey : '••••••••-••••-••••-••••-••••••••••••'}</p>
              </div>
            </div>
            {from.trim() && <p className="font-display text-lg">{t('With love, {name}', { name: from.trim() })}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
