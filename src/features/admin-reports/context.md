# Admin Reports Feature Context

## 1. Scope & Responsibility
- Báo cáo thống kê: Hiển thị các chỉ số kinh doanh quan trọng như tổng doanh thu, số lượng đơn thành công, tỷ lệ hủy, giá trị đơn trung bình (`AdminReportsPage`).
- Món bán chạy: Bảng xếp hạng các món đồ uống có doanh thu và số lượng tiêu thụ cao nhất.
- Bộ lọc thời gian: Lọc số liệu theo khoảng ngày (hôm nay, 7 ngày qua, 30 ngày qua, tùy chọn).

## 2. API Endpoints (api-spec.md §12)
- `GET /admin/reports/sales` — Lấy tổng hợp doanh thu và số lượng đơn hàng theo khoảng thời gian.
- `GET /admin/reports/top-products` — Lấy danh sách sản phẩm bán chạy nhất kèm số lượng và doanh thu.

## 3. Business Rules & Constraints
- **Chỉ dành cho Quản trị viên:** Được bảo vệ bởi guard quyền `admin`, nằm trọn trong `AdminLayout`.
- **Tối ưu Bundle (Code-splitting):** Màn hình báo cáo và mọi thư viện vẽ biểu đồ nặng (nếu sử dụng) được lazy-load riêng biệt, tuyệt đối không lọt vào bundle tải ban đầu của khách hàng.
- **Chiến lược Caching:** Dữ liệu báo cáo có `staleTime: 60_000` (1 phút) nhằm giảm tải cho server đối với các truy vấn tổng hợp phức tạp.
