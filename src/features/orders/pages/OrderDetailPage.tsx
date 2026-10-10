import { useParams } from 'react-router';

export function OrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>();

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Theo dõi đơn hàng: #{orderCode}</h1>
      <p className="text-muted-foreground">Màn hình tiến độ đơn hàng và timeline đang được phát triển.</p>
    </div>
  );
}
