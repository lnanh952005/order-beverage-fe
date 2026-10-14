import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/shared/lib/utils';
import { formatMoney } from '@/shared/lib/formatters';

interface PaymentReturnBannerProps {
  className?: string;
  onDismiss?: () => void;
}

export function PaymentReturnBanner({ className, onDismiss }: PaymentReturnBannerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(true);

  const responseCode = searchParams.get('vnp_ResponseCode');
  const amountStr = searchParams.get('vnp_Amount');
  const transactionNo = searchParams.get('vnp_TransactionNo');

  const amount = amountStr ? Number(amountStr) / 100 : null;

  useEffect(() => {
    if (responseCode) {
      // Invalidate orders and payments cache so fresh data reflects immediately
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  }, [responseCode, queryClient]);

  const handleClose = () => {
    setIsVisible(false);
    onDismiss?.();
    // Clean up VNPay query params from URL without reloading
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        prev.forEach((value, key) => {
          if (!key.startsWith('vnp_')) {
            next.set(key, value);
          }
        });
        return next;
      },
      { replace: true },
    );
  };

  if (!responseCode || !isVisible) {
    return null;
  }

  const isSuccess = responseCode === '00';
  const isCancelled = responseCode === '24';

  return (
    <div
      className={cn(
        'rounded-xl border p-4 shadow-sm flex items-start justify-between gap-3 transition-all animate-in fade-in slide-in-from-top-2 duration-300',
        isSuccess &&
          'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100',
        isCancelled &&
          'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100',
        !isSuccess &&
          !isCancelled &&
          'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : isCancelled ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          )}
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-sm">
            {isSuccess
              ? 'Thanh toán trực tuyến thành công!'
              : isCancelled
                ? 'Giao dịch thanh toán đã bị hủy'
                : 'Thanh toán không thành công'}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isSuccess && (
              <>
                Cổng VNPay đã xác nhận giao dịch
                {amount ? ` số tiền ${formatMoney(amount)}` : ''}
                {transactionNo ? ` (Mã GD: ${transactionNo})` : ''}. Đơn hàng của bạn đang được xử lý.
              </>
            )}
            {isCancelled &&
              'Bạn đã chủ động hủy giao dịch trên cổng thanh toán VNPay. Bạn có thể thanh toán lại bất cứ lúc nào.'}
            {!isSuccess &&
              !isCancelled &&
              `Giao dịch thanh toán không hoàn tất (Mã phản hồi VNPay: ${responseCode}). Vui lòng kiểm tra lại tài khoản hoặc thử phương thức khác.`}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
