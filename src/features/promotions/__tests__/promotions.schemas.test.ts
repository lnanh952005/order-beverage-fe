import { describe, it, expect } from 'vitest';
import { voucherFormSchema } from '../schemas/promotions.schemas';

describe('voucherFormSchema', () => {
  const validPercentData = {
    code: 'summer20',
    description: 'Giảm 20% mùa hè',
    discountType: 'percent' as const,
    discountValue: 20,
    maxDiscount: 50000,
    minOrderValue: 100000,
    usageLimit: 200,
    startsAt: '2026-06-01T00:00:00.000Z',
    endsAt: '2026-08-31T23:59:59.000Z',
    isActive: true,
  };

  const validFixedData = {
    code: 'giadinh50k',
    discountType: 'fixed' as const,
    discountValue: 50000,
    minOrderValue: 150000,
    startsAt: '2026-06-01T00:00:00.000Z',
    endsAt: '2026-06-30T23:59:59.000Z',
  };

  it('validates a valid percentage voucher and transforms code to uppercase', () => {
    const parsed = voucherFormSchema.parse(validPercentData);
    expect(parsed.code).toBe('SUMMER20');
    expect(parsed.discountType).toBe('percent');
    expect(parsed.discountValue).toBe(20);
    expect(parsed.maxDiscount).toBe(50000);
  });

  it('validates a valid fixed discount voucher and applies default values', () => {
    const parsed = voucherFormSchema.parse(validFixedData);
    expect(parsed.code).toBe('GIADINH50K');
    expect(parsed.discountType).toBe('fixed');
    expect(parsed.discountValue).toBe(50000);
    expect(parsed.isActive).toBe(true);
  });

  it('rejects empty or whitespace-only code', () => {
    expect(() =>
      voucherFormSchema.parse({
        ...validPercentData,
        code: '   ',
      }),
    ).toThrow('Mã voucher không được để trống');
  });

  it('rejects when endsAt is before or equal to startsAt', () => {
    expect(() =>
      voucherFormSchema.parse({
        ...validPercentData,
        startsAt: '2026-06-10T12:00:00.000Z',
        endsAt: '2026-06-10T12:00:00.000Z',
      }),
    ).toThrow('Thời gian kết thúc phải sau thời gian bắt đầu');
  });

  it('rejects percentage discount greater than 100', () => {
    expect(() =>
      voucherFormSchema.parse({
        ...validPercentData,
        discountValue: 120,
      }),
    ).toThrow('Giảm giá theo phần trăm phải từ 1% đến 100%');
  });

  it('rejects zero or negative discount value', () => {
    expect(() =>
      voucherFormSchema.parse({
        ...validPercentData,
        discountValue: 0,
      }),
    ).toThrow('Giá trị giảm giá phải lớn hơn 0');
  });
});
