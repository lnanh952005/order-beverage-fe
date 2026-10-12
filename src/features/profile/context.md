# Profile Feature Context & Specification

Summary documentation covering the architecture, workflows, file structure, API contracts, UI components, and state management for the **Profile** feature (`fe/src/features/profile/`).

---

## 1. Overview & Scope

The `profile` feature manages all customer profile viewing and editing operations, delivery address books, and social login identity connections:
- **Thông tin tài khoản (`/profile`)**:
  - Xem thông tin cá nhân: Họ tên, email đăng ký, số điện thoại, ảnh đại diện, vai trò tài khoản.
  - Cập nhật thông tin cá nhân (`PATCH /profile`): Chỉnh sửa họ tên, số điện thoại, URL ảnh đại diện với phản hồi real-time.
  - Quản lý tài khoản Google (`DELETE /auth/identities/google`): Hiển thị trạng thái kết nối Google và cho phép hủy liên kết khi tài khoản đã có mật khẩu đăng nhập (`hasPassword = true`).
- **Sổ địa chỉ giao hàng (`/profile/addresses`)**:
  - Xem danh sách địa chỉ nhận hàng của khách (địa chỉ mặc định luôn được sắp xếp ở đầu danh sách).
  - Thêm mới địa chỉ nhận hàng (`POST /profile/addresses`).
  - Chỉnh sửa thông tin địa chỉ (`PATCH /profile/addresses/:id`).
  - Xóa địa chỉ khỏi danh bạ (`DELETE /profile/addresses/:id`).
  - Thiết lập địa chỉ nhận hàng mặc định (`PATCH /profile/addresses/:id` với `isDefault: true`).
  - Tương tác liên module: Cung cấp types và components (`AddressCard`) cho quy trình Checkout của module `orders`.

---

## 2. Technical Conventions & Constraints

- **Single Source of Truth**: Dữ liệu từ server luôn là nguồn sự thật duy nhất. Tất cả thao tác đọc dùng `useQuery`, thao tác ghi dùng `useMutation` (TanStack Query).
- **Zustand Session Synchronization**: Khi cập nhật thành công thông tin người dùng (`useUpdateProfile`), dữ liệu mới được đồng bộ vào `useAuthStore` để cập nhật lập tức UI Header và các thành phần khác.
- **Form Management & Validation**: Biểu mẫu xây dựng với React Hook Form và Zod resolver (`@hookform/resolvers/zod`).
- **UI & Design Tokens**:
  - Giao diện mobile-first, responsive, sạch sẽ, chuẩn Radix UI primitives kết hợp Tailwind CSS.
  - Trạng thái rõ ràng: Loading (`Skeleton`), Error (`ErrorState` có retry), Empty (`EmptyState` có action), Success.
- **Route Guarding**: Cả 2 tuyến đường `/profile` và `/profile/addresses` được bảo vệ bằng `<RequireAuth>`, tự động chuyển hướng về `/login?redirect=...` nếu chưa đăng nhập.

---

## 3. Folder Anatomy

```
fe/src/features/profile/
├── __tests__/
│   ├── profile.schemas.test.ts # Kiểm thử Zod validation schemas
│   └── profile.service.test.ts # Kiểm thử query keys và service methods
├── components/
│   ├── AddressCard.tsx         # Card hiển thị địa chỉ và nút hành động
│   ├── AddressDialog.tsx       # Modal form thêm / sửa địa chỉ nhận hàng
│   ├── DeleteAddressDialog.tsx # Modal xác nhận xóa địa chỉ
│   ├── GoogleIdentityCard.tsx  # Card trạng thái và hủy liên kết Google
│   ├── ProfileForm.tsx         # Form cập nhật thông tin cá nhân (họ tên, SĐT, avatar)
│   ├── ProfileNavTabs.tsx      # Thanh chuyển hướng tab Profile <-> Sổ địa chỉ
│   └── index.ts                # Re-export các UI components
├── hooks/
│   ├── useAddresses.ts         # Query & mutations cho địa chỉ (list, create, update, delete, setDefault)
│   ├── useProfile.ts           # Query & mutations cho profile (read, update, unlinkGoogle)
│   └── index.ts                # Re-export hooks
├── pages/
│   ├── AddressesPage.tsx       # Màn hình quản lý danh sách địa chỉ
│   └── ProfilePage.tsx         # Màn hình thông tin cá nhân & tài khoản liên kết
├── routes.ts                   # Định nghĩa RouteObject bọc bởi RequireAuth
├── schemas/
│   └── profile.schemas.ts      # Zod validation schemas cho profile & address
├── services/
│   ├── profile.keys.ts         # Query key factory cho TanStack Query
│   └── profile.service.ts      # HTTP calls qua httpClient (Axios)
├── types/
│   └── profile.types.ts        # TypeScript interfaces: Address, DTOs, Inputs
├── context.md                  # Tài liệu ngữ cảnh tính năng (file này)
└── index.ts                    # Public API export của feature profile
```

