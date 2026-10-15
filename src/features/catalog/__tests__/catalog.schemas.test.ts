import { describe, it, expect } from 'vitest';
import {
  categoryFormSchema,
  productFormSchema,
  optionGroupFormSchema,
  optionFormSchema,
} from '../schemas/catalog.schemas';

describe('catalog.schemas', () => {
  describe('categoryFormSchema', () => {
    it('validates valid category input', () => {
      const result = categoryFormSchema.safeParse({
        name: 'Trà Sữa',
        slug: 'tra-sua',
        imageUrl: 'https://images.unsplash.com/photo-1558857563-b37fe4355529',
        sortOrder: 1,
        isActive: true,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name or invalid slug', () => {
      const emptyName = categoryFormSchema.safeParse({
        name: '   ',
        slug: 'tra-sua',
      });
      expect(emptyName.success).toBe(false);

      const invalidSlug = categoryFormSchema.safeParse({
        name: 'Trà Sữa',
        slug: 'Tra Sua! 123',
      });
      expect(invalidSlug.success).toBe(false);
    });
  });

  describe('optionGroupFormSchema', () => {
    it('validates single select option group with maxSelect = 1', () => {
      const result = optionGroupFormSchema.safeParse({
        name: 'Mức đường',
        selectType: 'single',
        minSelect: 1,
        maxSelect: 1,
        sortOrder: 0,
      });
      expect(result.success).toBe(true);
    });

    it('rejects single select group when maxSelect > 1', () => {
      const result = optionGroupFormSchema.safeParse({
        name: 'Mức đường',
        selectType: 'single',
        minSelect: 0,
        maxSelect: 2,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('single');
      }
    });

    it('validates multiple select option group', () => {
      const result = optionGroupFormSchema.safeParse({
        name: 'Topping',
        selectType: 'multiple',
        minSelect: 0,
        maxSelect: 3,
        sortOrder: 1,
      });
      expect(result.success).toBe(true);
    });

    it('rejects when minSelect > maxSelect', () => {
      const result = optionGroupFormSchema.safeParse({
        name: 'Topping',
        selectType: 'multiple',
        minSelect: 4,
        maxSelect: 2,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optionFormSchema', () => {
    it('validates valid option input', () => {
      const result = optionFormSchema.safeParse({
        name: 'Trân châu đen',
        priceDelta: 5000,
        isDefault: false,
        isAvailable: true,
        sortOrder: 0,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty option name', () => {
      const result = optionFormSchema.safeParse({
        name: '',
        priceDelta: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('productFormSchema', () => {
    it('validates product with exactly one default size', () => {
      const result = productFormSchema.safeParse({
        categoryId: 1,
        name: 'Trà Sữa Trân Châu',
        slug: 'tra-sua-tran-chau',
        basePrice: 35000,
        sizes: [
          { name: 'S', priceDelta: 0, isDefault: true },
          { name: 'M', priceDelta: 5000, isDefault: false },
        ],
        optionGroupIds: [1, 2],
      });
      expect(result.success).toBe(true);
    });

    it('rejects product with zero default sizes', () => {
      const result = productFormSchema.safeParse({
        categoryId: 1,
        name: 'Trà Sữa Trân Châu',
        slug: 'tra-sua-tran-chau',
        basePrice: 35000,
        sizes: [
          { name: 'S', priceDelta: 0, isDefault: false },
          { name: 'M', priceDelta: 5000, isDefault: false },
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('size mặc định');
      }
    });

    it('rejects product with multiple default sizes', () => {
      const result = productFormSchema.safeParse({
        categoryId: 1,
        name: 'Trà Sữa Trân Châu',
        slug: 'tra-sua-tran-chau',
        basePrice: 35000,
        sizes: [
          { name: 'S', priceDelta: 0, isDefault: true },
          { name: 'M', priceDelta: 5000, isDefault: true },
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('size mặc định');
      }
    });

    it('rejects product with negative base price', () => {
      const result = productFormSchema.safeParse({
        categoryId: 1,
        name: 'Trà Sữa Trân Châu',
        slug: 'tra-sua-tran-chau',
        basePrice: -1000,
        sizes: [{ name: 'S', priceDelta: 0, isDefault: true }],
      });
      expect(result.success).toBe(false);
    });
  });
});
