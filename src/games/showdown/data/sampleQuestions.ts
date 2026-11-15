import type { Question, QuestionSet } from '../types';
import type { Lang } from '../../../core/i18n/i18n';
import {
  SAMPLE_FINAL_CHALLENGE_QUESTIONS_ES,
  SAMPLE_FINAL_ROUND_QUESTIONS_ES,
  SAMPLE_ROUND_QUESTIONS_ES,
  SAMPLE_SET_ID_ES,
} from './sampleQuestionsEs';

/*
 * Sample content designed for family worship.
 * All point values are fictional game values created for this question set;
 * they are not real survey statistics.
 */

export { q } from './questionBuilder';
import { q } from './questionBuilder';

export const FW = 'Family Worship';
export const MEET = 'Congregation Meetings';
export const CHAR = 'Bible Characters';
export const KNOW = 'Bible Knowledge';
export const CREATE = 'Creation';
export const MIN = 'Christian Ministry';
export const QUAL = 'Christian Qualities';

export const SAMPLE_ROUND_QUESTIONS: Question[] = [
  q('fw-01', FW, 'What is something a family might do during family worship?', [
    ['Study the Bible', 30], ['Discuss a Bible account', 20], ['Watch a video', 15], ['Practice a demonstration', 12],
    ['Prepare for a meeting', 10], ['Pray', 8], ['Sing a Kingdom song', 5],
  ]),
  q('mt-01', MEET, 'What is something you might bring to a congregation meeting?', [
    ['Bible', 32], ['Tablet or phone', 25], ['Notebook', 14], ['Pen', 12], ['Water bottle', 9], ['Meeting workbook', 8],
  ]),
  q('ch-01', CHAR, 'Name a Bible character a family might enjoy learning about.', [
    ['David', 24], ['Daniel', 20], ['Joseph', 16], ['Esther', 13], ['Noah', 11], ['Ruth', 9], ['Moses', 7],
  ]),
  q('mt-02', MEET, 'What is something a family might do before going to a congregation meeting?', [
    ['Prepare comments', 28], ['Get dressed nicely', 22], ['Eat a meal', 15], ['Pray together', 12], ['Leave early', 11], ['Pack the meeting bag', 8],
  ]),
  q('kn-01', KNOW, 'Name an animal mentioned in the Bible.', [
    ['Lion', 25], ['Sheep', 22], ['Donkey', 15], ['Serpent', 12], ['Dove', 10], ['Camel', 8], ['Fish', 5],
  ]),
  q('ch-02', CHAR, 'Name something Noah needed to build the ark.', [
    ['Wood', 30], ['Tools', 20], ['Help from his family', 18], ['Tar', 12], ['Faith', 10], ['Time', 7],
  ], { notes: 'Genesis 6:14 mentions resinous wood and tar.' }),
  q('qu-01', QUAL, 'Name a quality from the fruitage of the spirit.', [
    ['Love', 28], ['Joy', 18], ['Peace', 15], ['Patience', 12], ['Kindness', 10], ['Goodness', 7], ['Faith', 5], ['Self-control', 5],
  ], { notes: 'Galatians 5:22, 23. Mildness is also on the list.' }),
  q('mn-01', MIN, 'Name something you might take with you in the ministry.', [
    ['Bible', 30], ['Tracts', 22], ['Invitations', 15], ['Tablet or phone', 13], ['Pen', 8], ['Water', 7],
  ]),
  q('kn-02', KNOW, 'Name a book of the Bible that starts with the letter J.', [
    ['John', 24], ['Jeremiah', 16], ['Joshua', 15], ['Job', 14], ['Judges', 11], ['James', 9], ['Jonah', 7], ['Jude', 4],
  ]),
  q('kn-03', KNOW, 'Name a miracle Jesus performed.', [
    ['Walked on water', 26], ['Fed the crowds', 22], ['Healed the sick', 18], ['Raised Lazarus', 14], ['Turned water into wine', 10], ['Calmed the storm', 8],
  ]),
  q('cr-01', CREATE, 'Name something in creation that shows Jehovah\u2019s wisdom.', [
    ['Stars', 22], ['Oceans', 20], ['Animals', 18], ['Flowers and trees', 15], ['Mountains', 12], ['The human body', 8],
  ]),
  q('fw-02', FW, 'Name a way a family can help an older one in the congregation.', [
    ['Visit them', 28], ['Give them a ride', 22], ['Bring a meal', 16], ['Help with chores', 13], ['Call them', 11], ['Send a card', 7],
  ]),
  q('kn-04', KNOW, 'Name a place mentioned in the Bible.', [
    ['Jerusalem', 30], ['Egypt', 22], ['Bethlehem', 16], ['Babylon', 12], ['Nazareth', 9], ['Galilee', 7],
  ]),
  q('mt-03', MEET, 'Name something you might see at a regional convention.', [
    ['Baptism', 26], ['A Bible drama', 22], ['Lots of friends', 18], ['Badge cards', 12], ['Packed lunches', 10], ['New releases', 8],
  ]),
  q('mt-04', MEET, 'Name a way young ones can take part at meetings.', [
    ['Comment', 34], ['Sing', 20], ['Give a student assignment', 18], ['Follow along in the Bible', 12], ['Take notes', 10], ['Listen carefully', 6],
  ]),
  q('kn-05', KNOW, 'Name something Jesus used in his illustrations.', [
    ['Sheep', 22], ['Seeds', 20], ['A lost coin', 14], ['A fishing net', 12], ['A vineyard', 11], ['A mustard grain', 9], ['A pearl', 6],
  ]),
  q('ch-03', CHAR, 'Name a person in the Bible who cared for sheep.', [
    ['David', 36], ['Abel', 16], ['Moses', 15], ['Jacob', 12], ['Rachel', 10], ['Amos', 6],
  ]),
  q('cr-02', CREATE, 'Name something mentioned in the creation account in Genesis chapter 1.', [
    ['Light', 22], ['Sun and moon', 18], ['Plants', 16], ['Animals', 15], ['Fish and birds', 12], ['Humans', 10], ['The sky', 7],
  ]),
];

