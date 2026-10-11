import * as React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';

interface UserFiltersBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

export function UserFiltersBar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  onReset,
}: UserFiltersBarProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery);
  const [prevSearchQuery, setPrevSearchQuery] = React.useState(searchQuery);

  if (prevSearchQuery !== searchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalSearch(searchQuery);
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  const hasActiveFilters = Boolean(
    searchQuery || (roleFilter && roleFilter !== 'all') || (statusFilter && statusFilter !== 'all'),
  );

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên hoặc email..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Role Filter */}
      <div className="w-full sm:w-44">
        <Select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          aria-label="Lọc theo vai trò"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="staff">Nhân viên</option>
          <option value="admin">Quản trị viên</option>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-44">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Lọc theo trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã bị khóa</option>
        </Select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="gap-1 text-muted-foreground hover:text-foreground shrink-0"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Đặt lại</span>
        </Button>
      )}
    </div>
  );
}
