import { MapPin, Phone, User, Star, Edit3, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Spinner } from '@/shared/components/feedback';
import { useSetDefaultAddress } from '../hooks/useAddresses';
import type { Address } from '../types/profile.types';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
}

export const AddressCard = ({ address, onEdit, onDelete }: AddressCardProps) => {
  const setDefaultMutation = useSetDefaultAddress();

  const fullAddress = [
    address.addressLine,
    address.ward,
    address.district,
    address.city,
  ]
    .filter(Boolean)
    .join(', ');

  const handleSetDefault = () => {
    setDefaultMutation.mutate(address.id);
  };

  return (
    <Card className={`border transition-all duration-150 ${address.isDefault ? 'border-primary/50 bg-primary/[0.02] shadow-sm' : 'border-border/80 hover:border-border'}`}>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            {/* Name, Phone & Default Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-base flex items-center gap-1.5 text-foreground">
                <User className="w-4 h-4 text-primary shrink-0" />
                {address.recipientName}
              </span>
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                {address.phone}
              </span>
              {address.isDefault && (
                <Badge variant="default" className="text-[11px] gap-1 px-2 py-0.5">
                  <Star className="w-3 h-3 fill-current" />
                  Mặc định
                </Badge>
              )}
            </div>

            {/* Address Line */}
            <p className="text-sm text-foreground/90 flex items-start gap-1.5 pt-1">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>{fullAddress}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
            {!address.isDefault && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 px-2.5"
                onClick={handleSetDefault}
                disabled={setDefaultMutation.isPending}
              >
                {setDefaultMutation.isPending ? (
                  <Spinner size={14} />
                ) : (
                  'Đặt mặc định'
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-muted-foreground hover:text-foreground gap-1"
              onClick={() => onEdit(address)}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Sửa</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
              onClick={() => onDelete(address)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
