import * as React from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { promotionsService, type VoucherValidateResult } from '@/features/promotions';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { formatMoney } from '@/shared/lib/formatters';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';

interface CheckoutVoucherSectionProps {
  subtotal: number;
  appliedVoucher: VoucherValidateResult | null;
  onApplyVoucher: (result: VoucherValidateResult | null) => void;
}

export function CheckoutVoucherSection({
  subtotal,
  appliedVoucher,
  onApplyVoucher,
}: CheckoutVoucherSectionProps) {
  const [code, setCode] = React.useState('');
  const [isValidating, setIsValidating] = React.useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsValidating(true);
    try {
      const result = await promotionsService.validateVoucher(cleanCode, subtotal);
      onApplyVoucher(result);
      setCode('');
      toast.success(`Đã áp dụng mã giảm giá ${cleanCode}!`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(getErrorMessage(error.code, error.message));
      } else {
        toast.error('Không thể áp dụng mã giảm giá này');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    onApplyVoucher(null);
    toast.info('Đã gỡ mã giảm giá');
  };

  return (
    <div className="space-y-2.5">
      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Tag className="w-4 h-4 text-primary" />
        <span>Mã ưu đãi / Voucher</span>
      </label>

      {appliedVoucher ? (
        <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-sm">{appliedVoucher.code}</span>
              <p className="text-xs opacity-90">
                Giảm: -{formatMoney(appliedVoucher.discountAmount)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 w-8 p-0 text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 hover:bg-emerald-500/20"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Gỡ voucher</span>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã giảm giá..."
            className="uppercase font-mono text-sm tracking-wider"
            maxLength={50}
            disabled={isValidating}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={!code.trim() || isValidating}
            className="shrink-0"
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Áp dụng'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
