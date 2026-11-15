import type { Question, QuestionSet } from '../types';
import { normalizeQuestion } from '../engine/validation';
import { uid } from '../../../core/lib/ids';
import { STORAGE_KEYS } from '../../../core/lib/storage';
import { addSet, libraryStore } from '../state/libraryStore';
import { createPersistentStore } from '../../../core/state/persistentStore';
import { entitlementName, PACK_CATALOG } from './catalog';
import { msg } from '../../../core/i18n/msg';
import { langStore, type Lang } from '../../../core/i18n/i18n';

/*
 * Purchases on this device. Each record holds a server-signed token that proves the
 * key was checked; the token is what the server uses to re-check the key later,
 * move it to another device, or re-send a pack's questions.
 *
 * `allPacks` is set by the Mega Pack, the Complete Edition and the owner key. It
 * covers every pack, including packs released after the purchase, which are added
 * to the library automatically the next time the app opens online.
 */

export interface LicenseRecord {
  entitlement: string;
  token: string;
  keyHint: string;
  activatedAt: number;
  lastCheckedAt: number;
  /**
   * For the all-packs record: the packs this Mega Pack / Complete Edition covers
   * (those released by its purchase date). Missing means every pack (the owner key).
   */
  packIds?: string[];
}

export interface LicenseState {
  game: LicenseRecord | null;
  allPacks: LicenseRecord | null;
  packs: Record<string, LicenseRecord>;
  /** Packs already added to the library once, so deleted sets aren't re-added. */
  installedPackIds: string[];
}

const REVALIDATE_EVERY_MS = 7 * 24 * 60 * 60 * 1000;
const ALL_PACK_GRANTS = new Set(['owner', 'mega-pack', 'complete']);

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

function isRecord(value: unknown): value is LicenseRecord {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Partial<LicenseRecord>;
  return typeof r.entitlement === 'string' && typeof r.token === 'string' && typeof r.keyHint === 'string' && typeof r.activatedAt === 'number';
}

const withChecked = (r: LicenseRecord): LicenseRecord => {
  const out: LicenseRecord = { ...r, lastCheckedAt: Number(r.lastCheckedAt) || 0 };
  if (!Array.isArray(r.packIds)) delete out.packIds;
  else out.packIds = r.packIds.filter((id): id is string => typeof id === 'string');
  return out;
};

function sanitize(raw: unknown): LicenseState {
  const state: LicenseState = { game: null, allPacks: null, packs: {}, installedPackIds: [] };
  if (typeof raw !== 'object' || raw === null) return state;
  const r = raw as { game?: unknown; allPacks?: unknown; packs?: unknown; installedPackIds?: unknown };
  if (isRecord(r.game) && r.game.entitlement === 'game') state.game = withChecked(r.game);
  if (isRecord(r.allPacks) && r.allPacks.entitlement === 'all-packs') state.allPacks = withChecked(r.allPacks);
  if (typeof r.packs === 'object' && r.packs !== null) {
    for (const [id, rec] of Object.entries(r.packs as Record<string, unknown>)) {
      if (isRecord(rec) && rec.entitlement === id) state.packs[id] = withChecked(rec);
    }
  }
  if (Array.isArray(r.installedPackIds)) state.installedPackIds = r.installedPackIds.filter((id): id is string => typeof id === 'string');
  // Devices activated with the owner key before bundles existed: the owner key covers every pack.
  if (!state.allPacks && state.game && tokenGrant(state.game.token) === 'owner') state.allPacks = { ...state.game, entitlement: 'all-packs' };
  return state;
}

export const licenseStore = createPersistentStore<LicenseState>(STORAGE_KEYS.license, sanitize);
export const useLicenses = () => licenseStore.useValue();

export function isGameUnlocked(): boolean {
  return licenseStore.get().game !== null;
}

export function useGameUnlocked(): boolean {
  return useLicenses().game !== null;
}

