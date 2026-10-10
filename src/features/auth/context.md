# Auth Feature Context

## 1. Scope & Responsibility
- Quản lý xác thực người dùng: Đăng nhập bằng email/mật khẩu, đăng ký tài khoản, đăng nhập Google Identity Services (OAuth2).
- Quản lý phiên làm việc: Lưu trữ access token in-memory, refresh token trong `localStorage`, cơ chế single-flight token refresh khi gặp mã lỗi `401 UNAUTHENTICATED`.
- Quản lý người dùng cho quản trị viên (`AdminUsersPage`).

## 2. API Endpoints (api-spec.md §4 & §12)
- `POST /auth/register` — Đăng ký tài khoản khách hàng mới.
- `POST /auth/login` — Đăng nhập bằng email và mật khẩu.
- `POST /auth/google` — Đăng nhập / đăng ký tự động bằng Google ID token (credential).
- `POST /auth/refresh` — Làm mới access token bằng refresh token.
- `POST /auth/logout` — Đăng xuất, hủy refresh token.
- `GET /auth/me` — Lấy thông tin người dùng hiện tại và quyền hạn.
- `GET /admin/users` — Quản trị viên xem danh sách người dùng.
- `PATCH /admin/users/:id/status` — Khóa / kích hoạt tài khoản người dùng.

## 3. Business Rules & Constraints
- **Token Security:** Không lưu access token vào `localStorage` hay cookie trực tiếp từ client; access token chỉ tồn tại trong bộ nhớ JavaScript (`token-storage.ts`).
- **Google OAuth:** Chỉ gửi `credential` (JWT id_token từ Google) về `POST /auth/google`, tuyệt đối không decode hoặc tự quyết định xác thực ở phía frontend.
- **Tài khoản Google (`hasPassword = false`):** Ẩn form đổi mật khẩu; nếu đăng nhập mật khẩu thì hiển thị hướng dẫn tiếp tục bằng Google (`USE_GOOGLE_SIGN_IN`).
- **Phân quyền (RBAC):** `admin` có toàn quyền truy cập các trang khách hàng và trang quản trị; `customer` chỉ truy cập các trang khách hàng.
