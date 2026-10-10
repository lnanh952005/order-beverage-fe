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
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface ReportFilterParams {
  startDate: string;
  endDate: string;
  period?: 'daily' | 'weekly' | 'monthly';
}
