import { httpClient } from '@/shared/api/http-client';
import type { UserProfile, Address } from '../types/profile.types';

export const profileService = {
  getProfile: () => httpClient.get<UserProfile>('/profile'),
  getAddresses: () => httpClient.get<Address[]>('/profile/addresses'),
};
