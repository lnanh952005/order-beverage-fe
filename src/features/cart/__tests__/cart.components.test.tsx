// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CartBadge } from '../components/CartBadge';
import { CartItemCard } from '../components/CartItemCard';
import { CartSummary } from '../components/CartSummary';
import { CartPage } from '../pages/CartPage';
import * as useCartModule from '../hooks/useCart';
import * as useUpdateCartItemModule from '../hooks/useUpdateCartItem';
import * as useRemoveCartItemModule from '../hooks/useRemoveCartItem';
import * as useClearCartModule from '../hooks/useClearCart';
import type { Cart, CartItem } from '../types/cart.types';

afterEach(() => {
  cleanup();
});

const mockItemAvailable: CartItem = {
  id: 1,
  product: {
    id: 10,
    name: 'Trà Sữa Oolong Nướng',
    slug: 'tra-sua-oolong-nuong',
    imageUrl: 'https://example.com/tea.jpg',
  },
  size: { id: 1, name: 'L', priceDelta: 10000 },
  options: [{ id: 101, groupName: 'Độ ngọt', name: '50% đường', priceDelta: 0 }],
  quantity: 2,
  note: 'Ít đá',
  unitPrice: 45000,
  lineTotal: 90000,
  isAvailable: true,
};

const mockItemUnavailable: CartItem = {
  id: 2,
  product: {
    id: 11,
    name: 'Trà Đào Cam Sả',
    slug: 'tra-dao-cam-sa',
    imageUrl: null,
  },
  size: null,
  options: [],
  quantity: 1,
  note: null,
  unitPrice: 40000,
  lineTotal: 40000,
  isAvailable: false,
};

const mockCart: Cart = {
  items: [mockItemAvailable],
  subtotal: 90000,
};

