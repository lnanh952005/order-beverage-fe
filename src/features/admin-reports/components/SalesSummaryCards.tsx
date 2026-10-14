import { TrendingUp, CheckCircle2, XCircle, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/feedback';
import { formatMoney } from '@/shared/lib/formatters';
import type { SalesSummary } from '../types/reports.types';

interface SalesSummaryCardsProps {
  summary?: SalesSummary;
  isLoading?: boolean;
}

export function SalesSummaryCards({ summary, isLoading = false }: SalesSummaryCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border shadow-xs">
            <CardContent className="p-5 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cancellationRate =
    summary.totalOrders > 0
      ? ((summary.cancelledOrders / summary.totalOrders) * 100).toFixed(1)
      : '0.0';

  const cards = [
    {
      title: 'Tổng doanh thu',
      value: formatMoney(summary.totalRevenue),
      subtitle: `${summary.successfulOrders} đơn hoàn tất`,
      icon: TrendingUp,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Đơn thành công',
      value: summary.successfulOrders.toLocaleString('vi-VN'),
      subtitle: `Trên tổng số ${summary.totalOrders} đơn`,
      icon: CheckCircle2,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Đơn đã hủy',
      value: summary.cancelledOrders.toLocaleString('vi-VN'),
      subtitle: `Tỷ lệ hủy: ${cancellationRate}%`,
      icon: XCircle,
      colorClass: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      title: 'Giá trị TB đơn (AOV)',
      value: formatMoney(summary.averageOrderValue),
      subtitle: 'Trung bình mỗi đơn thành công',
      icon: Receipt,
      colorClass: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border shadow-xs hover:shadow-sm transition-shadow">
            <CardContent className="p-5 flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgClass}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
