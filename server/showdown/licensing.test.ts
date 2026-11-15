import { describe, expect, it } from 'vitest';
import { QUESTION_PACKS } from './packs';
import {
  lemonSqueezyClient,
  parseConfig as parseConfigFor,
  route as routeFor,
  signToken,
  verifyToken,
  type ProviderClient,
  type ProviderLicense,
  type Route,
  type TitleContent,
} from '../core/licensing';
import { SHOWDOWN_TITLE } from './title';

type Env = Record<string, string | undefined>;
const parseConfig = (env: Env) => parseConfigFor(env, SHOWDOWN_TITLE);
const route = (name: Route, body: Record<string, unknown>, env: Env, provider: ProviderClient) => routeFor(name, body, env, provider, SHOWDOWN_TITLE);

const SECRET = 'x'.repeat(40);
const ENV = {
  LS_STORE_ID: '777',
  LICENSE_SIGNING_SECRET: SECRET,
  LS_CATALOG: JSON.stringify({
    game: { productId: 100, checkoutUrl: 'https://shop.example/game', price: '$39.99' },
    'bible-characters': { productId: 201, checkoutUrl: 'https://shop.example/bc', price: '$9.99' },
    'mega-pack': { productId: 300, checkoutUrl: 'https://shop.example/mega', price: '$49.99' },
    complete: { productId: 400, checkoutUrl: 'https://shop.example/complete', price: '$79.99' },
  }),
};
const KEY = '38b1460a-5104-4067-a91d-77b872934d51';

function fakeProvider(overrides: Partial<ProviderLicense> = {}, validateOverrides: Partial<ProviderLicense> = {}) {
  const calls: string[] = [];
  const base: ProviderLicense = { ok: true, error: null, instanceId: 'inst-1', storeId: 777, productId: 100, status: 'active', customerName: 'Rashad' };
  const provider: ProviderClient = {
    activate: async () => {
      calls.push('activate');
      return { ...base, ...overrides };
    },
    validate: async () => {
      calls.push('validate');
      return { ...base, ...validateOverrides };
    },
    deactivate: async () => {
      calls.push('deactivate');
      return { ok: true, error: null };
    },
  };
  return { provider, calls };
}

describe('configuration', () => {
  it('parses a complete setup and rejects incomplete ones', () => {
    expect(parseConfig(ENV).ok).toBe(true);
    expect(parseConfig({ ...ENV, LS_STORE_ID: 'abc' }).ok).toBe(false);
    expect(parseConfig({ LICENSE_SIGNING_SECRET: SECRET, OWNER_KEY: 'too-short' }).ok).toBe(false);
    expect(parseConfig({ ...ENV, LICENSE_SIGNING_SECRET: 'short' }).ok).toBe(false);
    expect(parseConfig({ ...ENV, LS_CATALOG: '{"game":{"productId":1,"checkoutUrl":"http://insecure"}}' }).ok).toBe(false);
    expect(parseConfig({ ...ENV, LS_CATALOG: '{"no-such-pack":{"productId":1,"checkoutUrl":"https://x"}}' }).ok).toBe(false);
  });

  it('reports the store as not open without leaking the reason to visitors', async () => {
    const { provider } = fakeProvider();
    const res = await route('catalog', {}, {}, provider);
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/not open/);
  });
});

describe('tokens', () => {
  it('round-trips and rejects tampering', async () => {
    const token = await signToken({ v: 1, ent: 'game', key: KEY, iid: 'i', iat: 1 }, SECRET);
    expect((await verifyToken(token, SECRET))?.ent).toBe('game');
    const [body, sig] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ v: 1, ent: 'bible-characters', key: KEY, iid: 'i', iat: 1 })).toString('base64url');
    expect(await verifyToken(`${forged}.${sig}`, SECRET)).toBeNull();
    expect(await verifyToken(`${body}.${sig}`, 'y'.repeat(40))).toBeNull();
    expect(await verifyToken('garbage', SECRET)).toBeNull();
  });
});

