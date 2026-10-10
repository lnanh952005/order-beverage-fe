import { useParams } from 'react-router';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Chi tiết sản phẩm: {slug}</h1>
      <p className="text-muted-foreground">Màn hình chi tiết sản phẩm và tùy biến món đang được phát triển.</p>
    </div>
  );
}
