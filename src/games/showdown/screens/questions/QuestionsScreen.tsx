import { msg, t } from '../../../../core/i18n/i18n';
import { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Download, FilePlus2, FolderPlus, Library, Link2, Pencil, Plus, Printer, RotateCcw, Search, Share2, Trash2, Upload } from 'lucide-react';
import type { Question, QuestionKind, QuestionSet } from '../../types';
import { questionKind } from '../../engine/questionPicker';
import { MAX_IMPORT_BYTES, parseQuestionSetText, toExport } from '../../engine/validation';
import { downloadJSON, readFileText, slugify } from '../../../../core/lib/download';
import { encodeSetPayload, LINK_WARN_LENGTH, shareLinkFor } from '../../lib/shareLink';
import { navigate } from '../../lib/router';
import { useGameUnlocked } from '../../commerce/licenseStore';
import { Paywall } from '../../components/Paywall';
import {
  createSet,
  deleteQuestion,
  deleteSet,
  duplicateQuestion,
  duplicateSet,
  importSet,
  moveQuestion,
  renameSet,
  restoreSampleSet,
  upsertQuestion,
  useLibrary,
} from '../../state/libraryStore';
import { updateSettings, useSettings } from '../../state/settingsStore';
import { Button } from '../../../../core/components/ui/Button';
import { useConfirm } from '../../../../core/components/ui/Confirm';
import { Modal } from '../../../../core/components/ui/Modal';
import { Tabs } from '../../../../core/components/ui/Tabs';
import { useToast } from '../../../../core/components/ui/Toast';
import { QuestionEditor } from './QuestionEditor';

type Filter = 'all' | QuestionKind;
const KIND_LABEL: Record<QuestionKind, string> = { round: msg('Round'), finalRound: msg('Final round'), finalChallenge: msg('Final Challenge') };

export function QuestionsScreen() {
  const unlocked = useGameUnlocked();
  if (!unlocked) {
    return (
      <div className="px-4 pb-24 pt-10 sm:px-6">
        <Paywall title={t('Your question library comes with the full game')} message={t("Unlock Ministry Showdown to use the 32-question starter set, write your own questions, share sets with other families and add question packs.")} />
      </div>
    );
  }
  return <QuestionsLibrary />;
}

