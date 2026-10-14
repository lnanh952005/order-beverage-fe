import { useState } from 'react';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useCreatePaymentUrl } from '../hooks/useCreatePaymentUrl';

interface PayNowButtonProps {
  orderId?: number;
  paymentId?: number;
  bankCode?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PayNowButton({
  orderId,
  paymentId,
  bankCode,
  disabled = false,
  className,
  children,
}: PayNowButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const createPaymentUrlMutation = useCreatePaymentUrl({
    autoRedirect: true,
    onSuccess: () => {
      setIsRedirecting(true);
    },
  });

  const isLoading = createPaymentUrlMutation.isPending || isRedirecting;

  const handlePay = () => {
    if (isLoading || disabled) return;
    if (!orderId && !paymentId) return;

    createPaymentUrlMutation.mutate({
      ...(orderId ? { orderId } : {}),
      ...(paymentId ? { paymentId } : {}),
      ...(bankCode ? { bankCode } : {}),
    });
  };

  return (
    <Button
      type="button"
      onClick={handlePay}
      disabled={disabled || isLoading}
      className={cn(
        'font-bold bg-linear-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 text-primary-foreground shadow-sm transition-all',
        className,
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Đang tạo liên kết...</span>
        </>
      ) : (
        children || (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            <span>Thanh toán ngay qua VNPay</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-80" />
          </>
        )
      )}
    </Button>
  );
}
