import { t } from '../i18n/i18n';
import { useEffect } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import type { Question } from '../types';
import { questionKind } from '../engine/questionPicker';
import { getHashParam, navigate } from '../lib/router';
import { useLibrary } from '../state/libraryStore';
import { useGameUnlocked } from '../commerce/licenseStore';

const GROUPS: { kind: ReturnType<typeof questionKind>; title: string }[] = [
  { kind: 'round', title: t('Round questions') },
  { kind: 'finalRound', title: t('Final round') },
  { kind: 'finalChallenge', title: t('Final Challenge') },
];

/** Printer-friendly host cards. Use the browser's print dialog to print or save as PDF. */
export function PrintScreen() {
  const { sets } = useLibrary();
  const unlocked = useGameUnlocked();
  const set = sets.find((s) => s.id === getHashParam('set')) ?? sets[0];

  useEffect(() => {
    document.title = set ? t('{name} host cards', { name: set.name }) : t('Host cards');
    document.body.classList.add('print-page');
    return () => document.body.classList.remove('print-page');
  }, [set]);

  if (!unlocked) {
    return (
      <main className="p-8">
        <p>{t('Host cards come with the full game.')}</p>
        <button type="button" className="btn btn-gold btn-md mt-4" onClick={() => navigate('/store')}>
          {t('Go to the store')}
        </button>
      </main>
    );
  }

  if (!set) {
    return (
      <main className="p-8">
        <p>{t('No question set to print.')}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#1b1446]">
      <div className="no-print sticky top-0 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white/95 px-4 py-3">
        <button type="button" className="btn btn-sm bg-slate-100 text-slate-800" onClick={() => navigate('/questions')}>
          <ArrowLeft className="btn-icon" aria-hidden />
          <span>{t('Back')}</span>
        </button>
        <button type="button" className="btn btn-gold btn-sm" onClick={() => window.print()}>
          <Printer className="btn-icon" aria-hidden />
          <span>{t('Print or save as PDF')}</span>
        </button>
        <p className="text-sm text-slate-600">{t('Tip: choose “Save as PDF” as the printer to keep a copy.')}</p>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-8 print:max-w-none print:p-0">
        <header className="mb-6 border-b-2 border-[#1b1446] pb-3">
          <h1 className="font-display text-3xl font-semibold !text-[#1b1446]">{set.name}</h1>
          <p className="text-sm text-slate-600">{t('Host cards · Keep these face down. Point values are game values, not survey statistics.')}</p>
        </header>
        {GROUPS.map(({ kind, title }) => {
          const questions = set.questions.filter((q) => questionKind(q) === kind);
          if (questions.length === 0) return null;
          return (
            <section key={kind} className="mb-8">
              <h2 className="mb-3 font-display text-xl font-semibold !text-[#1b1446]">{title}</h2>
              <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
                {questions.map((q, i) => (
                  <HostCard key={q.id} q={q} n={i + 1} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

function HostCard({ q, n }: { q: Question; n: number }) {
  return (
    <article className="break-inside-avoid rounded-xl border border-slate-300 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {n}. {q.category}
        {q.multiplier ? ` · ${q.multiplier}×` : ''}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold leading-snug !text-[#1b1446]">{q.question}</h3>
      <ol className="mt-2 space-y-0.5 text-sm">
        {q.answers.map((a, i) => (
          <li key={a.id} className="flex justify-between gap-3 border-b border-dotted border-slate-200 py-0.5">
            <span>
              <b>{i + 1}.</b> {a.text}
            </span>
            <span className="font-bold tabular-nums">{a.points}</span>
          </li>
        ))}
      </ol>
      {q.alternateAnswers && q.alternateAnswers.length > 0 && (
        <p className="mt-2 text-xs text-slate-600">{t('Also accept: {list}', { list: q.alternateAnswers.map((alt) => alt.acceptedAnswer).join(', ') })}</p>
      )}
      {q.notes && <p className="mt-2 text-xs italic text-slate-600">{q.notes}</p>}
    </article>
  );
}
