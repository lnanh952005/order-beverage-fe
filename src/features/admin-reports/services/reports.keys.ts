import type { ReportFilterParams } from '../types/reports.types';

export const reportKeys = {
  all: ['admin-reports'] as const,
  summary: (params: ReportFilterParams) =>
    [...reportKeys.all, 'summary', params] as const,
  sales: (params: ReportFilterParams) =>
    [...reportKeys.all, 'sales', params] as const,
  topProducts: (params: ReportFilterParams) =>
    [...reportKeys.all, 'top-products', params] as const,
};
