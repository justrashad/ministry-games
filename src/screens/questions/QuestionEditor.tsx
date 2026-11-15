import { msg, t } from '../../i18n/i18n';
import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Info, Plus, Trash2 } from 'lucide-react';
import type { Question, QuestionKind } from '../../types';
import { LIMITS } from '../../engine/defaults';
import { questionKind } from '../../engine/questionPicker';
import { validateQuestion } from '../../engine/validation';
import { uid } from '../../lib/ids';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface AnswerDraft {
  id: string;
  text: string;
  points: string;
}
interface AltDraft {
  key: string;
  text: string;
  answerId: string;
}

interface Props {
  initial: Question | null;
  categories: string[];
  defaultKind: QuestionKind;
  onSave: (q: Question) => void;
  onClose: () => void;
}

function toDraft(q: Question | null, kind: QuestionKind) {
  const answers: AnswerDraft[] = q
    ? q.answers.map((a) => ({ id: a.id, text: a.text, points: String(a.points) }))
    : Array.from({ length: kind === 'finalChallenge' ? 5 : 6 }, () => ({ id: uid('a'), text: '', points: '' }));
  const alts: AltDraft[] = (q?.alternateAnswers ?? []).map((a) => ({ key: uid('alt'), text: a.acceptedAnswer, answerId: a.matchesAnswerId }));
  return {
    id: q?.id ?? uid('q'),
    question: q?.question ?? '',
    category: q?.category ?? '',
    notes: q?.notes ?? '',
    kind: q ? questionKind(q) : kind,
    multiplier: q?.multiplier ? String(q.multiplier) : '',
    timeLimit: q?.timeLimit ? String(q.timeLimit) : '',
    answers,
    alts,
  };
}

const KIND_OPTIONS: { value: QuestionKind; label: string; help: string }[] = [
  { value: 'round', label: msg('Round question'), help: msg('Played in the main rounds.') },
  { value: 'finalRound', label: msg('Final round'), help: msg('Saved for the big-point final round.') },
  { value: 'finalChallenge', label: msg('Use for Final Challenge'), help: msg('Used in the two-player speed round after the game.') },
];

