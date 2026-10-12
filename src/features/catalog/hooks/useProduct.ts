import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { catalogKeys } from '../services/catalog.keys';
import type { Product } from '../types/catalog.types';

export const useProduct = (slug: string) => {
  return useQuery<Product>({
    queryKey: catalogKeys.product(slug),
    queryFn: () => catalogService.getProductBySlug(slug),
    enabled: Boolean(slug),
  });
};
