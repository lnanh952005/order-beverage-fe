# Profile Feature Context

## 1. Scope & Responsibility
- Quản lý thông tin cá nhân: Xem/chỉnh sửa họ tên, số điện thoại, đổi mật khẩu (`ProfilePage`).
- Quản lý sổ địa chỉ giao hàng: Thêm, sửa, xóa, thiết lập địa chỉ mặc định (`AddressesPage`).
- Liên kết / Hủy liên kết tài khoản mạng xã hội (Google Identity).

## 2. API Endpoints (api-spec.md §5 & §6)
- `GET /profile` — Lấy thông tin tài khoản đang đăng nhập.
- `PUT /profile` — Cập nhật thông tin cá nhân (họ tên, số điện thoại).
- `PUT /profile/password` — Đổi mật khẩu tài khoản (yêu cầu mật khẩu hiện tại).
- `DELETE /auth/identities/google` — Hủy liên kết tài khoản Google (chỉ khả dụng khi `hasPassword = true`).
- `GET /profile/addresses` — Lấy danh sách địa chỉ nhận hàng của khách.
- `POST /profile/addresses` — Thêm mới địa chỉ nhận hàng.
- `PUT /profile/addresses/:id` — Chỉnh sửa thông tin địa chỉ.
- `DELETE /profile/addresses/:id` — Xóa địa chỉ khỏi danh bạ.
- `PATCH /profile/addresses/:id/default` — Đặt làm địa chỉ nhận hàng mặc định.

## 3. Business Rules & Constraints
- Khách hàng có tối đa 1 địa chỉ mặc định. Khi đặt một địa chỉ làm mặc định, backend sẽ tự động cập nhật các địa chỉ khác thành không mặc định.
- Nút "Hủy liên kết Google" chỉ hiển thị khi tài khoản đã thiết lập mật khẩu (`hasPassword = true`), tránh trường hợp tài khoản bị mất phương thức đăng nhập duy nhất.
