import { Link } from 'react-router';
import { ArrowRight, Sparkles, CupSoda } from 'lucide-react';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/feedback';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

export function HomePage() {
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: productsData, isLoading: isProductsLoading } = useProducts({ limit: 4 });
  const featuredProducts = productsData?.data || [];

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-primary/15 border border-border/60 px-6 py-12 sm:px-12 sm:py-20 text-center sm:text-left">
        <div className="relative z-10 max-w-2xl mx-auto sm:mx-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-xs border border-primary/20 mb-4 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Đồ uống tươi mới mỗi ngày</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-tight">
            Khám phá hương vị <br className="hidden sm:inline" />
            <span className="text-primary">thanh mát & đặc sắc</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Tuyển chọn những búp trà tươi non và hạt cà phê thơm đượm, kết hợp cùng các loại topping thượng hạng, mang lại trải nghiệm sảng khoái trọn vẹn.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <Link to={ROUTE_PATHS.MENU} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full font-semibold gap-2 shadow-md shadow-primary/20 cursor-pointer">
                <span>Xem thực đơn ngay</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative graphic backdrop */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </section>

      {/* 2. Featured Categories Showcase */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Danh mục đồ uống
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Đa dạng thể loại đáp ứng mọi sở thích của bạn
            </p>
          </div>

          <Link
            to={ROUTE_PATHS.MENU}
            className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isCategoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`${ROUTE_PATHS.MENU}?category=${category.slug}`}
                className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all text-center"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-3">
                  <CupSoda className="h-6 w-6" />
                </div>
                <span className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Popular Drinks Spotlight */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Món ngon nổi bật
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Những thức uống được yêu thích nhất thời gian gần đây
            </p>
          </div>

          <Link
            to={ROUTE_PATHS.MENU}
            className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Khám phá thêm</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
