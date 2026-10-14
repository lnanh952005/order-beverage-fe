// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { SalesSummaryCards } from '../components/SalesSummaryCards';
import { TopProductsTable } from '../components/TopProductsTable';
import { ReportFilterBar } from '../components/ReportFilterBar';
import { SalesRechartsChart } from '../components/SalesRechartsChart';
import type { SalesSummary, TopProductItem, SalesReportItem } from '../types/reports.types';

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

afterEach(() => {
  cleanup();
});

describe('SalesSummaryCards', () => {
  it('renders skeleton loaders when isLoading is true', () => {
    const { container } = render(<SalesSummaryCards isLoading={true} />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders KPI values accurately', () => {
    const summary: SalesSummary = {
      totalRevenue: 3850000,
      totalOrders: 45,
      successfulOrders: 40,
      cancelledOrders: 5,
      averageOrderValue: 96250,
    };

    render(<SalesSummaryCards summary={summary} />);

    expect(screen.getByText('Tổng doanh thu')).toBeInTheDocument();
    expect(screen.getByText('Đơn thành công')).toBeInTheDocument();
    expect(screen.getByText('Đơn đã hủy')).toBeInTheDocument();
    expect(screen.getByText('Giá trị TB đơn (AOV)')).toBeInTheDocument();
    expect(screen.getByText('40 đơn hoàn tất')).toBeInTheDocument();
    expect(screen.getByText(/Tỷ lệ hủy: 11\.1%/)).toBeInTheDocument();
  });
});

describe('TopProductsTable', () => {
  it('renders empty message when no products exist', () => {
    render(<TopProductsTable products={[]} limit={10} onChangeLimit={vi.fn()} />);
    expect(
      screen.getByText('Chưa có dữ liệu đồ uống được tiêu thụ trong khoảng thời gian này'),
    ).toBeInTheDocument();
  });

  it('renders product rank, name, and quantity sold', () => {
    const products: TopProductItem[] = [
      {
        productId: 1,
        productName: 'Trà Sữa Oolong Nướng',
        quantitySold: 85,
        revenue: 2975000,
      },
      {
        productId: 2,
        productName: 'Cà Phê Muối Hoàng Gia',
        quantitySold: 60,
        revenue: 1800000,
      },
    ];

    const handleChangeLimit = vi.fn();
    render(<TopProductsTable products={products} limit={10} onChangeLimit={handleChangeLimit} />);

    expect(screen.getByText('Trà Sữa Oolong Nướng')).toBeInTheDocument();
    expect(screen.getByText('Cà Phê Muối Hoàng Gia')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();

    const top5Button = screen.getByText('Top 5');
    fireEvent.click(top5Button);
    expect(handleChangeLimit).toHaveBeenCalledWith(5);
  });
});

describe('ReportFilterBar', () => {
  it('renders presets and triggers callbacks', () => {
    const handleSelectPreset = vi.fn();
    const handleChangeGroupBy = vi.fn();
    const handleRefresh = vi.fn();

    render(
      <ReportFilterBar
        preset="30days"
        from="2026-09-14"
        to="2026-10-14"
        groupBy="day"
        onSelectPreset={handleSelectPreset}
        onChangeCustomRange={vi.fn()}
        onChangeGroupBy={handleChangeGroupBy}
        onRefresh={handleRefresh}
      />,
    );

    const sevenDaysBtn = screen.getByText('7 ngày qua');
    fireEvent.click(sevenDaysBtn);
    expect(handleSelectPreset).toHaveBeenCalledWith('7days');

    const weekBtn = screen.getByText('Tuần');
    fireEvent.click(weekBtn);
    expect(handleChangeGroupBy).toHaveBeenCalledWith('week');

    const refreshBtn = screen.getByText('Làm mới');
    fireEvent.click(refreshBtn);
    expect(handleRefresh).toHaveBeenCalled();
  });
});

describe('SalesRechartsChart', () => {
  it('renders chart title and metric toggle buttons', () => {
    const data: SalesReportItem[] = [
      { period: '2026-10-10', orders: 10, revenue: 500000 },
      { period: '2026-10-11', orders: 15, revenue: 750000 },
    ];

    render(<SalesRechartsChart data={data} />);

    expect(screen.getByText('Xu hướng doanh số & đơn hàng')).toBeInTheDocument();
    const revenueBtn = screen.getByRole('button', { name: 'Doanh thu' });
    const ordersBtn = screen.getByRole('button', { name: 'Số đơn' });
    expect(revenueBtn).toBeInTheDocument();
    expect(ordersBtn).toBeInTheDocument();

    fireEvent.click(ordersBtn);
    expect(ordersBtn).toHaveClass('bg-primary');
  });
});
