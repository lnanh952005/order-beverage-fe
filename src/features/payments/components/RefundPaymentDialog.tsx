import * as React from 'react';
import { RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { formatMoney } from '@/shared/lib/formatters';
import { useRefundPayment } from '../hooks/useAdminPayments';

interface RefundPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: number;
  orderCode?: string;
  maxAmount?: number;
  onSuccess?: () => void;
}

const QUICK_REASONS = [
  'Khách yêu cầu hủy đơn',
  'Hết món / hết nguyên liệu',
  'Đơn hàng trùng lặp',
  'Lỗi giao dịch / thanh toán thừa',
];

export function RefundPaymentDialog({
  open,
  onOpenChange,
  paymentId,
  orderCode,
  maxAmount,
  onSuccess,
}: RefundPaymentDialogProps) {
  const [amount, setAmount] = React.useState<string>(maxAmount ? String(maxAmount) : '');
  const [reason, setReason] = React.useState('');
  const refundMutation = useRefundPayment();

  const handleClose = () => {
    setAmount(maxAmount ? String(maxAmount) : '');
    setReason('');
    onOpenChange(false);
  };

  const handleConfirm = () => {
    const parsedAmount = amount ? Number(amount) : undefined;

    refundMutation.mutate(
      {
        paymentId,
        ...(parsedAmount !== undefined ? { amount: parsedAmount } : {}),
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      },
      {
        onSuccess: () => {
          handleClose();
          onSuccess?.();
        },
      },
    );
  };

  const isLoading = refundMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
            <RotateCcw className="w-5 h-5" />
          </div>
          <DialogTitle>Hoàn tiền giao dịch #{paymentId}</DialogTitle>
          <DialogDescription>
            Thực hiện hoàn tiền qua cổng thanh toán cho đơn hàng{' '}
            {orderCode ? <strong>#{orderCode}</strong> : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {maxAmount !== undefined && (
            <div className="p-3 rounded-lg bg-muted/60 text-xs flex justify-between items-center">
              <span className="text-muted-foreground">Giá trị giao dịch gốc:</span>
              <span className="font-bold text-foreground text-sm">{formatMoney(maxAmount)}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="refund-amount" className="text-xs font-semibold">
              Số tiền hoàn (VND)
            </Label>
            <Input
              id="refund-amount"
              type="number"
              min={1000}
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={maxAmount ? String(maxAmount) : 'Nhập số tiền hoàn'}
            />
            {maxAmount && Number(amount) > maxAmount && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Số tiền hoàn không thể lớn hơn số tiền giao dịch gốc.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="refund-reason" className="text-xs font-semibold">
              Lý do hoàn tiền
            </Label>
            <textarea
              id="refund-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do hoàn tiền..."
              className="w-full px-3 py-2 text-xs rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              maxLength={255}
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="text-[10px] bg-secondary/80 hover:bg-secondary px-2 py-0.5 rounded text-secondary-foreground transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || (maxAmount !== undefined && Number(amount) > maxAmount)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Xác nhận hoàn tiền'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
