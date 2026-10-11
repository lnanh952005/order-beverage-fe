import { Link } from 'react-router';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ROUTE_PATHS } from '@/shared/constants/routes';

export function ForbiddenView() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">403 — Không có quyền truy cập</h1>
      <p className="text-muted-foreground max-w-md mb-6 text-sm">
        Bạn không có quyền hạn cần thiết để truy cập khu vực này. Nếu bạn cho rằng đây là sự cố, vui lòng liên hệ quản trị viên hệ thống.
      </p>
      <Link to={ROUTE_PATHS.HOME}>
        <Button variant="default" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Button>
      </Link>
    </div>
  );
}
