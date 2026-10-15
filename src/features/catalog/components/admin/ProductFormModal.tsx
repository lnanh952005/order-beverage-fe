import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { uploadService } from '@/shared/services/upload.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/feedback';
import { toSlug } from '../../utils/slug';
import {
  productFormSchema,
  type ProductFormData,
} from '../../schemas/catalog.schemas';
import {
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductSizes,
  useUpdateProductOptionGroups,
} from '../../hooks/useAdminProducts';
import type { Category, OptionGroup, Product } from '../../types/catalog.types';

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  optionGroups: OptionGroup[];
  initialData?: Product | null;
}

export function ProductFormModal({
  open,
  onOpenChange,
  categories,
  optionGroups,
  initialData,
}: ProductFormModalProps) {
  const isEditing = Boolean(initialData);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const updateSizesMutation = useUpdateProductSizes();
  const updateOptionGroupsMutation = useUpdateProductOptionGroups();

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateSizesMutation.isPending ||
    updateOptionGroupsMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      categoryId: categories[0]?.id || 1,
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      basePrice: 30000,
      isActive: true,
      isAvailable: true,
      sizes: [
        { name: 'S', priceDelta: 0, isDefault: true, sortOrder: 0 },
        { name: 'M', priceDelta: 5000, isDefault: false, sortOrder: 1 },
        { name: 'L', priceDelta: 10000, isDefault: false, sortOrder: 2 },
      ],
      optionGroupIds: [],
    },
  });

  const { fields: sizeFields, append: appendSize, remove: removeSize } =
    useFieldArray({
      control,
      name: 'sizes',
    });

  const nameValue = watch('name');
  const imageUrlValue = watch('imageUrl');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (JPEG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadService.uploadImage(file);
      setValue('imageUrl', url, { shouldValidate: true, shouldDirty: true });
      toast.success('Tải ảnh lên Cloudinary thành công!');
    } catch {
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };
  const selectedOptionGroupIds = watch('optionGroupIds') || [];
  const currentSizes = watch('sizes') || [];

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Prepare initial sizes
        const mappedSizes =
          initialData.sizes && initialData.sizes.length > 0
            ? initialData.sizes.map((s, idx) => ({
                name: s.name || s.sizeCode || `Size ${idx + 1}`,
                priceDelta: s.priceDelta,
                isDefault: Boolean(s.isDefault),
                sortOrder: s.sortOrder ?? idx,
              }))
            : [{ name: 'Chuẩn', priceDelta: 0, isDefault: true, sortOrder: 0 }];

        // Prepare initial option group IDs
        const mappedGroupIds =
          initialData.optionGroups?.map((g) => g.id) || [];

        reset({
          categoryId: initialData.categoryId || (categories[0]?.id ?? 1),
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description || '',
          imageUrl: initialData.imageUrl || '',
          basePrice: initialData.basePrice,
          isActive: initialData.isActive,
          isAvailable: initialData.isAvailable,
          sizes: mappedSizes,
          optionGroupIds: mappedGroupIds,
        });
      } else {
        reset({
          categoryId: categories[0]?.id || 1,
          name: '',
          slug: '',
          description: '',
          imageUrl: '',
          basePrice: 30000,
          isActive: true,
          isAvailable: true,
          sizes: [
            { name: 'S', priceDelta: 0, isDefault: true, sortOrder: 0 },
            { name: 'M', priceDelta: 5000, isDefault: false, sortOrder: 1 },
            { name: 'L', priceDelta: 10000, isDefault: false, sortOrder: 2 },
          ],
          optionGroupIds: [],
        });
      }
    }
  }, [open, initialData, categories, reset]);

  const handleNameBlur = () => {
    if (!isEditing && nameValue) {
      setValue('slug', toSlug(nameValue), { shouldValidate: true });
    }
  };

  const handleSetDefaultSize = (index: number) => {
    const updated = currentSizes.map((s, i) => ({
      ...s,
      isDefault: i === index,
    }));
    setValue('sizes', updated, { shouldValidate: true });
  };

  const handleToggleOptionGroup = (groupId: number) => {
    const exists = selectedOptionGroupIds.includes(groupId);
    if (exists) {
      setValue(
        'optionGroupIds',
        selectedOptionGroupIds.filter((id) => id !== groupId),
      );
    } else {
      setValue('optionGroupIds', [...selectedOptionGroupIds, groupId]);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    const mappedSizes = data.sizes.map((s) => ({
      name: s.name,
      priceDelta: s.priceDelta,
      isDefault: Boolean(s.isDefault),
      sortOrder: s.sortOrder,
    }));

    if (initialData) {
      // 1. Update product basic details
      await updateMutation.mutateAsync({
        id: initialData.id,
        data: {
          categoryId: data.categoryId,
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          basePrice: data.basePrice,
          isActive: data.isActive,
          isAvailable: data.isAvailable,
        },
      });

      // 2. Update sizes
      await updateSizesMutation.mutateAsync({
        id: initialData.id,
        sizes: mappedSizes,
      });

      // 3. Update option groups
      await updateOptionGroupsMutation.mutateAsync({
        id: initialData.id,
        optionGroupIds: data.optionGroupIds ?? [],
      });
    } else {
      // Create product with sizes and option groups
      await createMutation.mutateAsync({
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        basePrice: data.basePrice,
        isActive: data.isActive,
        isAvailable: data.isAvailable,
        sizes: mappedSizes,
        optionGroupIds: data.optionGroupIds,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Cập nhật món đồ uống' : 'Thêm món đồ uống mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* 1. Category & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="product-categoryId">
                Danh mục <span className="text-destructive">*</span>
              </Label>
              <select
                id="product-categoryId"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                {...register('categoryId', { valueAsNumber: true })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-name">
                Tên món <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-name"
                placeholder="Ví dụ: Trà sữa Trân châu Đường đen"
                {...register('name')}
                onBlur={handleNameBlur}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* 2. Slug & Base Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="product-slug">
                  Slug (URL) <span className="text-destructive">*</span>
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    if (nameValue) {
                      setValue('slug', toSlug(nameValue), { shouldValidate: true });
                    }
                  }}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Tạo từ tên
                </button>
              </div>
              <Input
                id="product-slug"
                placeholder="tra-sua-tran-chau"
                {...register('slug')}
              />
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-basePrice">
                Giá cơ bản (VNĐ) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-basePrice"
                type="number"
                step="1000"
                min={0}
                placeholder="30000"
                {...register('basePrice', { valueAsNumber: true })}
              />
              {errors.basePrice && (
                <p className="text-xs text-destructive">{errors.basePrice.message}</p>
              )}
            </div>
          </div>

          {/* 3. Image URL & Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="product-imageUrl">Đường dẫn hình ảnh (URL)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-7 text-xs gap-1.5 cursor-pointer"
              >
                {isUploading ? <Spinner size={12} /> : <Upload className="w-3 h-3" />}
                <span>{isUploading ? 'Đang tải...' : 'Tải ảnh từ máy'}</span>
              </Button>
            </div>
            <Input
              id="product-imageUrl"
              placeholder="https://images.unsplash.com/..."
              {...register('imageUrl')}
            />
            {errors.imageUrl && (
              <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
            )}

            {imageUrlValue && (
              <div className="mt-2 flex items-center gap-3 p-2 rounded-xl border border-border/60 bg-muted/30">
                <img
                  src={imageUrlValue}
                  alt="Xem trước hình ảnh"
                  className="h-14 w-14 rounded-lg object-cover border border-border shrink-0 bg-background"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="text-xs text-muted-foreground truncate flex-1">
                  <p className="font-medium text-foreground">Xem trước hình ảnh</p>
                  <p className="truncate">{imageUrlValue}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-description">Mô tả món</Label>
            <textarea
              id="product-description"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="Hương vị béo ngậy cùng trân châu dai giòn..."
              {...register('description')}
            />
          </div>

          {/* 4. Sizes Configuration */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">
                  Cấu hình kích cỡ (Sizes) <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Phải có ít nhất 1 size và chính xác 1 size mặc định.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendSize({
                    name: '',
                    priceDelta: 0,
                    isDefault: false,
                    sortOrder: sizeFields.length,
                  })
                }
                className="cursor-pointer gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Thêm Size</span>
              </Button>
            </div>

            {errors.sizes?.message && (
              <p className="text-xs text-destructive">{errors.sizes.message}</p>
            )}

            <div className="space-y-2 pt-1">
              {sizeFields.map((field, index) => {
                const isDefault = currentSizes[index]?.isDefault;

                return (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 rounded-lg border border-border p-2 bg-muted/20"
                  >
                    <div className="flex-1">
                      <Input
                        placeholder="Tên (S, M, L...)"
                        {...register(`sizes.${index}.name` as const)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        step="1000"
                        placeholder="Giá thêm (+0)"
                        {...register(`sizes.${index}.priceDelta` as const, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSetDefaultSize(index)}
                      className={`text-xs px-2.5 py-1.5 rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                        isDefault
                          ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'border-border bg-card hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {isDefault ? 'Mặc định' : 'Đặt mặc định'}
                    </button>
                    {sizeFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        title="Xóa size"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Option Groups Selection */}
          <div className="space-y-2 pt-2 border-t border-border">
            <Label className="text-sm font-semibold">
              Nhóm tùy chọn áp dụng (Đường, Đá, Topping...)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {optionGroups.map((group) => {
                const isSelected = selectedOptionGroupIds.includes(group.id);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleToggleOptionGroup(group.id)}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border bg-card hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    <span>{group.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {group.options?.length || 0} món
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Active & Available Toggles */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                {...register('isAvailable')}
              />
              <span>Sẵn sàng phục vụ (Còn hàng)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                {...register('isActive')}
              />
              <span>Hiển thị trên thực đơn</span>
            </label>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              {isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
