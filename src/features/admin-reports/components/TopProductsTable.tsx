import { Trophy, Coffee } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/feedback';
import { formatMoney } from '@/shared/lib/formatters';
import type { TopProductItem } from '../types/reports.types';

interface TopProductsTableProps {
  products: TopProductItem[];
  limit: number;
  isLoading?: boolean;
  onChangeLimit: (limit: number) => void;
}

const LIMIT_OPTIONS = [5, 10, 20];

export function TopProductsTable({
  products,
  limit,
  isLoading = false,
  onChangeLimit,
}: TopProductsTableProps) {
  if (isLoading) {
    return (
      <Card className="border shadow-xs">
        <CardHeader className="p-6 pb-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="p-6 pt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = products.length > 0 ? Math.max(...products.map((p) => p.revenue)) : 1;

  return (
    <Card className="border shadow-xs">
      <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Top đồ uống bán chạy nhất
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Bảng xếp hạng theo số lượng và doanh thu tích lũy từ các đơn hoàn thành
          </CardDescription>
        </div>

        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30 self-start sm:self-auto">
          {LIMIT_OPTIONS.map((opt) => (
            <Button
              key={opt}
              type="button"
              variant={limit === opt ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onChangeLimit(opt)}
              className="h-7 px-2.5 text-xs"
            >
              Top {opt}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {products.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            <p>Chưa có dữ liệu đồ uống được tiêu thụ trong khoảng thời gian này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/20 text-muted-foreground font-medium">
                  <th className="py-3 px-4 w-14 text-center">Hạng</th>
                  <th className="py-3 px-4">Tên đồ uống</th>
                  <th className="py-3 px-4 text-right">Số lượng bán</th>
                  <th className="py-3 px-4 text-right">Doanh thu</th>
                  <th className="py-3 px-4 w-40 text-right hidden sm:table-cell">Tỷ trọng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((item, index) => {
                  const rank = index + 1;
                  const ratio = Math.min(100, Math.round((item.revenue / maxRevenue) * 100));

                  return (
                    <tr
                      key={item.productId}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 font-bold text-xs">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-700 dark:text-slate-300 font-bold text-xs">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/15 text-amber-800 dark:text-amber-600 font-bold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-medium">{rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                            <Coffee className="h-3.5 w-3.5" />
                          </div>
                          <span>{item.productName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {item.quantitySold.toLocaleString('vi-VN')} <span className="font-normal text-muted-foreground">ly</span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(item.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right hidden sm:table-cell">
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex items-center">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
