import { useState } from 'react';
import { Copy, Check, Calendar, ShoppingCart, Percent } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { formatDate, formatDateTime, formatMoney } from '@/shared/lib/formatters';
import { VoucherStatusBadge } from './VoucherStatusBadge';
import { VoucherUsageProgress } from './VoucherUsageProgress';
import type { Voucher } from '../types/promotions.types';

interface VoucherDetailModalProps {
  voucher: Voucher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (voucher: Voucher) => void;
}

export function VoucherDetailModal({
  voucher,
  open,
  onOpenChange,
  onEdit,
}: VoucherDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!voucher) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPercent = voucher.discountType === 'percent';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-4">
            <DialogTitle className="text-lg">Chi tiết mã khuyến mãi</DialogTitle>
            <VoucherStatusBadge voucher={voucher} />
          </div>
          <DialogDescription>
            Thông tin chi tiết và điều kiện áp dụng của mã voucher
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Voucher Code Card */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Mã áp dụng
              </span>
              <p className="text-xl font-bold font-mono tracking-widest text-primary">
                {voucher.code}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="gap-1.5 h-8 text-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </Button>
          </div>

          {/* Description */}
          {voucher.description && (
            <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
              {voucher.description}
            </div>
          )}

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-border bg-card space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Percent className="w-3.5 h-3.5 text-primary" />
                <span>Mức giảm</span>
              </div>
              <p className="text-sm font-bold text-foreground">
                {isPercent
                  ? `${voucher.discountValue}%`
                  : formatMoney(Number(voucher.discountValue))}
              </p>
              {isPercent && voucher.maxDiscount && (
                <p className="text-[11px] text-muted-foreground">
                  Tối đa: {formatMoney(Number(voucher.maxDiscount))}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                <span>Đơn tối thiểu</span>
              </div>
              <p className="text-sm font-bold text-foreground">
                {Number(voucher.minOrderValue) > 0
                  ? formatMoney(Number(voucher.minOrderValue))
                  : 'Không yêu cầu'}
              </p>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Tiến độ sử dụng</span>
            <VoucherUsageProgress
              usedCount={voucher.usedCount}
              usageLimit={voucher.usageLimit}
            />
          </div>

          {/* Validity Timeline */}
          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Thời gian hiệu lực</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>
                <span className="text-[10px] uppercase font-semibold">Bắt đầu:</span>
                <p className="text-foreground font-medium mt-0.5">
                  {formatDateTime(voucher.startsAt)}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold">Kết thúc:</span>
                <p className="text-foreground font-medium mt-0.5">
                  {formatDateTime(voucher.endsAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Created & Updated */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 px-1 pt-1">
            {voucher.createdAt && (
              <span>Tạo lúc: {formatDate(voucher.createdAt)}</span>
            )}
            <span>ID #{voucher.id}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(voucher);
              }}
            >
              Chỉnh sửa voucher
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
