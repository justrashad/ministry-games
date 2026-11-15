import type { Question } from '../src/types';
import { msg } from '../src/i18n/msg';
import type { TitleContent } from './licensing';
import { QUESTION_PACKS } from './packs';
import { QUESTION_PACKS_ES } from './packsEs';

/** Ministry Showdown as the license server sees it. The id matches tokens issued before titles existed. */
export const SHOWDOWN_TITLE: TitleContent<Question> = {
  id: 'showdown',
  name: 'Ministry Showdown',
  packs: QUESTION_PACKS,
  spanishPacks: QUESTION_PACKS_ES,
  messages: {
    notOpen: msg('The Ministry Showdown store is not open yet.'),
    wrongProduct: msg("That key isn't for Ministry Showdown. Check the email for your Ministry Showdown purchase."),
    deviceName: 'Ministry Showdown device',
  },
};
