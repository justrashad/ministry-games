import { msg } from '../../src/core/i18n/msg';

/*
 * License checks shared by every title, independent of the hosting platform.
 * Each title's site runs this with its own TitleContent (name, packs, wording)
 * and its own environment, so a key or token for one title is refused by another.
 * The payment provider (Lemon Squeezy) is isolated in `ProviderClient` so it can be
 * swapped (for example to Stripe Managed Payments) without touching the rest.
 *
 * Environment (set in Netlify > Site configuration > Environment variables):
 *   LS_STORE_ID              numeric Lemon Squeezy store id
 *   LS_CATALOG               JSON: { "<entitlement>": { "productId": 123, "checkoutUrl": "https://…", "price": "$39.99" } }
 *                            entitlement is "game", "mega-pack" (all packs), "complete" (game + all packs)
 *                            or a pack id such as "bible-characters"
 *   LICENSE_SIGNING_SECRET   random string, at least 32 characters
 *   PROMO                    optional JSON: { "code": "LAUNCH25", "percent": 25, "ends": "2026-10-10T23:59:59-05:00" }
 *                            A store-wide sale: the site shows a banner and applies the code at checkout until it ends.
 *                            The same code must exist in Lemon Squeezy (Store → Discounts). Invalid values are ignored.
 *   OWNER_KEY                optional, at least 24 characters: the owner's master key. It unlocks the
 *                            game and every pack on any device, and works before the store is set up.
 */

export type Entitlement = string; // 'game' or a pack id

/** A paid question pack as the server stores it. Q is the title's question shape. */
export interface PackDef<Q = unknown> {
  id: string;
  name: string;
  description: string;
  /** Release day (YYYY-MM-DD). Bundles include the packs released on or before the day they were bought. */
  released: string;
  questions: Q[];
}

export interface TranslatedPack<Q = unknown> {
  name: string;
  description: string;
  questions: Q[];
}

/** Everything the license server needs to know about the title it is serving. */
export interface TitleContent<Q = unknown> {
  /** Short id written into every license token, so one title's token can't be used on another. */
  id: string;
  name: string;
  packs: PackDef<Q>[];
  /** Spanish versions keyed by pack id. A pack that isn't here is served in English. */
  spanishPacks: Record<string, TranslatedPack<Q>>;
  messages: {
    /** Shown while the store has no products yet. */
    notOpen: string;
    /** Shown when a valid key belongs to some other product. */
    wrongProduct: string;
    /** Name given to a device that didn't send one. */
    deviceName: string;
  };
}

/** Tokens issued before titles existed carry no title id; they all belong to this one. */
export const LEGACY_TITLE_ID = 'showdown';

export function findPack<Q>(title: TitleContent<Q>, id: string): PackDef<Q> | undefined {
  return title.packs.find((p) => p.id === id);
}

export interface CatalogEntry {
  entitlement: Entitlement;
  productId: number;
  checkoutUrl: string;
  price: string | null;
}

export interface ServerConfig {
  title: TitleContent;
  /** null until Lemon Squeezy is connected; the owner key still works. */
  storeId: number | null;
  catalog: CatalogEntry[];
  secret: string;
  ownerKey: string | null;
  promo: Promo | null;
}

export interface Promo {
  code: string;
  percent: number;
  /** ms timestamp */
  ends: number;
}

/** Reads the optional PROMO setting. Anything malformed is ignored so a typo can't close the store. */
export function parsePromo(raw: string | undefined): Promo | null {
  if (!raw?.trim()) return null;
  try {
    const v = JSON.parse(raw) as { code?: unknown; percent?: unknown; ends?: unknown };
    const code = typeof v.code === 'string' ? v.code.trim() : '';
    const percent = Number(v.percent);
    const ends = typeof v.ends === 'string' ? Date.parse(v.ends) : NaN;
    if (!/^[A-Za-z0-9_-]{3,40}$/.test(code) || !Number.isInteger(percent) || percent < 1 || percent > 99 || !Number.isFinite(ends)) return null;
    return { code, percent, ends };
  } catch {
    return null;
  }
}

export const OWNER = 'owner';

/** Entitlements that cover every pack, including packs released after the purchase. */
export const ALL_PACK_ENTITLEMENTS = new Set([OWNER, 'mega-pack', 'complete']);
const BUNDLES = new Set(['mega-pack', 'complete']);

export function storeOpen(config: ServerConfig): boolean {
  return config.storeId !== null && config.catalog.some((c) => c.entitlement === 'game');
}

