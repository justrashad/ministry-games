import { describe, expect, it } from 'vitest';
import { normalizeQuestion } from './validation';

const clue = { id: 'c1', type: 'clue', category: 'Kings of Israel', level: 3, prompt: 'He built the first temple in Jerusalem.', answer: 'Solomon', reference: '1 Kings 6:1' };
const falseStatement = { id: 't1', type: 'truefalse', category: 'Bible Accounts', level: 2, statement: 'Noah took eight of every animal into the ark.', isTrue: false, correction: 'He took two of some animals and seven of others.' };

describe('shared question format in Ministry Showdown', () => {
  it('refuses clue and true or false questions', () => {
    expect(normalizeQuestion(clue).question).toBeNull();
    expect(normalizeQuestion(clue).errors[0]).toMatch(/survey question/);
    expect(normalizeQuestion(falseStatement).question).toBeNull();
  });

  it('keeps the shared fields on a survey question', () => {
    const { question } = normalizeQuestion({ type: 'survey', question: 'Name a prophet.', answers: [{ text: 'Daniel', points: 30 }], level: 2, reference: 'Daniel 1:6' });
    expect(question?.level).toBe(2);
    expect(question?.reference).toBe('Daniel 1:6');
    expect(question && 'type' in question).toBe(false);
  });
});
