import type { Option, ProductSize } from '../types/catalog.types';

/**
 * Calculates client-side price preview for display purposes on ProductDetailPage.
 * Note: The backend is the source of truth for final pricing at checkout.
 */
export function calcPricePreview(
  basePrice: number,
  selectedSize?: ProductSize | null,
  selectedOptions: Option[] = [],
): number {
  const sizeDelta = selectedSize ? Number(selectedSize.priceDelta) : 0;
  const optionsDelta = selectedOptions.reduce(
    (sum, opt) => sum + Number(opt.priceDelta || 0),
    0,
  );
  return Math.max(0, Number(basePrice || 0) + sizeDelta + optionsDelta);
}
