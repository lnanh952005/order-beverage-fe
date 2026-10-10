# Payments Feature Context

## 1. Scope & Responsibility
- Chọn phương thức thanh toán: Cung cấp component lựa chọn phương thức (Tiền mặt khi nhận, Ví điện tử MoMo, Cổng VNPay, ZaloPay) nhúng vào form checkout của `orders`.
- Xử lý chuyển hướng cổng thanh toán: Nếu đơn hàng trả về `payment.checkoutUrl`, frontend chuyển hướng khách hàng sang cổng thanh toán ngoài.
- Hoàn tiền cho Admin: Thao tác gửi yêu cầu hoàn tiền cho đơn thanh toán online bị hủy.

## 2. API Endpoints (api-spec.md §10)
- Thông tin thanh toán được đính kèm trong DTO của `POST /orders` và `GET /orders/:orderCode`.
- `POST /admin/payments/:id/refund` — Quản trị viên thực hiện hoàn tiền cho giao dịch.

## 3. Business Rules & Constraints
- **Không có Route riêng:** Cổng thanh toán sau khi hoàn tất sẽ chuyển hướng người dùng trở lại URL `/orders/:orderCode` (hoặc deep link tương ứng).
- **Cơ chế ghi nhận kết quả:** Backend nhận webhook từ cổng thanh toán và cập nhật trạng thái đơn hàng. Frontend nhận biết kết quả thanh toán thông qua polling trạng thái của `orders`, không xử lý thanh toán trực tiếp tại client.
- **Bảo mật:** Không bao giờ lưu trữ hoặc xử lý thông tin thẻ/tài khoản ngân hàng của khách hàng trên frontend.