describe('activation', () => {
  it('activates a game key and returns a signed token without pack content', async () => {
    const { provider } = fakeProvider();
    const res = await route('activate', { key: KEY, deviceName: 'Living room laptop' }, ENV, provider);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, entitlement: 'game', keyHint: '4D51', pack: null });
    expect((await verifyToken(res.body.token, SECRET))?.iid).toBe('inst-1');
  });

  it('delivers the pack content only for a pack key', async () => {
    const { provider } = fakeProvider({ productId: 201 });
    const res = await route('activate', { key: KEY }, ENV, provider);
    const pack = res.body.pack as { id: string; questions: unknown[] };
    expect(res.body.entitlement).toBe('bible-characters');
    expect(pack.id).toBe('bible-characters');
    expect(pack.questions.length).toBe(14);
  });

  it('rejects keys from another store or product, returning the activation', async () => {
    const other = fakeProvider({ storeId: 999 });
    expect((await route('activate', { key: KEY }, ENV, other.provider)).status).toBe(400);
    const wrongProduct = fakeProvider({ productId: 555 });
    const res = await route('activate', { key: KEY }, ENV, wrongProduct.provider);
    expect(res.body.error).toMatch(/isn't for Ministry Showdown/);
    expect(wrongProduct.calls).toContain('deactivate');
  });

  it('explains provider errors in plain language', async () => {
    const { provider } = fakeProvider({ ok: false, error: 'This license key has reached the activation limit.' });
    const res = await route('activate', { key: KEY }, ENV, provider);
    expect(res.body.error).toMatch(/maximum number of devices/);
    const missing = fakeProvider({ ok: false, error: 'license_key not found.' });
    expect((await route('activate', { key: KEY }, ENV, missing.provider)).body.error).toMatch(/couldn't find that key/);
  });

  it('refuses disabled keys and malformed input', async () => {
    const disabled = fakeProvider({ status: 'disabled' });
    expect((await route('activate', { key: KEY }, ENV, disabled.provider)).status).toBe(403);
    const { provider } = fakeProvider();
    expect((await route('activate', { key: 'nope' }, ENV, provider)).status).toBe(400);
    expect((await route('activate', {}, ENV, provider)).status).toBe(400);
  });
});

describe('validation, packs and removal', () => {
  it('re-validates, flags refunded keys as revoked, and serves packs only to pack tokens', async () => {
    const packToken = await signToken({ v: 1, ent: 'bible-characters', key: KEY, iid: 'inst-1', iat: 1 }, SECRET);
    const gameToken = await signToken({ v: 1, ent: 'game', key: KEY, iid: 'inst-1', iat: 1 }, SECRET);
    const ok = fakeProvider();
    expect((await route('validate', { token: gameToken }, ENV, ok.provider)).body.ok).toBe(true);
    expect(((await route('pack', { token: packToken }, ENV, ok.provider)).body.pack as { id: string }).id).toBe('bible-characters');
    expect((await route('pack', { token: gameToken }, ENV, ok.provider)).status).toBe(400);
    const refunded = fakeProvider({}, { ok: false, status: 'disabled', error: 'License key is disabled.' });
    const res = await route('validate', { token: gameToken }, ENV, refunded.provider);
    expect(res.body).toMatchObject({ ok: false, revoked: true });
    expect((await route('deactivate', { token: gameToken }, ENV, ok.provider)).body.ok).toBe(true);
  });

  it('turns an unreachable provider into a friendly retryable error', async () => {
    const provider = lemonSqueezyClient(async () => {
      throw new Error('offline');
    });
    const res = await route('activate', { key: KEY }, ENV, provider);
    expect(res.status).toBe(502);
    expect(res.body.retry).toBe(true);
  });

  it('speaks the Lemon Squeezy wire format', async () => {
    let sent = '';
    const provider = lemonSqueezyClient(async (_url, init) => {
      sent = String(init?.body);
      return new Response(
        JSON.stringify({
          activated: true,
          error: null,
          license_key: { status: 'active' },
          instance: { id: 'abc' },
          meta: { store_id: 777, product_id: 100, customer_name: 'R' },
        }),
      );
    });
    const res = await route('activate', { key: KEY, deviceName: 'TV <script>' }, ENV, provider);
    expect(res.body.entitlement).toBe('game');
    expect(sent).toContain(`license_key=${KEY}`);
    expect(sent).toContain('instance_name=TV+script');
  });
});

