# Payments Feature Context

## 1. Scope & Responsibility
- **Chọn phương thức thanh toán:** Cung cấp component lựa chọn phương thức (`PaymentMethodSelector` hỗ trợ COD, thẻ ATM/Visa qua VNPay, ví điện tử, chuyển khoản VietQR 24/7) nhúng vào form checkout của `orders`.
- **Tạo URL và chuyển hướng thanh toán:** Component `PayNowButton` và hook `useCreatePaymentUrl` gọi `POST /payments/create-url` để lấy URL cổng VNPay và tự động chuyển hướng khách hàng.
- **Xác thực kết quả thanh toán trên URL trả về:** Component `PaymentReturnBanner` nhận diện các tham số callback (`vnp_ResponseCode`, `vnp_Amount`, `vnp_TransactionNo`) khi VNPay redirect về trang chi tiết đơn hàng `/orders/:orderCode` để hiển thị banner thông báo kết quả tức thì và tự động kích hoạt refetch đơn hàng.
- **Màn hình quản trị thanh toán (Admin Dashboard):** Màn hình `AdminPaymentsPage` tại `/admin/payments` giúp admin và staff theo dõi, tra cứu danh sách giao dịch, lọc theo trạng thái/phương thức/mã đơn hàng, xem chi tiết transaction ID và payload từ cổng thanh toán.
- **Hoàn tiền cho Admin:** Dialog `RefundPaymentDialog` và hook `useRefundPayment` hỗ trợ gửi yêu cầu hoàn tiền qua `POST /admin/payments/:id/refund` trực tiếp từ danh sách thanh toán hoặc từ trang chi tiết đơn hàng admin.

## 2. API Endpoints (api-spec.md §10 & be/src/modules/payments/)
- `POST /payments/create-url` — Tạo URL thanh toán VNPay cho đơn hàng hoặc giao dịch.
- `GET /payments/:id` — Lấy thông tin thanh toán theo ID.
- `GET /payments/order/:orderId` — Lấy danh sách thanh toán theo mã đơn hàng.
- `GET /payments/vnpay-return` — Xác thực chữ ký và thông tin callback từ VNPay.
- `GET /admin/payments` — Lấy danh sách giao dịch thanh toán phân trang và hỗ trợ bộ lọc.
- `GET /admin/payments/:id` — Lấy thông tin chi tiết giao dịch cho admin.
- `POST /admin/payments/:id/refund` — Quản trị viên thực hiện hoàn tiền cho giao dịch.
- `PATCH /admin/payments/:id/status` — Cập nhật thủ công trạng thái thanh toán.

## 3. Business Rules & Constraints
- **Không có Route riêng cho cổng:** Cổng thanh toán sau khi hoàn tất sẽ chuyển hướng người dùng trở lại URL `/orders/:orderCode` (kèm các query params `vnp_*`).
- **Cơ chế ghi nhận kết quả:** Backend nhận webhook IPN từ cổng thanh toán và cập nhật trạng thái đơn hàng. Frontend nhận biết kết quả thanh toán thông qua polling trạng thái của `orders`, không xử lý thanh toán trực tiếp tại client.
- **Bảo mật:** Không bao giờ lưu trữ hoặc xử lý thông tin thẻ/tài khoản ngân hàng của khách hàng trên frontend.
- **Quan hệ Module:** `payments` chỉ phụ thuộc `@/shared/*` và `@/features/auth`. Các module khác (như `orders`) sử dụng `payments` thông qua public API `index.ts`.
