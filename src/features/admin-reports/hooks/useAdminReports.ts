import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import { reportKeys } from '../services/reports.keys';
import type { ReportFilterParams } from '../types/reports.types';

export function useAdminReports(params: ReportFilterParams) {
  const summaryQuery = useQuery({
    queryKey: reportKeys.summary({ from: params.from, to: params.to }),
    queryFn: () =>
      reportsService.getSalesSummary({ from: params.from, to: params.to }),
    staleTime: 60_000,
  });

  const salesQuery = useQuery({
    queryKey: reportKeys.sales({
      from: params.from,
      to: params.to,
      groupBy: params.groupBy,
    }),
    queryFn: () =>
      reportsService.getSalesReport({
        from: params.from,
        to: params.to,
        groupBy: params.groupBy,
      }),
    staleTime: 60_000,
  });

  const topProductsQuery = useQuery({
    queryKey: reportKeys.topProducts({
      from: params.from,
      to: params.to,
      limit: params.limit,
    }),
    queryFn: () =>
      reportsService.getTopProducts({
        from: params.from,
        to: params.to,
        limit: params.limit,
      }),
    staleTime: 60_000,
  });

  const isLoading =
    summaryQuery.isLoading || salesQuery.isLoading || topProductsQuery.isLoading;
  const isFetching =
    summaryQuery.isFetching || salesQuery.isFetching || topProductsQuery.isFetching;
  const isError =
    summaryQuery.isError || salesQuery.isError || topProductsQuery.isError;
  const error =
    summaryQuery.error || salesQuery.error || topProductsQuery.error;

  const refetch = async () => {
    await Promise.all([
      summaryQuery.refetch(),
      salesQuery.refetch(),
      topProductsQuery.refetch(),
    ]);
  };

  return {
    summary: summaryQuery.data,
    sales: salesQuery.data ?? [],
    topProducts: topProductsQuery.data ?? [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}
