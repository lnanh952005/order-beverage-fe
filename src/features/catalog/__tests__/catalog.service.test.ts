import { describe, it, expect, vi } from 'vitest';
import { catalogKeys } from '../services/catalog.keys';
import { catalogService } from '../services/catalog.service';
import { httpClient } from '@/shared/api/http-client';

vi.mock('@/shared/api/http-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('catalogKeys', () => {
  it('generates consistent keys', () => {
    expect(catalogKeys.all).toEqual(['catalog']);
    expect(catalogKeys.categories()).toEqual(['catalog', 'categories']);
    expect(catalogKeys.products({ categorySlug: 'tra-sua' })).toEqual([
      'catalog',
      'products',
      { categorySlug: 'tra-sua' },
    ]);
    expect(catalogKeys.product('tra-dao')).toEqual(['catalog', 'product', 'tra-dao']);
    expect(catalogKeys.adminCategories()).toEqual(['catalog', 'admin', 'categories', {}]);
    expect(catalogKeys.adminProducts()).toEqual(['catalog', 'admin', 'products', {}]);
    expect(catalogKeys.adminOptionGroups()).toEqual(['catalog', 'admin', 'option-groups']);
  });
});

describe('catalogService', () => {
  it('calls getCategories via GET /categories', async () => {
    const mockCategories = [{ id: 1, name: 'Trà Sữa', slug: 'tra-sua', sortOrder: 0 }];
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockCategories);

    const result = await catalogService.getCategories();
    expect(httpClient.get).toHaveBeenCalledWith('/categories');
    expect(result).toEqual(mockCategories);
  });

  it('calls getProducts via GET /products', async () => {
    const mockPaginated = {
      data: [{ id: 1, name: 'Trà Sữa Trân Châu', slug: 'tra-sua-tran-chau' }],
      meta: { page: 1, limit: 12, total: 1 },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockPaginated);

    const result = await catalogService.getProducts({ page: 1 });
    expect(httpClient.get).toHaveBeenCalledWith('/products', { params: { page: 1 } });
    expect(result).toEqual(mockPaginated);
  });

  it('calls getProductBySlug via GET /products/:slug', async () => {
    const mockProduct = { id: 1, name: 'Trà Sữa Trân Châu', slug: 'tra-sua-tran-chau' };
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockProduct);

    const result = await catalogService.getProductBySlug('tra-sua-tran-chau');
    expect(httpClient.get).toHaveBeenCalledWith('/products/tra-sua-tran-chau');
    expect(result).toEqual(mockProduct);
  });

  it('calls createProduct via POST /admin/products', async () => {
    const input = {
      categoryId: 1,
      name: 'Trà Oolong',
      slug: 'tra-oolong',
      basePrice: 32000,
      sizes: [{ name: 'S', priceDelta: 0, isDefault: true }],
    };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ id: 2, ...input });

    const result = await catalogService.createProduct(input);
    expect(httpClient.post).toHaveBeenCalledWith('/admin/products', input);
    expect(result.id).toBe(2);
  });

  it('calls toggleProductAvailability via PATCH /admin/products/:id/availability', async () => {
    vi.mocked(httpClient.patch).mockResolvedValueOnce({ id: 2, isAvailable: false });

    const result = await catalogService.toggleProductAvailability(2, false);
    expect(httpClient.patch).toHaveBeenCalledWith('/admin/products/2/availability', {
      isAvailable: false,
    });
    expect(result.isAvailable).toBe(false);
  });

  it('calls updateProductSizes via PUT /admin/products/:id/sizes', async () => {
    const sizes = [{ name: 'M', priceDelta: 0, isDefault: true }];
    vi.mocked(httpClient.put).mockResolvedValueOnce({ id: 2, sizes });

    const result = await catalogService.updateProductSizes(2, sizes);
    expect(httpClient.put).toHaveBeenCalledWith('/admin/products/2/sizes', { sizes });
    expect(result.sizes).toEqual(sizes);
  });

  it('calls deleteProduct via DELETE /admin/products/:id', async () => {
    vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined);

    await catalogService.deleteProduct(2);
    expect(httpClient.delete).toHaveBeenCalledWith('/admin/products/2');
  });
});
