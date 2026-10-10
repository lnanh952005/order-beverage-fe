# Promotions Feature Context

## 1. Scope & Responsibility
- Nhập & Áp dụng mã giảm giá: Cho phép người dùng nhập mã voucher tại trang thanh toán và kiểm tra tính hợp lệ (`VoucherInput` / xem trước mức giảm).
- Quản trị khuyến mãi: Quản trị viên xem danh sách, tạo mới, chỉnh sửa, khóa/mở voucher (`AdminVouchersPage`).

## 2. API Endpoints (api-spec.md §8)
- `POST /vouchers/validate` — Kiểm tra mã giảm giá với giá trị đơn hàng hiện tại.
- `GET /admin/vouchers` — Quản trị viên lấy danh sách toàn bộ voucher.
- `POST /admin/vouchers` — Tạo voucher mới (mã, loại giảm giá, ngày hết hạn, giới hạn số lượt).
- `PUT /admin/vouchers/:id` — Chỉnh sửa voucher.
- `PATCH /admin/vouchers/:id/status` — Bật / tắt trạng thái hoạt động của voucher.

## 3. Business Rules & Constraints
- **Chỉ là Preview:** Gọi `POST /vouchers/validate` chỉ để hiển thị xem trước mức giảm giá và thông báo lỗi nếu chưa đủ điều kiện. Số tiền giảm giá chính thức sẽ do `POST /orders` tại backend quyết định khi tạo đơn.
- **Ràng buộc điều kiện:** Hỗ trợ giảm giá theo số tiền cố định (`fixed`) hoặc tỷ lệ phần trăm (`percentage` kèm `maxDiscountAmount`). Đơn hàng phải có `subtotal >= minOrderValue` mới được tính hợp lệ.
