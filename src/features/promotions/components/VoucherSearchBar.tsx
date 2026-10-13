import { useEffect, useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

interface VoucherSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive') => void;
  onReset: () => void;
}

export function VoucherSearchBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
}: VoucherSearchBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalSearch(searchQuery);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter !== 'all');

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm theo mã voucher hoặc mô tả..."
          className="pl-9 pr-3 rounded-xl bg-card border-border h-10 text-sm"
        />
      </div>

      {/* Filter and Reset */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="inline-flex rounded-xl p-1 bg-muted/60 border border-border text-xs font-medium">
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('active')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-card text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Đang bật
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('inactive')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-card text-amber-700 dark:text-amber-400 font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tạm dừng
          </button>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-10 px-2.5 rounded-xl text-muted-foreground hover:text-foreground gap-1.5"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Đặt lại</span>
          </Button>
        )}
      </div>
    </div>
  );
}
