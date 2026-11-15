import { msg } from '../i18n/msg';
import { langStore } from '../i18n/i18n';
import { STORAGE_KEYS } from '../lib/storage';
import { createPersistentStore, type PersistentStore } from '../state/persistentStore';

/*
 * Purchases on this device, shared by every title. Each record holds a
 * server-signed token that proves the key was checked; the token is what the
 * server uses to re-check the key later, move it to another device, or re-send
 * a pack's questions.
 *
 * `allPacks` is set by bundles and the owner key. It covers every pack the
 * purchase includes, which a title can add to its library through `onPack`.
 *
 * A title creates one client (createLicenseClient) and builds its store screen
 * on it. What a pack contains is the title's business: the client only hands
 * the payload over.
 */

export interface LicenseRecord {
  entitlement: string;
  token: string;
  keyHint: string;
  activatedAt: number;
  lastCheckedAt: number;
  /** For the all-packs record: the packs it covers. Missing means every pack (the owner key). */
  packIds?: string[];
}

export interface LicenseState {
  game: LicenseRecord | null;
  allPacks: LicenseRecord | null;
  packs: Record<string, LicenseRecord>;
  /** Packs already added to the library once, so deleted sets aren't re-added. */
  installedPackIds: string[];
}

export interface PackPayload {
  id: string;
  name: string;
  description: string;
  questions: unknown[];
  lang?: string;
}

export interface StoreProduct {
  entitlement: string;
  checkoutUrl: string;
  price: string | null;
}

export interface StorePromo {
  code: string;
  percent: number;
  /** ms timestamp */
  ends: number;
}

export interface Purchase {
  token: string;
  /** What the key grants: 'game', 'owner', a bundle id or a pack id. */
  grant: string;
  keyHint: string;
  activatedAt: number;
}

export type ActivateResult = { ok: true; entitlement: string; addedPacks: number; alreadyOwned: boolean } | { ok: false; error: string };

export type ApiReply = { ok: true; [key: string]: unknown } | { ok: false; error: string; revoked?: boolean; retry?: boolean; offline?: boolean };

export interface LicenseClientOptions {
  /** Entitlements that cover every pack. The owner key always does. */
  bundles?: readonly string[];
  /** Bundles that include packs only, not the game itself. */
  packOnlyBundles?: readonly string[];
  /** Called for each pack the server delivers. Return false when the pack was already in the library. */
  onPack?: (payload: PackPayload) => boolean;
  /** Replaces fetch, for tests. */
  fetchImpl?: typeof fetch;
}

const REVALIDATE_EVERY_MS = 7 * 24 * 60 * 60 * 1000;
const OWNER = 'owner';

/** Reads the (unsigned, public) payload of a token to see what it grants. */
export function tokenGrant(token: string): string | null {
  try {
    const body = token.split('.')[0];
    const padded = body.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((body.length + 3) % 4);
    const payload = JSON.parse(atob(padded)) as { ent?: unknown };
    return typeof payload.ent === 'string' ? payload.ent : null;
  } catch {
    return null;
  }
}

/** Adds the sale code to a checkout link so the discount is already applied. */
export function withDiscount(checkoutUrl: string, promo: StorePromo | null): string {
  if (!promo) return checkoutUrl;
  const sep = checkoutUrl.includes('?') ? '&' : '?';
  return `${checkoutUrl}${sep}checkout%5Bdiscount_code%5D=${encodeURIComponent(promo.code)}`;
}

function isRecord(value: unknown): value is LicenseRecord {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Partial<LicenseRecord>;
  return typeof r.entitlement === 'string' && typeof r.token === 'string' && typeof r.keyHint === 'string' && typeof r.activatedAt === 'number';
}

function cleanRecord(r: LicenseRecord): LicenseRecord {
  const out: LicenseRecord = { ...r, lastCheckedAt: Number(r.lastCheckedAt) || 0 };
  if (!Array.isArray(r.packIds)) delete out.packIds;
  else out.packIds = r.packIds.filter((id): id is string => typeof id === 'string');
  return out;
}

function sanitize(raw: unknown): LicenseState {
  const state: LicenseState = { game: null, allPacks: null, packs: {}, installedPackIds: [] };
  if (typeof raw !== 'object' || raw === null) return state;
  const r = raw as { game?: unknown; allPacks?: unknown; packs?: unknown; installedPackIds?: unknown };
  if (isRecord(r.game) && r.game.entitlement === 'game') state.game = cleanRecord(r.game);
  if (isRecord(r.allPacks) && r.allPacks.entitlement === 'all-packs') state.allPacks = cleanRecord(r.allPacks);
  if (typeof r.packs === 'object' && r.packs !== null) {
    for (const [id, rec] of Object.entries(r.packs as Record<string, unknown>)) {
      if (isRecord(rec) && rec.entitlement === id) state.packs[id] = cleanRecord(rec);
    }
  }
  if (Array.isArray(r.installedPackIds)) state.installedPackIds = r.installedPackIds.filter((id): id is string => typeof id === 'string');
  return state;
}

