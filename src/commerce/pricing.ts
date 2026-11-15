import { useEffect, useState } from 'react';
import { defaultPrice, PACK_CATALOG } from './catalog';
import { loadPromo, loadStoreCatalog, type StorePromo } from './licenseStore';

/*
 * Bundle savings, worked out from the live store prices (falling back to the list
 * prices while the store loads or if it can't be reached), so the numbers on the
 * page always match what checkout charges.
 */

export type PriceMap = Record<string, string>;

/** "$9.99" -> 999 cents; null if it can't be read. */
export function parsePrice(price: string | null | undefined): number | null {
  if (!price) return null;
  const m = price.replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/);
  return m ? Math.round(parseFloat(m[1]) * 100) : null;
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export interface Savings {
  /** What the same items cost bought one by one. */
  separately: number;
  bundle: number;
  saved: number;
  percent: number;
  packCount: number;
}

export function bundleSavings(bundle: 'complete' | 'mega-pack', prices: PriceMap): Savings | null {
  const price = (ent: string) => parsePrice(prices[ent] ?? defaultPrice(ent));
  const packs = PACK_CATALOG.map((p) => price(p.id));
  const bundlePrice = price(bundle);
  const game = price('game');
  if (bundlePrice === null || game === null || packs.some((p) => p === null)) return null;
  const packTotal = (packs as number[]).reduce((a, b) => a + b, 0);
  const separately = bundle === 'complete' ? game + packTotal : packTotal;
  const saved = separately - bundlePrice;
  if (saved <= 0) return null;
  return { separately, bundle: bundlePrice, saved, percent: Math.round((saved / separately) * 100), packCount: PACK_CATALOG.length };
}

/** A price after the sale percentage, as the checkout will charge it. */
export function salePrice(price: string, percent: number): string | null {
  const cents = parsePrice(price);
  return cents === null ? null : formatMoney(Math.round((cents * (100 - percent)) / 100));
}

/** The running store-wide sale, if any. */
export function usePromo(): StorePromo | null {
  const [promo, setPromo] = useState<StorePromo | null>(null);
  useEffect(() => {
    let alive = true;
    void loadPromo().then((p) => alive && setPromo(p));
    return () => {
      alive = false;
    };
  }, []);
  return promo;
}

/** Current store prices by entitlement (list prices until the store answers). */
export function useStorePrices(): PriceMap {
  const [prices, setPrices] = useState<PriceMap>({});
  useEffect(() => {
    let alive = true;
    void loadStoreCatalog().then((products) => {
      if (!alive || !products) return;
      const map: PriceMap = {};
      for (const p of products) if (p.price) map[p.entitlement] = p.price;
      setPrices(map);
    });
    return () => {
      alive = false;
    };
  }, []);
  return prices;
}
