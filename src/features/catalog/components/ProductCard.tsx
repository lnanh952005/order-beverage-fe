import { Link } from 'react-router';
import { CupSoda, Plus } from 'lucide-react';
import { formatMoney } from '@/shared/lib/formatters';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import type { Product } from '../types/catalog.types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isAvailable = product.isAvailable;

  return (
    <Card className="group relative flex flex-col overflow-hidden border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 rounded-2xl">
      {/* Product Image or Fallback */}
      <Link
        to={`/menu/${product.slug}`}
        className="relative aspect-4/3 w-full overflow-hidden bg-muted/40 block"
        tabIndex={-1}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10">
            <CupSoda className="h-16 w-16 text-muted-foreground/40 transition-transform duration-300 group-hover:scale-110" />
          </div>
        )}

        {/* Availability Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-xs">
            <Badge variant="destructive" className="px-3 py-1 text-xs font-semibold shadow-sm">
              Hết món
            </Badge>
          </div>
        )}

        {/* Category Tag */}
        {product.category?.name && (
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-medium text-foreground/80 backdrop-blur-md shadow-xs border border-border/40">
            {product.category.name}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link
          to={`/menu/${product.slug}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xs"
        >
          <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm flex-1">
          {product.description || 'Hương vị thơm ngon, chế biến từ nguyên liệu tươi nguyên chất.'}
        </p>

        {/* Pricing and Action Footer */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Giá từ</span>
            <span className="text-base font-bold text-primary sm:text-lg">
              {formatMoney(product.basePrice)}
            </span>
          </div>

          <Link
            to={`/menu/${product.slug}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              isAvailable
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
                : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
            }`}
          >
            <span>{isAvailable ? 'Chọn món' : 'Hết hàng'}</span>
            {isAvailable && <Plus className="h-3.5 w-3.5" />}
          </Link>
        </div>
      </div>
    </Card>
  );
}
