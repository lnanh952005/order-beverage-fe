import { describe, it, expect, vi } from 'vitest';
import { httpClient } from '@/shared/api/http-client';
import { cartKeys } from '../services/cart.keys';
import { cartService } from '../services/cart.service';
import type { Cart } from '../types/cart.types';

vi.mock('@/shared/api/http-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('cartKeys', () => {
  it('generates consistent cart query keys', () => {
    expect(cartKeys.all).toEqual(['cart']);
    expect(cartKeys.detail()).toEqual(['cart', 'detail']);
  });
});

describe('cartService', () => {
  const mockCart: Cart = {
    items: [
      {
        id: 10,
        product: {
          id: 1,
          name: 'Trà Sữa Truyền Thống',
          slug: 'tra-sua-truyen-thong',
          imageUrl: 'https://example.com/tea.jpg',
        },
        size: { id: 2, name: 'L', priceDelta: 10000 },
        options: [{ id: 5, groupName: 'Độ ngọt', name: '50% đường', priceDelta: 0 }],
        quantity: 2,
        note: 'Ít đá',
        unitPrice: 45000,
        lineTotal: 90000,
        isAvailable: true,
      },
    ],
    subtotal: 90000,
  };

  it('calls getCart via GET /cart', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockCart);
    const result = await cartService.getCart();

    expect(httpClient.get).toHaveBeenCalledWith('/cart');
    expect(result).toEqual(mockCart);
  });

  it('calls addItem via POST /cart/items', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce(mockCart);
    const input = {
      productId: 1,
      sizeId: 2,
      optionIds: [5],
      quantity: 2,
      note: 'Ít đá',
    };
    const result = await cartService.addItem(input);

    expect(httpClient.post).toHaveBeenCalledWith('/cart/items', input);
    expect(result).toEqual(mockCart);
  });

  it('calls updateItem via PATCH /cart/items/:id', async () => {
    vi.mocked(httpClient.patch).mockResolvedValueOnce(mockCart);
    const input = { quantity: 3, note: 'Ghi chú mới' };
    const result = await cartService.updateItem(10, input);

    expect(httpClient.patch).toHaveBeenCalledWith('/cart/items/10', input);
    expect(result).toEqual(mockCart);
  });

  it('calls removeItem via DELETE /cart/items/:id', async () => {
    vi.mocked(httpClient.delete).mockResolvedValueOnce(mockCart);
    const result = await cartService.removeItem(10);

    expect(httpClient.delete).toHaveBeenCalledWith('/cart/items/10');
    expect(result).toEqual(mockCart);
  });

  it('calls clearCart via DELETE /cart', async () => {
    vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined);
    await cartService.clearCart();

    expect(httpClient.delete).toHaveBeenCalledWith('/cart');
  });
});