export type ConfigResult = { ok: true; config: ServerConfig } | { ok: false; error: string };

export function parseConfig(env: Record<string, string | undefined>, title: TitleContent): ConfigResult {
  const secret = env.LICENSE_SIGNING_SECRET ?? '';
  if (secret.length < 32) return { ok: false, error: 'LICENSE_SIGNING_SECRET must be at least 32 characters.' };
  const ownerRaw = (env.OWNER_KEY ?? '').trim();
  if (ownerRaw && ownerRaw.length < 24) return { ok: false, error: 'OWNER_KEY must be at least 24 characters.' };
  const ownerKey = ownerRaw || null;

  // The Lemon Squeezy half is optional so the owner key works before the store exists.
  const hasStore = !!(env.LS_STORE_ID || env.LS_CATALOG);
  if (!hasStore) return { ok: true, config: { title, storeId: null, catalog: [], secret, ownerKey, promo: parsePromo(env.PROMO) } };

  const storeId = Number(env.LS_STORE_ID);
  if (!Number.isInteger(storeId) || storeId <= 0) return { ok: false, error: 'LS_STORE_ID is missing or not a number.' };
  let raw: unknown;
  try {
    raw = JSON.parse(env.LS_CATALOG ?? '');
  } catch {
    return { ok: false, error: 'LS_CATALOG is not valid JSON.' };
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ok: false, error: 'LS_CATALOG must be a JSON object.' };
  const catalog: CatalogEntry[] = [];
  for (const [entitlement, value] of Object.entries(raw as Record<string, unknown>)) {
    if (entitlement !== 'game' && !BUNDLES.has(entitlement) && !findPack(title, entitlement)) return { ok: false, error: `LS_CATALOG has an unknown entry "${entitlement}".` };
    const v = value as { productId?: unknown; checkoutUrl?: unknown; price?: unknown };
    const productId = Number(v?.productId);
    if (!Number.isInteger(productId) || productId <= 0) return { ok: false, error: `LS_CATALOG "${entitlement}" needs a numeric productId.` };
    if (typeof v.checkoutUrl !== 'string' || !/^https:\/\//.test(v.checkoutUrl)) return { ok: false, error: `LS_CATALOG "${entitlement}" needs an https checkoutUrl.` };
    catalog.push({ entitlement, productId, checkoutUrl: v.checkoutUrl, price: typeof v.price === 'string' ? v.price : null });
  }
  if (!catalog.some((c) => c.entitlement === 'game')) return { ok: false, error: 'LS_CATALOG needs a "game" entry.' };
  return { ok: true, config: { title, storeId, catalog, secret, ownerKey, promo: parsePromo(env.PROMO) } };
}

/* ------------------------------ tokens --------------------------------- */

export interface TokenPayload {
  v: 1;
  ent: Entitlement;
  key: string;
  iid: string;
  iat: number;
  /** Id of the title that issued the token. Missing on tokens issued before titles existed. */
  t?: string;
  /** Purchase time (ms) for Mega Pack / Complete Edition keys: they cover packs released up to that day. */
  pd?: number;
}

const encoder = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(text: string): Uint8Array {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signToken(payload: TokenPayload, secret: string): Promise<string> {
  const body = b64url(encoder.encode(JSON.stringify(payload)));
  return `${body}.${b64url(await hmac(secret, body))}`;
}

export async function verifyToken(token: unknown, secret: string): Promise<TokenPayload | null> {
  if (typeof token !== 'string' || token.length > 2000) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    if (!constantTimeEqual(fromB64url(sig), await hmac(secret, body))) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Partial<TokenPayload>;
    if (payload.v !== 1 || typeof payload.ent !== 'string' || typeof payload.key !== 'string' || typeof payload.iid !== 'string') return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/* --------------------------- provider client ---------------------------- */

export interface ProviderLicense {
  ok: boolean;
  error: string | null;
  instanceId: string | null;
  storeId: number | null;
  productId: number | null;
  status: string | null;
  customerName: string | null;
  /** When the license key was created, i.e. the purchase time (ms), if the provider reports it. */
  purchasedAt?: number | null;
}

export interface ProviderClient {
  activate(key: string, instanceName: string): Promise<ProviderLicense>;
  validate(key: string, instanceId: string): Promise<ProviderLicense>;
  deactivate(key: string, instanceId: string): Promise<{ ok: boolean; error: string | null }>;
}

export class ProviderUnavailable extends Error {}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const LS_BASE = 'https://api.lemonsqueezy.com/v1/licenses';

/** Lemon Squeezy License API. These endpoints need no API key; ownership is checked via meta.store_id/product_id. */
export function lemonSqueezyClient(fetchImpl: FetchLike = fetch): ProviderClient {
  const call = async (path: string, params: Record<string, string>): Promise<Record<string, unknown>> => {
    let res: Response;
    try {
      res = await fetchImpl(`${LS_BASE}/${path}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params).toString(),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ProviderUnavailable('The license service could not be reached.');
    }
    if (res.status >= 500) throw new ProviderUnavailable('The license service is having trouble.');
    try {
      return (await res.json()) as Record<string, unknown>;
    } catch {
      throw new ProviderUnavailable('The license service sent an unexpected reply.');
    }
  };
  const toLicense = (data: Record<string, unknown>, okField: 'activated' | 'valid'): ProviderLicense => {
    const meta = (data.meta ?? {}) as Record<string, unknown>;
    const lk = (data.license_key ?? {}) as Record<string, unknown>;
    const instance = (data.instance ?? null) as Record<string, unknown> | null;
    return {
      ok: data[okField] === true,
      error: typeof data.error === 'string' ? data.error : null,
      instanceId: instance && typeof instance.id === 'string' ? instance.id : null,
      storeId: typeof meta.store_id === 'number' ? meta.store_id : null,
      productId: typeof meta.product_id === 'number' ? meta.product_id : null,
      status: typeof lk.status === 'string' ? lk.status : null,
      customerName: typeof meta.customer_name === 'string' ? meta.customer_name : null,
      purchasedAt: typeof lk.created_at === 'string' && Number.isFinite(Date.parse(lk.created_at)) ? Date.parse(lk.created_at) : null,
    };
  };
  return {
    activate: async (key, instanceName) => toLicense(await call('activate', { license_key: key, instance_name: instanceName }), 'activated'),
    validate: async (key, instanceId) => toLicense(await call('validate', { license_key: key, instance_id: instanceId }), 'valid'),
    deactivate: async (key, instanceId) => {
      const data = await call('deactivate', { license_key: key, instance_id: instanceId });
      return { ok: data.deactivated === true, error: typeof data.error === 'string' ? data.error : null };
    },
  };
}

/* ------------------------------ handlers -------------------------------- */

export interface PackPayload {
  id: string;
  name: string;
  description: string;
  questions: unknown[];
  /** The language actually delivered: Spanish when a Spanish version exists, otherwise English. */
  lang: PackLang;
}

export type PackLang = 'en' | 'es';

export function requestedLang(body: Record<string, unknown>): PackLang {
  return body.lang === 'es' ? 'es' : 'en';
}

export type ApiResult = { status: number; body: Record<string, unknown> };

const fail = (status: number, error: string, extra: Record<string, unknown> = {}): ApiResult => ({ status, body: { ok: false, error, ...extra } });

function allPackPayloads(title: TitleContent, lang: PackLang, purchasedAt?: number): PackPayload[] {
  return coveredPacks(title, purchasedAt).map((p) => packPayload(title, p.id, lang)!);
}

/** Packs a bundle bought at `purchasedAt` includes; no date (the owner key) means every pack. */
export function coveredPacks<Q>(title: TitleContent<Q>, purchasedAt?: number): PackDef<Q>[] {
  if (purchasedAt === undefined) return title.packs;
  const day = new Date(purchasedAt).toISOString().slice(0, 10);
  return title.packs.filter((p) => p.released <= day);
}

const NOT_INCLUDED = msg("That pack came out after your purchase, so it isn't included. You can buy it on its own in the Store.");

function isOwnerKey(key: string, config: ServerConfig): boolean {
  if (!config.ownerKey) return false;
  const a = encoder.encode(key);
  const b = encoder.encode(config.ownerKey);
  return constantTimeEqual(a, b);
}

/** True when the token was issued by the title this server is running. */
function ownToken(payload: TokenPayload, config: ServerConfig): boolean {
  return (payload.t ?? LEGACY_TITLE_ID) === config.title.id;
}

function packPayload(title: TitleContent, ent: Entitlement, lang: PackLang = 'en'): PackPayload | null {
  const pack = findPack(title, ent);
  if (!pack) return null;
  const es = lang === 'es' ? title.spanishPacks[pack.id] : undefined;
  if (es) return { id: pack.id, name: es.name, description: es.description, questions: es.questions, lang: 'es' };
  return { id: pack.id, name: pack.name, description: pack.description, questions: pack.questions, lang: 'en' };
}

/** Turns Lemon Squeezy's short technical messages into plain language for families. */
export function friendlyProviderError(error: string | null): string {
  const text = error ?? '';
  if (/not found/i.test(text)) return msg("We couldn't find that key. Check it against your purchase email and try again.");
  if (/activation limit/i.test(text)) {
    return msg('This key is already active on the maximum number of devices. On a device you no longer use, open Store and choose "Remove from this device", then try again.');
  }
  if (/disabled|expired|inactive/i.test(text)) return msg('That license key is no longer active. Contact support if you think this is a mistake.');
  return text || 'That license key could not be activated.';
}

const KEY_PATTERN = /^[A-Za-z0-9-]{10,100}$/;
const BAD_STATUSES = new Set(['disabled', 'expired']);

function cleanDeviceName(raw: unknown, fallback: string): string {
  const text = typeof raw === 'string' ? raw.replace(/[^\w\s().,/-]/g, '').trim().slice(0, 60) : '';
  return text || fallback;
}

export async function handleActivate(body: Record<string, unknown>, config: ServerConfig, provider: ProviderClient): Promise<ApiResult> {
  const { title } = config;
  const key = typeof body.key === 'string' ? body.key.trim() : '';
  if (!KEY_PATTERN.test(key)) return fail(400, msg("That doesn't look like a license key. Copy it from your purchase email and try again."));
  if (isOwnerKey(key, config)) {
    const token = await signToken({ v: 1, ent: OWNER, key, iid: OWNER, iat: Date.now(), t: title.id }, config.secret);
    return { status: 200, body: { ok: true, entitlement: OWNER, token, keyHint: 'OWNR', customerName: null, pack: null, packs: allPackPayloads(title, requestedLang(body)) } };
  }
  if (!storeOpen(config)) return fail(503, title.messages.notOpen);
  const result = await provider.activate(key, cleanDeviceName(body.deviceName, title.messages.deviceName));
  if (!result.ok) return fail(400, friendlyProviderError(result.error), { reason: 'provider' });
  const entry = result.storeId === config.storeId ? config.catalog.find((c) => c.productId === result.productId) : undefined;
  if (!entry || !result.instanceId) {
    // A valid key from some other product: give the activation back so the owner loses nothing.
    if (result.instanceId && result.storeId === config.storeId) await provider.deactivate(key, result.instanceId).catch(() => undefined);
    return fail(400, title.messages.wrongProduct);
  }
  if (result.status && BAD_STATUSES.has(result.status)) {
    await provider.deactivate(key, result.instanceId).catch(() => undefined);
    return fail(403, msg('That license key is no longer active. Contact support if you think this is a mistake.'));
  }
  const isBundle = BUNDLES.has(entry.entitlement);
  const purchasedAt = isBundle ? (result.purchasedAt ?? Date.now()) : undefined;
  const token = await signToken({ v: 1, ent: entry.entitlement, key, iid: result.instanceId, iat: Date.now(), t: title.id, ...(isBundle ? { pd: purchasedAt } : {}) }, config.secret);
  return {
    status: 200,
    body: {
      ok: true,
      entitlement: entry.entitlement,
      token,
      keyHint: key.slice(-4).toUpperCase(),
      customerName: result.customerName,
      pack: entry.entitlement === 'game' || isBundle ? null : packPayload(title, entry.entitlement, requestedLang(body)),
      packs: isBundle ? allPackPayloads(title, requestedLang(body), purchasedAt) : null,
      packIds: isBundle ? coveredPacks(title, purchasedAt).map((p) => p.id) : null,
    },
  };
}

export async function handleValidate(body: Record<string, unknown>, config: ServerConfig, provider: ProviderClient): Promise<ApiResult> {
  const payload = await verifyToken(body.token, config.secret);
  if (!payload) return fail(401, msg('This license record is damaged. Enter your key again.'), { revoked: true });
  if (!ownToken(payload, config)) return fail(403, config.title.messages.wrongProduct, { revoked: true });
  if (payload.ent === OWNER) {
    return isOwnerKey(payload.key, config) ? { status: 200, body: { ok: true, entitlement: OWNER } } : fail(403, msg('The owner key has changed.'), { revoked: true });
  }
  if (!storeOpen(config)) return fail(503, config.title.messages.notOpen, { retry: true });
  const result = await provider.validate(payload.key, payload.iid);
  const stillOurs = result.storeId === null || result.storeId === config.storeId;
  if (!result.ok || !stillOurs || (result.status && BAD_STATUSES.has(result.status))) {
    return fail(403, result.error ?? 'This license is no longer active.', { revoked: true });
  }
  return { status: 200, body: { ok: true, entitlement: payload.ent, ...(BUNDLES.has(payload.ent) ? { packIds: coveredPacks(config.title, payload.pd ?? payload.iat).map((p) => p.id) } : {}) } };
}

export async function handleDeactivate(body: Record<string, unknown>, config: ServerConfig, provider: ProviderClient): Promise<ApiResult> {
  const payload = await verifyToken(body.token, config.secret);
  if (!payload) return fail(401, msg('This license record is damaged.'));
  if (!ownToken(payload, config)) return fail(403, config.title.messages.wrongProduct);
  if (payload.ent === OWNER) return { status: 200, body: { ok: true } };
  if (!storeOpen(config)) return fail(503, config.title.messages.notOpen, { retry: true });
  const result = await provider.deactivate(payload.key, payload.iid);
  // An instance that no longer exists counts as removed.
  if (!result.ok && result.error && !/not found|invalid/i.test(result.error)) return fail(400, result.error);
  return { status: 200, body: { ok: true } };
}

export async function handlePack(body: Record<string, unknown>, config: ServerConfig, provider: ProviderClient): Promise<ApiResult> {
  const payload = await verifyToken(body.token, config.secret);
  if (!payload) return fail(401, msg('This license record is damaged. Enter your key again.'), { revoked: true });
  const { title } = config;
  if (!ownToken(payload, config)) return fail(403, title.messages.wrongProduct, { revoked: true });
  if (payload.ent === OWNER) {
    if (!isOwnerKey(payload.key, config)) return fail(403, msg('The owner key has changed.'), { revoked: true });
    const ownerPack = typeof body.packId === 'string' ? packPayload(title, body.packId, requestedLang(body)) : null;
    return ownerPack ? { status: 200, body: { ok: true, pack: ownerPack } } : fail(400, msg('Unknown question pack.'));
  }
  const lang = requestedLang(body);
  if (BUNDLES.has(payload.ent) && typeof body.packId === 'string' && findPack(title, body.packId) && !coveredPacks(title, payload.pd ?? payload.iat).some((p) => p.id === body.packId)) {
    return fail(403, NOT_INCLUDED, { notIncluded: true });
  }
  const pack = BUNDLES.has(payload.ent) ? (typeof body.packId === 'string' ? packPayload(title, body.packId, lang) : null) : packPayload(title, payload.ent, lang);
  if (!pack) return fail(400, BUNDLES.has(payload.ent) ? 'Unknown question pack.' : 'That license is not for a question pack.');
  if (!storeOpen(config)) return fail(503, config.title.messages.notOpen, { retry: true });
  const result = await provider.validate(payload.key, payload.iid);
  if (!result.ok || (result.status && BAD_STATUSES.has(result.status))) return fail(403, result.error ?? 'This license is no longer active.', { revoked: true });
  return { status: 200, body: { ok: true, pack } };
}

export function handleCatalog(config: ServerConfig, now = Date.now()): ApiResult {
  if (!storeOpen(config)) return fail(503, config.title.messages.notOpen);
  return {
    status: 200,
    body: {
      ok: true,
      products: config.catalog.map((c) => ({ entitlement: c.entitlement, checkoutUrl: c.checkoutUrl, price: c.price })),
      promo: config.promo && config.promo.ends > now ? config.promo : null,
    },
  };
}

export type Route = 'activate' | 'validate' | 'deactivate' | 'pack' | 'catalog';

/** Single entry point used by the Netlify Function (and by tests). */
export async function route(
  name: Route,
  body: Record<string, unknown>,
  env: Record<string, string | undefined>,
  provider: ProviderClient,
  title: TitleContent,
): Promise<ApiResult> {
  const parsed = parseConfig(env, title);
  if (!parsed.ok) return fail(503, title.messages.notOpen, { configError: parsed.error });
  try {
    switch (name) {
      case 'catalog':
        return handleCatalog(parsed.config);
      case 'activate':
        return await handleActivate(body, parsed.config, provider);
      case 'validate':
        return await handleValidate(body, parsed.config, provider);
      case 'deactivate':
        return await handleDeactivate(body, parsed.config, provider);
      case 'pack':
        return await handlePack(body, parsed.config, provider);
      default:
        return fail(404, msg('Unknown request.'));
    }
  } catch (err) {
    if (err instanceof ProviderUnavailable) return fail(502, msg('The license service could not be reached. Try again in a minute.'), { retry: true });
    return fail(500, msg('Something went wrong. Try again in a minute.'));
  }
}
