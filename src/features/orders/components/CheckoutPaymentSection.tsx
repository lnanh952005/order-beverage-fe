import { PaymentMethodSelector } from '@/features/payments';
import type { PaymentMethod } from '../types/orders.types';

interface CheckoutPaymentSectionProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export function CheckoutPaymentSection({
  selectedMethod,
  onSelectMethod,
}: CheckoutPaymentSectionProps) {
  return (
    <PaymentMethodSelector
      selectedMethod={selectedMethod}
      onSelectMethod={(method) => onSelectMethod(method as PaymentMethod)}
    />
  );
}
