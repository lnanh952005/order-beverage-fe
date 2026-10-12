import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/feedback';
import { addressSchema, type AddressFormData } from '../schemas/profile.schemas';
import { useCreateAddress, useUpdateAddress } from '../hooks/useAddresses';
import type { Address } from '../types/profile.types';

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Address | null;
}

export const AddressDialog = ({
  open,
  onOpenChange,
  initialData,
}: AddressDialogProps) => {
  const isEditing = Boolean(initialData);
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();

  const isPending =
    createAddressMutation.isPending || updateAddressMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipientName: '',
      phone: '',
      addressLine: '',
      ward: '',
      district: '',
      city: '',
      isDefault: false,
    },
  });

  // Populate form fields on open or initialData change
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          recipientName: initialData.recipientName,
          phone: initialData.phone,
          addressLine: initialData.addressLine,
          ward: initialData.ward || '',
          district: initialData.district || '',
          city: initialData.city,
          isDefault: initialData.isDefault,
        });
      } else {
        reset({
          recipientName: '',
          phone: '',
          addressLine: '',
          ward: '',
          district: '',
          city: '',
          isDefault: false,
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (isEditing && initialData) {
        await updateAddressMutation.mutateAsync({
          id: initialData.id,
          data: {
            recipientName: data.recipientName,
            phone: data.phone,
            addressLine: data.addressLine,
            ward: data.ward || null,
            district: data.district || null,
            city: data.city,
            isDefault: data.isDefault,
          },
        });
      } else {
        await createAddressMutation.mutateAsync({
          recipientName: data.recipientName,
          phone: data.phone,
          addressLine: data.addressLine,
          ward: data.ward || null,
          district: data.district || null,
          city: data.city,
          isDefault: data.isDefault,
        });
      }
      onOpenChange(false);
    } catch {
      // Handled in mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
          </DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin địa chỉ để chúng tôi giao đồ uống nhanh chóng và chính xác nhất.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Recipient & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="recipientName" className="text-xs font-semibold">
                Tên người nhận <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recipientName"
                placeholder="Ví dụ: Nguyễn Văn A"
                {...register('recipientName')}
                aria-invalid={Boolean(errors.recipientName)}
              />
              {errors.recipientName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.recipientName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="Ví dụ: 0901234567"
                {...register('phone')}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* City / Province */}
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-semibold">
              Tỉnh / Thành phố <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              placeholder="Ví dụ: TP. Hồ Chí Minh"
              {...register('city')}
              aria-invalid={Boolean(errors.city)}
            />
            {errors.city && (
              <p className="text-xs text-destructive mt-1">
                {errors.city.message}
              </p>
            )}
          </div>

          {/* District & Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="district" className="text-xs font-semibold">
                Quận / Huyện
              </Label>
              <Input
                id="district"
                placeholder="Ví dụ: Quận 1"
                {...register('district')}
              />
              {errors.district && (
                <p className="text-xs text-destructive mt-1">
                  {errors.district.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ward" className="text-xs font-semibold">
                Phường / Xã
              </Label>
              <Input
                id="ward"
                placeholder="Ví dụ: Phường Bến Nghé"
                {...register('ward')}
              />
              {errors.ward && (
                <p className="text-xs text-destructive mt-1">
                  {errors.ward.message}
                </p>
              )}
            </div>
          </div>

          {/* Address Line */}
          <div className="space-y-1.5">
            <Label htmlFor="addressLine" className="text-xs font-semibold">
              Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="addressLine"
              placeholder="Ví dụ: 123 Đường Lê Lợi"
              {...register('addressLine')}
              aria-invalid={Boolean(errors.addressLine)}
            />
            {errors.addressLine && (
              <p className="text-xs text-destructive mt-1">
                {errors.addressLine.message}
              </p>
            )}
          </div>

          {/* Default Address Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                {...register('isDefault')}
              />
              <span>Đặt làm địa chỉ nhận hàng mặc định</span>
            </label>
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Spinner size={16} />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{isEditing ? 'Lưu thay đổi' : 'Thêm địa chỉ'}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
