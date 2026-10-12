import { describe, it, expect } from 'vitest';
import { calcPricePreview } from '../utils/pricing';
import type { Option, ProductSize } from '../types/catalog.types';

describe('calcPricePreview', () => {
  it('returns base price when no size or options are provided', () => {
    expect(calcPricePreview(30000)).toBe(30000);
    expect(calcPricePreview(30000, undefined, [])).toBe(30000);
  });

  it('adds size priceDelta to base price', () => {
    const sizeM: ProductSize = {
      id: 1,
      name: 'M',
      priceDelta: 5000,
      isDefault: false,
    };
    expect(calcPricePreview(30000, sizeM)).toBe(35000);
  });

  it('adds options priceDelta to base price and size', () => {
    const sizeL: ProductSize = {
      id: 2,
      name: 'L',
      priceDelta: 10000,
      isDefault: false,
    };
    const options: Option[] = [
      {
        id: 10,
        name: 'Trân châu đen',
        priceDelta: 5000,
        isDefault: false,
        isAvailable: true,
        sortOrder: 0,
      },
      {
        id: 11,
        name: 'Kem Cheese',
        priceDelta: 10000,
        isDefault: false,
        isAvailable: true,
        sortOrder: 1,
      },
    ];

    // 30000 + 10000 (size) + 5000 (pearl) + 10000 (cheese) = 55000
    expect(calcPricePreview(30000, sizeL, options)).toBe(55000);
  });

  it('handles negative price deltas without dropping below zero', () => {
    const sizeSmallDiscount: ProductSize = {
      id: 3,
      name: 'S',
      priceDelta: -5000,
      isDefault: true,
    };
    expect(calcPricePreview(30000, sizeSmallDiscount)).toBe(25000);
    expect(calcPricePreview(2000, { ...sizeSmallDiscount, priceDelta: -5000 })).toBe(0);
  });
});
