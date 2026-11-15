import { describe, expect, it } from 'vitest';
import { createLicenseClient, tokenGrant, withDiscount, type PackPayload } from './licenseClient';

/** A token shaped like the server's: base64url JSON payload, a dot, a signature. */
function token(ent: string): string {
  const body = btoa(JSON.stringify({ v: 1, ent, key: 'k', iid: 'i', iat: 1 })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${body}.sig-${ent}`;
}

type Handler = (body: Record<string, unknown>) => Record<string, unknown>;

function server(routes: Record<string, Handler>) {
  const calls: string[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = String(input);
    calls.push(path);
    const handler = routes[path];
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
    return { json: async () => (handler ? handler(body) : { ok: false, error: 'Unknown request.' }) } as Response;
  }) as typeof fetch;
  return { fetchImpl, calls };
}

function freshClient(routes: Record<string, Handler>, extra: Parameters<typeof createLicenseClient>[0] = {}) {
  const { fetchImpl, calls } = server(routes);
  const client = createLicenseClient({ fetchImpl, ...extra });
  client.store.set({ game: null, allPacks: null, packs: {}, installedPackIds: [] });
  return { client, calls };
}

const pack: PackPayload = { id: 'kings', name: 'Kings', description: 'Kings of Israel and Judah', questions: [{ id: 'k1' }] };

describe('license client', () => {
  it('unlocks the game with a game key', async () => {
    const { client } = freshClient({ '/api/activate': () => ({ ok: true, entitlement: 'game', token: token('game'), keyHint: 'ABCD' }) });
    expect(client.isGameUnlocked()).toBe(false);
    const result = await client.activateKey('  some-key-1234567890  ');
    expect(result).toEqual({ ok: true, entitlement: 'game', addedPacks: 0, alreadyOwned: false });
    expect(client.isGameUnlocked()).toBe(true);
    expect(client.listPurchases(client.store.get())).toMatchObject([{ grant: 'game', keyHint: 'ABCD' }]);
    expect((await client.activateKey('some-key-1234567890')).ok && true).toBe(true);
  });

  it('reports the server message when a key is refused, and asks for a key when none is typed', async () => {
    const { client, calls } = freshClient({ '/api/activate': () => ({ ok: false, error: "That key isn't for this game." }) });
    expect(await client.activateKey('bad-key-1234567890')).toEqual({ ok: false, error: "That key isn't for this game." });
    expect(client.isGameUnlocked()).toBe(false);
    const empty = await client.activateKey('   ');
    expect(empty.ok).toBe(false);
    expect(calls).toHaveLength(1);
  });

  it('the owner key unlocks the game and hands every pack to the title', async () => {
    const delivered: string[] = [];
    const { client } = freshClient(
      { '/api/activate': () => ({ ok: true, entitlement: 'owner', token: token('owner'), keyHint: 'OWNR', packs: [pack, { nope: true }] }) },
      { onPack: (p) => delivered.push(p.id) > 0 },
    );
    const result = await client.activateKey('owner-0123456789abcdef0123456789');
    expect(result).toMatchObject({ ok: true, entitlement: 'owner', addedPacks: 1 });
    expect(client.isGameUnlocked()).toBe(true);
    expect(client.ownsPack('anything')).toBe(true);
    expect(delivered).toEqual(['kings']);
    // One key is one purchase, even though it wrote two records.
    expect(client.listPurchases(client.store.get())).toHaveLength(1);
  });

  it('a pack-only bundle covers its packs without unlocking the game', async () => {
    const { client } = freshClient(
      { '/api/activate': () => ({ ok: true, entitlement: 'mega-pack', token: token('mega-pack'), keyHint: 'MEGA', packIds: ['kings'], packs: [pack] }) },
      { bundles: ['mega-pack', 'complete'], packOnlyBundles: ['mega-pack'], onPack: () => true },
    );
    await client.activateKey('mega-key-1234567890');
    expect(client.isGameUnlocked()).toBe(false);
    expect(client.ownsPack('kings')).toBe(true);
    expect(client.ownsPack('later-pack')).toBe(false);
  });

  it('a single pack key delivers that pack', async () => {
    const got: PackPayload[] = [];
    const { client } = freshClient({ '/api/activate': () => ({ ok: true, entitlement: 'kings', token: token('kings'), keyHint: 'KING', pack }) }, { onPack: (p) => got.push(p) > 0 });
    expect(await client.activateKey('pack-key-1234567890')).toMatchObject({ ok: true, entitlement: 'kings', addedPacks: 1 });
    expect(client.ownsPack('kings')).toBe(true);
    expect(got[0].questions).toHaveLength(1);
  });

  it('removing a purchase frees the key and locks the game on this device', async () => {
    const { client } = freshClient({
      '/api/activate': () => ({ ok: true, entitlement: 'game', token: token('game'), keyHint: 'ABCD' }),
      '/api/deactivate': () => ({ ok: true }),
    });
    await client.activateKey('some-key-1234567890');
    expect(await client.deactivatePurchase(token('game'))).toEqual({ ok: true });
    expect(client.isGameUnlocked()).toBe(false);
  });

  it('re-checks a license after a week and removes it only when the server says it was revoked', async () => {
    let reply: Record<string, unknown> = { ok: true, entitlement: 'game' };
    const { client, calls } = freshClient({
      '/api/activate': () => ({ ok: true, entitlement: 'game', token: token('game'), keyHint: 'ABCD' }),
      '/api/validate': () => reply,
    });
    await client.activateKey('some-key-1234567890');
    const day = 24 * 60 * 60 * 1000;
    await client.revalidateIfDue(Date.now() + day);
    expect(calls.filter((c) => c === '/api/validate')).toHaveLength(0);

    await client.revalidateIfDue(Date.now() + 8 * day);
    expect(calls.filter((c) => c === '/api/validate')).toHaveLength(1);
    expect(client.isGameUnlocked()).toBe(true);

    // The store being down must not lock anyone out.
    reply = { ok: false, error: 'The store is not open yet.', retry: true };
    await client.revalidateIfDue(Date.now() + 30 * day);
    expect(client.isGameUnlocked()).toBe(true);

    reply = { ok: false, error: 'This license is no longer active.', revoked: true };
    await client.revalidateIfDue(Date.now() + 60 * day);
    expect(client.isGameUnlocked()).toBe(false);
  });

  it('loads prices and an active sale from the server, and nothing while the store is closed', async () => {
    const open = freshClient({
      '/api/catalog': () => ({ ok: true, products: [{ entitlement: 'game', checkoutUrl: 'https://shop.example/game', price: '$1' }, { bad: true }], promo: { code: 'LAUNCH25', percent: 25, ends: Date.now() + 60_000 } }),
    });
    expect(await open.client.loadStoreCatalog()).toEqual([{ entitlement: 'game', checkoutUrl: 'https://shop.example/game', price: '$1' }]);
    expect((await open.client.loadPromo())?.code).toBe('LAUNCH25');
    const closed = freshClient({ '/api/catalog': () => ({ ok: false, error: 'The store is not open yet.' }) });
    expect(await closed.client.loadStoreCatalog()).toBeNull();
    expect(await closed.client.loadPromo()).toBeNull();
  });

  it('reads what a token grants and adds a sale code to a checkout link', () => {
    expect(tokenGrant(token('owner'))).toBe('owner');
    expect(tokenGrant('not-a-token')).toBeNull();
    const promo = { code: 'LAUNCH25', percent: 25, ends: 1 };
    expect(withDiscount('https://shop.example/game', promo)).toBe('https://shop.example/game?checkout%5Bdiscount_code%5D=LAUNCH25');
    expect(withDiscount('https://shop.example/game?x=1', promo)).toContain('&checkout');
    expect(withDiscount('https://shop.example/game', null)).toBe('https://shop.example/game');
  });
});