---

## 4. API Endpoints Specification

Tất cả các yêu cầu đều yêu cầu `Authorization: Bearer <accessToken>`.

| Phương thức | Đường dẫn API | Payload | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/profile` | — | Lấy thông tin tài khoản đang đăng nhập |
| `PATCH` | `/api/v1/profile` | `{ fullName?, phone?, avatarUrl? }` | Cập nhật họ tên, SĐT, ảnh đại diện |
| `GET` | `/api/v1/profile/addresses` | — | Lấy danh sách địa chỉ nhận hàng (mặc định xếp trước) |
| `POST` | `/api/v1/profile/addresses` | `{ recipientName, phone, addressLine, ward?, district?, city, isDefault? }` | Thêm địa chỉ mới |
| `PATCH` | `/api/v1/profile/addresses/:id` | `{ recipientName?, phone?, addressLine?, ward?, district?, city?, isDefault? }` | Cập nhật địa chỉ nhận hàng |
| `DELETE` | `/api/v1/profile/addresses/:id` | — | Xóa địa chỉ nhận hàng |
| `DELETE` | `/api/v1/auth/identities/google` | — | Hủy liên kết tài khoản Google (khi `hasPassword = true`) |

---

## 5. Query Keys & Server State

Tất cả query keys được quản lý tập trung qua `profileKeys`:

```ts
export const profileKeys = {
  all: ['profile'] as const,
  user: () => [...profileKeys.all, 'user'] as const,
  addresses: () => [...profileKeys.all, 'addresses'] as const,
};
```

- `staleTime` cho thông tin user: 5 phút.
- Thao tác mutation trên địa chỉ tự động gọi `invalidateQueries({ queryKey: profileKeys.addresses() })`.
- Thao tác cập nhật profile cập nhật trực tiếp cache `setQueryData` và đồng bộ `useAuthStore`.

---

## 6. Business Rules & Security

1. **Địa chỉ mặc định duy nhất**:
   - Khi tạo hoặc cập nhật địa chỉ với `isDefault: true`, hệ thống backend tự động hủy trạng thái mặc định của các địa chỉ trước đó trong cùng transaction. Frontend làm mới danh sách để đảm bảo hiển thị đồng nhất.
2. **Quyền sở hữu tài nguyên**:
   - Không thể truy cập, sửa hoặc xóa địa chỉ của người dùng khác (backend trả về `403 FORBIDDEN`).
3. **An toàn tài khoản Google**:
   - Nút "Hủy liên kết" chỉ khả dụng khi `hasPassword = true`. Nếu tài khoản chỉ có duy nhất Google làm phương thức đăng nhập (`hasPassword = false`), giao diện hiển thị cảnh báo giải thích rõ ràng và vô hiệu hóa thao tác hủy liên kết.
4. **Bảo toàn đơn hàng trong quá khứ**:
   - Việc sửa hoặc xóa địa chỉ trong sổ địa chỉ không làm ảnh hưởng đến các đơn hàng đã đặt trong quá khứ do hệ thống lưu snapshot văn bản độc lập tại thời điểm checkout.