export const SAMPLE_FINAL_ROUND_QUESTIONS: Question[] = [
  q('fr-01', QUAL, 'Name a way we can show love to our brothers and sisters.', [
    ['Encourage them', 25], ['Help them', 20], ['Pray for them', 16], ['Invite them over', 14], ['Forgive them', 12], ['Listen to them', 8],
  ], { isFinalRound: true }),
  q('fr-02', FW, 'Name something a family might thank Jehovah for in prayer.', [
    ['Food', 26], ['Family', 22], ['Life', 16], ['The Bible', 13], ['The congregation', 11], ['Creation', 7], ['Jesus\u2019 sacrifice', 5],
  ], { isFinalRound: true }),
];

export const SAMPLE_FINAL_CHALLENGE_QUESTIONS: Question[] = [
  q('fc-01', MEET, 'Name something a family might do before going to a congregation meeting.', [
    ['Get dressed', 30], ['Prepare comments', 25], ['Eat', 18], ['Pray', 12], ['Iron clothes', 8],
  ], { isFinalChallenge: true, alternates: [['Get ready', 0], ['Study the lesson', 1], ['Have dinner', 2]] }),
  q('fc-02', CHAR, 'Name a Bible character children might enjoy learning about.', [
    ['David', 30], ['Noah', 22], ['Daniel', 18], ['Jonah', 14], ['Joseph', 10],
  ], { isFinalChallenge: true }),
  q('fc-03', MEET, 'Name something you might bring with you to a meeting.', [
    ['Bible', 35], ['Tablet', 22], ['Notebook', 15], ['Pen', 12], ['Water', 8],
  ], { isFinalChallenge: true, alternates: [['Phone', 1], ['Device', 1], ['iPad', 1]] }),
  q('fc-04', FW, 'Name something a family might do during a relaxing evening together.', [
    ['Play a game', 28], ['Watch a video', 24], ['Talk', 18], ['Eat dessert', 14], ['Take a walk', 10],
  ], { isFinalChallenge: true, alternates: [['Board game', 0], ['Watch a Bible video', 1], ['Have ice cream', 3]] }),
  q('fc-05', KNOW, 'Name a place mentioned in the Bible.', [
    ['Jerusalem', 32], ['Egypt', 22], ['Bethlehem', 18], ['Babylon', 12], ['Eden', 10],
  ], { isFinalChallenge: true, alternates: [['Garden of Eden', 4]] }),
  q('fc-06', FW, 'Name something a family might do together after dinner.', [
    ['Take a walk', 30], ['Talk together', 25], ['Study', 20], ['Play a game', 15], ['Clean up', 10],
  ], { isFinalChallenge: true, alternates: [['Stroll', 0], ['Wash the dishes', 4], ['Do the dishes', 4]] }),
  q('fc-07', MIN, 'Name something a family might do together on a Saturday.', [
    ['Go in the ministry', 32], ['Clean the house', 22], ['Take a walk', 16], ['Visit friends', 14], ['Run errands', 10],
  ], { isFinalChallenge: true, alternates: [['Field service', 0], ['Preaching', 0], ['Door to door', 0], ['Chores', 1]] }),
  q('fc-08', KNOW, 'Name a fruit mentioned in the Bible.', [
    ['Figs', 30], ['Grapes', 26], ['Olives', 16], ['Pomegranates', 14], ['Dates', 8],
  ], { isFinalChallenge: true }),
  q('fc-09', KNOW, 'Name an animal that went into Noah\u2019s ark.', [
    ['Elephant', 26], ['Lion', 22], ['Giraffe', 16], ['Dove', 14], ['Raven', 10],
  ], { isFinalChallenge: true }),
  q('fc-10', MIN, 'Name a spiritual goal a young person might set.', [
    ['Get baptized', 34], ['Read the whole Bible', 24], ['Pioneer', 18], ['Comment at every meeting', 12], ['Serve at Bethel', 8],
  ], { isFinalChallenge: true, alternates: [['Baptism', 0], ['Read the Bible', 1], ['Regular pioneer', 2]] }),
  q('fc-11', QUAL, 'Name a way to cheer up someone who feels sad.', [
    ['Talk with them', 28], ['Share a scripture', 24], ['Give them a card', 16], ['Pray with them', 14], ['Make them laugh', 10],
  ], { isFinalChallenge: true, alternates: [['Listen', 0], ['Bible verse', 1], ['Encourage them', 1]] }),
  q('fc-12', MEET, 'Name something you find inside a Kingdom Hall.', [
    ['Chairs', 28], ['Platform', 20], ['Microphones', 18], ['Literature', 14], ['Friends', 12],
  ], { isFinalChallenge: true, alternates: [['Seats', 0], ['Stage', 1], ['Mics', 2], ['Publications', 3], ['Brothers and sisters', 4]] }),
];

