import type { ReactNode } from 'react';
import { BookOpen, Check, KeyRound, MonitorPlay, Play, Smartphone, Sparkles, Trophy, Users, WifiOff } from 'lucide-react';
import { PACK_CATALOG } from '../commerce/catalog';
import { navigate } from '../lib/router';
import { BuyButton } from '../components/BuyButton';
import { Button } from '../../../core/components/ui/Button';
import { Wordmark } from '../components/game/Wordmark';
import { REFUND_DAYS, SUPPORT_EMAIL } from './LegalScreen';
import { LOST_KEY_URL } from '../components/LicenseKeyForm';
import { SavingsNote } from '../components/SavingsNote';
import { PromoBanner } from '../components/PromoBanner';
import { interpolate, t, useLang } from '../../../core/i18n/i18n';
import { LANDING_COPY } from './landingCopy';
import { TESTIMONIALS } from '../content/testimonials';
import { Gift, Download, Quote } from 'lucide-react';

const TOTAL_PACK_QUESTIONS = PACK_CATALOG.reduce((n, p) => n + p.questionCount, 0);

function Shot({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`block h-auto w-full ${className}`} />;
}

function PhoneShot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mx-auto w-[min(62vw,15rem)] rounded-[2.2rem] bg-night-950 p-2 shadow-2xl ring-4 ring-night-700">
      <Shot src={src} alt={alt} className="rounded-[1.7rem]" />
    </div>
  );
}

function TrailerVideo({ label }: { label: string }) {
  // Each language has its own recording (Spanish questions and captions for Español).
  const suffix = useLang() === 'es' ? '-es' : '';
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return (
    <video
      className="block aspect-video w-full rounded-xl bg-night-950"
      key={suffix}
      poster={`./landing/trailer-poster${suffix}.jpg`}
      aria-label={label}
      muted
      loop
      playsInline
      preload="metadata"
      autoPlay={!reduced}
      controls={reduced}
    >
      <source src={`./landing/trailer${suffix}.webm`} type="video/webm" />
      <source src={`./landing/trailer${suffix}.mp4`} type="video/mp4" />
    </video>
  );
}

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl bg-night-950/40 ring-1 ring-inset ring-white/10 open:bg-night-950/60">
      <summary className="cursor-pointer list-none px-5 py-4 font-display text-lg font-semibold text-cream marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-4">
          {q}
          <span aria-hidden className="text-gold-300 transition-transform group-open:rotate-45">
            +
          </span>
        </span>
      </summary>
      <div className="px-5 pb-5 text-night-100">{children}</div>
    </details>
  );
}