function QuestionsLibrary() {
  const { sets } = useLibrary();
  const settings = useSettings();
  const confirm = useConfirm();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => settings.questions.activeSetId);
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<{ question: Question | null } | null>(null);
  const [setDialog, setSetDialog] = useState<{ mode: 'create' | 'rename'; name: string; description: string } | null>(null);
  const [importError, setImportError] = useState<{ error: string; details: string[] } | null>(null);
  const [share, setShare] = useState<{ name: string; url: string } | null>(null);

  const set: QuestionSet | undefined = sets.find((s) => s.id === selectedId) ?? sets[0];
  const categories = useMemo(() => Array.from(new Set(sets.flatMap((s) => s.questions.map((q) => q.category)))).sort(), [sets]);
  const setCategories = useMemo(() => Array.from(new Set(set?.questions.map((q) => q.category) ?? [])).sort(), [set]);

  const visible = useMemo(() => {
    if (!set) return [];
    const term = search.trim().toLowerCase();
    return set.questions.filter(
      (q) =>
        (filter === 'all' || questionKind(q) === filter) &&
        (!category || q.category === category) &&
        (!term || q.question.toLowerCase().includes(term) || q.answers.some((a) => a.text.toLowerCase().includes(term))),
    );
  }, [set, filter, category, search]);

  const counts = useMemo(() => {
    const c = { all: 0, round: 0, finalRound: 0, finalChallenge: 0 };
    set?.questions.forEach((q) => {
      c.all += 1;
      c[questionKind(q)] += 1;
    });
    return c;
  }, [set]);

  const select = (id: string) => {
    setSelectedId(id);
    setCategory('');
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setImportError({ error: t('That file is too large to be a question set (over 2 MB).'), details: [] });
      return;
    }
    let text: string;
    try {
      text = await readFileText(file);
    } catch {
      setImportError({ error: "The file couldn't be read. Try choosing it again.", details: [] });
      return;
    }
    const result = parseQuestionSetText(text, t);
    if (!result.ok) {
      setImportError({ error: result.error, details: result.details });
      return;
    }
    const created = importSet(result.data);
    select(created.id);
    toast.show(`${t('Imported “{name}” with {n} questions.', { name: created.name, n: created.questions.length })}${result.warnings.length ? ` ${t('({n} fixes applied)', { n: result.warnings.length })}` : ''}`);
  };

  const saveSetDialog = () => {
    if (!setDialog || !setDialog.name.trim()) return;
    if (setDialog.mode === 'create') {
      const created = createSet(setDialog.name, setDialog.description);
      select(created.id);
      toast.show(`Created “${created.name}”`);
    } else if (set) {
      renameSet(set.id, setDialog.name, setDialog.description);
      toast.show(t('Set renamed'));
    }
    setSetDialog(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t('Questions')}</h1>
          <p className="text-night-200">{t('Build question sets for your family. Everything is saved in this browser.')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" icon={Upload} onClick={() => fileRef.current?.click()}>
            {t('Import question set')}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              void onImport(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Button variant="ghost" icon={Library} onClick={() => navigate('/store')}>
            {t('Question packs')}
          </Button>
          <Button variant="primary" icon={FolderPlus} onClick={() => setSetDialog({ mode: 'create', name: '', description: '' })}>
            {t('New set')}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="panel h-fit" aria-labelledby="sets-title">
          <h2 id="sets-title" className="panel-title">
            {t('Question sets')}
          </h2>
          {sets.length === 0 ? (
            <div className="space-y-3 text-sm text-night-100">
              <p>{t('No question sets yet.')}</p>
              <Button variant="gold" size="sm" icon={RotateCcw} onClick={() => select(restoreSampleSet().id)}>
                {t('Add the sample set')}
              </Button>
            </div>
          ) : (
            <ul className="space-y-1">
              {sets.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => select(s.id)}
                    aria-current={s.id === set?.id}
                    className={`w-full rounded-xl px-3 py-2 text-left transition-colors ${s.id === set?.id ? 'bg-gold-300 text-ink' : 'text-night-100 hover:bg-white/5'}`}
                  >
                    <span className="block truncate font-bold">{s.name}</span>
                    <span className={`text-xs ${s.id === set?.id ? 'text-ink/70' : 'text-night-200'}`}>
                      {t('{n} questions', { n: s.questions.length })}{s.packId ? ` · ${t('pack')}` : ''}{settings.questions.activeSetId === s.id ? ` · ${t('default')}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {sets.length > 0 && (
            <Button className="mt-3" variant="subtle" size="sm" icon={RotateCcw} onClick={() => select(restoreSampleSet().id)}>
              {t('Add a fresh sample set')}
            </Button>
          )}
        </aside>

        {set ? (
          <section className="min-w-0 space-y-4" aria-labelledby="set-title">
            <div className="panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id="set-title" className="truncate text-2xl font-semibold">
                    {set.name}
                  </h2>
                  {set.description && <p className="text-sm text-night-200">{set.description}</p>}
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setSetDialog({ mode: 'rename', name: set.name, description: set.description ?? '' })}>
                    {t('Rename')}
                  </Button>
                  <Button size="sm" variant="ghost" icon={Copy} onClick={() => select(duplicateSet(set.id)?.id ?? set.id)}>
                    {t('Duplicate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Download}
                    onClick={() => {
                      if (downloadJSON(`${slugify(set.name)}.ministry-showdown.json`, toExport(set))) toast.show(t('Question set exported'));
                      else toast.show(t('Export failed in this browser.'), 'error');
                    }}
                  >
                    {t('Export question set')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Share2}
                    disabled={set.questions.length === 0}
                    onClick={async () => {
                      try {
                        const payload = await encodeSetPayload(set);
                        setShare({ name: set.name, url: shareLinkFor(payload) });
                      } catch {
                        toast.show(t("Couldn't make a link for this set. Use Export instead."), 'error');
                      }
                    }}
                  >
                    {t('Share link')}
                  </Button>
                  <Button size="sm" variant="ghost" icon={Printer} disabled={set.questions.length === 0} onClick={() => navigate('/print', { set: set.id })}>
                    {t('Print host cards')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={async () => {
                      const ok = await confirm({
                        title: `Delete “${set.name}”?`,
                        message: t('Its {n} questions will be removed from this browser. Export it first if you want a copy.', { n: set.questions.length }),
                        confirmLabel: t('Delete set'),
                      });
                      if (ok) {
                        deleteSet(set.id);
                        setSelectedId(null);
                        toast.show(t('Question set deleted'));
                      }
                    }}
                  >
                    {t('Delete')}
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {settings.questions.activeSetId !== set.id && (
                  <Button size="sm" variant="subtle" onClick={() => updateSettings('questions', { activeSetId: set.id })}>
                    {t('Make this the default set')}
                  </Button>
                )}
                <p className="text-xs text-night-200">{t('Point values in every set are game values, not real survey statistics.')}</p>
              </div>
            </div>

            <div className="panel space-y-3">
              <Tabs<Filter>
                label={t('Question type')}
                idPrefix="qtype"
                active={filter}
                onChange={setFilter}
                tabs={[
                  { id: 'all', label: `All (${counts.all})` },
                  { id: 'round', label: `Rounds (${counts.round})` },
                  { id: 'finalRound', label: `${t('Final round')} (${counts.finalRound})` },
                  { id: 'finalChallenge', label: `Final Challenge (${counts.finalChallenge})` },
                ]}
              />
              <div className="flex flex-wrap gap-2">
                <div className="relative min-w-[12rem] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-night-300" aria-hidden />
                  <input className="input !pl-9" type="search" placeholder={t('Search questions and answers')} aria-label={t('Search questions')} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="input !w-auto" aria-label={t('Filter by category')} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">{t('All categories')}</option>
                  {setCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Button variant="gold" icon={Plus} onClick={() => setEditing({ question: null })}>
                  {t('New question')}
                </Button>
              </div>

              <div id={`qtype-panel-${filter}`} role="tabpanel" aria-labelledby={`qtype-tab-${filter}`}>
                {visible.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl bg-night-950/40 py-10 text-center">
                    <FilePlus2 className="h-9 w-9 text-night-300" aria-hidden />
                    <p className="text-night-100">{set.questions.length === 0 ? t('This set is empty. Add your first question.') : t('No questions match these filters.')}</p>
                    <Button variant="gold" size="sm" icon={Plus} onClick={() => setEditing({ question: null })}>
                      {t('New question')}
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {visible.map((q) => {
                      const index = set.questions.findIndex((x) => x.id === q.id);
                      const kind = questionKind(q);
                      return (
                        <li key={q.id} className="flex flex-col gap-2 rounded-2xl bg-night-950/40 p-3 ring-1 ring-inset ring-white/10 sm:flex-row sm:items-center">
                          <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEditing({ question: q })}>
                            <p className="font-bold text-cream">{q.question}</p>
                            <p className="mt-1 flex flex-wrap gap-1.5 text-xs">
                              <span className={`chip ${kind !== 'round' ? '!bg-gold-300/20 text-gold-100' : ''}`}>{t(KIND_LABEL[kind])}</span>
                              <span className="chip">{q.category}</span>
                              <span className="chip">{q.answers.length} answers</span>
                              {q.multiplier && <span className="chip">{q.multiplier}×</span>}
                            </p>
                          </button>
                          <div className="flex shrink-0 gap-1">
                            <Button size="sm" variant="subtle" icon={ArrowUp} disabled={index === 0} onClick={() => moveQuestion(set.id, q.id, -1)} aria-label={t('Move question up')} />
                            <Button size="sm" variant="subtle" icon={ArrowDown} disabled={index === set.questions.length - 1} onClick={() => moveQuestion(set.id, q.id, 1)} aria-label={t('Move question down')} />
                            <Button size="sm" variant="subtle" icon={Pencil} onClick={() => setEditing({ question: q })} aria-label={t('Edit question')} />
                            <Button size="sm" variant="subtle" icon={Copy} onClick={() => duplicateQuestion(set.id, q.id)} aria-label={t('Duplicate question')} />
                            <Button
                              size="sm"
                              variant="subtle"
                              icon={Trash2}
                              aria-label={t('Delete question')}
                              onClick={async () => {
                                const ok = await confirm({ title: t('Delete this question?'), message: q.question, confirmLabel: t('Delete question') });
                                if (ok) deleteQuestion(set.id, q.id);
                              }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="panel flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-night-100">{t('Create a set, import one, or add the sample set to get started.')}</p>
          </section>
        )}
      </div>

      {editing && set && (
        <QuestionEditor
          initial={editing.question}
          categories={categories}
          defaultKind={filter === 'all' ? 'round' : filter}
          onClose={() => setEditing(null)}
          onSave={(q) => {
            upsertQuestion(set.id, q);
            setEditing(null);
            toast.show(t('Question saved'));
          }}
        />
      )}

      <Modal
        open={setDialog !== null}
        onClose={() => setSetDialog(null)}
        title={setDialog?.mode === 'create' ? t('New question set') : t('Rename question set')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSetDialog(null)}>
              {t('Cancel')}
            </Button>
            <Button variant="gold" disabled={!setDialog?.name.trim()} onClick={saveSetDialog}>
              {setDialog?.mode === 'create' ? t('Create set') : t('Save name')}
            </Button>
          </>
        }
      >
        {setDialog && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveSetDialog();
            }}
          >
            <div>
              <label htmlFor="set-name" className="field-label">
                {t('Name')}
              </label>
              <input id="set-name" className="input" maxLength={60} placeholder={t('Bible Characters')} value={setDialog.name} autoFocus onChange={(e) => setSetDialog({ ...setDialog, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="set-desc" className="field-label">
                Description (optional)
              </label>
              <input id="set-desc" className="input" maxLength={200} value={setDialog.description} onChange={(e) => setSetDialog({ ...setDialog, description: e.target.value })} />
            </div>
            <button type="submit" hidden />
          </form>
        )}
      </Modal>

      <Modal
        open={share !== null}
        onClose={() => setShare(null)}
        title={`Share “${share?.name ?? ''}”`}
        description={t('Anyone who opens this link can add a copy of the set to their own device. The questions travel inside the link; nothing is uploaded.')}
        footer={
          <>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && share && (
              <Button
                variant="ghost"
                icon={Share2}
                onClick={() => {
                  navigator.share({ title: `${share.name} for Ministry Showdown`, text: t('Here are our Ministry Showdown questions: {name}', { name: share.name }), url: share.url }).catch(() => undefined);
                }}
              >
                {t('Send…')}
              </Button>
            )}
            <Button
              variant="gold"
              icon={Link2}
              onClick={async () => {
                if (!share) return;
                try {
                  await navigator.clipboard.writeText(share.url);
                  toast.show(t('Link copied'));
                } catch {
                  toast.show(t('Copy failed. Select the link and copy it manually.'), 'error');
                }
              }}
            >
              {t('Copy link')}
            </Button>
          </>
        }
      >
        {share && (
          <>
            <label htmlFor="share-url" className="field-label">
              {t('Link')}
            </label>
            <textarea id="share-url" readOnly className="input h-28 resize-none break-all font-mono text-xs" value={share.url} onFocus={(e) => e.currentTarget.select()} />
            <p className="field-help">
              {share.url.length > LINK_WARN_LENGTH
                ? t('This set is large, so the link is very long. Some messaging apps may cut it off; if so, use Export question set and send the file instead.')
                : `${share.url.length.toLocaleString()} characters.`}
            </p>
          </>
        )}
      </Modal>

      <Modal open={importError !== null} onClose={() => setImportError(null)} title={t('Import didn’t work')} footer={<Button variant="gold" onClick={() => setImportError(null)}>OK</Button>}>
        <p className="text-night-100">{importError?.error}</p>
        {importError && importError.details.length > 0 && (
          <ul className="mt-3 ml-4 list-disc space-y-1 text-sm text-night-200">
            {importError.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
