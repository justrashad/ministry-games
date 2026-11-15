import { createLicenseClient } from '../../../core/commerce/licenseClient';
import { createPackLibrary } from '../../../core/commerce/packLibrary';
import { msg } from '../../../core/i18n/msg';
import { normalizeClue } from '../../../core/questions/normalize';
import type { ClueQuestion } from '../../../core/questions/types';
import type { CluePack } from '../data/clueBuilder';
import { PACK_CATALOG } from './catalog';

/** Question packs bought on this device, in each language they were downloaded in. */
export const packLibrary = createPackLibrary<ClueQuestion>('packs.v1', (raw) => {
  const result = normalizeClue(raw);
  return result.errors.length === 0 ? result.question : null;
});

/* Theopardy!'s purchases on this device. One key unlocks the full game, which includes the starter pack. */
export const license = createLicenseClient({ onPack: (payload) => packLibrary.add(payload) });

/** A pack's final-round clues carry "-final-" in their id; the rest go on the boards. */
export function isFinalClue(clue: ClueQuestion): boolean {
  return clue.id.includes('-final-');
}

/** What the free demo plays: one short board from the first categories of the starter pack, with no final round. */
export const DEMO = { rounds: 1, categories: 3 } as const;

export function demoClues(pack: CluePack): ClueQuestion[] {
  const names: string[] = [];
  for (const clue of pack.clues) {
    if (!names.includes(clue.category)) names.push(clue.category);
    if (names.length === DEMO.categories) break;
  }
  return pack.clues.filter((clue) => names.includes(clue.category));
}

/** Display name for what a license key grants. Screens translate it. */
export function grantName(grant: string): string {
  if (grant === 'owner') return msg('Owner access');
  if (grant === 'game') return msg('Theopardy! full game');
  return PACK_CATALOG.find((p) => p.id === grant)?.name ?? grant;
}
