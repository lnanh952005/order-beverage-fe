import { Link } from 'react-router';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';

export function CartPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
      <p className="text-muted-foreground mb-6">Màn hình giỏ hàng đang được phát triển.</p>
      <Link to={ROUTE_PATHS.CHECKOUT}>
        <Button>Tiến hành thanh toán</Button>
      </Link>
    </div>
  );
}
