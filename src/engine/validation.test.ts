import { describe, expect, it } from 'vitest';
import { parseQuestionSetFile, parseQuestionSetText, sanitizeStoredSet, toExport, validateQuestion } from './validation';
import { createSampleSets } from '../data/sampleQuestions';

const good = {
  name: 'Family Worship Questions',
  version: 1,
  questions: [
    { id: 'x1', category: 'Test', question: 'Name a prophet.', answers: [{ id: 'a', text: 'Daniel', points: 30 }, { id: 'b', text: 'Isaiah', points: '20' }] },
  ],
};

describe('import validation', () => {
  it('accepts a valid export and coerces numeric strings', () => {
    const result = parseQuestionSetFile(good);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.questions[0].answers[1].points).toBe(20);
  });

  it('rejects invalid JSON with a friendly message', () => {
    const result = parseQuestionSetText('{ nope');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/valid JSON/);
  });

  it('rejects files without questions', () => {
    expect(parseQuestionSetFile({ name: 'x', version: 1 }).ok).toBe(false);
    expect(parseQuestionSetFile({ name: 'x', version: 1, questions: [] }).ok).toBe(false);
    expect(parseQuestionSetFile('hello').ok).toBe(false);
  });

  it('rejects newer versions', () => {
    const result = parseQuestionSetFile({ ...good, version: 2 });
    expect(result.ok).toBe(false);
  });

  it('reports empty text and bad points', () => {
    const result = parseQuestionSetFile({
      name: 'Bad',
      version: 1,
      questions: [{ question: '', answers: [{ text: '', points: 'lots' }] }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.details.join(' ')).toMatch(/question text/);
      expect(result.details.join(' ')).toMatch(/not a number/);
    }
  });

  it('replaces duplicate question and answer IDs', () => {
    const q = good.questions[0];
    const result = parseQuestionSetFile({
      ...good,
      questions: [q, { ...q, answers: [{ id: 'dup', text: 'A', points: 1 }, { id: 'dup', text: 'B', points: 2 }] }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const ids = result.data.questions.map((x) => x.id);
      expect(new Set(ids).size).toBe(2);
      const answerIds = result.data.questions[1].answers.map((a) => a.id);
      expect(new Set(answerIds).size).toBe(2);
      expect(result.warnings.length).toBeGreaterThan(0);
    }
  });

  it('round-trips the sample set through export and import', () => {
    const [set] = createSampleSets(0);
    const text = JSON.stringify(toExport(set));
    const result = parseQuestionSetText(text);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.questions).toHaveLength(set.questions.length);
  });

  it('keeps valid questions when loading a partially broken stored set', () => {
    const set = sanitizeStoredSet({ id: 's', name: 'S', questions: [good.questions[0], { question: 'broken' }] });
    expect(set?.questions).toHaveLength(1);
  });
});

describe('editor validation', () => {
  it('flags empty text, invalid points and dangling alternates', () => {
    const errors = validateQuestion({
      id: 'q',
      category: 'c',
      question: ' ',
      answers: [{ id: 'a', text: '', points: Number.NaN }],
      alternateAnswers: [{ acceptedAnswer: 'x', matchesAnswerId: 'missing' }],
    });
    expect(errors.length).toBe(4);
  });
});
