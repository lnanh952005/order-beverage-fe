import { z } from 'zod';

export const checkoutSchema = z
  .object({
    fulfillmentType: z.enum(['delivery', 'pickup'], {
      required_error: 'Vui lòng chọn hình thức nhận hàng',
    }),
    addressId: z.number().int().positive().optional(),
    paymentMethod: z.enum(['cod', 'card', 'e_wallet', 'bank_transfer'], {
      required_error: 'Vui lòng chọn phương thức thanh toán',
    }),
    voucherCode: z.string().trim().max(50, 'Mã voucher tối đa 50 ký tự').optional(),
    note: z.string().trim().max(255, 'Ghi chú tối đa 255 ký tự').optional(),
  })
  .refine(
    (data) => {
      if (data.fulfillmentType === 'delivery') {
        return typeof data.addressId === 'number' && data.addressId > 0;
      }
      return true;
    },
    {
      message: 'Vui lòng chọn địa chỉ giao hàng',
      path: ['addressId'],
    },
  );

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(255, 'Lý do tối đa 255 ký tự').optional(),
});

export type CancelOrderFormValues = z.infer<typeof cancelOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'delivering',
    'completed',
    'cancelled',
  ]),
  reason: z.string().trim().max(255, 'Lý do tối đa 255 ký tự').optional(),
});

export type UpdateOrderStatusFormValues = z.infer<typeof updateOrderStatusSchema>;
