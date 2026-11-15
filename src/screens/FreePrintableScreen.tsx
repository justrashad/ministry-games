import { useEffect } from 'react';
import { Download, Printer } from 'lucide-react';
import { demoSet } from '../commerce/demo';
import { Button } from '../components/ui/Button';
import { navigate } from '../lib/router';
import { t, useLang } from '../i18n/i18n';

/**
 * A free printable: five starter questions as host cards, the same ones the free
 * demo uses. Families can play it on paper tonight; the footer points them to the
 * full game. Shareable as ministryshowdown.live/?page=free-printable.
 */
export function FreePrintableScreen() {
  const lang = useLang();
  const set = demoSet(lang);

  useEffect(() => {
    document.body.classList.add('print-isolate');
    return () => document.body.classList.remove('print-isolate');
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-24 pt-6 sm:px-6">
      <div className="no-print space-y-3">
        <h1 className="flex items-center gap-3 text-3xl font-semibold">
          <Download className="h-8 w-8 text-gold-300" aria-hidden /> {t('Free printable: 5 family worship survey questions')}
        </h1>
        <p className="text-night-100">
          {t('Print these host cards and play tonight, no screen needed. One person reads the question, two teams guess the most popular answers, and the host reveals them from the card.')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="gold" size="lg" icon={Printer} onClick={() => window.print()}>
            {t('Print or save as PDF')}
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/new')}>
            {t('Play them on your TV instead')}
          </Button>
        </div>
      </div>

      <article className="print-area rounded-3xl bg-white p-6 text-[#1b1446] shadow-2xl sm:p-8" aria-label={t('Printable host cards')}>
        <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-[#1b1446] pb-3">
          <p className="font-display text-2xl font-bold">Ministry Showdown</p>
          <p className="text-sm font-semibold">{t('Free host cards · Keep these face down')}</p>
        </header>
        <ol className="grid gap-4 sm:grid-cols-2">
          {set.questions.map((q, i) => (
            <li key={q.id} className="break-inside-avoid rounded-2xl border-2 border-[#1b1446] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8a6d1c]">
                {t('Question {n}', { n: i + 1 })} · {q.category}
              </p>
              <p className="mt-1 font-display text-lg font-bold leading-snug">{q.question}</p>
              <ol className="mt-3 space-y-1">
                {q.answers.map((a, r) => (
                  <li key={a.id} className="flex items-center gap-2 border-b border-dashed border-[#1b1446]/30 pb-1 text-sm">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1b1446] text-xs font-bold text-white">{r + 1}</span>
                    <span className="flex-1 font-semibold">{a.text}</span>
                    <span className="font-bold tabular-nums">{a.points}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
        <footer className="mt-6 rounded-2xl bg-[#1b1446] p-4 text-center text-white">
          <p className="font-display text-xl font-bold">{t('Play it on your TV, with phone buzzers and a Final Challenge')}</p>
          <p className="mt-1 text-sm">{t('Try a round free at ministryshowdown.live')}</p>
          <p className="mt-2 text-[11px] opacity-80">
            {t('Point values are game values, not survey statistics. Not affiliated with Jehovah’s Witnesses.')}
          </p>
        </footer>
      </article>
    </div>
  );
}
