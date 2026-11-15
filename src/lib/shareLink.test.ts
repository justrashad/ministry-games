import { describe, expect, it } from 'vitest';
import { decodeSetPayload, encodeSetPayload } from './shareLink';
import { createSampleSets } from '../data/sampleQuestions';

describe('share links', () => {
  it('round-trips a full question set in a compact payload', async () => {
    const [set] = createSampleSets(0);
    const payload = await encodeSetPayload(set);
    expect(payload[0]).toBe('z');
    expect(payload.length).toBeLessThan(JSON.stringify(set).length);
    const result = await decodeSetPayload(payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe(set.name);
      expect(result.data.questions).toEqual(set.questions);
    }
  });

  it('rejects damaged or foreign links with a friendly error', async () => {
    const [set] = createSampleSets(0);
    const payload = await encodeSetPayload(set);
    const truncated = await decodeSetPayload(payload.slice(0, 40));
    expect(truncated.ok).toBe(false);
    expect((await decodeSetPayload('')).ok).toBe(false);
    expect((await decodeSetPayload('xabc')).ok).toBe(false);
  });
});

