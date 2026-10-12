// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCustomizer } from '../components/ProductCustomizer';
import type { Category, Product } from '../types/catalog.types';

afterEach(() => {
  cleanup();
});

const mockProduct: Product = {
  id: 1,
  name: 'Trà Sữa Trân Châu',
  slug: 'tra-sua-tran-chau',
  description: 'Trà sữa thơm ngon đậm vị trà, béo ngậy vị sữa.',
  basePrice: 35000,
  isAvailable: true,
  isActive: true,
  categoryId: 1,
  category: { id: 1, name: 'Trà Sữa', slug: 'tra-sua', sortOrder: 0 },
  sizes: [
    { id: 1, name: 'S', priceDelta: 0, isDefault: true },
    { id: 2, name: 'M', priceDelta: 5000, isDefault: false },
  ],
  optionGroups: [
    {
      id: 1,
      name: 'Mức đường',
      selectType: 'single',
      minSelect: 1,
      maxSelect: 1,
      sortOrder: 0,
      options: [
        { id: 10, name: '100% Đường', priceDelta: 0, isDefault: true, isAvailable: true, sortOrder: 0 },
        { id: 11, name: '50% Đường', priceDelta: 0, isDefault: false, isAvailable: true, sortOrder: 1 },
      ],
    },
    {
      id: 2,
      name: 'Topping thêm',
      selectType: 'multiple',
      minSelect: 0,
      maxSelect: 2,
      sortOrder: 1,
      options: [
        { id: 20, name: 'Trân châu đen', priceDelta: 5000, isDefault: false, isAvailable: true, sortOrder: 0 },
      ],
    },
  ],
};

describe('ProductCard', () => {
  it('renders product information, category tag, and price', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Trà Sữa Trân Châu')).toBeInTheDocument();
    expect(screen.getByText('Trà Sữa')).toBeInTheDocument();
    expect(screen.getByText('Chọn món')).toBeInTheDocument();
  });

  it('renders sold-out badge when product is not available', () => {
    const unavailableProduct: Product = {
      ...mockProduct,
      isAvailable: false,
    };

    render(
      <MemoryRouter>
        <ProductCard product={unavailableProduct} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Hết món')).toBeInTheDocument();
  });
});

describe('CategoryPills', () => {
  const categories: Category[] = [
    { id: 1, name: 'Trà Sữa', slug: 'tra-sua', sortOrder: 0, isActive: true },
    { id: 2, name: 'Cà Phê', slug: 'ca-phe', sortOrder: 1, isActive: true },
  ];

  it('renders categories with "Tất cả" tab', () => {
    const onSelect = vi.fn();
    render(
      <CategoryPills
        categories={categories}
        selectedCategorySlug="tra-sua"
        onSelectCategory={onSelect}
      />,
    );

    expect(screen.getByText('Tất cả')).toBeInTheDocument();
    expect(screen.getByText('Trà Sữa')).toBeInTheDocument();
    expect(screen.getByText('Cà Phê')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cà Phê'));
    expect(onSelect).toHaveBeenCalledWith('ca-phe');

    fireEvent.click(screen.getByText('Tất cả'));
    expect(onSelect).toHaveBeenCalledWith(undefined);
  });
});

describe('ProductCustomizer', () => {
  it('renders sizes, options, and handles size change', () => {
    const onAddToCart = vi.fn();
    render(<ProductCustomizer product={mockProduct} onAddToCart={onAddToCart} />);

    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('Mức đường')).toBeInTheDocument();
    expect(screen.getByText('Topping thêm')).toBeInTheDocument();

    // Change size to M (+5,000)
    fireEvent.click(screen.getByText('M'));

    // Submit add to cart
    fireEvent.click(screen.getByRole('button', { name: /Thêm vào giỏ/i }));
    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart.mock.calls[0][0].size.name).toBe('M');
  });

  it('increases and decreases quantity', () => {
    const onAddToCart = vi.fn();
    render(<ProductCustomizer product={mockProduct} onAddToCart={onAddToCart} />);

    const plusButton = screen.getByLabelText('Tăng số lượng');
    fireEvent.click(plusButton);
    expect(screen.getByText('2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Thêm vào giỏ/i }));
    expect(onAddToCart.mock.calls[0][0].quantity).toBe(2);
  });
});
