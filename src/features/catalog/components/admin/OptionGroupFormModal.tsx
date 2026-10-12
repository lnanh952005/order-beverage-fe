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
import {
  optionGroupFormSchema,
  type OptionGroupFormData,
} from '../../schemas/catalog.schemas';
import {
  useCreateOptionGroup,
  useUpdateOptionGroup,
} from '../../hooks/useAdminOptionGroups';
import type { OptionGroup } from '../../types/catalog.types';

interface OptionGroupFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: OptionGroup | null;
}

export function OptionGroupFormModal({
  open,
  onOpenChange,
  initialData,
}: OptionGroupFormModalProps) {
  const isEditing = Boolean(initialData);
  const createMutation = useCreateOptionGroup();
  const updateMutation = useUpdateOptionGroup();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OptionGroupFormData>({
    resolver: zodResolver(optionGroupFormSchema),
    defaultValues: {
      name: '',
      selectType: 'multiple',
      minSelect: 0,
      maxSelect: 3,
      sortOrder: 0,
    },
  });

  const selectType = watch('selectType');

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          selectType: initialData.allowMultiple ? 'multiple' : 'single',
          minSelect: initialData.minSelect,
          maxSelect: initialData.maxSelect,
          sortOrder: 0,
        });
      } else {
        reset({
          name: '',
          selectType: 'multiple',
          minSelect: 0,
          maxSelect: 3,
          sortOrder: 0,
        });
      }
    }
  }, [open, initialData, reset]);

  // Adjust maxSelect when selectType switches to 'single'
  useEffect(() => {
    if (selectType === 'single') {
      setValue('maxSelect', 1);
    }
  }, [selectType, setValue]);

  const onSubmit = async (data: OptionGroupFormData) => {
    if (isEditing && initialData) {
      await updateMutation.mutateAsync({
        id: initialData.id,
        data: {
          name: data.name,
          selectType: data.selectType,
          minSelect: data.minSelect,
          maxSelect: data.maxSelect,
          sortOrder: data.sortOrder,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: data.name,
        selectType: data.selectType,
        minSelect: data.minSelect,
        maxSelect: data.maxSelect,
        sortOrder: data.sortOrder,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Cập nhật nhóm tùy chọn' : 'Thêm nhóm tùy chọn mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Group Name */}
          <div className="space-y-1.5">
            <Label htmlFor="group-name">
              Tên nhóm tùy chọn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="group-name"
              placeholder="Ví dụ: Mức đường, Topping..."
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Select Type */}
          <div className="space-y-1.5">
            <Label>Hình thức chọn</Label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label
                className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition-all ${
                  selectType === 'single'
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <input
                  type="radio"
                  value="single"
                  className="text-primary"
                  {...register('selectType')}
                />
                <span className="text-sm">Chọn một (Single)</span>
              </label>

              <label
                className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition-all ${
                  selectType === 'multiple'
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <input
                  type="radio"
                  value="multiple"
                  className="text-primary"
                  {...register('selectType')}
                />
                <span className="text-sm">Chọn nhiều (Multiple)</span>
              </label>
            </div>
          </div>

          {/* Min & Max Select */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="group-minSelect">Tối thiểu (Min)</Label>
              <Input
                id="group-minSelect"
                type="number"
                min={0}
                {...register('minSelect', { valueAsNumber: true })}
              />
              {errors.minSelect && (
                <p className="text-xs text-destructive">{errors.minSelect.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="group-maxSelect">Tối đa (Max)</Label>
              <Input
                id="group-maxSelect"
                type="number"
                min={1}
                disabled={selectType === 'single'}
                {...register('maxSelect', { valueAsNumber: true })}
              />
              {errors.maxSelect && (
                <p className="text-xs text-destructive">{errors.maxSelect.message}</p>
              )}
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <Label htmlFor="group-sortOrder">Thứ tự hiển thị</Label>
            <Input
              id="group-sortOrder"
              type="number"
              min={0}
              {...register('sortOrder', { valueAsNumber: true })}
            />
            {errors.sortOrder && (
              <p className="text-xs text-destructive">{errors.sortOrder.message}</p>
            )}
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
              {isEditing ? 'Lưu thay đổi' : 'Tạo nhóm tùy chọn'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
