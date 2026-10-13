import * as React from 'react';
import { Link } from 'react-router';
import { Truck, Store, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/features/cart';
import type { VoucherValidateResult } from '@/features/promotions';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { EmptyState, Skeleton } from '@/shared/components/feedback';
import { cn } from '@/shared/lib/utils';
import {
  CheckoutAddressSection,
  CheckoutPaymentSection,
  CheckoutSummary,
  CheckoutVoucherSection,
} from '../components';
import { useCheckout } from '../hooks/useCheckout';
import { useCheckoutStore } from '../stores/checkout.store';

export function CheckoutPage() {
  const { data: cart, isLoading: isCartLoading } = useCart();
  const checkoutMutation = useCheckout();

  // Zustand draft store
  const {
    fulfillmentType,
    addressId,
    paymentMethod,
    note,
    setFulfillmentType,
    setAddressId,
    setPaymentMethod,
    setNote,
  } = useCheckoutStore();

  const [appliedVoucher, setAppliedVoucher] = React.useState<VoucherValidateResult | null>(null);
  const [addressError, setAddressError] = React.useState<string | undefined>();

  if (isCartLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4 sm:px-6">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12 text-muted-foreground" />}
          title="Giỏ hàng của bạn đang trống"
          description="Hãy chọn những món đồ uống thơm ngon từ menu của chúng tôi trước khi thanh toán."
          action={
            <Button asChild size="lg">
              <Link to="/menu">Khám phá Menu</Link>
            </Button>
          }
        />
      </div>
    );
  }

  // Check if any item is marked unavailable
  const hasUnavailableItems = cart.items.some((item) => !item.isAvailable);

  const handleCheckout = () => {
    if (fulfillmentType === 'delivery' && !addressId) {
      setAddressError('Vui lòng chọn địa chỉ giao hàng để tiếp tục');
      return;
    }
    setAddressError(undefined);

    checkoutMutation.mutate({
      fulfillmentType,
      addressId: fulfillmentType === 'delivery' ? addressId : undefined,
      paymentMethod,
      voucherCode: appliedVoucher?.code,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Thanh toán đơn hàng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hoàn tất thông tin nhận hàng và phương thức thanh toán
        </p>
      </div>

      {hasUnavailableItems && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            Có một số món trong giỏ hàng hiện tại không còn khả dụng.{' '}
            <Link to="/cart" className="underline font-semibold hover:opacity-80">
              Quay lại giỏ hàng
            </Link>{' '}
            để cập nhật trước khi thanh toán.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Checkout form inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Fulfillment type switch */}
          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <label className="text-sm font-semibold text-foreground block">
                Hình thức nhận hàng
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFulfillmentType('delivery');
                    setAddressError(undefined);
                  }}
                  className={cn(
                    'p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all cursor-pointer',
                    fulfillmentType === 'delivery'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30 font-semibold text-foreground'
                      : 'border-border/70 hover:border-primary/40 bg-card text-muted-foreground',
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      fulfillmentType === 'delivery'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm leading-tight">Giao tận nơi</p>
                    <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
                      Giao hàng tới địa chỉ
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFulfillmentType('pickup');
                    setAddressError(undefined);
                  }}
                  className={cn(
                    'p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all cursor-pointer',
                    fulfillmentType === 'pickup'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30 font-semibold text-foreground'
                      : 'border-border/70 hover:border-primary/40 bg-card text-muted-foreground',
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      fulfillmentType === 'pickup'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm leading-tight">Lấy tại quán</p>
                    <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
                      Tự đến nhận món
                    </p>
                  </div>
                </button>
              </div>

              {/* Delivery Address or Pickup Info */}
              {fulfillmentType === 'delivery' ? (
                <div className="pt-2">
                  <CheckoutAddressSection
                    selectedAddressId={addressId}
                    onSelectAddress={(id) => {
                      setAddressId(id);
                      setAddressError(undefined);
                    }}
                    error={addressError}
                  />
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Địa chỉ nhận món tại cửa hàng:</p>
                  <p>123 Đường Trà Sữa, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
                  <p className="text-[11px] opacity-80">
                    * Món sẽ được chuẩn bị ngay sau khi bạn đặt hàng. Vui lòng đến nhận khi đơn báo "Sẵn sàng".
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-5">
              <CheckoutPaymentSection
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
              />
            </CardContent>
          </Card>

          {/* Voucher Section */}
          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-5">
              <CheckoutVoucherSection
                subtotal={cart.subtotal}
                appliedVoucher={appliedVoucher}
                onApplyVoucher={setAppliedVoucher}
              />
            </CardContent>
          </Card>

          {/* Order Note */}
          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-5 space-y-2">
              <label htmlFor="order-note" className="text-sm font-semibold text-foreground block">
                Ghi chú cho đơn hàng
              </label>
              <textarea
                id="order-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Giao trước 12h, gọi trước khi đến, ít đá ngọt vừa..."
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                maxLength={255}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Order Summary & Place Order */}
        <div className="lg:col-span-5">
          <CheckoutSummary
            items={cart.items}
            subtotal={cart.subtotal}
            discountAmount={appliedVoucher?.discountAmount || 0}
            fulfillmentType={fulfillmentType}
            isSubmitting={checkoutMutation.isPending}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
