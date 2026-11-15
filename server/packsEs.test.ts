import { describe, expect, it } from 'vitest';
import { QUESTION_PACKS } from './packs';
import { QUESTION_PACKS_ES } from './packsEs';
import { validateQuestion } from '../src/engine/validation';
import { matchAnswer } from '../src/engine/matching';
import { questionKind } from '../src/engine/questionPicker';
import { route as routeFor, signToken, type ProviderClient, type Route } from './licensing';
import { SHOWDOWN_TITLE } from './showdownTitle';

const route = (name: Route, body: Record<string, unknown>, env: Record<string, string | undefined>, provider: ProviderClient) =>
  routeFor(name, body, env, provider, SHOWDOWN_TITLE);

describe('Spanish packs', () => {
  const ids = Object.keys(QUESTION_PACKS_ES);

  it('only use real pack IDs', () => {
    for (const id of ids) expect(QUESTION_PACKS.some((p) => p.id === id)).toBe(true);
  });

  it('mirror their English pack question for question', () => {
    for (const id of ids) {
      const en = QUESTION_PACKS.find((p) => p.id === id)!;
      const es = QUESTION_PACKS_ES[id];
      expect(es.questions.length).toBe(en.questions.length);
      es.questions.forEach((q, i) => {
        expect(q.id).toBe(en.questions[i].id.replace('pk-', 'pk-es-'));
        expect(questionKind(q)).toBe(questionKind(en.questions[i]));
        expect(q.answers.map((a) => a.points)).toEqual(en.questions[i].answers.map((a) => a.points));
      });
    }
  });

  it('are valid, and every Final Challenge answer and alternate matches itself', () => {
    for (const id of ids) {
      for (const q of QUESTION_PACKS_ES[id].questions) {
        expect(validateQuestion(q), `${q.id}`).toEqual([]);
        if (!q.isFinalChallenge) continue;
        q.answers.forEach((a) => expect(matchAnswer(q, a.text)?.answerId, `${q.id}: ${a.text}`).toBe(a.id));
        q.alternateAnswers?.forEach((alt) => expect(matchAnswer(q, alt.acceptedAnswer)?.answerId, `${q.id}: ${alt.acceptedAnswer}`).toBe(alt.matchesAnswerId));
      }
    }
  });

  it('are delivered in Spanish when asked, and fall back to English when a pack has no Spanish yet', async () => {
    const secret = 'x'.repeat(40);
    const env = { LICENSE_SIGNING_SECRET: secret, OWNER_KEY: 'owner-0123456789abcdef0123456789' };
    const token = await signToken({ v: 1, ent: 'owner', key: env.OWNER_KEY, iid: 'owner', iat: 1 }, secret);
    const provider = {} as never;
    const es = (await route('pack', { token, packId: ids[0], lang: 'es' }, env, provider)).body.pack as { lang: string; name: string };
    expect(es.lang).toBe('es');
    expect(es.name).toBe(QUESTION_PACKS_ES[ids[0]].name);
    const missing = QUESTION_PACKS.find((p) => !QUESTION_PACKS_ES[p.id]);
    if (missing) {
      const fallback = (await route('pack', { token, packId: missing.id, lang: 'es' }, env, provider)).body.pack as { lang: string };
      expect(fallback.lang).toBe('en');
    }
    const en = (await route('pack', { token, packId: ids[0] }, env, provider)).body.pack as { lang: string };
    expect(en.lang).toBe('en');
  });
});

describe('store catalog', () => {
  it('marks exactly the packs that have a Spanish version', async () => {
    const { PACK_CATALOG } = await import('../src/commerce/catalog');
    expect(PACK_CATALOG.filter((p) => p.es).map((p) => p.id).sort()).toEqual(Object.keys(QUESTION_PACKS_ES).sort());
  });
});
