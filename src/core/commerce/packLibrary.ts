import { createPersistentStore, type PersistentStore } from '../state/persistentStore';
import type { LicenseClient, PackPayload } from './licenseClient';

/*
 * Question packs a family has bought, as the server sent them, one copy per language.
 * Each title gives a validator for its own question shape; anything that doesn't pass
 * is dropped, so a damaged download can never reach a game.
 */

export interface InstalledPack<Q> {
  id: string;
  name: string;
  description: string;
  lang: 'en' | 'es';
  questions: Q[];
}

type Library<Q> = Record<string, InstalledPack<Q>>;

export function packKey(id: string, lang: string): string {
  return `${id}@${lang === 'es' ? 'es' : 'en'}`;
}

export interface PackLibrary<Q> {
  store: PersistentStore<Library<Q>>;
  /** Stores a pack the server delivered. Returns false when that pack was already here in that language. */
  add(payload: PackPayload): boolean;
  /** Installed packs in one language. */
  packsIn(lang: string): InstalledPack<Q>[];
  usePacksIn(lang: string): InstalledPack<Q>[];
  /** Downloads an owned pack in a language it isn't installed in yet. */
  download(license: LicenseClient, packId: string, lang: string): Promise<{ ok: true } | { ok: false; error: string }>;
}

export function createPackLibrary<Q>(storageKey: string, validate: (raw: unknown) => Q | null): PackLibrary<Q> {
  function clean(raw: unknown): InstalledPack<Q> | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const p = raw as Partial<InstalledPack<unknown>>;
    if (typeof p.id !== 'string' || typeof p.name !== 'string' || !Array.isArray(p.questions)) return null;
    const questions = p.questions.map(validate).filter((q): q is Q => q !== null);
    if (questions.length === 0) return null;
    return { id: p.id, name: p.name, description: typeof p.description === 'string' ? p.description : '', lang: p.lang === 'es' ? 'es' : 'en', questions };
  }

  const store = createPersistentStore<Library<Q>>(storageKey, (raw) => {
    const out: Library<Q> = {};
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return out;
    for (const value of Object.values(raw as Record<string, unknown>)) {
      const pack = clean(value);
      if (pack) out[packKey(pack.id, pack.lang)] = pack;
    }
    return out;
  });

  const sorted = (lib: Library<Q>, lang: string) =>
    Object.values(lib)
      .filter((p) => p.lang === (lang === 'es' ? 'es' : 'en'))
      .sort((a, b) => a.name.localeCompare(b.name));

  function add(payload: PackPayload): boolean {
    const pack = clean(payload);
    if (!pack) return false;
    const key = packKey(pack.id, pack.lang);
    const existed = !!store.get()[key];
    store.set((prev) => ({ ...prev, [key]: pack }));
    return !existed;
  }

  return {
    store,
    add,
    packsIn: (lang) => sorted(store.get(), lang),
    usePacksIn: (lang) => sorted(store.useValue(), lang),
    download: async (license, packId, lang) => {
      const result = await license.requestPack(packId, lang);
      if (!result.ok) return result;
      add(result.pack);
      return { ok: true };
    },
  };
}
