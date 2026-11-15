import { useCallback, useEffect } from 'react';
import { createPersistentStore } from '../state/persistentStore';
import { ES } from './es';
import { interpolate, type Vars } from './msg';

export { interpolate, msg, type Vars } from './msg';

/*
 * Two languages, keyed by the English text itself (gettext style): components call
 * t('Start game') and Spanish comes from the ES table. Missing Spanish falls back to
 * English, and a test fails if any t('…') literal in the code has no Spanish entry.
 * Variables use {name} placeholders: t('Round {n} of {total}', { n: 2, total: 3 }).
 */

export type Lang = 'en' | 'es';
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
];

function detect(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  return (navigator.languages?.[0] ?? navigator.language ?? 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
}

export const langStore = createPersistentStore<Lang>('lang.v1', (raw) => (raw === 'es' || raw === 'en' ? raw : detect()));

export const useLang = () => langStore.useValue();

export function setLang(lang: Lang): void {
  langStore.set(lang);
}

export function translate(lang: Lang, text: string, vars?: Vars): string {
  return interpolate(lang === 'es' ? (ES[text] ?? text) : text, vars);
}

/** For code outside React components (toasts from background tasks, error messages). */
export function t(text: string, vars?: Vars): string {
  return translate(langStore.get(), text, vars);
}

export type TFn = (text: string, vars?: Vars) => string;

export function useT(): TFn {
  const lang = useLang();
  return useCallback((text: string, vars?: Vars) => translate(lang, text, vars), [lang]);
}

/** Keeps <html lang> in sync so screen readers pronounce Spanish correctly. */
export function useApplyLangAttribute(): void {
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}
