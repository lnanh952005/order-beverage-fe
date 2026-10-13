import { Banknote, CreditCard, Wallet, QrCode, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { PaymentMethod } from '../types/orders.types';

interface CheckoutPaymentSectionProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'cod',
    title: 'Tiền mặt khi nhận hàng (COD)',
    description: 'Thanh toán trực tiếp cho nhân viên hoặc tài xế khi nhận món',
    icon: Banknote,
  },
  {
    id: 'card',
    title: 'Thẻ thanh toán (ATM / Visa / Mastercard)',
    description: 'Thanh toán bảo mật trực tuyến qua cổng thẻ',
    icon: CreditCard,
  },
  {
    id: 'e_wallet',
    title: 'Ví điện tử (MoMo / ZaloPay / VNPay)',
    description: 'Quét mã ví điện tử nhanh chóng, tiện lợi',
    icon: Wallet,
  },
  {
    id: 'bank_transfer',
    title: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản 24/7 qua mã VietQR tự động',
    icon: QrCode,
  },
];

export function CheckoutPaymentSection({
  selectedMethod,
  onSelectMethod,
}: CheckoutPaymentSectionProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground block">
        Phương thức thanh toán
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PAYMENT_OPTIONS.map((opt) => {
          const isSelected = selectedMethod === opt.id;
          const Icon = opt.icon;

          return (
            <div
              key={opt.id}
              onClick={() => onSelectMethod(opt.id)}
              className={cn(
                'cursor-pointer rounded-lg border p-3.5 transition-all text-left flex items-start gap-3',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border/70 hover:border-primary/40 bg-card',
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-xs sm:text-sm text-foreground">
                    {opt.title}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {opt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
