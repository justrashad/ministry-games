import { t } from '../../../core/i18n/i18n';
import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import type { QuestionSetExport } from '../types';
import { questionKind } from '../engine/questionPicker';
import { decodeSetPayload } from '../lib/shareLink';
import { getHashParam, navigate } from '../lib/router';
import { importSet } from '../state/libraryStore';
import { Button } from '../../../core/components/ui/Button';
import { useGameUnlocked } from '../commerce/licenseStore';
import { Paywall } from '../components/Paywall';
import { useToast } from '../../../core/components/ui/Toast';

type Status = { kind: 'loading' } | { kind: 'error'; error: string; details: string[] } | { kind: 'ready'; data: QuestionSetExport; warnings: string[] };

/** Opens a question set shared as a link and lets the family add it to their library. */
export function ImportLinkScreen() {
  const toast = useToast();
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const unlocked = useGameUnlocked();

  useEffect(() => {
    let alive = true;
    const payload = getHashParam('d') ?? '';
    decodeSetPayload(payload).then((result) => {
      if (!alive) return;
      setStatus(result.ok ? { kind: 'ready', data: result.data, warnings: result.warnings } : { kind: 'error', error: result.error, details: result.details });
    });
    return () => {
      alive = false;
    };
  }, []);

  const counts = useMemo(() => {
    const c = { round: 0, finalRound: 0, finalChallenge: 0 };
    if (status.kind === 'ready') status.data.questions.forEach((q) => (c[questionKind(q)] += 1));
    return c;
  }, [status]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold">{t('Shared question set')}</h1>
      {status.kind === 'loading' && (
        <p className="mt-6 flex items-center gap-2 text-night-100">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {t('Opening the link…')}
        </p>
      )}
      {status.kind === 'error' && (
        <div className="panel mt-6" role="alert">
          <p className="text-cream">{status.error}</p>
          {status.details.length > 0 && (
            <ul className="ml-4 mt-2 list-disc text-sm text-night-200">
              {status.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          <Button className="mt-4" variant="ghost" onClick={() => navigate('/questions')}>
            {t('Go to my questions')}
          </Button>
        </div>
      )}
      {status.kind === 'ready' && (
        <div className="panel mt-6 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">{status.data.name}</h2>
            {status.data.description && <p className="text-night-200">{status.data.description}</p>}
            <p className="mt-2 text-sm text-night-100">
              {t('{n} questions: {r} round, {f} final round, {c} Final Challenge.', { n: status.data.questions.length, r: counts.round, f: counts.finalRound, c: counts.finalChallenge })}
            </p>
          </div>
          <ol className="max-h-72 space-y-1 overflow-y-auto rounded-xl bg-night-950/40 p-3 text-sm">
            {status.data.questions.map((q, i) => (
              <li key={q.id} className="text-night-100">
                <b className="text-gold-300">{i + 1}.</b> {q.question}
              </li>
            ))}
          </ol>
          {!unlocked ? (
            <Paywall title={t('Unlock Ministry Showdown to add this set')} message={t("Shared question sets play in the full game. Unlock it and this page will let you add the set right away.")} />
          ) : (
          <>
          <p className="text-xs text-night-200">{t('Adding it saves a copy in this browser only. You can edit it afterward.')}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="gold"
              size="lg"
              icon={Download}
              onClick={() => {
                const created = importSet(status.data);
                toast.show(t('Added “{name}” to your questions', { name: created.name }));
                navigate('/questions');
              }}
            >
              {t('Add to my questions')}
            </Button>
            <Button variant="ghost" size="lg" icon={X} onClick={() => navigate('/')}>
              {t('No thanks')}
            </Button>
          </div>
          </>
          )}
        </div>
      )}
    </div>
  );
}
