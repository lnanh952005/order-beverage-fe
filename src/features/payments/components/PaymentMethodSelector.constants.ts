import { Banknote, CreditCard, Wallet, QrCode } from 'lucide-react';
import type { PaymentMethod } from '../types/payments.types';

export interface PaymentOption {
  id: PaymentMethod;
  title: string;
  description: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DEFAULT_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'cod',
    title: 'Tiền mặt khi nhận hàng (COD)',
    description: 'Thanh toán trực tiếp cho nhân viên hoặc tài xế khi nhận món',
    icon: Banknote,
  },
  {
    id: 'card',
    title: 'Thẻ thanh toán (ATM / Visa / Mastercard)',
    description: 'Thanh toán bảo mật trực tuyến qua cổng VNPay',
    badge: 'VNPay',
    icon: CreditCard,
  },
  {
    id: 'e_wallet',
    title: 'Ví điện tử (VNPay QR / MoMo / ZaloPay)',
    description: 'Quét mã ví điện tử hoặc thanh toán 1 chạm tiện lợi',
    badge: 'Tiện lợi',
    icon: Wallet,
  },
  {
    id: 'bank_transfer',
    title: 'Chuyển khoản ngân hàng (VietQR)',
    description: 'Chuyển khoản 24/7 qua mã VietQR tự động xác nhận',
    icon: QrCode,
  },
];
