import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  categoryFormSchema,
  type CategoryFormData,
} from '../../schemas/catalog.schemas';
import {
  useCreateCategory,
  useUpdateCategory,
} from '../../hooks/useAdminCategories';
import type { Category } from '../../types/catalog.types';

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Category | null;
}

export function CategoryFormModal({
  open,
  onOpenChange,
  initialData,
}: CategoryFormModalProps) {
  const isEditing = Boolean(initialData);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  const nameValue = watch('name');

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          slug: initialData.slug,
          sortOrder: initialData.sortOrder,
          isActive: initialData.isActive,
        });
      } else {
        reset({
          name: '',
          slug: '',
          sortOrder: 0,
          isActive: true,
        });
      }
    }
  }, [open, initialData, reset]);

  // Auto-generate slug when creating if name changes and slug is empty or matches previous slug
  const handleNameBlur = () => {
    if (!isEditing && nameValue) {
      const generated = toSlug(nameValue);
      setValue('slug', generated, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (initialData) {
      await updateMutation.mutateAsync({
        id: initialData.id,
        data: {
          name: data.name,
          slug: data.slug,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: data.name,
        slug: data.slug,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Category Name */}
          <div className="space-y-1.5">
            <Label htmlFor="category-name">
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input
              id="category-name"
              placeholder="Ví dụ: Trà sữa, Cà phê..."
              {...register('name')}
              onBlur={handleNameBlur}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="category-slug">
                Đường dẫn (Slug) <span className="text-destructive">*</span>
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
                Tạo tự động từ tên
              </button>
            </div>
            <Input
              id="category-slug"
              placeholder="ví dụ: tra-sua"
              {...register('slug')}
            />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <Label htmlFor="category-sortOrder">Thứ tự hiển thị</Label>
            <Input
              id="category-sortOrder"
              type="number"
              min={0}
              placeholder="0"
              {...register('sortOrder', { valueAsNumber: true })}
            />
            {errors.sortOrder && (
              <p className="text-xs text-destructive">{errors.sortOrder.message}</p>
            )}
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              id="category-isActive"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              {...register('isActive')}
            />
            <Label htmlFor="category-isActive" className="cursor-pointer text-sm font-medium">
              Kích hoạt hiển thị cho khách hàng
            </Label>
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
              {isEditing ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
