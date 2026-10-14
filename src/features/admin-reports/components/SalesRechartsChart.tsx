import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/feedback';
import { formatMoney } from '@/shared/lib/formatters';
import type { SalesReportItem } from '../types/reports.types';

interface SalesRechartsChartProps {
  data: SalesReportItem[];
  isLoading?: boolean;
}

type ChartMetric = 'revenue' | 'orders';

const formatCompactCurrency = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }
  return String(value);
};

interface TooltipPayloadItem {
  payload?: SalesReportItem;
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    if (!item) return null;
    return (
      <div className="bg-popover/95 backdrop-blur-xs border text-popover-foreground rounded-lg p-3 shadow-md text-xs space-y-1.5 min-w-36">
        <p className="font-semibold text-foreground border-b pb-1">{label}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Doanh thu:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(item.revenue)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Đơn hoàn thành:</span>
          <span className="font-semibold">{item.orders} đơn</span>
        </div>
      </div>
    );
  }
  return null;
}

export function SalesRechartsChart({ data, isLoading = false }: SalesRechartsChartProps) {
  const [metric, setMetric] = React.useState<ChartMetric>('revenue');

  if (isLoading) {
    return (
      <Card className="border shadow-xs">
        <CardHeader className="p-6 pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <Skeleton className="h-72 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.length > 0;

  return (
    <Card className="border shadow-xs">
      <CardHeader className="p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold">Xu hướng doanh số & đơn hàng</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Thống kê doanh thu và lượng đơn hoàn thành theo chu kỳ đã chọn
          </CardDescription>
        </div>

        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30 self-start sm:self-auto">
          <Button
            type="button"
            variant={metric === 'revenue' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMetric('revenue')}
            className="h-7 px-3 text-xs"
          >
            Doanh thu
          </Button>
          <Button
            type="button"
            variant={metric === 'orders' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMetric('orders')}
            className="h-7 px-3 text-xs"
          >
            Số đơn
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        {!hasData ? (
          <div className="h-72 flex flex-col items-center justify-center text-muted-foreground text-xs gap-1 border border-dashed rounded-lg">
            <p>Không có dữ liệu giao dịch trong khoảng thời gian này</p>
          </div>
        ) : (
          <div className="h-72 w-full" data-testid="recharts-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[11px] fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={metric === 'revenue' ? formatCompactCurrency : (v) => String(v)}
                  className="text-[11px] fill-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={metric}
                  fill={metric === 'revenue' ? '#10b981' : '#3b82f6'}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
