import { AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type { User } from '../../types/auth.types';

interface UserStatusDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (user: User, newStatus: boolean) => Promise<void>;
  isPending: boolean;
}

export function UserStatusDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: UserStatusDialogProps) {
  if (!user) return null;

  const willActivate = user.isActive === false;

  const handleConfirm = async () => {
    await onConfirm(user, willActivate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                willActivate
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {willActivate ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle>
                {willActivate ? 'Kích hoạt tài khoản' : 'Khóa tài khoản'}
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Người dùng: <strong className="text-foreground">{user.fullName}</strong> ({user.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-sm text-muted-foreground">
          {willActivate ? (
            <p>
              Tài khoản này sẽ được kích hoạt lại và người dùng có thể tiếp tục đăng nhập và đặt hàng.
            </p>
          ) : (
            <p>
              Tài khoản này sẽ bị khóa ngay lập tức. Toàn bộ phiên làm việc của người dùng sẽ bị chấm dứt và không thể đăng nhập cho đến khi được mở lại.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            variant={willActivate ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending
              ? 'Đang cập nhật...'
              : willActivate
              ? 'Kích hoạt tài khoản'
              : 'Xác nhận khóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
