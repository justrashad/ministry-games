import { msg } from '../../../core/i18n/msg';

/*
 * What the store shows. Only names and counts live in the public app; the questions
 * themselves are sent by the server after a pack's license key checks out.
 * A test keeps this list in sync with server/packs.ts.
 */

export const DEFAULT_GAME_PRICE = '$39.99';
export const DEFAULT_PACK_PRICE = '$9.99';
export const DEFAULT_MEGA_PRICE = '$49.99';
export const DEFAULT_COMPLETE_PRICE = '$79.99';

export function defaultPrice(entitlement: string): string {
  if (entitlement === 'game') return DEFAULT_GAME_PRICE;
  if (entitlement === 'mega-pack') return DEFAULT_MEGA_PRICE;
  if (entitlement === 'complete') return DEFAULT_COMPLETE_PRICE;
  return DEFAULT_PACK_PRICE;
}

/** Display names for what a license token grants. */
export function entitlementName(ent: string): string {
  if (ent === 'game') return msg('Ministry Showdown');
  if (ent === 'mega-pack') return msg('Mega Pack (all question packs)');
  if (ent === 'complete') return msg('Complete Edition (game + all packs)');
  if (ent === 'owner') return msg('Owner access');
  return PACK_CATALOG.find((p) => p.id === ent)?.name ?? ent;
}

export interface PackInfo {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  finalChallengeCount: number;
  /** Easy questions; no Bible background needed. */
  beginner?: boolean;
  /** A Spanish version exists (see server/packsEs.ts). */
  es?: boolean;
}

export const PACK_CATALOG: PackInfo[] = [
  { id: 'bible-characters', name: msg("Bible Characters"), description: msg("Kings, prophets, apostles and faithful women and men."), questionCount: 14, finalChallengeCount: 5, es: true },
  { id: 'kingdom-hall', name: msg("Kingdom Hall and Meetings"), description: msg("Meetings, conventions and life at the Kingdom Hall."), questionCount: 14, finalChallengeCount: 5, es: true },
  { id: 'creation', name: msg("Creation"), description: msg("Animals, plants, the sky and the wonders Jehovah made."), questionCount: 14, finalChallengeCount: 5, es: true },
  { id: 'ministry', name: msg("Christian Ministry"), description: msg("Sharing the good news, at the door and everywhere else."), questionCount: 14, finalChallengeCount: 5, es: true },
  { id: 'life-of-jesus', name: msg("Life of Jesus"), description: msg("His birth, miracles, illustrations and example."), questionCount: 14, finalChallengeCount: 5, es: true },
  { id: 'bible-accounts', name: msg("Bible Accounts"), description: msg("Favorite accounts from the Hebrew Scriptures."), questionCount: 14, finalChallengeCount: 5, es: true },
  { id: 'little-ones', name: msg("Little Ones"), description: msg("Short, simple questions young children can answer."), questionCount: 14, finalChallengeCount: 5, es: true },
  { id: 'family-life', name: msg("Family Life"), description: msg("Helping at home, kindness, forgiveness and Jehovah’s qualities."), questionCount: 14, finalChallengeCount: 5, es: true },
  { id: 'bible-places', name: msg("Bible Places"), description: msg("Cities, seas, mountains and lands from the Bible."), questionCount: 14, finalChallengeCount: 5, es: true },
  { id: 'paradise-hope', name: msg("The Paradise Hope"), description: msg("What the Bible promises about life on a paradise earth."), questionCount: 14, finalChallengeCount: 5, es: true },
  { id: 'bible-basics', name: msg("Bible Basics"), description: msg("Easy questions about the best-known people and teachings in the Bible."), questionCount: 14, finalChallengeCount: 5, beginner: true, es: true },
  { id: 'famous-stories', name: msg("Famous Bible Stories"), description: msg("Noah, David and Goliath, Jonah, Daniel and more, told simply."), questionCount: 14, finalChallengeCount: 5, beginner: true, es: true },
  { id: 'everyday-values', name: msg("Everyday Values"), description: msg("Kindness, honesty, respect and friendship. Anyone can play, no Bible background needed."), questionCount: 14, finalChallengeCount: 5, beginner: true, es: true },
];

export function packInfo(id: string): PackInfo | undefined {
  return PACK_CATALOG.find((p) => p.id === id);
}
