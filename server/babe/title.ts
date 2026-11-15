import { msg } from '../../src/core/i18n/msg';
import type { TitleContent } from '../core/licensing';
import { PACKS, PACKS_ES } from './packs';

/*
 * Are You Smarter Than a Spiritual Babe? as the license server sees it. The starter pack ships with the
 * game. Paid packs live in packs.ts, which is bundled only into the server function
 * and never into the public website.
 */
export const BABE_TITLE: TitleContent = {
  id: 'babe',
  name: 'Are You Smarter Than a Spiritual Babe?',
  packs: PACKS,
  spanishPacks: PACKS_ES,
  messages: {
    notOpen: msg('The store for Are You Smarter Than a Spiritual Babe? is not open yet.'),
    wrongProduct: msg('That key is for a different game. Check the email for your Are You Smarter Than a Spiritual Babe? purchase.'),
    deviceName: 'Spiritual Babe device',
  },
};
