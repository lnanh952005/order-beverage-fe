import type { PaginationMeta } from '@/shared/types/common.types';

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProductSize {
  id: number;
  name: string;
  sizeCode?: string;
  priceDelta: number;
  isDefault: boolean;
  sortOrder?: number;
}

export interface Option {
  id: number;
  optionGroupId?: number;
  name: string;
  priceDelta: number;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export interface OptionGroup {
  id: number;
  name: string;
  selectType: 'single' | 'multiple';
  allowMultiple?: boolean;
  isRequired?: boolean;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: Option[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  basePrice: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  isActive: boolean;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
    sortOrder?: number;
  };
  sizes?: ProductSize[];
  optionGroups?: OptionGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// -------------------------------------------------------------
// Query & Filter Types
// -------------------------------------------------------------

export interface ListProductsQuery {
  categorySlug?: string | undefined;
  q?: string | undefined;
  sort?: 'name' | 'price' | undefined;
  order?: 'asc' | 'desc' | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface AdminListProductsQuery {
  categoryId?: number | undefined;
  q?: string | undefined;
  isActive?: boolean | undefined;
  isAvailable?: boolean | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface ListCategoriesQuery {
  page?: number | undefined;
  limit?: number | undefined;
  includeDeleted?: boolean | undefined;
}

// -------------------------------------------------------------
// Mutation Inputs
// -------------------------------------------------------------

export interface CreateProductSizeInput {
  name: string;
  priceDelta: number;
  isDefault?: boolean | undefined;
  sortOrder?: number | undefined;
}

export interface CreateProductInput {
  categoryId: number;
  name: string;
  slug: string;
  description?: string | null | undefined;
  imageUrl?: string | null | undefined;
  basePrice: number;
  isActive?: boolean | undefined;
  isAvailable?: boolean | undefined;
  sizes: CreateProductSizeInput[];
  optionGroupIds?: number[] | undefined;
}

export interface UpdateProductInput {
  categoryId?: number | undefined;
  name?: string | undefined;
  slug?: string | undefined;
  description?: string | null | undefined;
  imageUrl?: string | null | undefined;
  basePrice?: number | undefined;
  isActive?: boolean | undefined;
  isAvailable?: boolean | undefined;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  imageUrl?: string | null | undefined;
  sortOrder?: number | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateCategoryInput {
  name?: string | undefined;
  slug?: string | undefined;
  imageUrl?: string | null | undefined;
  sortOrder?: number | undefined;
  isActive?: boolean | undefined;
}

export interface CreateOptionGroupInput {
  name: string;
  selectType: 'single' | 'multiple';
  minSelect?: number | undefined;
  maxSelect?: number | undefined;
  sortOrder?: number | undefined;
}

export interface UpdateOptionGroupInput {
  name?: string | undefined;
  selectType?: 'single' | 'multiple' | undefined;
  minSelect?: number | undefined;
  maxSelect?: number | undefined;
  sortOrder?: number | undefined;
}

export interface CreateOptionInput {
  name: string;
  priceDelta?: number | undefined;
  isDefault?: boolean | undefined;
  isAvailable?: boolean | undefined;
  sortOrder?: number | undefined;
}

export interface UpdateOptionInput {
  name?: string | undefined;
  priceDelta?: number | undefined;
  isDefault?: boolean | undefined;
  isAvailable?: boolean | undefined;
  sortOrder?: number | undefined;
}
