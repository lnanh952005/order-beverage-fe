import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { PaymentMethod } from '../types/payments.types';
import {
  DEFAULT_PAYMENT_OPTIONS,
  type PaymentOption,
} from './PaymentMethodSelector.constants';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | string;
  onSelectMethod: (method: PaymentMethod) => void;
  options?: PaymentOption[];
  className?: string;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  options = DEFAULT_PAYMENT_OPTIONS,
  className,
}: PaymentMethodSelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-sm font-semibold text-foreground block">
        Phương thức thanh toán
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedMethod === opt.id;
          const Icon = opt.icon;

          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => onSelectMethod(opt.id)}
              className={cn(
                'rounded-lg border p-3.5 transition-all text-left flex items-start gap-3 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs'
                  : 'border-border/70 hover:border-primary/40 bg-card hover:bg-muted/30',
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-xs sm:text-sm text-foreground">
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
