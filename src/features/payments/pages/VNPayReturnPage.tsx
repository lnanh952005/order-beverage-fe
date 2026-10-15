import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowRight,
  Home,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatMoney } from '@/shared/lib/formatters';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { paymentsService } from '../services/payments.service';
import type { VNPayReturnResult } from '../types/payments.types';

export function VNPayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const hasSearchParams = Boolean(searchParams.toString());
  const [isLoading, setIsLoading] = useState(hasSearchParams);
  const [verificationResult, setVerificationResult] = useState<VNPayReturnResult | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  // Extract query parameters from URL
  const queryRecord = useMemo(() => {
    const record: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      record[key] = val;
    });
    return record;
  }, [searchParams]);

  // Extract fallback orderCode from vnp_OrderInfo if present (e.g. "Thanh toan don hang ORD-20261015-8394")
  const fallbackOrderCode = useMemo(() => {
    const orderInfo = searchParams.get('vnp_OrderInfo') || '';
    const match = orderInfo.match(/ORD-[\w-]+/i);
    return match ? match[0] : null;
  }, [searchParams]);

  const responseCode = searchParams.get('vnp_ResponseCode');
  const rawAmount = searchParams.get('vnp_Amount');
  const amount = rawAmount ? Number(rawAmount) / 100 : verificationResult?.amount;
  const transactionNo = searchParams.get('vnp_TransactionNo') || verificationResult?.providerTxnId;
  const bankCode = searchParams.get('vnp_BankCode') || verificationResult?.bankCode;

  // Effective orderCode from backend result or URL fallback
  const orderCode = verificationResult?.orderCode || fallbackOrderCode;

  useEffect(() => {
    if (!hasSearchParams) {
      return;
    }

    let isMounted = true;

    paymentsService
      .verifyReturnUrl(queryRecord)
      .then((result) => {
        if (isMounted) {
          setVerificationResult(result);
          // Invalidate cache to immediately show updated status
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['payments'] });
        }
      })
      .catch(() => {
        if (isMounted) {
          // If network error, still construct fallback result based on responseCode
          setVerificationResult({
            isSuccess: responseCode === '00',
            isVerified: false,
            message: 'Không thể xác thực trực tiếp với máy chủ, vui lòng kiểm tra đơn hàng.',
            orderCode: fallbackOrderCode,
          });
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [hasSearchParams, queryRecord, queryClient, responseCode, fallbackOrderCode]);

  // Determine transaction status
  const isSuccess = responseCode === '00' || (verificationResult?.isSuccess && verificationResult?.isVerified);
  const isCancelled = responseCode === '24';

  // Auto redirect countdown on success
  useEffect(() => {
    if (!isLoading && isSuccess && orderCode) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(ROUTE_PATHS.ORDER_DETAIL(orderCode));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoading, isSuccess, orderCode, navigate]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-lg border border-border/80 shadow-xl overflow-hidden bg-card/95 backdrop-blur-sm transition-all duration-300">
        <CardContent className="p-6 sm:p-8">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Đang xử lý kết quả thanh toán
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Vui lòng không đóng hoặc tải lại trang trong khi hệ thống xác thực giao dịch...
                </p>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-10 h-10 animate-in zoom-in duration-300" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Thanh toán thành công!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Cổng VNPay đã xác nhận giao dịch của bạn hoàn tất.
                </p>
              </div>

              {/* Payment Details Receipt */}
              <div className="rounded-xl bg-muted/50 border border-border/60 p-4 space-y-2.5 text-sm text-left">
                {orderCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mã đơn hàng</span>
                    <span className="font-semibold text-foreground">#{orderCode}</span>
                  </div>
                )}
                {amount !== undefined && amount !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Số tiền</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                      {formatMoney(amount)}
                    </span>
                  </div>
                )}
                {transactionNo && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mã giao dịch VNPay</span>
                    <span className="font-mono text-xs text-foreground">{transactionNo}</span>
                  </div>
                )}
                {bankCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ngân hàng</span>
                    <span className="font-semibold text-foreground">{bankCode}</span>
                  </div>
                )}
              </div>

              {/* Countdown hint */}
              {orderCode && countdown > 0 && (
                <div className="text-xs text-muted-foreground animate-pulse">
                  Tự động chuyển về chi tiết đơn hàng sau <span className="font-bold text-primary">{countdown}s</span>...
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {orderCode ? (
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.ORDER_DETAIL(orderCode))}
                    className="flex-1 font-semibold flex items-center justify-center gap-2"
                  >
                    <span>Xem đơn hàng ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.ORDERS)}
                    className="flex-1 font-semibold flex items-center justify-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Xem danh sách đơn</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTE_PATHS.HOME)}
                  className="flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Trang chủ</span>
                </Button>
              </div>
            </div>
          ) : isCancelled ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              {/* Cancelled Icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-10 h-10 animate-in zoom-in duration-300" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Giao dịch đã bị hủy
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Bạn đã hủy giao dịch trên cổng VNPay. Đơn hàng của bạn vẫn được lưu lại với trạng thái chưa thanh toán.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {orderCode ? (
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.ORDER_DETAIL(orderCode))}
                    className="flex-1 font-semibold flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Thanh toán lại</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.ORDERS)}
                    className="flex-1 font-semibold flex items-center justify-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Danh sách đơn hàng</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTE_PATHS.HOME)}
                  className="flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Trang chủ</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              {/* Error Icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <XCircle className="w-10 h-10 animate-in zoom-in duration-300" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Thanh toán không thành công
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {verificationResult?.message ||
                    (responseCode
                      ? `Giao dịch không thành công (Mã phản hồi VNPay: ${responseCode}). Vui lòng kiểm tra lại tài khoản hoặc phương thức thanh toán.`
                      : 'Không tìm thấy thông tin giao dịch hợp lệ từ cổng thanh toán.')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {orderCode ? (
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.ORDER_DETAIL(orderCode))}
                    className="flex-1 font-semibold flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Quay lại đơn hàng</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.HOME)}
                    className="flex-1 font-semibold flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>Về trang chủ</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
