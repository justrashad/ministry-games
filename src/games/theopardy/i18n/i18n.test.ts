import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CORE_ES } from '../../../core/i18n/es';
import { ES } from './es';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !name.endsWith('.test.ts') ? [path] : [];
  });
}

const repo = join(__dirname, '..', '..', '..', '..');

/** Every literal passed to t('…'), tr('…') or msg('…') in this title and the shared code it runs on. */
function usedKeys(): Map<string, string> {
  const keys = new Map<string, string>();
  const pattern = /\b(?:t|tr|msg)\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  const dirs = [join(repo, 'src', 'core'), join(repo, 'src', 'games', 'theopardy'), join(repo, 'server', 'core'), join(repo, 'server', 'theopardy')];
  for (const file of dirs.flatMap(sourceFiles)) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(pattern)) {
      if (m[1] === '`' && m[2].includes('${')) continue;
      keys.set(m[2].replace(/\\(['"`\\])/g, '$1'), file);
    }
  }
  return keys;
}

describe('Theopardy! translations', () => {
  const all = { ...CORE_ES, ...ES };

  it('every piece of interface text has a Spanish translation', () => {
    const missing = [...usedKeys()].filter(([k]) => !(k in all)).map(([k, f]) => `${f.split('/src/')[1] ?? f}: ${k}`);
    expect(missing).toEqual([]);
  });

  it('has no leftover translations for text that is no longer used', () => {
    const used = usedKeys();
    expect(Object.keys(ES).filter((k) => !used.has(k))).toEqual([]);
  });

  it('keeps the same {placeholders} in both languages', () => {
    const bad = Object.entries(all).filter(([en, es]) => {
      const a = (en.match(/\{\w+\}/g) ?? []).sort().join();
      const b = (es.match(/\{\w+\}/g) ?? []).sort().join();
      return a !== b;
    });
    expect(bad).toEqual([]);
  });
});
