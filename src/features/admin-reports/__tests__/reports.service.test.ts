import { describe, it, expect, vi } from 'vitest';
import { reportKeys } from '../services/reports.keys';
import { reportsService } from '../services/reports.service';
import { httpClient } from '@/shared/api/http-client';

vi.mock('@/shared/api/http-client', () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe('reportKeys', () => {
  it('generates consistent query keys', () => {
    expect(reportKeys.all).toEqual(['admin-reports']);
    expect(reportKeys.summary({ from: '2026-09-01', to: '2026-10-01' })).toEqual([
      'admin-reports',
      'summary',
      { from: '2026-09-01', to: '2026-10-01' },
    ]);
    expect(
      reportKeys.sales({ from: '2026-09-01', to: '2026-10-01', groupBy: 'day' }),
    ).toEqual([
      'admin-reports',
      'sales',
      { from: '2026-09-01', to: '2026-10-01', groupBy: 'day' },
    ]);
    expect(
      reportKeys.topProducts({ from: '2026-09-01', to: '2026-10-01', limit: 10 }),
    ).toEqual([
      'admin-reports',
      'top-products',
      { from: '2026-09-01', to: '2026-10-01', limit: 10 },
    ]);
  });
});

describe('reportsService', () => {
  it('calls getSalesSummary via GET /admin/reports/summary', async () => {
    const mockSummary = {
      totalRevenue: 5000000,
      totalOrders: 20,
      successfulOrders: 18,
      cancelledOrders: 2,
      averageOrderValue: 277777,
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockSummary);

    const params = { from: '2026-09-01', to: '2026-10-01' };
    const res = await reportsService.getSalesSummary(params);
    expect(httpClient.get).toHaveBeenCalledWith('/admin/reports/summary', { params });
    expect(res).toEqual(mockSummary);
  });

  it('calls getSalesReport via GET /admin/reports/sales', async () => {
    const mockSales = [
      { period: '2026-10-01', orders: 5, revenue: 1200000 },
      { period: '2026-10-02', orders: 8, revenue: 2100000 },
    ];
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockSales);

    const params = { from: '2026-10-01', to: '2026-10-02', groupBy: 'day' as const };
    const res = await reportsService.getSalesReport(params);
    expect(httpClient.get).toHaveBeenCalledWith('/admin/reports/sales', { params });
    expect(res).toEqual(mockSales);
  });

  it('calls getTopProducts via GET /admin/reports/top-products', async () => {
    const mockProducts = [
      {
        productId: 1,
        productName: 'Trà Sữa Trân Châu Hoàng Gia',
        quantitySold: 120,
        revenue: 4200000,
      },
    ];
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockProducts);

    const params = { from: '2026-10-01', to: '2026-10-14', limit: 5 };
    const res = await reportsService.getTopProducts(params);
    expect(httpClient.get).toHaveBeenCalledWith('/admin/reports/top-products', { params });
    expect(res).toEqual(mockProducts);
  });
});
