import type { ReactNode } from 'react';
import { Mail } from 'lucide-react';
import { useLang } from '../../../core/i18n/i18n';
import { LegalScreenEs } from './LegalScreenEs';

export const SUPPORT_EMAIL = 'rashad@justrashad.com';
export const REFUND_DAYS = 7;
export const UPDATED = 'September 25, 2026';

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="panel scroll-mt-20 space-y-3 text-night-100 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-cream">
      <h2 id={`${id}-title`} className="text-2xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export const mail = (
  <a className="font-bold text-gold-200 underline underline-offset-2" href={`mailto:${SUPPORT_EMAIL}`}>
    {SUPPORT_EMAIL}
  </a>
);

/** Support, terms of sale, refunds and privacy, written in plain language. */
export function LegalScreen() {
  if (useLang() === 'es') return <LegalScreenEs />;
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 pb-24 pt-6 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold">Support, terms and privacy</h1>
        <p className="mt-1 text-sm text-night-200">Last updated {UPDATED}</p>
        <nav aria-label="On this page" className="mt-3 flex flex-wrap gap-2 text-sm">
          {[
            ['support', 'Support'],
            ['refunds', 'Refunds'],
            ['terms', 'Terms of sale'],
            ['privacy', 'Privacy'],
            ['affiliation', 'Affiliation'],
          ].map(([id, label]) => (
            <a key={id} href={`#/legal`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }} className="chip hover:bg-white/15">
              {label}
            </a>
          ))}
        </nav>
      </div>

      <Section id="support" title="Support">
        <p>Questions, a key that won&apos;t activate, or anything else: email {mail}. We usually reply within two business days.</p>
        <p>To help us help you quickly, include the email address you used at checkout and, if possible, the last few characters of your license key. Please never send your full card details.</p>
        <a className="btn btn-gold btn-md" href={`mailto:${SUPPORT_EMAIL}?subject=Ministry%20Showdown%20support`}>
          <Mail className="btn-icon" aria-hidden />
          <span>Email support</span>
        </a>
      </Section>

      <Section id="refunds" title="Refund policy">
        <p>
          If Ministry Showdown or a question pack isn&apos;t right for your family, email {mail} within <strong>{REFUND_DAYS} days of purchase</strong> for a full refund. No
          complicated questions; just tell us the email address you used at checkout.
        </p>
        <ul className="space-y-1">
          <li>Refunds go back to the original payment method through our payment provider, Lemon Squeezy. Your bank may take a few days to show it.</li>
          <li>When an order is refunded, its license key stops working, and the game or pack it unlocked will lock again on your devices.</li>
          <li>After {REFUND_DAYS} days we can&apos;t offer refunds, but we&apos;ll always try to fix a problem. Please try the free demo before buying.</li>
          <li>If you were charged twice or a key never arrived, contact us any time and we&apos;ll put it right.</li>
        </ul>
      </Section>

      <Section id="terms" title="Terms of sale">
        <ul className="space-y-1">
          <li>
            <strong>Who you&apos;re buying from.</strong> Ministry Showdown is created by Rashad Washington. Orders are processed by Lemon Squeezy, which acts as the
            merchant of record: it handles payment, receipts and sales tax, and its terms also apply to your purchase.
          </li>
          <li>
            <strong>What you get.</strong> A one-time purchase of a personal license for your household. There are no subscriptions. The full game unlocks the app
            and the starter set; each question pack unlocks that pack; the Mega Pack and Complete Edition include every pack available on the day you buy; packs released later are sold separately.
          </li>
          <li>
            <strong>Devices.</strong> Each license key can be activated on a limited number of devices at a time. You can free a device from the Store screen
            (&ldquo;Remove from this device&rdquo;) to use the key elsewhere. Phones joining a game as a buzzer, player or remote don&apos;t need their own key.
          </li>
          <li>
            <strong>Please don&apos;t share keys</strong> outside your household or resell or redistribute the game or its questions. Sharing a key publicly may
            get it disabled.
          </li>
          <li>
            <strong>Your own questions</strong> belong to you. Question sets you write or share are your content.
          </li>
          <li>
            <strong>Availability.</strong> Ministry Showdown runs in your web browser and works offline once activated. We work to keep it available and may update
            it over time, but it&apos;s provided as is, without guarantees of uninterrupted service. To the extent the law allows, our responsibility for any
            problem is limited to the amount you paid.
          </li>
          <li>
            <strong>Point values</strong> in the questions are game values created for fun, not real survey statistics.
          </li>
        </ul>
      </Section>

      <Section id="privacy" title="Privacy policy">
        <p>
          <strong>The short version:</strong> your games, questions, scores and history stay on your own device. There are no ads, no tracking and no accounts.
        </p>
        <ul className="space-y-1">
          <li>
            <strong>Stored only on your device:</strong> question sets, settings, game history, team and player names, and the game in progress. They&apos;re kept
            in your browser&apos;s storage and never sent to us. Clearing your browser&apos;s site data removes them; Settings → Data can erase them too.
          </li>
          <li>
            <strong>When you buy:</strong> Lemon Squeezy collects your name, email, payment and billing details to process the order and send your license key.
            We receive your name and email with the order so we can provide support. We never see your full card number. See Lemon Squeezy&apos;s privacy policy
            for how it handles your data.
          </li>
          <li>
            <strong>When you activate a key:</strong> the app sends the key and a short device description (like &ldquo;Chrome on Windows&rdquo;) to our server,
            which checks it with Lemon Squeezy. About once a week, when you&apos;re online, the app re-checks the key the same way. Question packs you own are
            downloaded from our server at that time.
          </li>
          <li>
            <strong>Phone remote:</strong> when you connect a phone to the TV, a free connection service (PeerJS) briefly helps the two devices find each other using
            a random room code. After that, game data travels directly between your devices.
          </li>
          <li>
            <strong>Hosting:</strong> the site is hosted on Netlify, which, like any web host, may keep standard technical logs such as IP addresses for security
            and reliability.
          </li>
          <li>
            <strong>Children:</strong> the game is designed for families. It doesn&apos;t ask for or collect personal information from children. Purchases are made
            by adults through Lemon Squeezy.
          </li>
          <li>
            <strong>Your choices:</strong> to ask what purchase information we have about you, or to have it deleted, email {mail}.
          </li>
        </ul>
      </Section>

      <Section id="affiliation" title="Affiliation">
        <p>
          Ministry Showdown is an independent game designed for family worship. It is not produced by, affiliated with, or endorsed by Jehovah&apos;s Witnesses or the
          Watch Tower Bible and Tract Society. It is inspired by the general format of classic survey game shows and is not affiliated with any television program.
        </p>
      </Section>
    </div>
  );
}
