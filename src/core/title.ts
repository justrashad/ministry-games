import type { TitleInfo } from '../../titles.config';

export type { TitleInfo } from '../../titles.config';

// Filled in by the build (see "define" in vite.config.ts) from titles.config.ts.
declare const __TITLE__: TitleInfo;

/** The title this app was built as. */
export const TITLE: TitleInfo = __TITLE__;
