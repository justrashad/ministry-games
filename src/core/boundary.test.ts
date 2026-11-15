import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, sep } from 'node:path';

/*
 * The shared code must never reach into a title. A title may import from core;
 * core may import only from core (plus the title table's types). The same rule
 * holds on the server: server/core knows nothing about any title's packs.
 */

const repo = join(__dirname, '..', '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

const IMPORT = /(?:from\s+|import\s+|import\(\s*)(['"])([^'"]+)\1/g;

function outsideImports(coreDir: string, allowed: string[]): string[] {
  const problems: string[] = [];
  for (const file of sourceFiles(coreDir)) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(IMPORT)) {
      const spec = match[2];
      if (spec.startsWith('@title')) {
        problems.push(`${relative(repo, file)} imports ${spec}`);
        continue;
      }
      if (!spec.startsWith('.')) continue;
      const target = normalize(join(dirname(file), spec));
      const inside = target === coreDir || target.startsWith(coreDir + sep);
      if (!inside && !allowed.some((a) => target === a)) problems.push(`${relative(repo, file)} imports ${spec}`);
    }
  }
  return problems;
}

describe('shared code boundary', () => {
  it('src/core imports nothing from a title', () => {
    expect(outsideImports(join(repo, 'src', 'core'), [join(repo, 'titles.config')])).toEqual([]);
  });

  it('server/core imports nothing from a title', () => {
    expect(outsideImports(join(repo, 'server', 'core'), [join(repo, 'src', 'core', 'i18n', 'msg')])).toEqual([]);
  });
});
