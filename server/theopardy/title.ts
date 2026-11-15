import { msg } from '../../src/core/i18n/msg';
import type { TitleContent } from '../core/licensing';
import { PACKS, PACKS_ES } from './packs';

/*
 * Theopardy! as the license server sees it. The starter pack ships with the game,
 * Paid packs live in packs.ts, which is bundled only into the server function and
 * never into the public website.
 */
export const THEOPARDY_TITLE: TitleContent = {
  id: 'theopardy',
  name: 'Theopardy!',
  packs: PACKS,
  spanishPacks: PACKS_ES,
  messages: {
    notOpen: msg('The Theopardy! store is not open yet.'),
    wrongProduct: msg("That key isn't for Theopardy!. Check the email for your Theopardy! purchase."),
    deviceName: 'Theopardy! device',
  },
};
