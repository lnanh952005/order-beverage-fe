import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { catalogKeys } from '../services/catalog.keys';
import type { ListProductsQuery, PaginatedResult, Product } from '../types/catalog.types';

export const useProducts = (params?: ListProductsQuery) => {
  return useQuery<PaginatedResult<Product>>({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogService.getProducts(params),
  });
};