describe('CartBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders badge with count when itemCount > 0', () => {
    vi.spyOn(useCartModule, 'useCart').mockReturnValue({
      cart: mockCart,
      isLoading: false,
      isError: false,
      itemCount: 5,
      hasUnavailableItems: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCartModule.useCart>);

    render(
      <MemoryRouter>
        <CartBadge />
      </MemoryRouter>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giỏ hàng, 5 món/i })).toBeInTheDocument();
  });

  it('renders "99+" when itemCount exceeds 99', () => {
    vi.spyOn(useCartModule, 'useCart').mockReturnValue({
      cart: mockCart,
      isLoading: false,
      isError: false,
      itemCount: 120,
      hasUnavailableItems: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCartModule.useCart>);

    render(
      <MemoryRouter>
        <CartBadge />
      </MemoryRouter>
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('does not display count badge when itemCount is 0', () => {
    vi.spyOn(useCartModule, 'useCart').mockReturnValue({
      cart: { items: [], subtotal: 0 },
      isLoading: false,
      isError: false,
      itemCount: 0,
      hasUnavailableItems: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCartModule.useCart>);

    render(
      <MemoryRouter>
        <CartBadge />
      </MemoryRouter>
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Giỏ hàng' })).toBeInTheDocument();
  });
});

describe('CartItemCard', () => {
  const mockMutateUpdate = vi.fn();
  const mockMutateRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useUpdateCartItemModule, 'useUpdateCartItem').mockReturnValue({
      mutate: mockMutateUpdate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateCartItemModule.useUpdateCartItem>);
    vi.spyOn(useRemoveCartItemModule, 'useRemoveCartItem').mockReturnValue({
      mutate: mockMutateRemove,
      isPending: false,
    } as unknown as ReturnType<typeof useRemoveCartItemModule.useRemoveCartItem>);
  });

  it('renders item details, size, options, note and pricing', () => {
    render(
      <MemoryRouter>
        <CartItemCard item={mockItemAvailable} />
      </MemoryRouter>
    );

    expect(screen.getByText('Trà Sữa Oolong Nướng')).toBeInTheDocument();
    expect(screen.getByText(/Size L/i)).toBeInTheDocument();
    expect(screen.getByText(/Độ ngọt: 50% đường/i)).toBeInTheDocument();
    expect(screen.getByText(/Ghi chú: “Ít đá”/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // quantity
  });

  it('triggers updateItem mutation on plus and minus clicks', () => {
    render(
      <MemoryRouter>
        <CartItemCard item={mockItemAvailable} />
      </MemoryRouter>
    );

    const plusBtn = screen.getByRole('button', { name: 'Tăng số lượng' });
    fireEvent.click(plusBtn);
    expect(mockMutateUpdate).toHaveBeenCalledWith({
      itemId: 1,
      input: { quantity: 3 },
    });

    const minusBtn = screen.getByRole('button', { name: 'Giảm số lượng' });
    fireEvent.click(minusBtn);
    expect(mockMutateUpdate).toHaveBeenCalledWith({
      itemId: 1,
      input: { quantity: 1 },
    });
  });

  it('triggers removeItem mutation on trash button click', () => {
    render(
      <MemoryRouter>
        <CartItemCard item={mockItemAvailable} />
      </MemoryRouter>
    );

    const deleteBtn = screen.getByRole('button', {
      name: /Xóa Trà Sữa Oolong Nướng khỏi giỏ hàng/i,
    });
    fireEvent.click(deleteBtn);
    expect(mockMutateRemove).toHaveBeenCalledWith(1);
  });

  it('displays out of stock message when item is unavailable', () => {
    render(
      <MemoryRouter>
        <CartItemCard item={mockItemUnavailable} />
      </MemoryRouter>
    );

    expect(screen.getByText('Hết hàng')).toBeInTheDocument();
    expect(
      screen.getByText(/Món này hoặc tùy chọn kèm theo hiện đã hết hàng/i)
    ).toBeInTheDocument();
  });
});

describe('CartSummary', () => {
  const mockMutateClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useClearCartModule, 'useClearCart').mockReturnValue({
      mutate: mockMutateClear,
      isPending: false,
    } as unknown as ReturnType<typeof useClearCartModule.useClearCart>);
  });

  it('renders subtotal, shipping hint, and checkout button', () => {
    render(
      <MemoryRouter>
        <CartSummary cart={mockCart} hasUnavailableItems={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Tóm tắt đơn hàng')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tiến hành thanh toán/i })).toBeEnabled();
  });

  it('displays warning alert and disables checkout when items are unavailable', () => {
    render(
      <MemoryRouter>
        <CartSummary cart={mockCart} hasUnavailableItems={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('Có món tạm thời hết hàng')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tiến hành thanh toán/i })).toBeDisabled();
  });

  it('confirms and calls clearCart on clear button click', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <CartSummary cart={mockCart} hasUnavailableItems={false} />
      </MemoryRouter>
    );

    const clearBtn = screen.getByRole('button', { name: /Làm trống giỏ hàng/i });
    fireEvent.click(clearBtn);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockMutateClear).toHaveBeenCalledTimes(1);
  });
});

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useUpdateCartItemModule, 'useUpdateCartItem').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateCartItemModule.useUpdateCartItem>);
    vi.spyOn(useRemoveCartItemModule, 'useRemoveCartItem').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useRemoveCartItemModule.useRemoveCartItem>);
    vi.spyOn(useClearCartModule, 'useClearCart').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useClearCartModule.useClearCart>);
  });

  it('renders skeleton loading state', () => {
    vi.spyOn(useCartModule, 'useCart').mockReturnValue({
      cart: undefined,
      isLoading: true,
      isError: false,
      itemCount: 0,
      hasUnavailableItems: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCartModule.useCart>);

    const { container } = render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders error state with retry button', () => {
    const mockRefetch = vi.fn();
    vi.spyOn(useCartModule, 'useCart').mockReturnValue({
      cart: undefined,
      isLoading: false,
      isError: true,
      itemCount: 0,
      hasUnavailableItems: false,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useCartModule.useCart>);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Không thể tải giỏ hàng')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /thử lại/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when cart is empty', () => {
    vi.spyOn(useCartModule, 'useCart').mockReturnValue({
      cart: { items: [], subtotal: 0 },
      isLoading: false,
      isError: false,
      itemCount: 0,
      hasUnavailableItems: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCartModule.useCart>);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Giỏ hàng của bạn đang trống')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Khám phá thực đơn/i })).toBeInTheDocument();
  });

  it('renders full cart with items and summary when cart has items', () => {
    vi.spyOn(useCartModule, 'useCart').mockReturnValue({
      cart: mockCart,
      isLoading: false,
      isError: false,
      itemCount: 2,
      hasUnavailableItems: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCartModule.useCart>);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Giỏ hàng của bạn')).toBeInTheDocument();
    expect(screen.getByText('2 món')).toBeInTheDocument();
    expect(screen.getByText('Trà Sữa Oolong Nướng')).toBeInTheDocument();
    expect(screen.getByText('Tóm tắt đơn hàng')).toBeInTheDocument();
  });
});
