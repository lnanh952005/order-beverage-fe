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
import type { Address } from '../types/profile.types';

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
