import { describe, it, expect } from 'vitest';
import { updateProfileSchema, addressSchema } from '../schemas/profile.schemas';

describe('profile.schemas', () => {
  describe('updateProfileSchema', () => {
    it('validates correct profile data', () => {
      const result = updateProfileSchema.safeParse({
        fullName: 'Nguyễn Văn An',
        phone: '0901234567',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('allows empty phone and avatarUrl', () => {
      const result = updateProfileSchema.safeParse({
        fullName: 'Nguyễn Văn An',
        phone: '',
        avatarUrl: '',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty fullName', () => {
      const result = updateProfileSchema.safeParse({
        fullName: '   ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Họ và tên không được để trống');
      }
    });

    it('rejects invalid avatarUrl format', () => {
      const result = updateProfileSchema.safeParse({
        fullName: 'Nguyễn Văn An',
        avatarUrl: 'not-a-valid-url',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Đường dẫn ảnh đại diện không hợp lệ');
      }
    });

    it('rejects phone longer than 20 chars', () => {
      const result = updateProfileSchema.safeParse({
        fullName: 'Nguyễn Văn An',
        phone: '0123456789012345678901',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('addressSchema', () => {
    it('validates correct address data', () => {
      const result = addressSchema.safeParse({
        recipientName: 'Trần Thị Bình',
        phone: '0987654321',
        addressLine: '123 Đường Nguyễn Huệ',
        ward: 'Phường Bến Nghé',
        district: 'Quận 1',
        city: 'TP. Hồ Chí Minh',
        isDefault: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDefault).toBe(true);
      }
    });

    it('validates address data with isDefault false', () => {
      const result = addressSchema.safeParse({
        recipientName: 'Trần Thị Bình',
        phone: '0987654321',
        addressLine: '123 Đường Nguyễn Huệ',
        city: 'TP. Hồ Chí Minh',
        isDefault: false,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDefault).toBe(false);
      }
    });

    it('rejects missing recipientName', () => {
      const result = addressSchema.safeParse({
        phone: '0987654321',
        addressLine: '123 Đường Nguyễn Huệ',
        city: 'TP. Hồ Chí Minh',
      });
      expect(result.success).toBe(false);
    });

    it('rejects phone shorter than 8 chars', () => {
      const result = addressSchema.safeParse({
        recipientName: 'Trần Thị Bình',
        phone: '12345',
        addressLine: '123 Đường Nguyễn Huệ',
        city: 'TP. Hồ Chí Minh',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8 ký tự');
      }
    });

    it('rejects missing addressLine', () => {
      const result = addressSchema.safeParse({
        recipientName: 'Trần Thị Bình',
        phone: '0987654321',
        city: 'TP. Hồ Chí Minh',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing city', () => {
      const result = addressSchema.safeParse({
        recipientName: 'Trần Thị Bình',
        phone: '0987654321',
        addressLine: '123 Đường Nguyễn Huệ',
      });
      expect(result.success).toBe(false);
    });
  });
});
