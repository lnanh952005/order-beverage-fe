import { httpClient } from '@/shared/api/http-client';
import type { User } from '@/features/auth';
import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
  UpdateProfileInput,
} from '../types/profile.types';

export const profileService = {
  getProfile: (): Promise<User> => {
    return httpClient.get<User>('/profile');
  },

  updateProfile: (data: UpdateProfileInput): Promise<User> => {
    return httpClient.patch<User>('/profile', data);
  },

  uploadAvatar: (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient.post<User>('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteAvatar: (): Promise<User> => {
    return httpClient.delete<User>('/profile/avatar');
  },

  getAddresses: (): Promise<Address[]> => {
    return httpClient.get<Address[]>('/profile/addresses');
  },

  createAddress: (data: CreateAddressInput): Promise<Address> => {
    return httpClient.post<Address>('/profile/addresses', data);
  },

  updateAddress: (id: number, data: UpdateAddressInput): Promise<Address> => {
    return httpClient.patch<Address>(`/profile/addresses/${id}`, data);
  },

  deleteAddress: (id: number): Promise<void> => {
    return httpClient.delete<void>(`/profile/addresses/${id}`);
  },

  unlinkGoogleIdentity: (): Promise<void> => {
    return httpClient.delete<void>('/auth/identities/google');
  },
};
