import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface UserPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  disabled?: boolean;
}

export function UserPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  disabled,
}: UserPaginationProps) {
  if (totalPages <= 1 && total === 0) return null;

  const start = Math.min((page - 1) * limit + 1, total);
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-sm text-muted-foreground">
      <div>
        Hiển thị <span className="font-medium text-foreground">{start}</span> -{' '}
        <span className="font-medium text-foreground">{end}</span> trong tổng số{' '}
        <span className="font-medium text-foreground">{total}</span> người dùng
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || disabled}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Trước</span>
        </Button>

        <div className="text-xs px-2 font-medium text-foreground">
          Trang {page} / {Math.max(totalPages, 1)}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || disabled}
          className="gap-1"
        >
          <span>Sau</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
