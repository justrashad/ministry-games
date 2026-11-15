import { createLicenseClient } from '../../../core/commerce/licenseClient';
import { msg } from '../../../core/i18n/msg';

/* Purchases on this device. One key unlocks the full game, which includes the starter pack. */
export const license = createLicenseClient();

/** What the free demo plays: one question per stage on each board, and no bonus question. */
export const DEMO = { perStage: 1 } as const;

/** Display name for what a license key grants. Screens translate it. */
export function grantName(grant: string): string {
  if (grant === 'owner') return msg('Owner access');
  return msg('Are You Smarter Than a Spiritual Babe? full game');
}
