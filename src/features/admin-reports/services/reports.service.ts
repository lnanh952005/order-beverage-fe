import { httpClient } from '@/shared/api/http-client';
import type { SalesSummary, TopProductItem, ReportFilterParams } from '../types/reports.types';

export const reportsService = {
  getSalesSummary: (params: ReportFilterParams) =>
    httpClient.get<SalesSummary>('/admin/reports/sales', { params }),
  getTopProducts: (params: ReportFilterParams & { limit?: number }) =>
    httpClient.get<TopProductItem[]>('/admin/reports/top-products', { params }),
};
