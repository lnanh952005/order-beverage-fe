import { describe, it, expect } from 'vitest';
import {
  checkoutSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
} from '../schemas/orders.schemas';

describe('checkoutSchema', () => {
  it('validates successful delivery order with addressId', () => {
    const input = {
      fulfillmentType: 'delivery',
      addressId: 10,
      paymentMethod: 'cod',
      voucherCode: 'SALE10',
      note: 'Giao hàng cẩn thận',
    };

    const result = checkoutSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('fails delivery order when addressId is missing', () => {
    const input = {
      fulfillmentType: 'delivery',
      paymentMethod: 'cod',
    };

    const result = checkoutSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Vui lòng chọn địa chỉ giao hàng');
      expect(result.error.errors[0].path).toEqual(['addressId']);
    }
  });

  it('validates successful pickup order without addressId', () => {
    const input = {
      fulfillmentType: 'pickup',
      paymentMethod: 'card',
      note: 'Tự đến lấy',
    };

    const result = checkoutSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('fails with invalid paymentMethod', () => {
    const input = {
      fulfillmentType: 'pickup',
      paymentMethod: 'crypto',
    };

    const result = checkoutSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('fails if note exceeds 255 characters', () => {
    const input = {
      fulfillmentType: 'pickup',
      paymentMethod: 'cod',
      note: 'a'.repeat(256),
    };

    const result = checkoutSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('cancelOrderSchema', () => {
  it('accepts empty reason', () => {
    expect(cancelOrderSchema.safeParse({}).success).toBe(true);
    expect(cancelOrderSchema.safeParse({ reason: '' }).success).toBe(true);
  });

  it('accepts valid reason', () => {
    expect(
      cancelOrderSchema.safeParse({ reason: 'Thay đổi địa chỉ nhận' }).success,
    ).toBe(true);
  });

  it('fails if reason exceeds 255 chars', () => {
    expect(
      cancelOrderSchema.safeParse({ reason: 'x'.repeat(256) }).success,
    ).toBe(false);
  });
});

describe('updateOrderStatusSchema', () => {
  it('validates valid status transitions', () => {
    expect(
      updateOrderStatusSchema.safeParse({ status: 'preparing' }).success,
    ).toBe(true);
    expect(
      updateOrderStatusSchema.safeParse({ status: 'ready', reason: 'Pha xong' })
        .success,
    ).toBe(true);
  });

  it('fails on invalid status string', () => {
    expect(
      updateOrderStatusSchema.safeParse({ status: 'invalid_status' }).success,
    ).toBe(false);
  });
});
