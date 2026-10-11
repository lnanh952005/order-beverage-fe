import { UserCheck, UserX, Shield, Users as UsersIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton, EmptyState } from '@/shared/components/feedback';
import { formatDate } from '@/shared/lib/formatters';
import type { User, UserRole } from '../../types/auth.types';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEditRole: (user: User) => void;
  onToggleStatus: (user: User) => void;
  currentUserId?: number;
}

function getRoleBadge(role: UserRole) {
  switch (role) {
    case 'admin':
      return <Badge variant="destructive">Quản trị viên</Badge>;
    case 'staff':
      return <Badge variant="default">Nhân viên</Badge>;
    case 'customer':
    default:
      return <Badge variant="secondary">Khách hàng</Badge>;
  }
}

function getUserInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserTable({
  users,
  isLoading,
  onEditRole,
  onToggleStatus,
  currentUserId,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-lg border bg-card/50 gap-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="w-36 h-4" />
                <Skeleton className="w-48 h-3" />
              </div>
            </div>
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-20 h-6 rounded-full" />
            <Skeleton className="w-24 h-8 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy người dùng nào"
        description="Thử thay đổi từ khóa tìm kiếm hoặc bỏ các bộ lọc để xem danh sách."
        icon={<UsersIcon className="w-8 h-8 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase font-medium">
              <th className="py-3.5 px-4">Người dùng</th>
              <th className="py-3.5 px-4">Số điện thoại</th>
              <th className="py-3.5 px-4">Vai trò</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4">Đăng nhập</th>
              <th className="py-3.5 px-4">Ngày tham gia</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const isActive = u.isActive !== false;

              return (
                <tr
                  key={u.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* User info: Avatar + Name + Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-primary/20">
                          {getUserInitials(u.fullName)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-foreground flex items-center gap-2">
                          <span>{u.fullName}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {u.phone || '—'}
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    {getRoleBadge(u.role)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {isActive ? (
                      <Badge variant="success">Hoạt động</Badge>
                    ) : (
                      <Badge variant="destructive">Đã khóa</Badge>
                    )}
                  </td>

                  {/* Providers */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {u.linkedProviders && u.linkedProviders.includes('google') && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-sky-500/10 text-sky-700 dark:text-sky-400 font-medium">
                          Google
                        </span>
                      )}
                      {u.hasPassword && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground font-medium">
                          Mật khẩu
                        </span>
                      )}
                      {!u.hasPassword && (!u.linkedProviders || u.linkedProviders.length === 0) && (
                        <span>—</span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(u.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRole(u)}
                        disabled={isSelf}
                        className="h-8 gap-1 text-xs"
                        title={isSelf ? 'Không thể tự đổi quyền của bạn' : 'Đổi vai trò'}
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Phân quyền</span>
                      </Button>

                      <Button
                        variant={isActive ? 'ghost' : 'outline'}
                        size="sm"
                        onClick={() => onToggleStatus(u)}
                        disabled={isSelf}
                        className={`h-8 gap-1 text-xs ${
                          isActive
                            ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                            : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400'
                        }`}
                        title={isSelf ? 'Không thể tự khóa tài khoản của bạn' : (isActive ? 'Khóa tài khoản' : 'Mở khóa')}
                      >
                        {isActive ? (
                          <>
                            <UserX className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Khóa</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Kích hoạt</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
