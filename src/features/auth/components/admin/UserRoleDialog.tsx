import * as React from 'react';
import { Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { useRoles } from '../../hooks/useRoles';
import type { User, UserRole } from '../../types/auth.types';

interface UserRoleDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (user: User, newRole: UserRole) => Promise<void>;
  isPending: boolean;
}

export function UserRoleDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: UserRoleDialogProps) {
  const { data: roles } = useRoles();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('customer');
  const [prevUser, setPrevUser] = React.useState<User | null>(user);

  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setSelectedRole(user.role);
    }
  }

  if (!user) return null;

  const handleConfirm = async () => {
    await onConfirm(user, selectedRole);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Phân quyền người dùng</DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Người dùng: <strong className="text-foreground">{user.fullName}</strong> ({user.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="role-select">Chọn vai trò mới</Label>
            <Select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            >
              {roles && roles.length > 0 ? (
                roles.map((r) => (
                  <option key={r.id} value={r.code}>
                    {r.name} ({r.code})
                  </option>
                ))
              ) : (
                <>
                  <option value="customer">Khách hàng (customer)</option>
                  <option value="staff">Nhân viên (staff)</option>
                  <option value="admin">Quản trị viên (admin)</option>
                </>
              )}
            </Select>
          </div>

          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Giải thích quyền hạn:</p>
            <p>• <strong>Khách hàng:</strong> Xem thực đơn, đặt món và theo dõi đơn hàng cá nhân.</p>
            <p>• <strong>Nhân viên:</strong> Vận hành đơn hàng (xác nhận, chuẩn bị, hoàn thành) và xem báo cáo đơn.</p>
            <p>• <strong>Quản trị viên:</strong> Toàn quyền quản lý danh mục, sản phẩm, voucher và tài khoản người dùng.</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isPending || selectedRole === user.role}
          >
            {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
