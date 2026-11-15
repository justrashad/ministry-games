import { msg } from '../../src/core/i18n/msg';
import type { TitleContent } from '../core/licensing';

/*
 * Theopardy! as the license server sees it. The starter pack ships with the game,
 * so there are no paid packs yet. Paid packs go here, in files that are bundled
 * only into the server function and never into the public website.
 */
export const THEOPARDY_TITLE: TitleContent = {
  id: 'theopardy',
  name: 'Theopardy!',
  packs: [],
  spanishPacks: {},
  messages: {
    notOpen: msg('The Theopardy! store is not open yet.'),
    wrongProduct: msg("That key isn't for Theopardy!. Check the email for your Theopardy! purchase."),
    deviceName: 'Theopardy! device',
  },
};
