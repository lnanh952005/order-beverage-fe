// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddressCard } from '../components/AddressCard';
import { ProfileNavTabs } from '../components/ProfileNavTabs';
import { ProfileForm } from '../components/ProfileForm';
import { profileService } from '../services/profile.service';
import type { Address } from '../types/profile.types';
import type { User } from '@/features/auth';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProfileNavTabs', () => {
  it('renders navigation tabs', () => {
    render(<ProfileNavTabs />, { wrapper: createWrapper() });

    expect(screen.getByText('Thông tin tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Sổ địa chỉ giao hàng')).toBeInTheDocument();
  });
});

describe('AddressCard', () => {
  const mockAddress: Address = {
    id: 10,
    recipientName: 'Lê Văn An',
    phone: '0901234567',
    addressLine: '123 Đường Nguyễn Thị Minh Khai',
    ward: 'Phường 6',
    district: 'Quận 3',
    city: 'Hồ Chí Minh',
    isDefault: true,
  };

  it('renders address details and default badge', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AddressCard
        address={mockAddress}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Lê Văn An')).toBeInTheDocument();
    expect(screen.getByText('0901234567')).toBeInTheDocument();
    expect(
      screen.getByText('123 Đường Nguyễn Thị Minh Khai, Phường 6, Quận 3, Hồ Chí Minh'),
    ).toBeInTheDocument();
    expect(screen.getByText('Mặc định')).toBeInTheDocument();
    // Default address should not have "Đặt mặc định" button
    expect(screen.queryByText('Đặt mặc định')).not.toBeInTheDocument();
  });

  it('calls onEdit and onDelete when respective buttons are clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const nonDefaultAddress: Address = {
      ...mockAddress,
      id: 11,
      isDefault: false,
    };

    render(
      <AddressCard
        address={nonDefaultAddress}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Đặt mặc định')).toBeInTheDocument();

    const editButton = screen.getByText('Sửa');
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(nonDefaultAddress);

    const deleteButton = screen.getByText('Xóa');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(nonDefaultAddress);
  });
});

describe('ProfileForm', () => {
  const mockUser: User = {
    id: 1,
    email: 'admin@gmail.com',
    fullName: 'Quản Trị Viên',
    phone: '0901234567',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    isActive: true,
  };

  it('renders initial user info with avatar image and submit button enabled', () => {
    render(<ProfileForm user={mockUser} />, { wrapper: createWrapper() });

    expect(screen.getByDisplayValue('Quản Trị Viên')).toBeInTheDocument();
    expect(screen.getByDisplayValue('admin@gmail.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0901234567')).toBeInTheDocument();

    const avatarImg = screen.getByRole('img', { name: 'Quản Trị Viên' });
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg');

    const uploadButton = screen.getByRole('button', { name: /Tải ảnh mới/i });
    expect(uploadButton).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: /Xóa ảnh/i });
    expect(deleteButton).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /Lưu thay đổi/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
  });

  it('calls uploadAvatar when a new image file is selected', async () => {
    const uploadAvatarSpy = vi.spyOn(profileService, 'uploadAvatar').mockResolvedValueOnce({
      ...mockUser,
      avatarUrl: 'https://res.cloudinary.com/test/new-avatar.png',
    });

    const { container } = render(<ProfileForm user={mockUser} />, { wrapper: createWrapper() });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(uploadAvatarSpy).toHaveBeenCalledWith(file);
    });
  });

  it('calls deleteAvatar when clicking Xóa ảnh', async () => {
    const deleteAvatarSpy = vi.spyOn(profileService, 'deleteAvatar').mockResolvedValueOnce({
      ...mockUser,
      avatarUrl: null,
    });

    render(<ProfileForm user={mockUser} />, { wrapper: createWrapper() });

    const deleteBtn = screen.getByRole('button', { name: /Xóa ảnh/i });
    fireEvent.click(deleteBtn);

    await vi.waitFor(() => {
      expect(deleteAvatarSpy).toHaveBeenCalled();
    });
  });

  it('submits form with updated data and calls updateProfile', async () => {
    const updateSpy = vi.spyOn(profileService, 'updateProfile').mockResolvedValueOnce({
      ...mockUser,
      fullName: 'Quản Trị Viên Mới',
      phone: '0988888888',
    });

    render(<ProfileForm user={mockUser} />, { wrapper: createWrapper() });

    const nameInput = screen.getByDisplayValue('Quản Trị Viên');
    fireEvent.change(nameInput, { target: { value: 'Quản Trị Viên Mới' } });

    const phoneInput = screen.getByDisplayValue('0901234567');
    fireEvent.change(phoneInput, { target: { value: '0988888888' } });

    const saveButton = screen.getByRole('button', { name: /Lưu thay đổi/i });
    fireEvent.click(saveButton);

    await vi.waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        fullName: 'Quản Trị Viên Mới',
        phone: '0988888888',
      });
    });
  });
});

