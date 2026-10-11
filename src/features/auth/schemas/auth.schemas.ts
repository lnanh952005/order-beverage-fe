import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập địa chỉ email')
    .email('Địa chỉ email không đúng định dạng'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Vui lòng nhập họ và tên')
      .max(120, 'Họ và tên không được quá 120 ký tự'),
    email: z
      .string()
      .min(1, 'Vui lòng nhập địa chỉ email')
      .email('Địa chỉ email không đúng định dạng'),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z
      .string()
      .min(1, 'Vui lòng nhập lại mật khẩu'),
    phone: z
      .string()
      .regex(/^([0-9]{8,15})?$/, 'Số điện thoại không hợp lệ (8 - 15 chữ số)')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['customer', 'staff', 'admin'], {
    errorMap: () => ({ message: 'Vai trò không hợp lệ' }),
  }),
});

export type UpdateUserRoleFormValues = z.infer<typeof updateUserRoleSchema>;
