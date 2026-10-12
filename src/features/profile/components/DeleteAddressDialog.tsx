import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/feedback';
import { useDeleteAddress } from '../hooks/useAddresses';
import type { Address } from '../types/profile.types';

interface DeleteAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address | null;
}

export const DeleteAddressDialog = ({
  open,
  onOpenChange,
  address,
}: DeleteAddressDialogProps) => {
  const deleteMutation = useDeleteAddress();

  if (!address) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(address.id);
      onOpenChange(false);
    } catch {
      // Handled in mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa địa chỉ?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa địa chỉ của <strong>{address.recipientName}</strong> ({address.addressLine}, {address.city}) khỏi danh bạ? Thao tác này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-2"
          >
            {deleteMutation.isPending ? (
              <>
                <Spinner size={16} />
                <span>Đang xóa...</span>
              </>
            ) : (
              <span>Xóa địa chỉ</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