function isPackPayload(value: unknown): value is PackPayload {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Partial<PackPayload>;
  return typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.questions);
}

function deviceName(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const os = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'Chromebook' : /Linux/.test(ua) ? 'Linux' : 'device';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'browser';
  return `${browser} on ${os}`;
}

export interface LicenseClient {
  store: PersistentStore<LicenseState>;
  useLicenses(): LicenseState;
  isGameUnlocked(): boolean;
  useGameUnlocked(): boolean;
  ownsPack(packId: string): boolean;
  activateKey(rawKey: string): Promise<ActivateResult>;
  listPurchases(state: LicenseState): Purchase[];
  /** Frees this device's activation so the key can be used on another device. */
  deactivatePurchase(token: string): Promise<{ ok: true } | { ok: false; error: string }>;
  /** Re-checks licenses about once a week when online, so refunded keys stop working. Being offline never locks anyone out. */
  revalidateIfDue(now?: number): Promise<void>;
  /** Checkout links and prices come from the server so they can change without an app update. Null while the store is closed. */
  loadStoreCatalog(force?: boolean): Promise<StoreProduct[] | null>;
  loadPromo(): Promise<StorePromo | null>;
  /** Downloads an owned pack in the given language (after a language switch, or a pack released after a bundle was activated). */
  requestPack(packId: string, lang: string): Promise<{ ok: true; pack: PackPayload } | { ok: false; error: string }>;
}

