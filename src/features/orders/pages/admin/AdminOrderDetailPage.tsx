import { useParams } from 'react-router';

export function AdminOrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng #{orderCode}</h1>
      <p className="text-muted-foreground">Màn hình xem chi tiết và thao tác đơn hàng dành cho Admin đang được phát triển.</p>
    </div>
  );
}
