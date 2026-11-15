import { msg } from '../../src/core/i18n/msg';
import type { TitleContent } from '../core/licensing';
import { PACKS, PACKS_ES } from './packs';

/*
 * Kingdom Squares as the license server sees it. The starter pack ships with the
 * game. Paid packs live in packs.ts, which is bundled only into the server function
 * and never into the public website.
 */
export const SQUARES_TITLE: TitleContent = {
  id: 'squares',
  name: 'Kingdom Squares',
  packs: PACKS,
  spanishPacks: PACKS_ES,
  messages: {
    notOpen: msg('The Kingdom Squares store is not open yet.'),
    wrongProduct: msg("That key isn't for Kingdom Squares. Check the email for your Kingdom Squares purchase."),
    deviceName: 'Kingdom Squares device',
  },
};
