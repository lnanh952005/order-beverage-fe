// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
import { VoucherStatusBadge } from '../components/VoucherStatusBadge';
import { VoucherUsageProgress } from '../components/VoucherUsageProgress';
import { VoucherMetricsCards } from '../components/VoucherMetricsCards';
import type { Voucher } from '../types/promotions.types';

describe('VoucherStatusBadge', () => {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  it('renders "Tạm dừng" when isActive is false', () => {
    render(
      <VoucherStatusBadge
        voucher={{
          isActive: false,
          startsAt: new Date(now.getTime() - oneDay).toISOString(),
          endsAt: new Date(now.getTime() + oneDay).toISOString(),
          usedCount: 0,
        }}
      />,
    );
    expect(screen.getByText('Tạm dừng')).toBeInTheDocument();
  });

  it('renders "Hết hạn" when endsAt has passed', () => {
    render(
      <VoucherStatusBadge
        voucher={{
          isActive: true,
          startsAt: new Date(now.getTime() - oneDay * 5).toISOString(),
          endsAt: new Date(now.getTime() - oneDay * 2).toISOString(),
          usedCount: 0,
        }}
      />,
    );
    expect(screen.getByText('Hết hạn')).toBeInTheDocument();
  });

  it('renders "Sắp diễn ra" when startsAt is in the future', () => {
    render(
      <VoucherStatusBadge
        voucher={{
          isActive: true,
          startsAt: new Date(now.getTime() + oneDay * 2).toISOString(),
          endsAt: new Date(now.getTime() + oneDay * 5).toISOString(),
          usedCount: 0,
        }}
      />,
    );
    expect(screen.getByText('Sắp diễn ra')).toBeInTheDocument();
  });

  it('renders "Đang diễn ra" when active and within time bounds', () => {
    render(
      <VoucherStatusBadge
        voucher={{
          isActive: true,
          startsAt: new Date(now.getTime() - oneDay).toISOString(),
          endsAt: new Date(now.getTime() + oneDay).toISOString(),
          usedCount: 0,
        }}
      />,
    );
    expect(screen.getByText('Đang diễn ra')).toBeInTheDocument();
  });

  it('renders "Hết lượt dùng" when usedCount meets or exceeds usageLimit', () => {
    render(
      <VoucherStatusBadge
        voucher={{
          isActive: true,
          startsAt: new Date(now.getTime() - oneDay).toISOString(),
          endsAt: new Date(now.getTime() + oneDay).toISOString(),
          usageLimit: 50,
          usedCount: 50,
        }}
      />,
    );
    expect(screen.getByText('Hết lượt dùng')).toBeInTheDocument();
  });
});

describe('VoucherUsageProgress', () => {
  it('renders unlimited usage label when usageLimit is not set', () => {
    render(<VoucherUsageProgress usedCount={25} usageLimit={null} />);
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('lượt (vô hạn)')).toBeInTheDocument();
  });

  it('renders fraction and percentage when usageLimit is provided', () => {
    render(<VoucherUsageProgress usedCount={40} usageLimit={100} />);
    expect(screen.getByText('/ 100')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });
});

describe('VoucherMetricsCards', () => {
  const now = new Date();
  const mockVouchers: Voucher[] = [
    {
      id: 1,
      code: 'V1',
      discountType: 'percent',
      discountValue: 10,
      minOrderValue: 0,
      startsAt: new Date(now.getTime() - 100000).toISOString(),
      endsAt: new Date(now.getTime() + 100000).toISOString(),
      usedCount: 15,
      isActive: true,
    },
    {
      id: 2,
      code: 'V2',
      discountType: 'fixed',
      discountValue: 20000,
      minOrderValue: 0,
      startsAt: new Date(now.getTime() - 200000).toISOString(),
      endsAt: new Date(now.getTime() - 100000).toISOString(),
      usedCount: 5,
      isActive: false,
    },
  ];

  it('renders metrics cards with correct counts', () => {
    render(<VoucherMetricsCards vouchers={mockVouchers} totalFromMeta={2} />);
    expect(screen.getByText('Tổng số mã')).toBeInTheDocument();
    expect(screen.getByText('Đang diễn ra')).toBeInTheDocument();
    expect(screen.getByText('Tạm dừng / Hết hạn')).toBeInTheDocument();
    expect(screen.getByText('Lượt sử dụng')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument(); // total uses 15 + 5
  });
});
