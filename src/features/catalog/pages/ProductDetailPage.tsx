import { useParams, Link, useNavigate } from 'react-router';
import { ChevronLeft, CupSoda } from 'lucide-react';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { formatMoney } from '@/shared/lib/formatters';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton, ErrorState } from '@/shared/components/feedback';
import { useAuth } from '@/features/auth';
import { useAddToCart } from '@/features/cart';
import { useProduct } from '../hooks/useProduct';
import { ProductCustomizer } from '../components/ProductCustomizer';
import type { Option, Product, ProductSize } from '../types/catalog.types';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const addToCartMutation = useAddToCart();
  const { data: product, isLoading, isError, refetch } = useProduct(slug || '');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorState
          title="Không tìm thấy sản phẩm"
          message="Món đồ uống này có thể đã bị xóa hoặc tạm ngưng phục vụ."
          onRetry={refetch}
        />
        <div className="text-center mt-6">
          <Link
            to={ROUTE_PATHS.MENU}
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Quay lại thực đơn đồ uống</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = (payload: {
    product: Product;
    size?: ProductSize;
    options: Option[];
    quantity: number;
  }) => {
    if (!isAuthenticated) {
      navigate(
        `${ROUTE_PATHS.LOGIN}?redirect=${encodeURIComponent(
          ROUTE_PATHS.PRODUCT_DETAIL(slug || ''),
        )}`,
      );
      return;
    }

    addToCartMutation.mutate({
      productId: payload.product.id,
      sizeId: payload.size?.id,
      optionIds: payload.options.map((o) => o.id),
      quantity: payload.quantity,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to={ROUTE_PATHS.MENU}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Quay lại thực đơn</span>
        </Link>
      </div>

      {/* Product Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Product Media & Highlights */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border/60 bg-muted/30 shadow-md">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10">
                <CupSoda className="h-28 w-28 text-muted-foreground/30" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {product.category?.name && (
                <Badge variant="secondary" className="backdrop-blur-md bg-background/90 font-medium">
                  {product.category.name}
                </Badge>
              )}
              {!product.isAvailable && (
                <Badge variant="destructive" className="font-semibold shadow-xs">
                  Tạm ngưng phục vụ
                </Badge>
              )}
            </div>
          </div>

          {/* Description Card */}
          {product.description && (
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Giới thiệu món
              </h2>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Right: Title, Base Price, and Interactive Customizer */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {product.name}
            </h1>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-primary">
                {formatMoney(product.basePrice)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                (Giá cơ bản)
              </span>
            </div>
          </div>

          {/* Interactive Customizer */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs">
            <ProductCustomizer
              product={product}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
