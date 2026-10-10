# Orders Feature Context

## 1. Scope & Responsibility
- Quy trình thanh toán: Thu thập hình thức nhận hàng (giao tận nơi / lấy tại quán), địa chỉ nhận, mã voucher, phương thức thanh toán, ghi chú (`CheckoutPage`).
- Lịch sử đơn hàng: Xem danh sách các đơn hàng đã đặt (`OrdersPage`).
- Theo dõi đơn hàng & Timeline: Xem tiến độ chuẩn bị món trong thời gian thực qua cơ chế polling (`OrderDetailPage`).
- Quản trị đơn hàng: Bảng điều phối đơn hàng, cập nhật trạng thái đơn (chờ duyệt -> đang làm -> giao hàng -> hoàn thành), xem chi tiết đơn (`AdminOrdersPage`, `AdminOrderDetailPage`).

## 2. API Endpoints (api-spec.md §7 & §9)
- `POST /orders` — Đặt đơn hàng mới từ giỏ hàng hiện tại.
- `GET /orders` — Lấy danh sách lịch sử đơn hàng của người dùng.
- `GET /orders/:orderCode` — Lấy chi tiết đơn hàng kèm timeline trạng thái (`statusHistory`).
- `POST /orders/:orderCode/cancel` — Khách hàng hủy đơn hàng (kèm lý do).
- `GET /admin/orders` — Quản trị viên lấy danh sách đơn hàng (lọc theo trạng thái, ngày).
- `PATCH /admin/orders/:orderCode/status` — Quản trị viên chuyển trạng thái đơn hàng.

## 3. Business Rules & Constraints
- **Payload Đặt hàng tối giản:** Frontend **chỉ** gửi:
  `{ fulfillmentType, addressId?, voucherCode?, paymentMethod, note? }`.
  Tuyệt đối không gửi giá, số tiền, hoặc danh sách món; server sẽ lấy từ giỏ hàng và tính toán snapshot.
- **Phí vận chuyển:** Tính server-side (15,000 VND cho `delivery`, 0 VND nếu `subtotal >= 150,000 VND`, 0 VND cho `pickup`). Frontend chỉ hiển thị `shippingFee` trả về.
- **Quy tắc Hủy đơn:** Khách hàng chỉ được hủy khi trạng thái là `pending` hoặc `confirmed`. Một khi đơn đã chuyển sang `preparing` (đang pha chế), chỉ Admin mới có quyền can thiệp hủy đơn.
- **Theo dõi qua Polling:** Trang `OrderDetailPage` poll `GET /orders/:orderCode` mỗi 10 giây; ngừng polling khi đơn đạt trạng thái cuối cùng (`completed` hoặc `cancelled`).
- **Mã đơn hàng:** Luôn sử dụng chuỗi `orderCode` trong URL và hiển thị trên giao diện, không để lộ ID số nội bộ.
