import { useState } from 'react';
import {
  Calendar,
  User,
  Phone,
  RotateCcw,
  Receipt,
  FileCode,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { formatDateTime, formatMoney } from '@/shared/lib/formatters';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { RefundPaymentDialog } from './RefundPaymentDialog';
import type { PaymentAdminDetail } from '../types/payments.types';

interface PaymentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentAdminDetail | null;
}

export function PaymentDetailDialog({
  open,
  onOpenChange,
  payment,
}: PaymentDetailDialogProps) {
  const [showRefund, setShowRefund] = useState(false);
  const [showRawPayload, setShowRawPayload] = useState(false);

  if (!payment) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 pb-2 border-b">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">
                    Giao dịch #{payment.id}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Đơn hàng #{payment.order?.orderCode ?? payment.orderId}
                  </p>
                </div>
              </div>
              <PaymentStatusBadge status={payment.status} />
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Amount card */}
            <div className="p-4 rounded-xl bg-muted/40 border flex items-center justify-between">
              <div>
                <span className="text-muted-foreground block text-[11px]">Tổng số tiền</span>
                <span className="text-xl font-extrabold text-foreground">
                  {formatMoney(payment.amount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[11px]">Phương thức</span>
                <span className="font-bold text-foreground uppercase tracking-wide">
                  {payment.method}
                </span>
              </div>
            </div>

            {/* Transaction metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border bg-card">
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[11px]">Mã GD Cổng (Provider Txn)</span>
                <span className="font-mono font-medium text-foreground">
                  {payment.providerTxnId || '—'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Ngày thanh toán
                </span>
                <span className="font-medium text-foreground">
                  {payment.paidAt ? formatDateTime(payment.paidAt) : 'Chưa ghi nhận'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[11px]">Khởi tạo lúc</span>
                <span className="font-medium text-foreground">
                  {formatDateTime(payment.createdAt)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[11px]">Cập nhật lần cuối</span>
                <span className="font-medium text-foreground">
                  {formatDateTime(payment.updatedAt)}
                </span>
              </div>
            </div>

            {/* Order snapshot */}
            {payment.order && (
              <div className="p-3 rounded-lg border bg-card space-y-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5 pb-1 border-b">
                  <User className="w-3.5 h-3.5 text-primary" /> Thông tin đơn hàng liên kết
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Người nhận</span>
                    <span className="font-medium text-foreground">
                      {payment.order.recipientName || 'Khách vãng lai'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px] flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Điện thoại
                    </span>
                    <span className="font-medium text-foreground">
                      {payment.order.recipientPhone || '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Raw Provider Payload toggle */}
            {Boolean(payment.providerPayload) && (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowRawPayload(!showRawPayload)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  {showRawPayload ? 'Ẩn phản hồi từ cổng (Provider Payload)' : 'Xem dữ liệu cổng (Provider Payload)'}
                </button>
                {showRawPayload && (
                  <pre className="p-3 rounded-md bg-muted font-mono text-[11px] overflow-x-auto max-h-48 border">
                    {JSON.stringify(payment.providerPayload, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>

            {payment.status === 'paid' && (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowRefund(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Hoàn tiền giao dịch
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Embedded refund dialog */}
      <RefundPaymentDialog
        open={showRefund}
        onOpenChange={setShowRefund}
        paymentId={payment.id}
        orderCode={payment.order?.orderCode}
        maxAmount={payment.amount}
        onSuccess={() => {
          onOpenChange(false);
        }}
      />
    </>
  );
}
