import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Skeleton, EmptyState, ErrorState } from '@/shared/components/feedback';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCard } from '../components/ProductCard';

export function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categorySlug = searchParams.get('category') || undefined;
  const searchQuery = searchParams.get('q') || '';
  const sort = (searchParams.get('sort') as 'name' | 'price') || undefined;
  const order = (searchParams.get('order') as 'asc' | 'desc') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(searchQuery);

  // Queries
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError,
    refetch,
  } = useProducts({
    categorySlug,
    q: searchQuery || undefined,
    sort,
    order,
    page,
    limit: 12,
  });

  const products = productsData?.data || [];
  const meta = productsData?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  // Handlers
  const handleSelectCategory = (slug?: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug) {
        next.set('category', slug);
      } else {
        next.delete('category');
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (searchInput.trim()) {
        next.set('q', searchInput.trim());
      } else {
        next.delete('q');
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleSortChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value) {
        next.delete('sort');
        next.delete('order');
      } else {
        const [s, o] = value.split(':');
        next.set('sort', s);
        next.set('order', o);
      }
      next.set('page', '1');
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const currentSortValue = sort && order ? `${sort}:${order}` : '';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 1. Header & Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Thực đơn đồ uống
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Lựa chọn thức uống yêu thích của bạn, tùy chỉnh mức đường, đá và những món topping hấp dẫn.
        </p>
      </div>

      {/* 2. Controls: Search, Filter Tabs & Sort */}
      <div className="flex flex-col gap-4">
        {/* Search & Sort row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm đồ uống theo tên..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-20 h-10 rounded-full bg-card"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 rounded-full text-xs font-semibold px-3"
            >
              Tìm
            </Button>
          </form>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <select
              value={currentSortValue}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-10 rounded-full border border-input bg-card px-4 text-xs sm:text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="">Sắp xếp mặc định</option>
              <option value="price:asc">Giá: Thấp đến cao</option>
              <option value="price:desc">Giá: Cao đến thấp</option>
              <option value="name:asc">Tên: A - Z</option>
              <option value="name:desc">Tên: Z - A</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        {!isCategoriesLoading && (
          <CategoryPills
            categories={categories}
            selectedCategorySlug={categorySlug}
            onSelectCategory={handleSelectCategory}
            className="pt-1"
          />
        )}
      </div>

      {/* 3. Products Grid */}
      {isError ? (
        <ErrorState
          title="Không thể tải thực đơn"
          message="Đã có lỗi xảy ra trong quá trình lấy danh sách đồ uống. Vui lòng thử lại."
          onRetry={refetch}
        />
      ) : isProductsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đồ uống phù hợp"
          description={
            searchQuery || categorySlug
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục đồ uống khác.'
              : 'Hiện chưa có món nào trong thực đơn.'
          }
          action={
            (searchQuery || categorySlug) && (
              <Button onClick={handleResetFilters} variant="outline" size="sm">
                Xóa tất cả bộ lọc
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="cursor-pointer"
              >
                Trang trước
              </Button>
              <span className="text-xs sm:text-sm font-medium px-3 text-muted-foreground">
                Trang <span className="font-bold text-foreground">{page}</span> / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="cursor-pointer"
              >
                Trang sau
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
