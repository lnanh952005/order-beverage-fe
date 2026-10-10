import { Link } from 'react-router';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';

export function HomePage() {
  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Hương vị đồ uống tươi mới mỗi ngày
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Khám phá bộ sưu tập đồ uống đặc sắc được pha chế tỉ mỉ từ những nguyên liệu tươi ngon nhất.
      </p>
      <Link to={ROUTE_PATHS.MENU}>
        <Button size="lg">Xem thực đơn ngay</Button>
      </Link>
    </div>
  );
}
