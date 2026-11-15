/*
 * Framework-free translation helpers, safe to use from the game engine and the
 * server. msg() only marks text so the translation coverage test can find it; the
 * text is translated where it's displayed.
 */
export type Vars = Record<string, string | number>;
export type Tr = (text: string, vars?: Vars) => string;

export const msg = (text: string): string => text;

export function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** English: just fills in the placeholders. */
export const english: Tr = (text, vars) => interpolate(text, vars);
