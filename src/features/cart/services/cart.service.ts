import { httpClient } from '@/shared/api/http-client';
import type { Cart, AddToCartInput, UpdateCartItemInput } from '../types/cart.types';

export const cartService = {
  getCart: () => httpClient.get<Cart>('/cart'),
  addItem: (body: AddToCartInput) => httpClient.post<Cart>('/cart/items', body),
  updateItem: (itemId: number, body: UpdateCartItemInput) =>
    httpClient.patch<Cart>(`/cart/items/${itemId}`, body),
  removeItem: (itemId: number) => httpClient.delete<Cart>(`/cart/items/${itemId}`),
  clearCart: () => httpClient.delete<void>('/cart'),
};
