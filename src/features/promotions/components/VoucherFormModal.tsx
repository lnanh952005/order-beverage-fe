import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  voucherFormSchema,
  type VoucherFormValues,
  type VoucherFormInput,
} from '../schemas/promotions.schemas';
import type { Voucher } from '../types/promotions.types';

interface VoucherFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingVoucher: Voucher | null;
  onSubmit: (values: VoucherFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

function toDatetimeLocal(isoString?: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function VoucherFormModal({
  open,
  onOpenChange,
  editingVoucher,
  onSubmit,
  isSubmitting = false,
}: VoucherFormModalProps) {
  const isEditing = Boolean(editingVoucher);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<VoucherFormInput, unknown, VoucherFormValues>({
    resolver: zodResolver(voucherFormSchema),
    defaultValues: {
      code: '',
      description: '',
      discountType: 'percent',
      discountValue: 10,
      maxDiscount: null,
      minOrderValue: 0,
      usageLimit: null,
      startsAt: '',
      endsAt: '',
      isActive: true,
    },
  });

  const selectedDiscountType = watch('discountType');

  useEffect(() => {
    if (open) {
      if (editingVoucher) {
        reset({
          code: editingVoucher.code,
          description: editingVoucher.description ?? '',
          discountType: editingVoucher.discountType,
          discountValue: Number(editingVoucher.discountValue),
          maxDiscount:
            editingVoucher.maxDiscount !== null && editingVoucher.maxDiscount !== undefined
              ? Number(editingVoucher.maxDiscount)
              : null,
          minOrderValue: Number(editingVoucher.minOrderValue || 0),
          usageLimit:
            editingVoucher.usageLimit !== null && editingVoucher.usageLimit !== undefined
              ? Number(editingVoucher.usageLimit)
              : null,
          startsAt: toDatetimeLocal(editingVoucher.startsAt),
          endsAt: toDatetimeLocal(editingVoucher.endsAt),
          isActive: editingVoucher.isActive,
        });
      } else {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000 * 30);
        reset({
          code: '',
          description: '',
          discountType: 'percent',
          discountValue: 10,
          maxDiscount: null,
          minOrderValue: 0,
          usageLimit: null,
          startsAt: toDatetimeLocal(now.toISOString()),
          endsAt: toDatetimeLocal(tomorrow.toISOString()),
          isActive: true,
        });
      }
    }
  }, [open, editingVoucher, reset]);

  const onFormSubmit = async (data: VoucherFormValues) => {
    // Convert local datetime to ISO UTC strings
    const formattedData: VoucherFormValues = {
      ...data,
      code: data.code.trim().toUpperCase(),
      startsAt: new Date(data.startsAt).toISOString(),
      endsAt: new Date(data.endsAt).toISOString(),
      maxDiscount:
        data.discountType === 'percent' && data.maxDiscount !== undefined
          ? data.maxDiscount
          : null,
    };
    await onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Cập nhật thông tin và điều kiện của voucher #${editingVoucher?.id}`
              : 'Thiết lập điều kiện áp dụng, tỷ lệ giảm và thời gian hiệu lực'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
          {/* Code & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-semibold">
                Mã Voucher <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="VD: BANME20, FREESHIP"
                className="uppercase font-mono tracking-wider text-sm"
                {...register('code')}
              />
              {errors.code && (
                <p className="text-xs text-rose-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Mô tả hiển thị
              </Label>
              <Input
                id="description"
                placeholder="VD: Giảm 20% cho đơn từ 100k"
                className="text-sm"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-rose-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="rounded-xl border border-border p-3.5 bg-muted/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Hình thức giảm giá <span className="text-rose-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-border bg-card text-xs font-medium cursor-pointer hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary">
                    <input
                      type="radio"
                      value="percent"
                      className="sr-only"
                      {...register('discountType')}
                    />
                    <span>Phần trăm (%)</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-border bg-card text-xs font-medium cursor-pointer hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary">
                    <input
                      type="radio"
                      value="fixed"
                      className="sr-only"
                      {...register('discountType')}
                    />
                    <span>Số tiền cố định (đ)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="discountValue" className="text-xs font-semibold">
                  Mức giảm{' '}
                  {selectedDiscountType === 'percent' ? '(%)' : '(VND)'}{' '}
                  <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  placeholder={selectedDiscountType === 'percent' ? 'VD: 15' : 'VD: 30000'}
                  className="text-sm font-semibold"
                  {...register('discountValue', { valueAsNumber: true })}
                />
                {errors.discountValue && (
                  <p className="text-xs text-rose-500">{errors.discountValue.message}</p>
                )}
              </div>
            </div>

            {/* Max Discount for Percent */}
            {selectedDiscountType === 'percent' && (
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="maxDiscount" className="text-xs font-semibold">
                  Giảm tối đa (VND) <span className="text-muted-foreground font-normal">(bỏ trống nếu không giới hạn)</span>
                </Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  placeholder="VD: 50000"
                  className="text-sm"
                  {...register('maxDiscount', {
                    setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)),
                  })}
                />
                {errors.maxDiscount && (
                  <p className="text-xs text-rose-500">{errors.maxDiscount.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Min Order Value & Usage Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="minOrderValue" className="text-xs font-semibold">
                Đơn hàng tối thiểu (VND)
              </Label>
              <Input
                id="minOrderValue"
                type="number"
                placeholder="VD: 100000"
                className="text-sm"
                {...register('minOrderValue', { valueAsNumber: true })}
              />
              {errors.minOrderValue && (
                <p className="text-xs text-rose-500">{errors.minOrderValue.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="usageLimit" className="text-xs font-semibold">
                Giới hạn lượt dùng{' '}
                <span className="text-muted-foreground font-normal">(bỏ trống = vô hạn)</span>
              </Label>
              <Input
                id="usageLimit"
                type="number"
                placeholder="VD: 500"
                className="text-sm"
                {...register('usageLimit', {
                  setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)),
                })}
              />
              {errors.usageLimit && (
                <p className="text-xs text-rose-500">{errors.usageLimit.message}</p>
              )}
            </div>
          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startsAt" className="text-xs font-semibold">
                Thời gian bắt đầu <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="startsAt"
                type="datetime-local"
                className="text-sm"
                {...register('startsAt')}
              />
              {errors.startsAt && (
                <p className="text-xs text-rose-500">{errors.startsAt.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endsAt" className="text-xs font-semibold">
                Thời gian kết thúc <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="endsAt"
                type="datetime-local"
                className="text-sm"
                {...register('endsAt')}
              />
              {errors.endsAt && (
                <p className="text-xs text-rose-500">{errors.endsAt.message}</p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="isActive"
              type="checkbox"
              className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
              {...register('isActive')}
            />
            <Label htmlFor="isActive" className="text-xs font-medium cursor-pointer">
              Kích hoạt ngay (khách hàng có thể áp dụng mã này khi thỏa điều kiện)
            </Label>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Lưu thay đổi' : 'Tạo mã voucher'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