describe('owner key', () => {
  const OWNER_KEY = 'owner-0123456789abcdef0123456789';
  const OWNER_ONLY = { LICENSE_SIGNING_SECRET: SECRET, OWNER_KEY };

  it('unlocks the game and every pack before the store exists', async () => {
    const { provider, calls } = fakeProvider();
    const res = await route('activate', { key: OWNER_KEY }, OWNER_ONLY, provider);
    expect(res.status).toBe(200);
    expect(res.body.entitlement).toBe('owner');
    expect((res.body.packs as unknown[]).length).toBe(QUESTION_PACKS.length);
    expect(calls).toEqual([]);
    expect((await route('catalog', {}, OWNER_ONLY, provider)).status).toBe(503);
    expect((await route('activate', { key: KEY }, OWNER_ONLY, provider)).status).toBe(503);
  });

  it('validates and re-sends packs, and stops working when the owner key changes', async () => {
    const { provider } = fakeProvider();
    const token = (await route('activate', { key: OWNER_KEY }, OWNER_ONLY, provider)).body.token;
    expect((await route('validate', { token }, OWNER_ONLY, provider)).body.ok).toBe(true);
    expect(((await route('pack', { token, packId: 'little-ones' }, OWNER_ONLY, provider)).body.pack as { id: string }).id).toBe('little-ones');
    expect((await route('pack', { token, packId: 'nope' }, OWNER_ONLY, provider)).status).toBe(400);
    const rotated = { ...OWNER_ONLY, OWNER_KEY: 'another-owner-key-0123456789ab' };
    expect((await route('validate', { token }, rotated, provider)).body.revoked).toBe(true);
  });

  it('works alongside a live store', async () => {
    const { provider } = fakeProvider();
    const res = await route('activate', { key: OWNER_KEY }, { ...ENV, OWNER_KEY }, provider);
    expect(res.body.entitlement).toBe('owner');
  });
});

describe('bundles', () => {
  it('a Mega Pack key delivers every pack and can re-send any pack, including ones added later', async () => {
    const { provider } = fakeProvider({ productId: 300 });
    const res = await route('activate', { key: KEY }, ENV, provider);
    expect(res.body.entitlement).toBe('mega-pack');
    expect((res.body.packs as unknown[]).length).toBe(QUESTION_PACKS.length);
    expect(res.body.pack).toBeNull();
    const token = res.body.token;
    expect(((await route('pack', { token, packId: 'paradise-hope' }, ENV, provider)).body.pack as { id: string }).id).toBe('paradise-hope');
    expect((await route('pack', { token }, ENV, provider)).status).toBe(400);
  });

  it('a Complete Edition key is recognized as game plus packs', async () => {
    const { provider } = fakeProvider({ productId: 400 });
    const res = await route('activate', { key: KEY }, ENV, provider);
    expect(res.body.entitlement).toBe('complete');
    expect((res.body.packs as unknown[]).length).toBe(QUESTION_PACKS.length);
  });

  it('a single-pack key cannot fetch other packs', async () => {
    const packToken = await signToken({ v: 1, ent: 'bible-characters', key: KEY, iid: 'inst-1', iat: 1 }, SECRET);
    const { provider } = fakeProvider();
    const res = await route('pack', { token: packToken, packId: 'little-ones' }, ENV, provider);
    expect((res.body.pack as { id: string }).id).toBe('bible-characters');
  });
});

describe('bundles cover the packs released by the purchase date', () => {
  const futurePack = { id: 'future-pack', name: 'Future', description: 'Later', released: '2099-01-01', questions: QUESTION_PACKS[0].questions };

  it('a Mega Pack bought today gets today\'s packs, not one released later', async () => {
    QUESTION_PACKS.push(futurePack);
    try {
      const { provider } = fakeProvider({ productId: 300, purchasedAt: Date.parse('2026-10-01T12:00:00Z') });
      const res = await route('activate', { key: KEY }, ENV, provider);
      const ids = res.body.packIds as string[];
      expect(ids).not.toContain('future-pack');
      expect(ids.length).toBe(QUESTION_PACKS.length - 1);
      expect((res.body.packs as unknown[]).length).toBe(QUESTION_PACKS.length - 1);
      const token = res.body.token;
      const later = await route('pack', { token, packId: 'future-pack' }, ENV, provider);
      expect(later.status).toBe(403);
      expect(later.body.notIncluded).toBe(true);
      expect((await route('pack', { token, packId: 'little-ones' }, ENV, provider)).status).toBe(200);
      expect((await route('validate', { token }, ENV, provider)).body.packIds).toEqual(ids);
    } finally {
      QUESTION_PACKS.pop();
    }
  });

  it('a Mega Pack bought after a release includes it; the owner key always gets everything', async () => {
    QUESTION_PACKS.push(futurePack);
    try {
      const { provider } = fakeProvider({ productId: 300, purchasedAt: Date.parse('2099-02-01T00:00:00Z') });
      expect((await route('activate', { key: KEY }, ENV, provider)).body.packIds).toContain('future-pack');
      const owner = await route('activate', { key: 'owner-0123456789abcdef0123456789' }, { ...ENV, OWNER_KEY: 'owner-0123456789abcdef0123456789' }, provider);
      expect((owner.body.packs as { id: string }[]).map((p) => p.id)).toContain('future-pack');
    } finally {
      QUESTION_PACKS.pop();
    }
  });
});

