// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { useAuth } from '@/features/auth';
import { cartService } from '../services/cart.service';
import { cartKeys } from '../services/cart.keys';
import { useCart } from '../hooks/useCart';
import { useAddToCart } from '../hooks/useAddToCart';
import { useUpdateCartItem } from '../hooks/useUpdateCartItem';
import { useRemoveCartItem } from '../hooks/useRemoveCartItem';
import { useClearCart } from '../hooks/useClearCart';
import type { Cart } from '../types/cart.types';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/cart.service', () => ({
  cartService: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
}));

const mockCart: Cart = {
  items: [
    {
      id: 1,
      product: {
        id: 10,
        name: 'Trà Sữa Oolong',
        slug: 'tra-sua-oolong',
        imageUrl: 'https://example.com/tea.jpg',
      },
      size: { id: 1, name: 'M', priceDelta: 0 },
      options: [{ id: 101, groupName: 'Đường', name: '70% Đường', priceDelta: 0 }],
      quantity: 2,
      note: 'Ít đá',
      unitPrice: 40000,
      lineTotal: 80000,
      isAvailable: true,
    },
    {
      id: 2,
      product: {
        id: 11,
        name: 'Trà Trái Cây',
        slug: 'tra-trai-cay',
        imageUrl: null,
      },
      size: null,
      options: [],
      quantity: 1,
      note: null,
      unitPrice: 35000,
      lineTotal: 35000,
      isAvailable: false,
    },
  ],
  subtotal: 115000,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe('Cart Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: 'test@example.com', role: 'customer', name: 'User' },
    } as unknown as ReturnType<typeof useAuth>);
  });

  describe('useCart', () => {
    it('fetches cart, computes itemCount and hasUnavailableItems when authenticated', async () => {
      vi.mocked(cartService.getCart).mockResolvedValueOnce(mockCart);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(cartService.getCart).toHaveBeenCalledTimes(1);
      expect(result.current.cart).toEqual(mockCart);
      expect(result.current.itemCount).toBe(3); // 2 + 1
      expect(result.current.hasUnavailableItems).toBe(true);
    });

    it('does not fetch cart when unauthenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
      } as unknown as ReturnType<typeof useAuth>);

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(cartService.getCart).not.toHaveBeenCalled();
      expect(result.current.cart).toBeUndefined();
      expect(result.current.itemCount).toBe(0);
      expect(result.current.hasUnavailableItems).toBe(false);
    });
  });

  describe('useAddToCart', () => {
    it('adds item to cart and updates query cache', async () => {
      const updatedCart: Cart = { ...mockCart, subtotal: 120000 };
      vi.mocked(cartService.addItem).mockResolvedValueOnce(updatedCart);
      const { wrapper, queryClient } = createWrapper();

      const { result } = renderHook(() => useAddToCart(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          productId: 10,
          sizeId: 1,
          optionIds: [101],
          quantity: 1,
          note: 'Nhiều đá',
        });
      });

      expect(cartService.addItem).toHaveBeenCalledWith({
        productId: 10,
        sizeId: 1,
        optionIds: [101],
        quantity: 1,
        note: 'Nhiều đá',
      });
      expect(queryClient.getQueryData(cartKeys.detail())).toEqual(updatedCart);
      expect(toast.success).toHaveBeenCalledWith('Đã thêm sản phẩm vào giỏ hàng!');
    });

    it('handles ApiError and shows error toast', async () => {
      const error = new ApiError(400, 'PRODUCT_NOT_AVAILABLE', 'Sản phẩm hiện không khả dụng');
      vi.mocked(cartService.addItem).mockRejectedValueOnce(error);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useAddToCart(), { wrapper });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            productId: 10,
            quantity: 1,
          });
        } catch {
          // Expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('useUpdateCartItem', () => {
    it('updates item quantity and updates query cache', async () => {
      const updatedCart: Cart = { ...mockCart, subtotal: 155000 };
      vi.mocked(cartService.updateItem).mockResolvedValueOnce(updatedCart);
      const { wrapper, queryClient } = createWrapper();

      const { result } = renderHook(() => useUpdateCartItem(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          itemId: 1,
          input: { quantity: 3 },
        });
      });

      expect(cartService.updateItem).toHaveBeenCalledWith(1, { quantity: 3 });
      expect(queryClient.getQueryData(cartKeys.detail())).toEqual(updatedCart);
    });

    it('shows error toast on update failure', async () => {
      const error = new ApiError(404, 'CART_ITEM_NOT_FOUND', 'Món không tồn tại');
      vi.mocked(cartService.updateItem).mockRejectedValueOnce(error);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUpdateCartItem(), { wrapper });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            itemId: 99,
            input: { quantity: 2 },
          });
        } catch {
          // Expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('useRemoveCartItem', () => {
    it('removes item and updates query cache', async () => {
      const updatedCart: Cart = {
        items: [mockCart.items[1]],
        subtotal: 35000,
      };
      vi.mocked(cartService.removeItem).mockResolvedValueOnce(updatedCart);
      const { wrapper, queryClient } = createWrapper();

      const { result } = renderHook(() => useRemoveCartItem(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(1);
      });

      expect(cartService.removeItem).toHaveBeenCalledWith(1);
      expect(queryClient.getQueryData(cartKeys.detail())).toEqual(updatedCart);
      expect(toast.success).toHaveBeenCalledWith('Đã xóa món khỏi giỏ hàng.');
    });
  });

  describe('useClearCart', () => {
    it('clears cart and sets empty cart in cache', async () => {
      vi.mocked(cartService.clearCart).mockResolvedValueOnce(undefined);
      const { wrapper, queryClient } = createWrapper();

      const { result } = renderHook(() => useClearCart(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(cartService.clearCart).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryData(cartKeys.detail())).toEqual({
        items: [],
        subtotal: 0,
      });
      expect(toast.success).toHaveBeenCalledWith('Đã làm trống giỏ hàng.');
    });
  });
});
