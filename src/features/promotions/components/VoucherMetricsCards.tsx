import { Tag, Sparkles, PauseCircle, CheckCircle2 } from 'lucide-react';
import type { Voucher } from '../types/promotions.types';

interface VoucherMetricsCardsProps {
  vouchers: Voucher[];
  totalFromMeta?: number;
}

export function VoucherMetricsCards({ vouchers, totalFromMeta }: VoucherMetricsCardsProps) {
  const now = new Date();

  const total = totalFromMeta ?? vouchers.length;
  const activeCount = vouchers.filter(
    (v) => v.isActive && new Date(v.startsAt) <= now && new Date(v.endsAt) >= now,
  ).length;
  const inactiveOrExpiredCount = vouchers.filter(
    (v) => !v.isActive || new Date(v.endsAt) < now,
  ).length;
  const totalUses = vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0);

  const cards = [
    {
      title: 'Tổng số mã',
      value: total,
      subtext: 'Tất cả voucher trên hệ thống',
      icon: Tag,
      iconClass: 'text-primary bg-primary/10',
    },
    {
      title: 'Đang diễn ra',
      value: activeCount,
      subtext: 'Có thể áp dụng ngay',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      title: 'Tạm dừng / Hết hạn',
      value: inactiveOrExpiredCount,
      subtext: 'Không khả dụng cho đơn hàng',
      icon: PauseCircle,
      iconClass: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
    },
    {
      title: 'Lượt sử dụng',
      value: totalUses.toLocaleString('vi-VN'),
      subtext: 'Tổng lượt khách hàng áp dụng',
      icon: Sparkles,
      iconClass: 'text-indigo-600 bg-indigo-500/10 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{card.value}</p>
              <p className="text-[11px] text-muted-foreground/80">{card.subtext}</p>
            </div>
            <div className={`p-3 rounded-xl shrink-0 ${card.iconClass}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