describe('launch promo', () => {
  it('is offered until it ends, and a malformed setting is ignored', async () => {
    const { provider } = fakeProvider();
    const promo = JSON.stringify({ code: 'LAUNCH25', percent: 25, ends: '2099-01-01T00:00:00Z' });
    expect((await route('catalog', {}, { ...ENV, PROMO: promo }, provider)).body.promo).toMatchObject({ code: 'LAUNCH25', percent: 25 });
    const ended = JSON.stringify({ code: 'LAUNCH25', percent: 25, ends: '2020-01-01T00:00:00Z' });
    expect((await route('catalog', {}, { ...ENV, PROMO: ended }, provider)).body.promo).toBeNull();
    const bad = (await route('catalog', {}, { ...ENV, PROMO: '{"code":"x","percent":250}' }, provider));
    expect(bad.status).toBe(200);
    expect(bad.body.promo).toBeNull();
  });
});

describe('titles', () => {
  // A second title sharing the same store and signing secret, with its own product ids.
  const OTHER: TitleContent = {
    id: 'theopardy',
    name: 'Theopardy!',
    packs: [{ id: 'kings', name: 'Kings', description: 'Kings of Israel and Judah', released: '2026-01-01', questions: [{ id: 'k1' }] }],
    spanishPacks: {},
    messages: { notOpen: 'The Theopardy! store is not open yet.', wrongProduct: "That key isn't for Theopardy!.", deviceName: 'Theopardy! device' },
  };
  const OTHER_ENV = {
    LS_STORE_ID: '777',
    LICENSE_SIGNING_SECRET: SECRET,
    LS_CATALOG: JSON.stringify({
      game: { productId: 500, checkoutUrl: 'https://shop.example/theopardy' },
      kings: { productId: 501, checkoutUrl: 'https://shop.example/kings' },
    }),
  };

  it('stamps tokens with the title that issued them', async () => {
    const { provider } = fakeProvider();
    const token = (await route('activate', { key: KEY }, ENV, provider)).body.token;
    expect((await verifyToken(token, SECRET))?.t).toBe('showdown');
    const other = fakeProvider({ productId: 500 });
    const otherToken = (await routeFor('activate', { key: KEY }, OTHER_ENV, other.provider, OTHER)).body.token;
    expect((await verifyToken(otherToken, SECRET))?.t).toBe('theopardy');
  });

  it("refuses one title's key and token on another title", async () => {
    const { provider, calls } = fakeProvider();
    // A Ministry Showdown key (product 100) entered on the other title's site.
    const wrongKey = await routeFor('activate', { key: KEY }, OTHER_ENV, provider, OTHER);
    expect(wrongKey.status).toBe(400);
    expect(wrongKey.body.error).toBe("That key isn't for Theopardy!.");
    expect(calls).toContain('deactivate');

    // A Ministry Showdown token copied onto the other title's site.
    const token = (await route('activate', { key: KEY }, ENV, provider)).body.token;
    const validate = await routeFor('validate', { token }, OTHER_ENV, provider, OTHER);
    expect(validate.status).toBe(403);
    expect(validate.body.revoked).toBe(true);
    expect((await routeFor('pack', { token, packId: 'kings' }, OTHER_ENV, provider, OTHER)).status).toBe(403);
    expect((await routeFor('deactivate', { token }, OTHER_ENV, provider, OTHER)).status).toBe(403);
    // It still works where it was issued.
    expect((await route('validate', { token }, ENV, provider)).body.ok).toBe(true);
  });

  it('treats tokens issued before titles existed as Ministry Showdown tokens', async () => {
    const { provider } = fakeProvider();
    const legacy = await signToken({ v: 1, ent: 'game', key: KEY, iid: 'inst-1', iat: 1 }, SECRET);
    expect((await route('validate', { token: legacy }, ENV, provider)).body.ok).toBe(true);
    expect((await routeFor('validate', { token: legacy }, OTHER_ENV, provider, OTHER)).status).toBe(403);
  });

  it("serves only the running title's packs and wording", async () => {
    const other = fakeProvider({ productId: 501 });
    const res = await routeFor('activate', { key: KEY }, OTHER_ENV, other.provider, OTHER);
    expect((res.body.pack as { id: string }).id).toBe('kings');
    expect(parseConfigFor({ ...OTHER_ENV, LS_CATALOG: JSON.stringify({ game: { productId: 500, checkoutUrl: 'https://x' }, 'bible-characters': { productId: 9, checkoutUrl: 'https://x' } }) }, OTHER).ok).toBe(false);
    expect((await routeFor('catalog', {}, {}, other.provider, OTHER)).body.error).toBe('The Theopardy! store is not open yet.');
  });
});
