import * as React from 'react';
import { Link } from 'react-router';
import { MapPin, Plus, CheckCircle2 } from 'lucide-react';
import { useAddresses, type Address } from '@/features/profile';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/feedback';
import { cn } from '@/shared/lib/utils';

interface CheckoutAddressSectionProps {
  selectedAddressId?: number;
  onSelectAddress: (id: number) => void;
  error?: string;
}

export function CheckoutAddressSection({
  selectedAddressId,
  onSelectAddress,
  error,
}: CheckoutAddressSectionProps) {
  const { data: addresses, isLoading } = useAddresses();

  // Auto-select default address if none is selected
  React.useEffect(() => {
    if (!selectedAddressId && addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      onSelectAddress(defaultAddr.id);
    }
  }, [addresses, selectedAddressId, onSelectAddress]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const formatFullAddress = (addr: Address) => {
    return [addr.addressLine, addr.ward, addr.district, addr.city]
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Địa chỉ nhận hàng</span>
        </label>
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary">
          <Link to="/profile/addresses" className="flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm địa chỉ</span>
          </Link>
        </Button>
      </div>

      {!addresses || addresses.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Bạn chưa có địa chỉ giao hàng nào đã lưu.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to="/profile/addresses">Thêm địa chỉ mới</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr.id)}
                className={cn(
                  'cursor-pointer rounded-lg border p-3.5 transition-all text-left relative flex items-start gap-3',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border/70 hover:border-primary/40 bg-card',
                )}
              >
                <div className="mt-0.5">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/40',
                    )}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">
                      {addr.recipientName}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {addr.phone}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[11px] bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {formatFullAddress(addr)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
}
