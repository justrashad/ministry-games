import type { LicenseClient } from './licenseClient';
import type { InstalledPack } from './packLibrary';

/** What the public app knows about a paid pack: its name and description, never its questions. */
export interface PackInfo {
  id: string;
  name: string;
  description: string;
}

export type PackRowState = 'installed' | 'download' | 'locked';

export interface PackRow<Q> {
  info: PackInfo;
  state: PackRowState;
  /** The installed copy in the current language, when there is one. */
  pack: InstalledPack<Q> | null;
}

/** Every pack in the catalog, with whether it is ready to play, owned but not downloaded in this language, or not owned. */
export function packRows<Q>(catalog: readonly PackInfo[], installed: readonly InstalledPack<Q>[], license: Pick<LicenseClient, 'ownsPack'>): PackRow<Q>[] {
  return catalog.map((info) => {
    const pack = installed.find((p) => p.id === info.id) ?? null;
    if (pack) return { info, state: 'installed', pack };
    return { info, state: license.ownsPack(info.id) ? 'download' : 'locked', pack: null };
  });
}
