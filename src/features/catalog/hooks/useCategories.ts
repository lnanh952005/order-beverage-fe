import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { catalogKeys } from '../services/catalog.keys';
import type { Category } from '../types/catalog.types';

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: catalogKeys.categories(),
    queryFn: catalogService.getCategories,
  });
};
