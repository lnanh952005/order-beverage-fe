import { z } from 'zod';

export const voucherFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, 'Mã voucher không được để trống')
      .max(50, 'Mã voucher không được vượt quá 50 ký tự')
      .transform((val) => val.toUpperCase()),
    description: z.string().trim().max(255, 'Mô tả tối đa 255 ký tự').optional(),
    discountType: z.enum(['percent', 'fixed'], {
      required_error: 'Vui lòng chọn loại giảm giá',
    }),
    discountValue: z
      .number({ required_error: 'Vui lòng nhập giá trị giảm' })
      .positive('Giá trị giảm giá phải lớn hơn 0'),
    maxDiscount: z
      .number()
      .nonnegative('Mức giảm tối đa không được âm')
      .nullable()
      .optional(),
    minOrderValue: z
      .number()
      .nonnegative('Giá trị đơn tối thiểu không được âm')
      .default(0),
    usageLimit: z
      .number()
      .int('Lượt sử dụng phải là số nguyên')
      .positive('Lượt sử dụng phải lớn hơn 0')
      .nullable()
      .optional(),
    startsAt: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
    endsAt: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const start = new Date(data.startsAt);
      const end = new Date(data.endsAt);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end.getTime() > start.getTime();
    },
    {
      message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      path: ['endsAt'],
    },
  )
  .refine(
    (data) => {
      if (data.discountType === 'percent') {
        return data.discountValue >= 1 && data.discountValue <= 100;
      }
      return true;
    },
    {
      message: 'Giảm giá theo phần trăm phải từ 1% đến 100%',
      path: ['discountValue'],
    },
  );

export type VoucherFormValues = z.infer<typeof voucherFormSchema>;
export type VoucherFormInput = z.input<typeof voucherFormSchema>;
