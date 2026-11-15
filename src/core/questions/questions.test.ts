import { describe, expect, it } from 'vitest';
import { normalizeClue, normalizeList, normalizeTrueFalse } from './normalize';
import { questionTypeOf, toLevel } from './types';

const clue = { id: 'c1', type: 'clue', category: 'Kings of Israel', level: 3, prompt: 'He built the first temple in Jerusalem.', answer: 'Solomon', reference: '1 Kings 6:1' };
const falseStatement = { id: 't1', type: 'truefalse', category: 'Bible Accounts', level: 2, statement: 'Noah took eight of every animal into the ark.', isTrue: false, correction: 'He took two of some animals and seven of others.' };

describe('question types', () => {
  it('treats a missing type as a survey question and rejects unknown types', () => {
    expect(questionTypeOf({ question: 'Name a prophet.', answers: [] })).toBe('survey');
    expect(questionTypeOf({ type: 'survey' })).toBe('survey');
    expect(questionTypeOf(clue)).toBe('clue');
    expect(questionTypeOf(falseStatement)).toBe('truefalse');
    expect(questionTypeOf({ type: 'riddle' })).toBeNull();
    expect(questionTypeOf('clue')).toBeNull();
  });

  it('reads levels 1 to 5 only', () => {
    expect(toLevel(1)).toBe(1);
    expect(toLevel('5')).toBe(5);
    expect(toLevel(0)).toBeNull();
    expect(toLevel(6)).toBeNull();
    expect(toLevel(2.5)).toBeNull();
    expect(toLevel('')).toBeNull();
    expect(toLevel(undefined)).toBeNull();
  });
});

describe('clue questions', () => {
  it('accepts a complete clue and keeps its reference', () => {
    const { question, errors } = normalizeClue(clue);
    expect(errors).toEqual([]);
    expect(question).toEqual(clue);
  });

  it('cleans up accepted alternates', () => {
    const { question } = normalizeClue({ ...clue, accept: [' King Solomon ', 'solomon', 'King Solomon', '', 7] });
    expect(question?.accept).toEqual(['King Solomon']);
  });

  it('rejects clues missing text, an answer or a valid level', () => {
    expect(normalizeClue({ ...clue, prompt: ' ' }).question).toBeNull();
    expect(normalizeClue({ ...clue, answer: undefined }).question).toBeNull();
    expect(normalizeClue({ ...clue, level: 9 }).errors[0]).toMatch(/level from 1 to 5/);
    expect(normalizeClue({ ...falseStatement }).question).toBeNull();
    expect(normalizeClue(null).question).toBeNull();
  });

  it('gives a question without an id a new one', () => {
    const { question } = normalizeClue({ ...clue, id: undefined });
    expect(question?.id).toBeTruthy();
    expect(question?.id).not.toBe('c1');
  });
});

describe('true or false questions', () => {
  it('accepts true and false statements', () => {
    expect(normalizeTrueFalse(falseStatement).question).toEqual(falseStatement);
    const truth = { id: 't2', type: 'truefalse', category: 'Bible Accounts', level: 1, statement: 'Jonah was swallowed by a big fish.', isTrue: true };
    expect(normalizeTrueFalse(truth).question).toEqual(truth);
  });

  it('requires a correction on a false statement', () => {
    const result = normalizeTrueFalse({ ...falseStatement, correction: '' });
    expect(result.question).toBeNull();
    expect(result.errors[0]).toMatch(/needs a correction/);
  });

  it('rejects a statement that does not say whether it is true', () => {
    expect(normalizeTrueFalse({ ...falseStatement, isTrue: 'no' }).question).toBeNull();
  });
});

describe('lists', () => {
  it('keeps good questions, reports bad ones and replaces duplicate ids', () => {
    const { questions, errors } = normalizeList([clue, { ...clue, prompt: 'He asked for wisdom.' }, { type: 'clue' }], normalizeClue);
    expect(questions).toHaveLength(2);
    expect(questions[0].id).toBe('c1');
    expect(questions[1].id).not.toBe('c1');
    expect(errors.length).toBeGreaterThan(0);
    expect(normalizeList('nope', normalizeClue).errors).toEqual(['The questions list is missing.']);
  });
});