/** The front page for people who haven't bought yet: what it is, how it works, what it costs. */
export function LandingScreen() {
  const lang = useLang();
  const c = LANDING_COPY[lang];
  const f = (text: string) => interpolate(text, { days: REFUND_DAYS, n: PACK_CATALOG.length, q: TOTAL_PACK_QUESTIONS, email: SUPPORT_EMAIL });
  return (
    <div className="overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-5 pt-5">
        <PromoBanner />
      </div>

      {/* Hero: the game on a TV, framed like the board itself */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:pt-16">
        <div className="text-center lg:text-left">
          <div className="pop-in">
            <Wordmark size="md" />
          </div>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight sm:text-5xl">{c.headline}</h1>
          <p className="mt-4 max-w-xl text-lg text-night-100 lg:max-w-none">
            {c.lede}
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button variant="gold" size="xl" icon={Play} onClick={() => navigate('/new')}>
              {c.tryFree}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              {c.seePricing}
            </Button>
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-bold text-night-200 lg:justify-start">
            {c.badges.map((b) => (
              <li key={b} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-300" aria-hidden />
                {f(b)}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="marquee rotate-[-1.5deg] !p-2 sm:!p-3">
            <Shot src="./landing/tv-board.jpg" alt={c.heroAlt} className="rounded-xl" />
          </div>
          <div className="absolute -bottom-10 -right-2 hidden w-32 rotate-3 sm:block lg:-right-6 lg:w-40">
            <div className="rounded-[1.6rem] bg-night-950 p-1.5 shadow-2xl ring-4 ring-night-700">
              <Shot src="./landing/phone-buzzer.jpg" alt={c.buzzerAlt} className="rounded-[1.2rem]" />
            </div>
          </div>
        </div>
      </section>

      {/* Real gameplay, recorded from the game itself. Muted and looping; paused for reduced motion. */}
      <section className="mx-auto max-w-5xl px-5 py-10" aria-labelledby="video-title">
        <h2 id="video-title" className="text-center text-3xl font-semibold">
          {c.videoTitle}
        </h2>
        <div className="marquee mt-6 !p-2 sm:!p-3">
          <TrailerVideo label={c.videoLabel} />
        </div>
      </section>

      {/* How it works: a real sequence, so it's numbered */}
      <section className="mx-auto max-w-6xl px-5 py-12" aria-labelledby="how-title">
        <h2 id="how-title" className="text-center text-3xl font-semibold">
          {c.howTitle}
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[MonitorPlay, Smartphone, Trophy].map((Icon, i) => {
            const [title, text] = c.steps[i];
            const I = Icon as typeof MonitorPlay;
            return (
              <li key={title as string} className="panel flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-300 font-display text-xl font-bold text-ink" aria-hidden>
                  {i + 1}
                </span>
                <div>
                  <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-cream">
                    <I className="h-5 w-5 text-gold-300" aria-hidden />
                    {title as string}
                  </h3>
                  <p className="mt-1 text-night-100">{text as string}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Two showcase rows */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2" aria-labelledby="phones-title">
        <div className="flex items-end justify-center gap-4">
          <PhoneShot src="./landing/phone-host.jpg" alt={c.hostAlt} />
          <div className="hidden sm:block">
            <PhoneShot src="./landing/phone-buzzer.jpg" alt={c.buzzerAlt} />
          </div>
        </div>
        <div>
          <h2 id="phones-title" className="text-3xl font-semibold">
            {c.phonesTitle}
          </h2>
          <p className="mt-3 text-lg text-night-100">
            {c.phonesBody}
          </p>
          <ul className="mt-4 space-y-2 text-night-100">
            {c.phonesPoints.map((p) => (
              <li key={p} className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2" aria-labelledby="fc-title">
        <div className="md:order-2">
          <div className="marquee rotate-[1.2deg] !p-2 sm:!p-3">
            <Shot src="./landing/tv-final-challenge.jpg" alt={c.fcAlt} className="rounded-xl" />
          </div>
        </div>
        <div className="md:order-1">
          <h2 id="fc-title" className="text-3xl font-semibold">
            {c.fcTitle}
          </h2>
          <p className="mt-3 text-lg text-night-100">
            {c.fcBody}
          </p>
        </div>
      </section>

      {TESTIMONIALS.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-12" aria-labelledby="testimonials-title">
          <h2 id="testimonials-title" className="text-center text-3xl font-semibold">
            {c.testimonialsTitle}
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <li key={item.name + item.quote.en} className="panel flex flex-col gap-3">
                <Quote className="h-6 w-6 text-gold-300" aria-hidden />
                <blockquote className="flex-1 text-lg text-cream">“{(lang === 'es' && item.quote.es) || item.quote.en}”</blockquote>
                <p className="text-sm font-bold text-night-200">
                  {item.name}
                  {item.place ? ` · ${item.place}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Question packs */}
      <section className="mx-auto max-w-6xl px-5 py-12" aria-labelledby="packs-title">
        <div className="panel">
          <div className="flex flex-wrap items-center gap-3">
            <BookOpen className="h-7 w-7 text-gold-300" aria-hidden />
            <h2 id="packs-title" className="text-3xl font-semibold">
              {f(c.packsTitle)}
            </h2>
          </div>
          <p className="mt-2 text-night-100">
            {f(c.packsBody)}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[...PACK_CATALOG.filter((p) => p.beginner), ...PACK_CATALOG.filter((p) => !p.beginner)].map((p) => (
              <li key={p.id} className={`chip !px-3 !py-1.5 !text-sm ${p.beginner ? '!bg-sky-400/15 text-sky-100' : 'text-night-100'}`}>
                {t(p.name)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12" aria-labelledby="pricing-title">
        <h2 id="pricing-title" className="text-center text-3xl font-semibold">
          {c.pricingTitle}
        </h2>
        <p className="mt-2 text-center text-night-200">{f(c.pricingSub)}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="panel flex flex-col gap-4">
            <div>
              <h3 className="font-display text-2xl font-semibold text-cream">{c.gameTitle}</h3>
              <p className="text-sm text-night-200">{c.gameSub}</p>
            </div>
            <ul className="flex-1 space-y-1.5 text-night-100">
              {c.gamePoints.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <BuyButton entitlement="game" block />
          </div>
          <div className="panel relative flex flex-col gap-4 ring-2 ring-gold-300">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-300 px-3 py-1 font-display text-sm font-bold text-ink">{c.bestValue}</span>
            <div>
              <h3 className="flex items-center gap-2 font-display text-2xl font-semibold text-cream">
                <Sparkles className="h-5 w-5 text-gold-300" aria-hidden /> {c.completeTitle}
              </h3>
              <p className="text-sm text-night-200">{c.completeSub}</p>
            </div>
            <ul className="flex-1 space-y-1.5 text-night-100">
              {c.completePoints.map((p) => (
                <li key={p}>{f(p)}</li>
              ))}
            </ul>
            <SavingsNote bundle="complete" />
            <BuyButton entitlement="complete" block />
          </div>
          <div className="panel flex flex-col gap-4">
            <div>
              <h3 className="font-display text-2xl font-semibold text-cream">{c.megaTitle}</h3>
              <p className="text-sm text-night-200">{c.megaSub}</p>
            </div>
            <ul className="flex-1 space-y-1.5 text-night-100">
              {c.megaPoints.map((p) => (
                <li key={p}>{f(p)}</li>
              ))}
            </ul>
            <SavingsNote bundle="mega-pack" />
            <BuyButton entitlement="mega-pack" block variant="primary" />
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-night-200">{c.bundleNote}</p>
        <p className="mt-2 text-center text-sm text-night-200">
          {c.alreadyBought}{' '}
          <button type="button" className="font-bold text-gold-200 underline underline-offset-2" onClick={() => navigate('/store')}>
            {c.enterKey}
          </button>
          .
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" aria-label={c.giftTitle}>
        <div className="panel flex flex-col gap-3 ring-2 ring-gold-300/60">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Gift className="h-6 w-6 text-gold-300" aria-hidden /> {c.giftTitle}
          </h2>
          <p className="flex-1 text-night-100">{c.giftBody}</p>
          <div>
            <Button variant="gold" icon={Gift} onClick={() => navigate('/gift')}>
              {c.giftCta}
            </Button>
          </div>
        </div>
        <div className="panel flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Download className="h-6 w-6 text-gold-300" aria-hidden /> {c.freeTitle}
          </h2>
          <p className="flex-1 text-night-100">{c.freeBody}</p>
          <div>
            <Button variant="ghost" icon={Download} onClick={() => navigate('/free-printable')}>
              {c.freeCta}
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-12" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-center text-3xl font-semibold">
          {c.faqTitle}
        </h2>
        <div className="mt-6 space-y-3">
          {c.faq.slice(0, 6).map(([q, answer]) => (
            <Faq key={q} q={q}>
              {f(answer)}
            </Faq>
          ))}
          <Faq q={c.lostKeyQ}>
            {c.lostKeyA[0]}{' '}
            <a className="font-bold text-gold-200 underline underline-offset-2" href={LOST_KEY_URL} target="_blank" rel="noopener noreferrer">
              {c.lostKeyA[1]}
            </a>{' '}
            {f(c.lostKeyA[2])}
          </Faq>
          {c.faq.slice(6).map(([q, answer]) => (
            <Faq key={q} q={q}>
              {f(answer)}
            </Faq>
          ))}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-4xl px-5 pb-16 pt-6 text-center">
        <div className="panel space-y-4 py-10">
          <Users className="mx-auto h-10 w-10 text-gold-300" aria-hidden />
          <h2 className="text-3xl font-semibold">{c.closingTitle}</h2>
          <p className="text-night-100">{c.closingSub}</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="gold" size="xl" icon={Play} onClick={() => navigate('/new')}>
              {c.tryFree}
            </Button>
            <Button variant="ghost" size="lg" icon={KeyRound} onClick={() => navigate('/store')}>
              {c.haveKey}
            </Button>
          </div>
          <p className="flex items-center justify-center gap-2 text-sm text-night-200">
            <WifiOff className="h-4 w-4" aria-hidden /> {c.offlineNote}
          </p>
        </div>
      </section>
    </div>
  );
}
