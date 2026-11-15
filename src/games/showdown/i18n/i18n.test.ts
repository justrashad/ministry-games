import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ES } from './es';
import './register';
import { interpolate, translate } from '../../../core/i18n/i18n';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !name.endsWith('.test.ts') ? [path] : [];
  });
}

/** Every literal passed to t('…') anywhere in the app. */
function usedKeys(): Map<string, string> {
  const keys = new Map<string, string>();
  const pattern = /\b(?:t|tr|msg)\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  const repo = join(__dirname, '..', '..', '..', '..');
  for (const file of [...sourceFiles(join(repo, 'src')), ...sourceFiles(join(repo, 'server'))]) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(pattern)) {
      if (m[1] === '`' && m[2].includes('${')) continue;
      keys.set(m[2].replace(/\\(['"`\\])/g, '$1'), file);
    }
  }
  return keys;
}

describe('translations', () => {
  it('every piece of interface text has a Spanish translation', () => {
    const missing = [...usedKeys()].filter(([k]) => !(k in ES)).map(([k, f]) => `${f.split('/src/')[1]}: ${k}`);
    expect(missing).toEqual([]);
  });

  it('keeps the same {placeholders} in both languages', () => {
    const bad = Object.entries(ES).filter(([en, es]) => {
      const a = (en.match(/\{\w+\}/g) ?? []).sort().join();
      const b = (es.match(/\{\w+\}/g) ?? []).sort().join();
      return a !== b;
    });
    expect(bad).toEqual([]);
  });

  it('translates and fills placeholders, falling back to English', () => {
    expect(interpolate('Round {n} of {total}', { n: 2, total: 3 })).toBe('Round 2 of 3');
    expect(translate('en', 'Hello {name}', { name: 'Ana' })).toBe('Hello Ana');
    expect(translate('es', 'Not a real key')).toBe('Not a real key');
    expect(translate('es', 'Start game')).toBe(ES['Start game']);
  });
});
