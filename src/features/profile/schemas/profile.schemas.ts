import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Họ và tên không được để trống')
    .max(120, 'Họ và tên không được vượt quá 120 ký tự'),
  phone: z
    .string()
    .trim()
    .max(20, 'Số điện thoại tối đa 20 ký tự')
    .optional()
    .or(z.literal('')),
  avatarUrl: z
    .string()
    .trim()
    .max(500, 'Đường dẫn ảnh tối đa 500 ký tự')
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'Đường dẫn ảnh đại diện không hợp lệ',
    })
    .optional()
    .or(z.literal('')),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên người nhận')
    .max(120, 'Tên người nhận tối đa 120 ký tự'),
  phone: z
    .string()
    .trim()
    .min(8, 'Số điện thoại phải có ít nhất 8 ký tự')
    .max(20, 'Số điện thoại tối đa 20 ký tự')
    .regex(/^[0-9+() -]+$/, 'Số điện thoại không đúng định dạng'),
  addressLine: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập địa chỉ cụ thể')
    .max(255, 'Địa chỉ cụ thể tối đa 255 ký tự'),
  ward: z
    .string()
    .trim()
    .max(100, 'Phường/Xã tối đa 100 ký tự')
    .optional()
    .or(z.literal('')),
  district: z
    .string()
    .trim()
    .max(100, 'Quận/Huyện tối đa 100 ký tự')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập Tỉnh/Thành phố')
    .max(100, 'Tỉnh/Thành phố tối đa 100 ký tự'),
  isDefault: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
