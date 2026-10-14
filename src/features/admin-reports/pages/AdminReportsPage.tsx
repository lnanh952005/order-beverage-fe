import { BarChart3 } from 'lucide-react';
import { useReportFilters } from '../hooks/useReportFilters';
import { useAdminReports } from '../hooks/useAdminReports';
import { ReportFilterBar } from '../components/ReportFilterBar';
import { SalesSummaryCards } from '../components/SalesSummaryCards';
import { SalesRechartsChart } from '../components/SalesRechartsChart';
import { TopProductsTable } from '../components/TopProductsTable';
import { ErrorState } from '@/shared/components/feedback';
import { formatDate } from '@/shared/lib/formatters';

export function AdminReportsPage() {
  const {
    from,
    to,
    groupBy,
    limit,
    preset,
    setPreset,
    setCustomRange,
    setGroupBy,
    setLimit,
  } = useReportFilters();

  const {
    summary,
    sales,
    topProducts,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminReports({ from, to, groupBy, limit });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-primary" />
            Báo cáo & Thống kê kinh doanh
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Theo dõi doanh thu, hiệu suất đơn hàng và các thức uống bán chạy nhất
          </p>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/40 border px-3 py-1.5 rounded-lg self-start sm:self-auto">
          Dữ liệu từ <span className="font-semibold text-foreground">{formatDate(from)}</span> đến{' '}
          <span className="font-semibold text-foreground">{formatDate(to)}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <ReportFilterBar
        preset={preset}
        from={from}
        to={to}
        groupBy={groupBy}
        isFetching={isFetching}
        onSelectPreset={setPreset}
        onChangeCustomRange={setCustomRange}
        onChangeGroupBy={setGroupBy}
        onRefresh={refetch}
      />

      {/* Error State */}
      {isError ? (
        <ErrorState
          title="Không thể tải dữ liệu báo cáo"
          message={error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi truy vấn dữ liệu từ máy chủ.'}
          onRetry={refetch}
        />
      ) : (
        <>
          {/* KPI Summary Cards */}
          <SalesSummaryCards summary={summary} isLoading={isLoading} />

          {/* Revenue & Orders Chart using Recharts */}
          <SalesRechartsChart data={sales} isLoading={isLoading} />

          {/* Top Selling Products Table */}
          <TopProductsTable
            products={topProducts}
            limit={limit}
            isLoading={isLoading}
            onChangeLimit={setLimit}
          />
        </>
      )}
    </div>
  );
}
