import * as React from 'react';
import { useSearchParams } from 'react-router';
import { Users, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useUpdateUserStatus } from '../../hooks/useUpdateUserStatus';
import { useUpdateUserRole } from '../../hooks/useUpdateUserRole';
import { useAuth } from '../../hooks/useAuth';
import { UserTable } from '../../components/admin/UserTable';
import { UserFiltersBar } from '../../components/admin/UserFiltersBar';
import { UserPagination } from '../../components/admin/UserPagination';
import { UserStatusDialog } from '../../components/admin/UserStatusDialog';
import { UserRoleDialog } from '../../components/admin/UserRoleDialog';
import { Button } from '@/shared/components/ui/button';
import { ErrorState } from '@/shared/components/feedback';
import type { User, UserRole } from '../../types/auth.types';

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAuth();

  // Extract filter state from URL search params
  const page = Number(searchParams.get('page')) || 1;
  const limit = 10;
  const searchQuery = searchParams.get('q') || '';
  const roleFilter = searchParams.get('role') || 'all';
  const statusFilter = searchParams.get('status') || 'all';

  // Modal dialog states
  const [statusDialogUser, setStatusDialogUser] = React.useState<User | null>(null);
  const [roleDialogUser, setRoleDialogUser] = React.useState<User | null>(null);

  // Queries & Mutations
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminUsers({
    page,
    limit,
    q: searchQuery ? searchQuery : undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    isActive:
      statusFilter === 'active'
        ? true
        : statusFilter === 'inactive'
        ? false
        : undefined,
  });

  const updateStatusMutation = useUpdateUserStatus();
  const updateRoleMutation = useUpdateUserRole();

  // Update query params helper
  const updateParams = React.useCallback(
    (newParams: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(newParams).forEach(([key, val]) => {
            if (val === null || val === '' || val === 'all') {
              next.delete(key);
            } else {
              next.set(key, val);
            }
          });
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handleSearchChange = (q: string) => {
    updateParams({ q: q || null, page: '1' });
  };

  const handleRoleChange = (role: string) => {
    updateParams({ role: role !== 'all' ? role : null, page: '1' });
  };

  const handleStatusChange = (status: string) => {
    updateParams({ status: status !== 'all' ? status : null, page: '1' });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage > 1 ? String(newPage) : null });
  };

  // Status toggle handler
  const handleConfirmStatus = async (targetUser: User, newStatus: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({
        userId: targetUser.id,
        data: { isActive: newStatus },
      });
      toast.success(
        newStatus
          ? `Đã kích hoạt tài khoản của ${targetUser.fullName}`
          : `Đã khóa tài khoản của ${targetUser.fullName}`,
      );
    } catch {
      toast.error('Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.');
    }
  };

  // Role update handler
  const handleConfirmRole = async (targetUser: User, newRole: UserRole) => {
    try {
      await updateRoleMutation.mutateAsync({
        userId: targetUser.id,
        data: { role: newRole },
      });
      toast.success(
        `Đã cập nhật vai trò của ${targetUser.fullName} thành ${newRole}`,
      );
    } catch {
      toast.error('Không thể phân quyền người dùng. Vui lòng thử lại.');
    }
  };

  const users = response?.data || [];
  const meta = response?.meta || {
    page: 1,
    limit: 10,
    total: users.length,
    totalPages: 1,
  };

  // Derived counts for quick summary cards
  const totalCount = meta.total;
  const staffOrAdminCount = users.filter((u) => u.role === 'staff' || u.role === 'admin').length;
  const inactiveCount = users.filter((u) => u.isActive === false).length;

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xem danh sách tài khoản khách hàng, nhân viên và phân quyền hệ thống
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Tổng số tài khoản</div>
            <div className="text-xl font-bold text-foreground">{totalCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Trang hiện tại (Staff/Admin)</div>
            <div className="text-xl font-bold text-foreground">{staffOrAdminCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Trang hiện tại (Bị khóa)</div>
            <div className="text-xl font-bold text-foreground">{inactiveCount}</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <UserFiltersBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        roleFilter={roleFilter}
        onRoleChange={handleRoleChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
      />

      {/* Main Content Area */}
      {isError ? (
        <ErrorState
          title="Không thể tải danh sách người dùng"
          message={error?.message || 'Đã có lỗi xảy ra khi truy vấn dữ liệu.'}
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          <UserTable
            users={users}
            isLoading={isLoading}
            onEditRole={(u) => setRoleDialogUser(u)}
            onToggleStatus={(u) => setStatusDialogUser(u)}
            currentUserId={currentUser?.id}
          />

          <UserPagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
            onPageChange={handlePageChange}
            disabled={isLoading || isFetching}
          />
        </div>
      )}

      {/* Status Confirmation Modal */}
      <UserStatusDialog
        user={statusDialogUser}
        open={Boolean(statusDialogUser)}
        onOpenChange={(open) => {
          if (!open) setStatusDialogUser(null);
        }}
        onConfirm={handleConfirmStatus}
        isPending={updateStatusMutation.isPending}
      />

      {/* Role Assignment Modal */}
      <UserRoleDialog
        user={roleDialogUser}
        open={Boolean(roleDialogUser)}
        onOpenChange={(open) => {
          if (!open) setRoleDialogUser(null);
        }}
        onConfirm={handleConfirmRole}
        isPending={updateRoleMutation.isPending}
      />
    </div>
  );
}
