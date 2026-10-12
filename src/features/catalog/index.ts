// Feature routes (lazy loaded)
export { catalogRoutes, catalogAdminRoutes } from './routes';

// Public customer hooks
export { useCategories } from './hooks/useCategories';
export { useProducts } from './hooks/useProducts';
export { useProduct } from './hooks/useProduct';

// Public customer components
export { ProductCard } from './components/ProductCard';
export { CategoryPills } from './components/CategoryPills';
export { ProductCustomizer } from './components/ProductCustomizer';

// Utils
export { calcPricePreview } from './utils/pricing';

// Domain types
export type {
  Category,
  Product,
  ProductSize,
  OptionGroup,
  Option,
  ListProductsQuery,
  PaginatedResult,
} from './types/catalog.types';
