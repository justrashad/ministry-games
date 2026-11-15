import { createLicenseClient } from '../../../core/commerce/licenseClient';
import { msg } from '../../../core/i18n/msg';
import type { ClueQuestion } from '../../../core/questions/types';
import type { CluePack } from '../data/clueBuilder';

/* Theopardy!'s purchases on this device. One key unlocks the full game, which includes the starter pack. */
export const license = createLicenseClient();

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
  return msg('Theopardy! full game');
}