/** Whether the all-packs record (Mega Pack, Complete Edition, owner key) covers this pack. */
export function bundleCovers(record: LicenseRecord | null, packId: string): boolean {
  return !!record && (!record.packIds || record.packIds.includes(packId));
}

export function ownsPack(state: LicenseState, packId: string): boolean {
  return !!state.packs[packId] || bundleCovers(state.allPacks, packId);
}

/* ------------------------------ server calls ----------------------------- */

export type ApiReply = { ok: true; [key: string]: unknown } | { ok: false; error: string; revoked?: boolean; retry?: boolean; offline?: boolean };

async function post(path: string, body: unknown): Promise<ApiReply> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, error: msg('You are offline. Connect to the internet and try again.'), offline: true };
  }
  try {
    const res = await fetch(path, {
      method: path === '/api/catalog' ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: path === '/api/catalog' ? undefined : JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as ApiReply | null;
    if (!data || typeof data !== 'object') return { ok: false, error: msg('The store sent an unexpected reply. Try again in a minute.'), retry: true };
    return data;
  } catch {
    return { ok: false, error: msg("Couldn't reach the Ministry Showdown store. Check your connection and try again."), offline: true };
  }
}

function deviceName(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const os = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'Chromebook' : /Linux/.test(ua) ? 'Linux' : 'device';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'browser';
  return `${browser} on ${os}`;
}

/* ------------------------------ pack install ----------------------------- */

interface PackPayload {
  id: string;
  name: string;
  description: string;
  questions: unknown[];
  /** Which language the server sent (Spanish when the pack has a Spanish version). */
  lang?: Lang;
}

/**
 * Library key for a pack in one language. English keeps the plain pack ID (so
 * libraries from before Spanish existed still match); Spanish adds "@es".
 */
export function packKey(packId: string, lang: Lang): string {
  return lang === 'es' ? `${packId}@es` : packId;
}

function isPackPayload(value: unknown): value is PackPayload {
  const p = value as Partial<PackPayload> | null;
  return !!p && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.questions);
}

function rememberInstalled(packId: string): void {
  licenseStore.set((prev) => (prev.installedPackIds.includes(packId) ? prev : { ...prev, installedPackIds: [...prev.installedPackIds, packId] }));
}

/** Adds a purchased pack to the question library, unless a copy is already there. */
export function installPack(payload: PackPayload): { set: QuestionSet; alreadyInstalled: boolean } {
  const key = packKey(payload.id, payload.lang === 'es' ? 'es' : 'en');
  rememberInstalled(key);
  const existing = libraryStore.get().sets.find((s) => s.packId === key);
  if (existing) return { set: existing, alreadyInstalled: true };
  const questions: Question[] = [];
  payload.questions.forEach((raw, i) => {
    const result = normalizeQuestion(raw, `Question ${i + 1}`);
    if (result.question) questions.push(result.question);
  });
  const now = Date.now();
  const set: QuestionSet = { id: uid('set'), name: payload.name, description: payload.description, questions, createdAt: now, updatedAt: now, packId: key };
  return { set: addSet(set), alreadyInstalled: false };
}

/* -------------------------------- actions -------------------------------- */

export type ActivateResult =
  | { ok: true; entitlement: string; label: string; installed: QuestionSet | null; addedPacks: number; alreadyOwned: boolean }
  | { ok: false; error: string };

