import { createLicenseClient } from '../../../core/commerce/licenseClient';
import { createPackLibrary } from '../../../core/commerce/packLibrary';
import { msg } from '../../../core/i18n/msg';
import { normalizeTrueFalse } from '../../../core/questions/normalize';
import type { TrueFalseQuestion } from '../../../core/questions/types';
import type { StatementPack } from '../data/statementBuilder';
import { PACK_CATALOG } from './catalog';

/** Statement packs bought on this device, in each language they were downloaded in. */
export const packLibrary = createPackLibrary<TrueFalseQuestion>('packs.v1', (raw) => {
  const result = normalizeTrueFalse(raw);
  return result.errors.length === 0 ? result.question : null;
});

/* Kingdom Squares' purchases on this device. One key unlocks the full game, which includes the starter pack. */
export const license = createLicenseClient({ onPack: (payload) => packLibrary.add(payload) });

/** What the free demo plays: one game, with statements from the first categories of the starter pack. */
export const DEMO = { gamesToWin: 1, categories: 2 } as const;

export function demoStatements(pack: StatementPack): TrueFalseQuestion[] {
  const names: string[] = [];
  for (const statement of pack.statements) {
    if (!names.includes(statement.category)) names.push(statement.category);
    if (names.length === DEMO.categories) break;
  }
  return pack.statements.filter((statement) => names.includes(statement.category));
}

/** Display name for what a license key grants. Screens translate it. */
export function grantName(grant: string): string {
  if (grant === 'owner') return msg('Owner access');
  if (grant === 'game') return msg('Kingdom Squares full game');
  return PACK_CATALOG.find((p) => p.id === grant)?.name ?? grant;
}