export function createLicenseClient(options: LicenseClientOptions = {}): LicenseClient {
  const allPackGrants = new Set<string>([OWNER, ...(options.bundles ?? [])]);
  const packOnly = new Set<string>(options.packOnlyBundles ?? []);
  const store = createPersistentStore<LicenseState>(STORAGE_KEYS.license, sanitize);
  const doFetch = (...args: Parameters<typeof fetch>) => (options.fetchImpl ?? fetch)(...args);

  async function post(path: string, body: unknown): Promise<ApiReply> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { ok: false, error: msg('You are offline. Connect to the internet and try again.'), offline: true };
    }
    try {
      const get = path === '/api/catalog';
      const res = await doFetch(path, { method: get ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json' }, body: get ? undefined : JSON.stringify(body) });
      const data = (await res.json().catch(() => null)) as ApiReply | null;
      if (!data || typeof data !== 'object') return { ok: false, error: msg('The store sent an unexpected reply. Try again in a minute.'), retry: true };
      return data;
    } catch {
      return { ok: false, error: msg("Couldn't reach the store. Check your connection and try again."), offline: true };
    }
  }

  function deliver(payloads: unknown[]): number {
    let added = 0;
    for (const payload of payloads) {
      if (!isPackPayload(payload) || !options.onPack) continue;
      if (options.onPack(payload) !== false) added += 1;
    }
    return added;
  }

  async function activateKey(rawKey: string): Promise<ActivateResult> {
    const key = rawKey.trim();
    if (!key) return { ok: false, error: msg('Paste the license key from your purchase email.') };
    const reply = await post('/api/activate', { key, deviceName: deviceName(), lang: langStore.get() });
    if (!reply.ok) return { ok: false, error: reply.error };
    const entitlement = typeof reply.entitlement === 'string' ? reply.entitlement : '';
    const token = typeof reply.token === 'string' ? reply.token : '';
    if (!entitlement || !token) return { ok: false, error: msg('The store sent an unexpected reply. Try again in a minute.') };
    const now = Date.now();
    const record: LicenseRecord = { entitlement, token, keyHint: typeof reply.keyHint === 'string' ? reply.keyHint : '', activatedAt: now, lastCheckedAt: now };
    const before = store.get();

    if (allPackGrants.has(entitlement)) {
      const grantsGame = !packOnly.has(entitlement);
      const packIds = Array.isArray(reply.packIds) ? reply.packIds.filter((id): id is string => typeof id === 'string') : null;
      store.set((prev) => ({
        ...prev,
        game: grantsGame ? { ...record, entitlement: 'game' } : prev.game,
        allPacks: { ...record, entitlement: 'all-packs', ...(packIds ? { packIds } : {}) },
      }));
      const addedPacks = deliver(Array.isArray(reply.packs) ? reply.packs : []);
      return { ok: true, entitlement, addedPacks, alreadyOwned: before.allPacks !== null && (!grantsGame || before.game !== null) };
    }

    if (entitlement === 'game') {
      store.set((prev) => ({ ...prev, game: record }));
      return { ok: true, entitlement, addedPacks: 0, alreadyOwned: before.game !== null };
    }
    store.set((prev) => ({ ...prev, packs: { ...prev.packs, [entitlement]: record } }));
    return { ok: true, entitlement, addedPacks: deliver([reply.pack]), alreadyOwned: !!before.packs[entitlement] };
  }

  /** Removes every record that came from the same key activation (one bundle key covers the game and packs). */
  function removeRecordsWithToken(token: string): void {
    store.set((prev) => {
      const packs: Record<string, LicenseRecord> = {};
      for (const [id, rec] of Object.entries(prev.packs)) if (rec.token !== token) packs[id] = rec;
      return { ...prev, game: prev.game?.token === token ? null : prev.game, allPacks: prev.allPacks?.token === token ? null : prev.allPacks, packs };
    });
  }

  function listPurchases(state: LicenseState): Purchase[] {
    const seen = new Map<string, Purchase>();
    const add = (rec: LicenseRecord | null, fallback: string) => {
      if (!rec || seen.has(rec.token)) return;
      seen.set(rec.token, { token: rec.token, grant: tokenGrant(rec.token) ?? fallback, keyHint: rec.keyHint, activatedAt: rec.activatedAt });
    };
    add(state.game, 'game');
    add(state.allPacks, 'all-packs');
    Object.entries(state.packs).forEach(([id, rec]) => add(rec, id));
    return [...seen.values()];
  }

  async function deactivatePurchase(token: string): Promise<{ ok: true } | { ok: false; error: string }> {
    const reply = await post('/api/deactivate', { token });
    if (!reply.ok) return { ok: false, error: reply.error };
    removeRecordsWithToken(token);
    return { ok: true };
  }

  async function revalidateIfDue(now = Date.now()): Promise<void> {
    const state = store.get();
    const byToken = new Map<string, LicenseRecord>();
    [state.game, state.allPacks, ...Object.values(state.packs)].forEach((r) => {
      if (r && !byToken.has(r.token)) byToken.set(r.token, r);
    });
    for (const record of byToken.values()) {
      if (now - record.lastCheckedAt < REVALIDATE_EVERY_MS) continue;
      const reply = await post('/api/validate', { token: record.token });
      if (reply.ok) {
        store.set((prev) => {
          const touch = (r: LicenseRecord | null) => (r && r.token === record.token ? { ...r, lastCheckedAt: now } : r);
          const packs: Record<string, LicenseRecord> = {};
          for (const [id, rec] of Object.entries(prev.packs)) packs[id] = touch(rec) as LicenseRecord;
          return { ...prev, game: touch(prev.game), allPacks: touch(prev.allPacks), packs };
        });
      } else if (reply.revoked) {
        removeRecordsWithToken(record.token);
      }
    }
  }

  let catalogCache: Promise<{ products: StoreProduct[]; promo: StorePromo | null } | null> | null = null;
  function loadStoreInfo(force = false) {
    if (!catalogCache || force) {
      catalogCache = post('/api/catalog', null).then((reply) => {
        if (!reply.ok || !Array.isArray(reply.products)) {
          catalogCache = null;
          return null;
        }
        const products = (reply.products as StoreProduct[]).filter((p) => typeof p.entitlement === 'string' && typeof p.checkoutUrl === 'string');
        const raw = reply.promo as Partial<StorePromo> | null | undefined;
        const promo = raw && typeof raw.code === 'string' && typeof raw.percent === 'number' && typeof raw.ends === 'number' && raw.ends > Date.now() ? { code: raw.code, percent: raw.percent, ends: raw.ends } : null;
        return { products, promo };
      });
    }
    return catalogCache;
  }

  return {
    store,
    useLicenses: () => store.useValue(),
    isGameUnlocked: () => store.get().game !== null,
    useGameUnlocked: () => store.useValue().game !== null,
    ownsPack: (packId) => {
      const state = store.get();
      return !!state.packs[packId] || (!!state.allPacks && (!state.allPacks.packIds || state.allPacks.packIds.includes(packId)));
    },
    activateKey,
    listPurchases,
    deactivatePurchase,
    revalidateIfDue,
    loadStoreCatalog: (force = false) => loadStoreInfo(force).then((info) => info?.products ?? null),
    loadPromo: () => loadStoreInfo().then((info) => (info?.promo && info.promo.ends > Date.now() ? info.promo : null)),
    requestPack: async (packId, lang) => {
      const state = store.get();
      const record = state.packs[packId] ?? (state.allPacks && (!state.allPacks.packIds || state.allPacks.packIds.includes(packId)) ? state.allPacks : null);
      if (!record) return { ok: false, error: msg('This pack is not activated on this device.') };
      const reply = await post('/api/pack', { token: record.token, packId, lang });
      if (!reply.ok) {
        if (reply.revoked) removeRecordsWithToken(record.token);
        return { ok: false, error: reply.error };
      }
      if (!isPackPayload(reply.pack)) return { ok: false, error: msg('The store sent an unexpected reply. Try again in a minute.') };
      return { ok: true, pack: reply.pack };
    },
  };
}
