import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
} from '../schemas/auth.schemas';

describe('auth.schemas', () => {
  describe('loginSchema', () => {
    it('validates correct email and password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email');
      }
    });

    it('rejects short password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('6');
      }
    });
  });

  describe('registerSchema', () => {
    it('validates valid registration data', () => {
      const result = registerSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        email: 'nguyen@example.com',
        phone: '0901234567',
        password: 'StrongPassword123!',
        confirmPassword: 'StrongPassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched confirmPassword', () => {
      const result = registerSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        email: 'nguyen@example.com',
        password: 'StrongPassword123!',
        confirmPassword: 'DifferentPassword123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });

    it('rejects password shorter than 8 chars', () => {
      const result = registerSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        email: 'nguyen@example.com',
        password: '1234567',
        confirmPassword: '1234567',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8');
      }
    });
  });

  describe('updateUserStatusSchema', () => {
    it('accepts boolean isActive', () => {
      expect(updateUserStatusSchema.safeParse({ isActive: true }).success).toBe(true);
      expect(updateUserStatusSchema.safeParse({ isActive: false }).success).toBe(true);
    });
  });

  describe('updateUserRoleSchema', () => {
    it('accepts valid roles', () => {
      expect(updateUserRoleSchema.safeParse({ role: 'customer' }).success).toBe(true);
      expect(updateUserRoleSchema.safeParse({ role: 'staff' }).success).toBe(true);
      expect(updateUserRoleSchema.safeParse({ role: 'admin' }).success).toBe(true);
    });

    it('rejects invalid role', () => {
      expect(updateUserRoleSchema.safeParse({ role: 'superadmin' }).success).toBe(false);
    });
  });
});
