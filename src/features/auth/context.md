# Auth Feature Context

## 1. Scope & Responsibility
- Quản lý xác thực người dùng: Đăng nhập bằng email/mật khẩu, đăng ký tài khoản khách hàng mới, đăng nhập Google Identity Services (OAuth2).
- Quản lý phiên làm việc: Lưu trữ access token và refresh token trong `localStorage` (`token-storage.ts`), cơ chế single-flight token refresh khi gặp mã lỗi `401 UNAUTHENTICATED`.
- Cung cấp `AuthProvider` và hook `useAuth()` cho toàn bộ ứng dụng để truy xuất thông tin phiên, cờ phân quyền (`isAdmin`, `isStaff`).
- Cung cấp Route Guards: `<RequireAuth>` (bảo vệ trang yêu cầu đăng nhập) và `<RequireRole>` (bảo vệ trang theo vai trò kèm màn hình 403 Forbidden).
- Quản lý người dùng cho quản trị viên (`AdminUsersPage`): Tìm kiếm, lọc theo vai trò và trạng thái, phân trang, khóa / mở khóa tài khoản, phân quyền vai trò.

## 2. API Endpoints (api-spec.md §4 & §12)
- `POST /auth/register` — Đăng ký tài khoản khách hàng mới.
- `POST /auth/login` — Đăng nhập bằng email và mật khẩu.
- `POST /auth/google` — Đăng nhập / đăng ký tự động bằng Google ID token (credential).
- `POST /auth/refresh` — Làm mới access token bằng refresh token.
- `POST /auth/logout` — Đăng xuất, hủy refresh token.
- `GET /auth/me` — Lấy thông tin người dùng hiện tại và quyền hạn.
- `DELETE /auth/identities/google` — Hủy liên kết Google khi tài khoản có mật khẩu.
- `GET /admin/users` — Quản trị viên xem danh sách người dùng kèm phân trang.
- `PATCH /admin/users/:id/status` — Khóa / kích hoạt tài khoản người dùng.
- `PATCH /admin/users/:id/role` — Cập nhật vai trò người dùng (customer, staff, admin).
- `GET /admin/roles` — Quản trị viên lấy danh mục vai trò hệ thống.

## 3. Business Rules & Constraints
- **Token Storage:** Cả access token và refresh token được lưu trữ an toàn trong `localStorage` qua module `token-storage.ts`.
- **Google OAuth:** Chỉ gửi `credential` (JWT id_token từ Google) về `POST /auth/google`, tuyệt đối không decode hoặc tự quyết định xác thực ở phía frontend.
- **Tài khoản Google (`hasPassword = false`):** Ẩn form đổi mật khẩu; nếu đăng nhập mật khẩu thì hiển thị hướng dẫn tiếp tục bằng Google (`USE_GOOGLE_SIGN_IN`).
- **Phân quyền (RBAC):** `admin` có toàn quyền truy cập các trang khách hàng và trang quản trị; `staff` truy cập các trang khách hàng và trang vận hành đơn hàng; `customer` chỉ truy cập các trang khách hàng.
