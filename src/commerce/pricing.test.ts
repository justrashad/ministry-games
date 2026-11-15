import { describe, expect, it } from 'vitest';
import { bundleSavings, formatMoney, parsePrice } from './pricing';
import { PACK_CATALOG } from './catalog';

describe('bundle savings', () => {
  it('reads and formats prices', () => {
    expect(parsePrice('$9.99')).toBe(999);
    expect(parsePrice('$1,299.50')).toBe(129950);
    expect(parsePrice(null)).toBeNull();
    expect(formatMoney(4988)).toBe('$49.88');
  });

  it('compares each bundle with buying the same things one by one', () => {
    const n = PACK_CATALOG.length;
    const mega = bundleSavings('mega-pack', {})!;
    expect(mega.separately).toBe(999 * n);
    expect(mega.saved).toBe(999 * n - 4999);
    const complete = bundleSavings('complete', {})!;
    expect(complete.separately).toBe(3999 + 999 * n);
    expect(complete.saved).toBe(3999 + 999 * n - 7999);
    expect(complete.percent).toBe(Math.round((complete.saved / complete.separately) * 100));
  });

  it('uses live store prices when they are available, and hides a non-saving', () => {
    expect(bundleSavings('mega-pack', { 'mega-pack': '$59.99' })!.bundle).toBe(5999);
    expect(bundleSavings('mega-pack', { 'mega-pack': '$999.00' })).toBeNull();
  });
});
