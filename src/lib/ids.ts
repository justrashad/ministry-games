export function uid(prefix = 'id'): string {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (c && typeof c.randomUUID === 'function') {
    try {
      return `${prefix}-${c.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    } catch {
      /* randomUUID throws in some insecure contexts; fall through */
    }
  }
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
