import { createLicenseClient } from '../../../core/commerce/licenseClient';
import { createPackLibrary } from '../../../core/commerce/packLibrary';
import { msg } from '../../../core/i18n/msg';
import { normalizeClue } from '../../../core/questions/normalize';
import type { ClueQuestion } from '../../../core/questions/types';
import { PACK_CATALOG } from './catalog';

/** Question packs bought on this device, in each language they were downloaded in. */
export const packLibrary = createPackLibrary<ClueQuestion>('packs.v1', (raw) => {
  const result = normalizeClue(raw);
  return result.errors.length === 0 ? result.question : null;
});

/* Purchases on this device. One key unlocks the full game, which includes the starter pack. */
export const license = createLicenseClient({ onPack: (payload) => packLibrary.add(payload) });

/** A pack's bonus questions carry "-bonus-" in their id; the rest go on the boards. */
export function isBonusQuestion(q: ClueQuestion): boolean {
  return q.id.includes('-bonus-');
}

/** What the free demo plays: one question per stage on each board, and no bonus question. */
export const DEMO = { perStage: 1 } as const;

/** Display name for what a license key grants. Screens translate it. */
export function grantName(grant: string): string {
  if (grant === 'owner') return msg('Owner access');
  if (grant === 'game') return msg('Are You Smarter Than a Spiritual Babe? full game');
  return PACK_CATALOG.find((p) => p.id === grant)?.name ?? grant;
}
