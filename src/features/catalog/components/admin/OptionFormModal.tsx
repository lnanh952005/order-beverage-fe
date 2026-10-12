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
  optionFormSchema,
  type OptionFormData,
} from '../../schemas/catalog.schemas';
import {
  useCreateOption,
  useUpdateOption,
} from '../../hooks/useAdminOptionGroups';
import type { Option } from '../../types/catalog.types';

interface OptionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number;
  initialData?: Option | null;
}

export function OptionFormModal({
  open,
  onOpenChange,
  groupId,
  initialData,
}: OptionFormModalProps) {
  const isEditing = Boolean(initialData);
  const createMutation = useCreateOption();
  const updateMutation = useUpdateOption();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OptionFormData>({
    resolver: zodResolver(optionFormSchema),
    defaultValues: {
      name: '',
      priceDelta: 0,
      isDefault: false,
      isAvailable: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          priceDelta: initialData.priceDelta,
          isDefault: initialData.isDefault,
          isAvailable: initialData.isAvailable,
          sortOrder: 0,
        });
      } else {
        reset({
          name: '',
          priceDelta: 0,
          isDefault: false,
          isAvailable: true,
          sortOrder: 0,
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data: OptionFormData) => {
    if (isEditing && initialData) {
      await updateMutation.mutateAsync({
        id: initialData.id,
        data: {
          name: data.name,
          priceDelta: data.priceDelta,
          isAvailable: data.isAvailable,
          isDefault: data.isDefault,
          sortOrder: data.sortOrder,
        },
      });
    } else {
      await createMutation.mutateAsync({
        groupId,
        data: {
          name: data.name,
          priceDelta: data.priceDelta,
          isAvailable: data.isAvailable,
          sortOrder: data.sortOrder,
        },
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Cập nhật tùy chọn' : 'Thêm tùy chọn mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Option Name */}
          <div className="space-y-1.5">
            <Label htmlFor="option-name">
              Tên tùy chọn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="option-name"
              placeholder="Ví dụ: Trân châu trắng, 50% Đá..."
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Price Delta */}
          <div className="space-y-1.5">
            <Label htmlFor="option-priceDelta">Giá cộng thêm (VNĐ)</Label>
            <Input
              id="option-priceDelta"
              type="number"
              step="1000"
              placeholder="0"
              {...register('priceDelta', { valueAsNumber: true })}
            />
            {errors.priceDelta && (
              <p className="text-xs text-destructive">{errors.priceDelta.message}</p>
            )}
          </div>

          {/* Checkboxes: Default & Available */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center space-x-2">
              <input
                id="option-isDefault"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                {...register('isDefault')}
              />
              <Label htmlFor="option-isDefault" className="cursor-pointer text-sm">
                Đặt làm tùy chọn mặc định của nhóm
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="option-isAvailable"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                {...register('isAvailable')}
              />
              <Label htmlFor="option-isAvailable" className="cursor-pointer text-sm">
                Đang có hàng (sẵn sàng phục vụ)
              </Label>
            </div>
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
              {isEditing ? 'Lưu thay đổi' : 'Thêm tùy chọn'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