export const SAMPLE_SET_ID = 'sample-family-worship-mix';

/** The starter set's library ID in a given language (both can be in the library at once). */
export function sampleSetId(lang: Lang = 'en'): string {
  return lang === 'es' ? SAMPLE_SET_ID_ES : SAMPLE_SET_ID;
}

export function createSampleSets(now = Date.now(), lang: Lang = 'en'): QuestionSet[] {
  if (lang === 'es') {
    return [
      {
        id: SAMPLE_SET_ID_ES,
        name: 'Adoración en familia variada',
        description: 'Un paquete inicial con preguntas de ronda, de ronda final y del Desafío final.',
        questions: [...SAMPLE_ROUND_QUESTIONS_ES, ...SAMPLE_FINAL_ROUND_QUESTIONS_ES, ...SAMPLE_FINAL_CHALLENGE_QUESTIONS_ES],
        createdAt: now,
        updatedAt: now,
        isSample: true,
      },
    ];
  }
  return [
    {
      id: SAMPLE_SET_ID,
      name: 'Mixed Family Worship',
      description: 'A starter set with round questions, final round questions, and Final Challenge questions.',
      questions: [...SAMPLE_ROUND_QUESTIONS, ...SAMPLE_FINAL_ROUND_QUESTIONS, ...SAMPLE_FINAL_CHALLENGE_QUESTIONS],
      createdAt: now,
      updatedAt: now,
      isSample: true,
    },
  ];
}
