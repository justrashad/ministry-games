import { t } from '../i18n/i18n';
import { useEffect, useState } from 'react';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import { loadStoreCatalog, withDiscount, type StoreProduct } from '../commerce/licenseStore';
import { salePrice, usePromo } from '../commerce/pricing';
import { defaultPrice } from '../commerce/catalog';
import type { ButtonSize, ButtonVariant } from './ui/Button';

/** Opens the checkout for a product in a new tab. Shows "opening soon" until the store is configured. */
export function BuyButton({
  entitlement,
  label,
  variant = 'gold',
  size = 'lg',
  block = false,
}: {
  entitlement: string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}) {
  const [product, setProduct] = useState<StoreProduct | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    loadStoreCatalog().then((products) => alive && setProduct(products?.find((p) => p.entitlement === entitlement) ?? null));
    return () => {
      alive = false;
    };
  }, [entitlement]);
  const promo = usePromo();
  const price = product?.price ?? defaultPrice(entitlement);
  // During a sale the button shows the sale price and the checkout opens with the code applied.
  const sale = promo && product ? salePrice(price, promo.percent) : null;
  const text = label ?? t('Buy for {price}', { price: sale ?? price });
  if (product === null) {
    return (
      <span className={`btn btn-ghost btn-${size} ${block ? 'w-full' : ''} cursor-default opacity-70`} role="note">
        <ShoppingCart className="btn-icon" aria-hidden />
        <span>{t('Store opening soon')}</span>
      </span>
    );
  }
  return (
    <a
      href={product ? withDiscount(product.checkoutUrl, promo) : '#'}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={!product}
      onClick={(e) => {
        if (!product) e.preventDefault();
      }}
      className={`btn btn-${variant} btn-${size} ${block ? 'w-full' : ''} ${!product ? 'opacity-60' : ''}`}
    >
      <ShoppingCart className="btn-icon" aria-hidden />
      <span>{text}</span>
      {sale && !label && (
        <s className="text-[0.8em] font-semibold opacity-60" aria-label={t('was {price}', { price })}>
          {price}
        </s>
      )}
      <ExternalLink className="btn-icon !h-4 !w-4 opacity-70" aria-hidden />
    </a>
  );
}
