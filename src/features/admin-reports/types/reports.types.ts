export type GroupByPeriod = 'day' | 'week' | 'month';

export type DatePreset = 'today' | '7days' | '30days' | 'thisMonth' | 'custom';

export interface SalesReportItem {
  period: string;
  orders: number;
  revenue: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  successfulOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

export interface TopProductItem {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
  totalQuantitySold?: number;
  totalRevenue?: number;
}

export interface ReportFilterParams {
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: GroupByPeriod;
  period?: 'daily' | 'weekly' | 'monthly';
  limit?: number;
}
