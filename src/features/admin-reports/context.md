# Admin Reports Feature Context

## 1. Scope & Responsibility
- **Báo cáo thống kê (KPIs):** Hiển thị các chỉ số kinh doanh quan trọng như tổng doanh thu, số lượng đơn thành công, số đơn hủy, tỷ lệ hủy đơn, giá trị đơn trung bình AOV (`SalesSummaryCards`).
- **Biểu đồ trực quan (Recharts):** Biểu đồ cột / xu hướng theo chu kỳ ngày, tuần, tháng với Recharts, hỗ trợ chuyển đổi linh hoạt giữa xem Doanh thu (VND) và Số lượng đơn (`SalesRechartsChart`).
- **Món bán chạy nhất:** Bảng xếp hạng các món đồ uống có doanh thu và số lượng tiêu thụ cao nhất kèm thanh thị phần trực quan (`TopProductsTable`).
- **Bộ lọc thời gian đồng bộ URL:** Lọc số liệu theo các mốc định sẵn (hôm nay, 7 ngày qua, 30 ngày qua, tháng này, tùy chọn) đồng bộ với URL search params (`ReportFilterBar`, `useReportFilters`).

## 2. API Endpoints (api-spec.md §11)
- `GET /admin/reports/summary` — Lấy các chỉ số KPI tổng quan (tổng doanh thu, đơn thành công, đơn hủy, AOV).
- `GET /admin/reports/sales` — Lấy chuỗi thời gian doanh thu và số lượng đơn hàng theo chu kỳ.
- `GET /admin/reports/top-products` — Lấy danh sách sản phẩm bán chạy nhất kèm số lượng và doanh thu.

## 3. Business Rules & Constraints
- **Chỉ dành cho Quản trị viên:** Được bảo vệ bởi guard quyền `admin`, nằm trọn trong `AdminLayout`.
- **Tối ưu Bundle (Code-splitting):** Màn hình báo cáo và thư viện `recharts` được lazy-load riêng biệt thông qua dynamic import trong `routes.ts`, không làm tăng kích thước tải trang của khách hàng.
- **Chiến lược Caching:** Dữ liệu báo cáo có `staleTime: 60_000` (1 phút) nhằm giảm tải cho server đối với các truy vấn tổng hợp phức tạp.
