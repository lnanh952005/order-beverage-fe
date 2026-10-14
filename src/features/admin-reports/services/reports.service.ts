import { httpClient } from '@/shared/api/http-client';
import type {
  SalesSummary,
  SalesReportItem,
  TopProductItem,
  ReportFilterParams,
} from '../types/reports.types';

export const reportsService = {
  getSalesSummary: (params: ReportFilterParams) =>
    httpClient.get<SalesSummary>('/admin/reports/summary', { params }),

  getSalesReport: (params: ReportFilterParams) =>
    httpClient.get<SalesReportItem[]>('/admin/reports/sales', { params }),

  getTopProducts: (params: ReportFilterParams) =>
    httpClient.get<TopProductItem[]>('/admin/reports/top-products', { params }),
};
