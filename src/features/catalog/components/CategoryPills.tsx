import { cn } from '@/shared/lib/utils';
import type { Category } from '../types/catalog.types';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategorySlug?: string;
  onSelectCategory: (slug?: string) => void;
  className?: string;
}

export function CategoryPills({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  className,
}: CategoryPillsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSelectCategory(undefined)}
        className={cn(
          'inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
          !selectedCategorySlug
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        Tất cả
      </button>

      {categories.map((category) => {
        const isSelected = selectedCategorySlug === category.slug;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.slug)}
            className={cn(
              'inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
