import { describe, it, expect, vi } from 'vitest';
import { profileKeys } from '../services/profile.keys';
import { profileService } from '../services/profile.service';
import { httpClient } from '@/shared/api/http-client';

vi.mock('@/shared/api/http-client', () => ({
  httpClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('profile.keys', () => {
  it('generates consistent query keys', () => {
    expect(profileKeys.all).toEqual(['profile']);
    expect(profileKeys.user()).toEqual(['profile', 'user']);
    expect(profileKeys.addresses()).toEqual(['profile', 'addresses']);
  });
});

describe('profileService', () => {
  it('calls getProfile via GET /profile', async () => {
    const mockUser = { id: 1, email: 'an@example.com', fullName: 'Nguyen An' };
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockUser);

    const result = await profileService.getProfile();
    expect(httpClient.get).toHaveBeenCalledWith('/profile');
    expect(result).toEqual(mockUser);
  });

  it('calls updateProfile via PATCH /profile', async () => {
    const input = { fullName: 'Nguyen Van An', phone: '0901234567' };
    const mockUser = { id: 1, ...input };
    vi.mocked(httpClient.patch).mockResolvedValueOnce(mockUser);

    const result = await profileService.updateProfile(input);
    expect(httpClient.patch).toHaveBeenCalledWith('/profile', input);
    expect(result).toEqual(mockUser);
  });

  it('calls getAddresses via GET /profile/addresses', async () => {
    const mockAddresses = [{ id: 1, recipientName: 'An', city: 'HCM', isDefault: true }];
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockAddresses);

    const result = await profileService.getAddresses();
    expect(httpClient.get).toHaveBeenCalledWith('/profile/addresses');
    expect(result).toEqual(mockAddresses);
  });

  it('calls createAddress via POST /profile/addresses', async () => {
    const input = {
      recipientName: 'Binh',
      phone: '0987654321',
      addressLine: '123 Le Loi',
      city: 'HCM',
      isDefault: true,
    };
    const mockAddress = { id: 2, ...input };
    vi.mocked(httpClient.post).mockResolvedValueOnce(mockAddress);

    const result = await profileService.createAddress(input);
    expect(httpClient.post).toHaveBeenCalledWith('/profile/addresses', input);
    expect(result).toEqual(mockAddress);
  });

  it('calls updateAddress via PATCH /profile/addresses/:id', async () => {
    const input = { recipientName: 'Binh Updated' };
    const mockAddress = { id: 2, recipientName: 'Binh Updated', city: 'HCM', isDefault: true };
    vi.mocked(httpClient.patch).mockResolvedValueOnce(mockAddress);

    const result = await profileService.updateAddress(2, input);
    expect(httpClient.patch).toHaveBeenCalledWith('/profile/addresses/2', input);
    expect(result).toEqual(mockAddress);
  });

  it('calls deleteAddress via DELETE /profile/addresses/:id', async () => {
    vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined);

    await profileService.deleteAddress(2);
    expect(httpClient.delete).toHaveBeenCalledWith('/profile/addresses/2');
  });

  it('calls unlinkGoogleIdentity via DELETE /auth/identities/google', async () => {
    vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined);

    await profileService.unlinkGoogleIdentity();
    expect(httpClient.delete).toHaveBeenCalledWith('/auth/identities/google');
  });
});
