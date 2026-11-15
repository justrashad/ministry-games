/*
 * Every title built from this repository. One title is built at a time: set the
 * TITLE environment variable to its id (TITLE=theopardy npm run build). With no
 * TITLE set, Ministry Showdown is built, so its Netlify site needs no setting.
 *
 * Each title's own code lives in src/games/<id> and its paid packs in server/<id>.
 */

export interface TitleInfo {
  /** Folder name under src/games and server, and the id written into license tokens. */
  id: string;
  name: string;
  shortName: string;
  description: string;
  /** Prefix for everything this title saves in the browser. Never change it for a released title. */
  storagePrefix: string;
  /** Prefix for phone-remote room ids. Never change it for a released title. */
  peerPrefix: string;
  themeColor: string;
  backgroundColor: string;
}

export const TITLES: Record<string, TitleInfo> = {
  showdown: {
    id: 'showdown',
    name: 'Ministry Showdown',
    shortName: 'Showdown',
    description: 'A family-friendly survey guessing game designed for family worship.',
    // Kept as 'survey-showdown:' from before the rename so existing families keep their questions and history.
    storagePrefix: 'survey-showdown:',
    peerPrefix: 'ministry-showdown-v1-',
    themeColor: '#130d3d',
    backgroundColor: '#0b0828',
  },
  theopardy: {
    id: 'theopardy',
    name: 'Theopardy!',
    shortName: 'Theopardy!',
    description: 'A Bible clue board game for two teams, designed for family worship.',
    storagePrefix: 'theopardy:',
    peerPrefix: 'theopardy-v1-',
    themeColor: '#0A2152',
    backgroundColor: '#0A2152',
  },
  squares: {
    id: 'squares',
    name: 'Kingdom Squares',
    shortName: 'Kingdom Squares',
    description: 'A Bible true-or-false squares game for two teams, designed for family worship.',
    storagePrefix: 'kingdom-squares:',
    peerPrefix: 'kingdom-squares-v1-',
    themeColor: '#1D4ED8',
    backgroundColor: '#FFFFFF',
  },
  babe: {
    id: 'babe',
    name: 'Are You Smarter Than a Spiritual Babe?',
    shortName: 'Spiritual Babe',
    description: 'A Bible quiz for two teams, from Newborn to Mature questions, designed for family worship.',
    storagePrefix: 'spiritual-babe:',
    peerPrefix: 'spiritual-babe-v1-',
    themeColor: '#EA580C',
    backgroundColor: '#FFFFFF',
  },
};

export const DEFAULT_TITLE = 'showdown';

export function titleFor(id: string | undefined): TitleInfo {
  const title = TITLES[id?.trim() || DEFAULT_TITLE];
  if (!title) throw new Error(`Unknown TITLE "${id}". Known titles: ${Object.keys(TITLES).join(', ')}.`);
  return title;
}
