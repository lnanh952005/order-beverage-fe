import { useState, useMemo } from 'react';
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatMoney } from '@/shared/lib/formatters';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { calcPricePreview } from '../utils/pricing';
import type { Option, OptionGroup, Product, ProductSize } from '../types/catalog.types';

interface ProductCustomizerProps {
  product: Product;
  onAddToCart?: (payload: {
    product: Product;
    size?: ProductSize;
    options: Option[];
    quantity: number;
    totalPrice: number;
  }) => void;
}

export function ProductCustomizer({ product, onAddToCart }: ProductCustomizerProps) {
  // Sort sizes: S first, then M, then L, or by priceDelta
  const sortedSizes = useMemo(() => {
    if (!product.sizes || product.sizes.length === 0) return [];
    return [...product.sizes].sort((a, b) => a.priceDelta - b.priceDelta);
  }, [product.sizes]);

  // Selected size state
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    sortedSizes[0],
  );

  // Selected options state: Map of optionGroupId -> Option[]
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<number, Option[]>>(() => {
    const initialMap: Record<number, Option[]> = {};
    if (!product.optionGroups) return initialMap;

    for (const group of product.optionGroups) {
      if (!group.options || group.options.length === 0) continue;
      const isMultiple = group.selectType === 'multiple' || Boolean(group.allowMultiple);

      if (!isMultiple) {
        // Single select: pick default or first available option
        const defaultOption = group.options.find((o) => o.isDefault && o.isAvailable) ||
          group.options.find((o) => o.isAvailable);
        if (defaultOption) {
          initialMap[group.id] = [defaultOption];
        }
      } else {
        // Multi select: pick all isDefault options
        const defaultOptions = group.options.filter((o) => o.isDefault && o.isAvailable);
        if (defaultOptions.length > 0) {
          initialMap[group.id] = defaultOptions;
        }
      }
    }
    return initialMap;
  });

  // Quantity state
  const [quantity, setQuantity] = useState<number>(1);

  // Flatten selected options for pricing calculation
  const allSelectedOptions = useMemo(() => {
    return Object.values(selectedOptionsMap).flat();
  }, [selectedOptionsMap]);

  // Live Unit and Total Price
  const unitPrice = useMemo(() => {
    return calcPricePreview(product.basePrice, selectedSize, allSelectedOptions);
  }, [product.basePrice, selectedSize, allSelectedOptions]);

  const totalPrice = unitPrice * quantity;

  // Toggle single option
  const handleSingleSelect = (group: OptionGroup, option: Option) => {
    if (!option.isAvailable) return;
    setSelectedOptionsMap((prev) => ({
      ...prev,
      [group.id]: [option],
    }));
  };

  // Toggle multi option
  const handleMultiSelect = (group: OptionGroup, option: Option) => {
    if (!option.isAvailable) return;

    setSelectedOptionsMap((prev) => {
      const currentList = prev[group.id] || [];
      const isAlreadySelected = currentList.some((o) => o.id === option.id);
      const isRequired = group.minSelect > 0 || Boolean(group.isRequired);

      if (isAlreadySelected) {
        // If required and it's the only one selected, check minSelect
        if (isRequired && currentList.length <= group.minSelect) {
          toast.warning(`Bạn cần chọn tối thiểu ${group.minSelect} lựa chọn trong ${group.name}.`);
          return prev;
        }
        return {
          ...prev,
          [group.id]: currentList.filter((o) => o.id !== option.id),
        };
      }

      // Check maxSelect
      if (currentList.length >= group.maxSelect) {
        toast.warning(`Chỉ được chọn tối đa ${group.maxSelect} lựa chọn trong ${group.name}.`);
        return prev;
      }

      return {
        ...prev,
        [group.id]: [...currentList, option],
      };
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCartSubmit = () => {
    if (!product.isAvailable) {
      toast.error('Sản phẩm hiện đang tạm hết.');
      return;
    }

    // Verify required groups
    if (product.optionGroups) {
      for (const group of product.optionGroups) {
        const selected = selectedOptionsMap[group.id] || [];
        const isRequired = group.minSelect > 0 || Boolean(group.isRequired);
        if (isRequired && selected.length < group.minSelect) {
          toast.error(`Vui lòng chọn đầy đủ tùy chọn cho "${group.name}".`);
          return;
        }
      }
    }

    if (onAddToCart) {
      onAddToCart({
        product,
        size: selectedSize,
        options: allSelectedOptions,
        quantity,
        totalPrice,
      });
    } else {
      const sizeLabel = selectedSize?.name || selectedSize?.sizeCode || 'Mặc định';
      toast.success(
        `Đã thêm ${quantity}x "${product.name}" (${sizeLabel}) vào giỏ hàng!`,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Size Selection */}
      {sortedSizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Chọn kích cỡ <span className="text-destructive">*</span>
            </span>
            <span className="text-xs text-muted-foreground">Bắt buộc</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {sortedSizes.map((size) => {
              const isSelected = selectedSize?.id === size.id;
              const sizeLabel = size.name || size.sizeCode || 'Tiêu chuẩn';
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'relative flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary shadow-xs font-semibold ring-1 ring-primary'
                      : 'border-border/70 bg-card hover:border-border hover:bg-muted/40 text-foreground',
                  )}
                >
                  <span className="text-sm font-bold uppercase tracking-wide">
                    {sizeLabel}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {size.priceDelta > 0 ? `+${formatMoney(size.priceDelta)}` : 'Tiêu chuẩn'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Option Groups */}
      {product.optionGroups &&
        product.optionGroups.map((group) => {
          const selectedList = selectedOptionsMap[group.id] || [];
          const isMultiple = group.selectType === 'multiple' || Boolean(group.allowMultiple);
          const isRequired = group.minSelect > 0 || Boolean(group.isRequired);

          return (
            <div key={group.id} className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    {group.name}
                  </span>
                  {isRequired && <span className="ml-1 text-destructive">*</span>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {isMultiple
                    ? `Tối đa ${group.maxSelect}`
                    : isRequired
                      ? 'Bắt buộc chọn 1'
                      : 'Tùy chọn'}
                </span>
              </div>

              {isMultiple ? (
                // Multi-select (Checkboxes)
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map((option) => {
                    const isSelected = selectedList.some((o) => o.id === option.id);
                    const isMaxReached =
                      !isSelected && selectedList.length >= group.maxSelect;
                    const isDisabled = !option.isAvailable || isMaxReached;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleMultiSelect(group, option)}
                        className={cn(
                          'flex items-center justify-between rounded-xl border p-3 text-left transition-all text-xs sm:text-sm cursor-pointer',
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary font-medium'
                            : 'border-border/70 bg-card hover:bg-muted/30 text-foreground',
                          isDisabled &&
                            'opacity-40 cursor-not-allowed bg-muted/20 border-dashed',
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border text-xs',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/40',
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span>{option.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {option.priceDelta > 0
                            ? `+${formatMoney(option.priceDelta)}`
                            : 'Miễn phí'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Single-select (Radio Pills)
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {group.options.map((option) => {
                    const isSelected = selectedList.some((o) => o.id === option.id);
                    const isDisabled = !option.isAvailable;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleSingleSelect(group, option)}
                        className={cn(
                          'flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all text-xs sm:text-sm cursor-pointer',
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary font-semibold'
                            : 'border-border/70 bg-card hover:bg-muted/30 text-foreground',
                          isDisabled &&
                            'opacity-40 cursor-not-allowed bg-muted/20 border-dashed',
                        )}
                      >
                        <span>{option.name}</span>
                        {option.priceDelta > 0 && (
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            +{formatMoney(option.priceDelta)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      {/* 3. Quantity & Add to Cart Footer */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <span className="text-sm font-medium text-muted-foreground">Số lượng:</span>
          <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-2xs">
            <button
              type="button"
              disabled={quantity <= 1 || !product.isAvailable}
              onClick={() => handleQuantityChange(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer"
              aria-label="Giảm số lượng"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm">
              {quantity}
            </span>
            <button
              type="button"
              disabled={!product.isAvailable}
              onClick={() => handleQuantityChange(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer"
              aria-label="Tăng số lượng"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CTA Button with Price */}
        <Button
          size="lg"
          disabled={!product.isAvailable}
          onClick={handleAddToCartSubmit}
          className="w-full sm:w-auto min-w-[220px] rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20"
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Thêm vào giỏ</span>
          <span>•</span>
          <span>{formatMoney(totalPrice)}</span>
        </Button>
      </div>
    </div>
  );
}