export async function activateKey(rawKey: string): Promise<ActivateResult> {
  const key = rawKey.trim();
  if (!key) return { ok: false, error: msg('Paste the license key from your purchase email.') };
  const reply = await post('/api/activate', { key, deviceName: deviceName(), lang: langStore.get() });
  if (!reply.ok) return { ok: false, error: reply.error };
  const entitlement = typeof reply.entitlement === 'string' ? reply.entitlement : '';
  const token = typeof reply.token === 'string' ? reply.token : '';
  if (!entitlement || !token) return { ok: false, error: msg('The store sent an unexpected reply. Try again in a minute.') };
  const now = Date.now();
  const record: LicenseRecord = { entitlement, token, keyHint: typeof reply.keyHint === 'string' ? reply.keyHint : '', activatedAt: now, lastCheckedAt: now };
  const label = entitlementName(entitlement);

  if (ALL_PACK_GRANTS.has(entitlement)) {
    const grantsGame = entitlement !== 'mega-pack';
    const before = licenseStore.get();
    licenseStore.set((prev) => ({
      ...prev,
      game: grantsGame ? { ...record, entitlement: 'game' } : prev.game,
      allPacks: { ...record, entitlement: 'all-packs', ...(Array.isArray(reply.packIds) ? { packIds: reply.packIds.filter((id): id is string => typeof id === 'string') } : {}) },
    }));
    let addedPacks = 0;
    const payloads = Array.isArray(reply.packs) ? reply.packs.filter(isPackPayload) : [];
    payloads.forEach((p) => {
      if (!installPack(p).alreadyInstalled) addedPacks += 1;
    });
    return { ok: true, entitlement, label, installed: null, addedPacks, alreadyOwned: before.allPacks !== null && (!grantsGame || before.game !== null) };
  }

  const before = licenseStore.get();
  const alreadyOwned = entitlement === 'game' ? before.game !== null : !!before.packs[entitlement];
  licenseStore.set((prev) => (entitlement === 'game' ? { ...prev, game: record } : { ...prev, packs: { ...prev.packs, [entitlement]: record } }));
  let installed: QuestionSet | null = null;
  if (entitlement !== 'game' && isPackPayload(reply.pack)) installed = installPack(reply.pack).set;
  return { ok: true, entitlement, label, installed, addedPacks: installed ? 1 : 0, alreadyOwned };
}

/** Removes every record that came from the same key activation (a Complete Edition covers game + packs). */
function removeRecordsWithToken(token: string): void {
  licenseStore.set((prev) => {
    const packs: Record<string, LicenseRecord> = {};
    for (const [id, rec] of Object.entries(prev.packs)) if (rec.token !== token) packs[id] = rec;
    return {
      ...prev,
      game: prev.game?.token === token ? null : prev.game,
      allPacks: prev.allPacks?.token === token ? null : prev.allPacks,
      packs,
    };
  });
}

/** Re-downloads an owned pack (after deleting its set, or a new pack for bundle owners). */
export async function redownloadPack(packId: string): Promise<{ ok: true; set: QuestionSet; alreadyInstalled: boolean } | { ok: false; error: string }> {
  const state = licenseStore.get();
  const record = state.packs[packId] ?? (bundleCovers(state.allPacks, packId) ? state.allPacks : null);
  if (!record) return { ok: false, error: msg('This pack is not activated on this device.') };
  const reply = await post('/api/pack', { token: record.token, packId, lang: langStore.get() });
  if (!reply.ok) {
    if (reply.revoked) removeRecordsWithToken(record.token);
    return { ok: false, error: reply.error };
  }
  if (!isPackPayload(reply.pack)) return { ok: false, error: msg('The store sent an unexpected reply. Try again in a minute.') };
  return { ok: true, ...installPack(reply.pack) };
}

/** A purchase on this device, grouped by key: one Complete Edition key is one purchase. */
export interface Purchase {
  token: string;
  name: string;
  keyHint: string;
  activatedAt: number;
}

export function listPurchases(state: LicenseState): Purchase[] {
  const seen = new Map<string, Purchase>();
  const add = (rec: LicenseRecord | null, fallback: string) => {
    if (!rec || seen.has(rec.token)) return;
    const grant = tokenGrant(rec.token) ?? fallback;
    seen.set(rec.token, { token: rec.token, name: entitlementName(grant), keyHint: rec.keyHint, activatedAt: rec.activatedAt });
  };
  add(state.game, 'game');
  add(state.allPacks, 'mega-pack');
  Object.entries(state.packs).forEach(([id, rec]) => add(rec, id));
  return [...seen.values()];
}