export function QuestionEditor({ initial, categories, defaultKind, onSave, onClose }: Props) {
  const [draft, setDraft] = useState(() => toDraft(initial, defaultKind));
  const [errors, setErrors] = useState<string[]>([]);
  const total = useMemo(() => draft.answers.reduce((sum, a) => sum + (Number(a.points) || 0), 0), [draft.answers]);

  const patch = (p: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...p }));
  const patchAnswer = (index: number, p: Partial<AnswerDraft>) => patch({ answers: draft.answers.map((a, i) => (i === index ? { ...a, ...p } : a)) });
  const moveAnswer = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= draft.answers.length) return;
    const answers = [...draft.answers];
    [answers[index], answers[target]] = [answers[target], answers[index]];
    patch({ answers });
  };
  const removeAnswer = (index: number) => {
    const removed = draft.answers[index];
    patch({ answers: draft.answers.filter((_, i) => i !== index), alts: draft.alts.filter((a) => a.answerId !== removed.id) });
  };
  const sortByPoints = () => patch({ answers: [...draft.answers].sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0)) });

  const build = (): Question => {
    const q: Question = {
      id: draft.id,
      category: draft.category.trim().slice(0, 40) || 'General',
      question: draft.question.trim(),
      answers: draft.answers.map((a) => ({ id: a.id, text: a.text.trim(), points: a.points.trim() === '' ? Number.NaN : Number(a.points) })),
    };
    if (draft.kind === 'finalRound') q.isFinalRound = true;
    if (draft.kind === 'finalChallenge') q.isFinalChallenge = true;
    if (draft.multiplier.trim()) q.multiplier = Number(draft.multiplier);
    if (draft.timeLimit.trim()) {
      const t = Math.round(Number(draft.timeLimit));
      if (Number.isFinite(t)) q.timeLimit = Math.min(LIMITS.timerSeconds.max, Math.max(LIMITS.timerSeconds.min, t));
    }
    if (draft.notes.trim()) q.notes = draft.notes.trim().slice(0, 500);
    const alts = draft.alts.filter((a) => a.text.trim());
    if (alts.length) q.alternateAnswers = alts.map((a) => ({ acceptedAnswer: a.text.trim().slice(0, LIMITS.answerText), matchesAnswerId: a.answerId }));
    return q;
  };

  const save = () => {
    const q = build();
    const problems = validateQuestion(q, t);
    if (draft.kind === 'finalChallenge' && q.answers.length < 2) problems.push(t('Final Challenge questions need at least two answers.'));
    setErrors(problems);
    if (problems.length === 0) onSave(q);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? t('Edit question') : t('New question')}
      width={760}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button variant="gold" onClick={save}>
            {t('Save question')}
          </Button>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        noValidate
      >
        {errors.length > 0 && (
          <div role="alert" className="rounded-xl bg-rose-950/70 p-3 text-sm text-rose-100 ring-1 ring-rose-400/40">
            <p className="font-bold">{t('Fix these to save:')}</p>
            <ul className="ml-4 list-disc">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <fieldset>
          <legend className="field-label">{t('Where is this question used?')}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {KIND_OPTIONS.map((o) => (
              <label key={o.value} className={`cursor-pointer rounded-xl p-3 ring-1 ring-inset ${draft.kind === o.value ? 'bg-gold-300/15 ring-gold-300' : 'ring-white/15'}`}>
                <input type="radio" name="kind" className="sr-only" checked={draft.kind === o.value} onChange={() => patch({ kind: o.value })} />
                <span className="block font-bold text-cream">{o.label}</span>
                <span className="text-xs text-night-200">{o.help}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="q-text" className="field-label">
            {t('Question')}
          </label>
          <textarea
            id="q-text"
            className="input min-h-[80px] resize-y"
            value={draft.question}
            maxLength={LIMITS.questionText}
            placeholder={t('Name something a family might do together after dinner.')}
            onChange={(e) => patch({ question: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="q-category" className="field-label">
              {t('Category')}
            </label>
            <input id="q-category" className="input" list="category-options" value={draft.category} maxLength={40} placeholder={t('Family Worship')} onChange={(e) => patch({ category: e.target.value })} />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          {draft.kind !== 'finalChallenge' && (
            <div>
              <label htmlFor="q-mult" className="field-label">
                Multiplier (optional)
              </label>
              <input
                id="q-mult"
                className="input"
                type="number"
                inputMode="numeric"
                min={LIMITS.multiplier.min}
                max={LIMITS.multiplier.max}
                placeholder={t("Use round's")}
                value={draft.multiplier}
                onChange={(e) => patch({ multiplier: e.target.value })}
              />
            </div>
          )}
          {draft.kind === 'round' && (
            <div>
              <label htmlFor="q-time" className="field-label">
                {t('Time limit (optional)')}
              </label>
              <input
                id="q-time"
                className="input"
                type="number"
                inputMode="numeric"
                min={LIMITS.timerSeconds.min}
                max={LIMITS.timerSeconds.max}
                placeholder={t('Seconds')}
                value={draft.timeLimit}
                onChange={(e) => patch({ timeLimit: e.target.value })}
              />
            </div>
          )}
        </div>

        <fieldset>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <legend className="field-label !mb-0">{t('Answers, most popular first')}</legend>
            <div className="flex items-center gap-2">
              <span className="text-sm text-night-200">{t('Total {n}', { n: total })}</span>
              <Button size="sm" variant="subtle" icon={ArrowUpDown} onClick={sortByPoints}>
                {t('Sort by points')}
              </Button>
            </div>
          </div>
          <p className="mb-3 flex items-start gap-2 rounded-xl bg-night-950/50 p-3 text-xs text-night-100">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />
            {t('These point values are game values created for this question set. They are not real survey statistics.')}
          </p>
          <ol className="space-y-2">
            {draft.answers.map((a, i) => (
              <li key={a.id} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-center font-display font-bold text-gold-300" aria-hidden>
                  {i + 1}
                </span>
                <input
                  className="input min-w-0 flex-1"
                  aria-label={t('Answer {n} text', { n: i + 1 })}
                  value={a.text}
                  maxLength={LIMITS.answerText}
                  onChange={(e) => patchAnswer(i, { text: e.target.value })}
                  aria-invalid={errors.length > 0 && !a.text.trim()}
                />
                <input
                  className="input !w-20 shrink-0 text-center"
                  aria-label={t('Answer {n} points', { n: i + 1 })}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={LIMITS.maxPoints}
                  placeholder={t('pts')}
                  value={a.points}
                  onChange={(e) => patchAnswer(i, { points: e.target.value })}
                  aria-invalid={errors.length > 0 && !Number.isFinite(Number(a.points === '' ? Number.NaN : a.points))}
                />
                <div className="flex shrink-0">
                  <Button size="sm" variant="subtle" icon={ArrowUp} disabled={i === 0} onClick={() => moveAnswer(i, -1)} aria-label={t('Move answer {n} up', { n: i + 1 })} />
                  <Button size="sm" variant="subtle" icon={ArrowDown} disabled={i === draft.answers.length - 1} onClick={() => moveAnswer(i, 1)} aria-label={t('Move answer {n} down', { n: i + 1 })} />
                  <Button size="sm" variant="subtle" icon={Trash2} onClick={() => removeAnswer(i)} aria-label={t('Remove answer {n}', { n: i + 1 })} />
                </div>
              </li>
            ))}
          </ol>
          <Button className="mt-2" size="sm" variant="ghost" icon={Plus} disabled={draft.answers.length >= 12} onClick={() => patch({ answers: [...draft.answers, { id: uid('a'), text: '', points: '' }] })}>
            {t('Add answer')}
          </Button>
        </fieldset>

        {draft.kind === 'finalChallenge' && (
          <fieldset>
            <legend className="field-label">{t('Alternate acceptable answers')}</legend>
            <p className="field-help mb-2">{t('Other ways players might say an answer. These match automatically; you can always change a match during review.')}</p>
            <ul className="space-y-2">
              {draft.alts.map((alt, i) => (
                <li key={alt.key} className="flex flex-wrap items-center gap-2">
                  <input
                    className="input min-w-[10rem] flex-1"
                    aria-label={t('Alternate answer {n}', { n: i + 1 })}
                    placeholder={t('e.g. Go for a stroll')}
                    value={alt.text}
                    maxLength={LIMITS.answerText}
                    onChange={(e) => patch({ alts: draft.alts.map((x) => (x.key === alt.key ? { ...x, text: e.target.value } : x)) })}
                  />
                  <select
                    className="input !w-auto min-w-[10rem]"
                    aria-label={t('Answer that alternate {n} counts as', { n: i + 1 })}
                    value={alt.answerId}
                    onChange={(e) => patch({ alts: draft.alts.map((x) => (x.key === alt.key ? { ...x, answerId: e.target.value } : x)) })}
                  >
                    {draft.answers.map((a, j) => (
                      <option key={a.id} value={a.id}>
                        counts as #{j + 1} {a.text || '(blank)'}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" variant="subtle" icon={Trash2} aria-label={t('Remove alternate {n}', { n: i + 1 })} onClick={() => patch({ alts: draft.alts.filter((x) => x.key !== alt.key) })} />
                </li>
              ))}
            </ul>
            <Button
              className="mt-2"
              size="sm"
              variant="ghost"
              icon={Plus}
              disabled={draft.answers.length === 0}
              onClick={() => patch({ alts: [...draft.alts, { key: uid('alt'), text: '', answerId: draft.answers[0]?.id ?? '' }] })}
            >
              {t('Add alternate answer')}
            </Button>
          </fieldset>
        )}

        <div>
          <label htmlFor="q-notes" className="field-label">
            {t('Host notes (optional)')}
          </label>
          <textarea id="q-notes" className="input min-h-[64px] resize-y" maxLength={500} placeholder={t('A scripture reference or a tip for the host')} value={draft.notes} onChange={(e) => patch({ notes: e.target.value })} />
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
