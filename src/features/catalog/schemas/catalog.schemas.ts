import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Tên danh mục không được để trống').max(100, 'Tên không quá 100 ký tự'),
  slug: z
    .string()
    .trim()
    .min(1, 'Đường dẫn (slug) không được để trống')
    .max(120, 'Slug không quá 120 ký tự')
    .regex(slugRegex, 'Slug chỉ chứa chữ thường, số và dấu gạch nối (ví dụ: tra-sua)'),
  imageUrl: z.string().trim().max(500, 'Đường dẫn hình ảnh không quá 500 ký tự').optional(),
  sortOrder: z.number().int().min(0, 'Thứ tự phải lớn hơn hoặc bằng 0').optional(),
  isActive: z.boolean().optional(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

export const productSizeFormSchema = z.object({
  name: z.string().trim().min(1, 'Tên size không được để trống').max(50),
  priceDelta: z.number(),
  isDefault: z.boolean(),
  sortOrder: z.number().int().optional(),
});

export const productFormSchema = z
  .object({
    categoryId: z.number().int().positive('Vui lòng chọn danh mục cho sản phẩm'),
    name: z.string().trim().min(1, 'Tên món không được để trống').max(150, 'Tên không quá 150 ký tự'),
    slug: z
      .string()
      .trim()
      .min(1, 'Đường dẫn (slug) không được để trống')
      .max(180, 'Slug không quá 180 ký tự')
      .regex(slugRegex, 'Slug chỉ chứa chữ thường, số và dấu gạch nối (ví dụ: tra-sua-tran-chau)'),
    description: z.string().trim().max(5000).optional(),
    imageUrl: z.string().trim().max(500).optional(),
    basePrice: z.number().min(0, 'Giá cơ bản phải lớn hơn hoặc bằng 0'),
    isActive: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    sizes: z.array(productSizeFormSchema).min(1, 'Sản phẩm phải có ít nhất 1 size'),
    optionGroupIds: z.array(z.number()).optional(),
  })
  .refine(
    (data) => {
      const defaultSizes = data.sizes.filter((s) => s.isDefault);
      return defaultSizes.length === 1;
    },
    {
      message: 'Món ăn/đồ uống phải có chính xác một size mặc định',
      path: ['sizes'],
    },
  );

export type ProductFormData = z.infer<typeof productFormSchema>;

export const optionGroupFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Tên nhóm tùy chọn không được để trống').max(100),
    selectType: z.enum(['single', 'multiple']),
    minSelect: z.number().int().min(0).optional(),
    maxSelect: z.number().int().min(1).optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine(
    (data) => {
      if (data.minSelect !== undefined && data.maxSelect !== undefined) {
        return data.minSelect <= data.maxSelect;
      }
      return true;
    },
    {
      message: 'Số lượng tối thiểu không được lớn hơn số lượng tối đa',
      path: ['minSelect'],
    },
  )
  .refine(
    (data) => {
      if (data.selectType === 'single' && data.maxSelect !== undefined && data.maxSelect !== 1) {
        return false;
      }
      return true;
    },
    {
      message: 'Nhóm chọn đơn (single) phải có số lượng tối đa là 1',
      path: ['maxSelect'],
    },
  );

export type OptionGroupFormData = z.infer<typeof optionGroupFormSchema>;

export const optionFormSchema = z.object({
  name: z.string().trim().min(1, 'Tên tùy chọn không được để trống').max(100),
  priceDelta: z.number(),
  isDefault: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type OptionFormData = z.infer<typeof optionFormSchema>;