/** Frees this device's activation so the key can be used on another device. */
export async function deactivatePurchase(token: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const reply = await post('/api/deactivate', { token });
  if (!reply.ok) return { ok: false, error: reply.error };
  removeRecordsWithToken(token);
  return { ok: true };
}

/**
 * Re-checks licenses about once a week when online, so refunded keys stop working.
 * Being offline or the store being down never locks anyone out.
 */
export async function revalidateIfDue(now = Date.now()): Promise<void> {
  const state = licenseStore.get();
  const byToken = new Map<string, LicenseRecord>();
  [state.game, state.allPacks, ...Object.values(state.packs)].forEach((r) => {
    if (r && !byToken.has(r.token)) byToken.set(r.token, r);
  });
  for (const record of byToken.values()) {
    if (now - record.lastCheckedAt < REVALIDATE_EVERY_MS) continue;
    const reply = await post('/api/validate', { token: record.token });
    if (reply.ok) {
      licenseStore.set((prev) => {
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

/**
 * For bundle and owner licenses: adds any pack that hasn't been added before, such
 * as newly released packs. Returns the names of packs added.
 */
export async function installNewBundlePacks(): Promise<string[]> {
  const state = licenseStore.get();
  if (!state.allPacks) return [];
  const lang = langStore.get();
  const inLibrary = new Set(libraryStore.get().sets.map((s) => s.packId).filter((id): id is string => !!id));
  inLibrary.forEach((id) => rememberInstalled(id));
  const known = new Set([...licenseStore.get().installedPackIds]);
  const added: string[] = [];
  for (const pack of PACK_CATALOG.filter((p) => bundleCovers(state.allPacks, p.id))) {
    // Each language is added once. A pack with no Spanish yet arrives in English;
    // it's still marked as done for Spanish so it isn't fetched on every launch.
    const key = packKey(pack.id, lang);
    if (known.has(key)) continue;
    const result = await redownloadPack(pack.id);
    if (!result.ok) break;
    rememberInstalled(key);
    if (!result.alreadyInstalled) added.push(result.set.name);
  }
  return added;
}

/* -------------------------------- catalog -------------------------------- */

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

interface StoreInfo {
  products: StoreProduct[];
  promo: StorePromo | null;
}

let catalogCache: Promise<StoreInfo | null> | null = null;

function loadStoreInfo(force = false): Promise<StoreInfo | null> {
  if (!catalogCache || force) {
    catalogCache = post('/api/catalog', null).then((reply) => {
      if (!reply.ok || !Array.isArray(reply.products)) {
        catalogCache = null;
        return null;
      }
      const products = (reply.products as StoreProduct[]).filter((p) => typeof p.entitlement === 'string' && typeof p.checkoutUrl === 'string');
      const raw = reply.promo as Partial<StorePromo> | null | undefined;
      const promo =
        raw && typeof raw.code === 'string' && typeof raw.percent === 'number' && typeof raw.ends === 'number' && raw.ends > Date.now()
          ? { code: raw.code, percent: raw.percent, ends: raw.ends }
          : null;
      return { products, promo };
    });
  }
  return catalogCache;
}

/** Checkout links come from the server so prices and products can change without an app update. */
export function loadStoreCatalog(force = false): Promise<StoreProduct[] | null> {
  return loadStoreInfo(force).then((info) => info?.products ?? null);
}

/** The store-wide sale, if one is running (set with the PROMO setting on the server). */
export function loadPromo(): Promise<StorePromo | null> {
  return loadStoreInfo().then((info) => (info?.promo && info.promo.ends > Date.now() ? info.promo : null));
}

/** Adds the sale code to a Lemon Squeezy checkout link so the discount is already applied. */
export function withDiscount(checkoutUrl: string, promo: StorePromo | null): string {
  if (!promo) return checkoutUrl;
  const sep = checkoutUrl.includes('?') ? '&' : '?';
  return `${checkoutUrl}${sep}checkout%5Bdiscount_code%5D=${encodeURIComponent(promo.code)}`;
}
