import type { User } from '@/features/auth';

export interface Address {
  id: number;
  userId?: number;
  recipientName: string;
  phone: string;
  addressLine: string;
  ward?: string | null;
  district?: string | null;
  city: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressInput {
  recipientName: string;
  phone: string;
  addressLine: string;
  ward?: string | null | undefined;
  district?: string | null | undefined;
  city: string;
  isDefault?: boolean | undefined;
}

export type UpdateAddressInput = Partial<CreateAddressInput>;

export interface UpdateProfileInput {
  fullName?: string | undefined;
  phone?: string | null | undefined;
  avatarUrl?: string | null | undefined;
}

export type UserProfile = User;
export type { User };
