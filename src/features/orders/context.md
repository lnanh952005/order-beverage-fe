# Orders Feature Context

Feature quản lý toàn bộ chu trình đặt hàng, thanh toán, theo dõi tiến độ đơn hàng và điều phối đơn hàng phía Admin trong ứng dụng Beverage Ordering Website (`fe/src/features/orders`).

---

## 1. Phạm vi & Trách nhiệm (Scope & Responsibility)

Module `orders` phục vụ 2 luồng đối tượng chính:

### 1.1. Khách hàng (Customer Experience)
- **Quy trình Thanh toán (`/checkout` - [CheckoutPage](file:///d:/WorkSpace/videcode/order-beverage/fe/src/features/orders/pages/CheckoutPage.tsx)):**
  - Đặt hàng từ giỏ hàng hiện tại (server-side snapshot).
  - Chọn hình thức nhận hàng: Giao tận nơi (`delivery`) hoặc Lấy tại quán (`pickup`).
  - Lựa chọn địa chỉ giao hàng từ danh bạ đã lưu (tích hợp `useAddresses()` từ `@/features/profile`).
  - Lựa chọn phương thức thanh toán: COD, Thẻ thanh toán (card), Ví điện tử (e-wallet), Chuyển khoản ngân hàng (bank transfer).
  - Áp dụng và xem trước giảm giá từ mã voucher (tích hợp `promotionsService.validateVoucher` từ `@/features/promotions`).
  - Ghi chú đơn hàng cho nhân viên / tài xế.
  - Tự động làm sạch cache giỏ hàng (`cartKeys.all`) khi đặt hàng thành công và điều hướng sang trang theo dõi đơn.
- **Lịch sử đơn hàng (`/orders` - [OrdersPage](file:///d:/WorkSpace/videcode/order-beverage/fe/src/features/orders/pages/OrdersPage.tsx)):**
  - Xem danh sách đơn hàng đã đặt với các tab trạng thái: Tất cả, Chờ duyệt, Đang làm món, Đang giao, Hoàn thành, Đã hủy.
  - Phân trang dữ liệu và hiển thị card tóm tắt [OrderCard](file:///d:/WorkSpace/videcode/order-beverage/fe/src/features/orders/components/OrderCard.tsx).
- **Theo dõi tiến độ đơn hàng (`/orders/:orderCode` - [OrderDetailPage](file:///d:/WorkSpace/videcode/order-beverage/fe/src/features/orders/pages/OrderDetailPage.tsx)):**
  - Hiển thị tiến trình trực quan dạng stepper [OrderTimeline](file:///d:/WorkSpace/videcode/order-beverage/fe/src/features/orders/components/OrderTimeline.tsx) với mốc thời gian và ghi chú trạng thái thực tế.
  - Cơ chế **tự động Polling mỗi 10 giây** khi đơn ở trạng thái đang xử lý (`pending`, `confirmed`, `preparing`, `ready`, `delivering`), tự động dừng khi kết thúc (`completed`, `cancelled`).
  - Chi tiết danh sách món đã đặt: Tên món, size, các options tùy biến, đơn giá, số lượng, thành tiền.
  - Thông tin người nhận, địa chỉ giao hàng và hạch toán chi tiết.
  - **Nút hủy đơn hàng:** Cho phép khách hàng hủy đơn kèm lý do khi đơn ở trạng thái `pending` hoặc `confirmed`. Khóa/ẩn nút khi đơn đã chuyển sang pha chế (`preparing` trở đi).

### 1.2. Quản trị & Nhân viên (Staff / Admin Board)
- **Bảng điều phối đơn hàng (`/admin/orders` - [AdminOrdersPage](file:///d:/WorkSpace/videcode/order-beverage/fe/src/features/orders/pages/admin/AdminOrdersPage.tsx)):**
  - Tự động **Polling mỗi 15 giây** để cập nhật danh sách đơn mới.
  - Thanh công cụ lọc: Lọc trạng thái, lọc hình thức giao nhận, tìm kiếm theo mã đơn / số điện thoại khách hàng.
  - Bảng dữ liệu chi tiết kèm cụm nút thao tác nhanh [AdminOrderStatusActions](file:///d:/WorkSpace/videcode/order-beverage/fe/src/features/orders/components/AdminOrderStatusActions.tsx) để chuyển trạng thái theo đúng state machine.
- **Chi tiết & Thao tác quản trị (`/admin/orders/:orderCode` - [AdminOrderDetailPage](file:///d:/WorkSpace/videcode/order-beverage/fe/src/features/orders/pages/admin/AdminOrderDetailPage.tsx)):**
  - Quản trị toàn diện đơn hàng, hạch toán và thông tin khách hàng.
  - Nút chuyển trạng thái tiếp theo hợp lệ hoặc nút hủy đơn kèm lý do.
  - Bảng nhật ký kiểm toán trạng thái (`statusHistory` audit trail) ghi nhận thời gian, người thao tác và lý do.

---

## 2. API Endpoints & Contract (`docs/api-spec.md` §9)

| Phương thức | Endpoint | Vai trò | Mô tả |
|---|---|---|---|
| `POST` | `/orders` | Auth | Đặt đơn hàng mới từ giỏ hàng hiện tại của caller |
| `GET` | `/orders` | Auth | Lấy danh sách lịch sử đơn hàng của caller (hỗ trợ `status`, `page`, `limit`) |
| `GET` | `/orders/:orderCode` | Auth | Lấy chi tiết đơn hàng (khách chỉ xem đơn của mình, staff/admin xem mọi đơn) |
| `POST` | `/orders/:orderCode/cancel` | Auth | Khách hàng hủy đơn (chỉ cho phép khi `pending` hoặc `confirmed`) |
| `GET` | `/admin/orders` | Staff / Admin | Lấy danh sách đơn hàng cho admin board (hỗ trợ lọc đa chiều) |
| `PATCH` | `/admin/orders/:orderCode/status` | Staff / Admin | Cập nhật trạng thái đơn hàng theo state machine |

---

## 3. Kiến trúc State Management (Zustand & TanStack Query)

> [!IMPORTANT]
> **Không sử dụng React `useContext`:** Toàn bộ client state được quản lý thông qua **Zustand store** và server state được quản lý bởi **TanStack Query**.

- **Zustand Store (`stores/checkout.store.ts`):**
  - Quản lý bản nháp thanh toán của người dùng: `fulfillmentType`, `addressId`, `paymentMethod`, `voucherCode`, `note`.
  - Giữ trạng thái form bền bỉ khi chuyển qua lại giữa các tab hoặc màn hình phụ, tự động reset qua `resetDraft()` sau khi đặt hàng thành công.
- **TanStack Query Cache (`services/orders.keys.ts` & `hooks/`):**
  - Quản lý dữ liệu máy chủ và đồng bộ cache:
    - `ordersKeys.list(filters)`
    - `ordersKeys.detail(orderCode)`
    - `ordersKeys.adminList(filters)`
  - **Polling:**
    - `useOrder(orderCode)`: `refetchInterval` tự động kích hoạt mỗi **10 giây** khi trạng thái đơn là `pending | confirmed | preparing | ready | delivering`, và trả về `false` khi đơn đạt trạng thái cuối (`completed | cancelled`).
    - `useAdminOrders(filters)`: `refetchInterval` duy trì **15 giây** để bảng điều phối luôn cập nhật tức thì.

---

## 4. Các quy tắc nghiệp vụ quan trọng (Business Rules)

1. **Server là Single Source of Truth:**
   - Frontend không tự tính toán tổng tiền có thẩm quyền. Khi checkout, client chỉ gửi payload tối giản:
     ```json
     {
       "fulfillmentType": "delivery",
       "addressId": 5,
       "voucherCode": "WELCOME10",
       "paymentMethod": "cod",
       "note": "Giao giờ hành chính"
     }
     ```
2. **Quy tắc Phí vận chuyển (Shipping Fee):**
   - Tính toán server-side: 15,000 VND cho `delivery`; 0 VND nếu `subtotal >= 150,000 VND`; 0 VND cho `pickup`.
   - UI có thanh tiến trình gợi ý khách hàng mua thêm để được miễn phí giao hàng khi tạm tính chưa đạt 150,000 VND.
3. **Quy tắc Hủy đơn (Cancellation Window):**
   - Khách hàng chỉ có quyền hủy đơn khi trạng thái là `pending` hoặc `confirmed`. Khi đã chuyển sang `preparing` (đang pha chế) hoặc `ready`, nút hủy đơn bị ẩn đối với khách hàng; chỉ Admin/Staff mới có quyền can thiệp hủy đơn.
4. **Định danh trong URL & Giao diện:**
   - Sử dụng định danh thân thiện `orderCode` (ví dụ `ORD-20261013-0001`), không để lộ ID số nội bộ.
5. **Bảo vệ Route (Guards):**
   - Các route khách hàng (`/checkout`, `/orders`, `/orders/:orderCode`) được bảo vệ bởi guard `RequireAuth`.
   - Các route admin (`/admin/orders`, `/admin/orders/:orderCode`) được bảo vệ bởi `<RequireRole role={['staff', 'admin']}>` và render bên trong `AdminLayout`.

---

## 5. Cấu trúc thư mục Module (`fe/src/features/orders/`)

```
fe/src/features/orders/
├─ components/
│  ├─ OrderStatusBadge.tsx         # Badge trạng thái đơn hàng kèm icon & màu sắc
│  ├─ OrderCard.tsx                # Card tóm tắt đơn cho danh sách lịch sử
│  ├─ OrderTimeline.tsx            # Stepper tiến trình trực quan thời gian thực
│  ├─ CancelOrderDialog.tsx        # Modal xác nhận hủy đơn kèm ô nhập lý do
│  ├─ AdminOrderStatusActions.tsx  # Cụm nút tác vụ chuyển trạng thái theo state machine
│  ├─ CheckoutAddressSection.tsx   # Lựa chọn địa chỉ giao hàng từ profile
│  ├─ CheckoutPaymentSection.tsx   # Lựa chọn phương thức thanh toán
│  ├─ CheckoutVoucherSection.tsx   # Áp dụng và xem trước voucher
│  ├─ CheckoutSummary.tsx          # Bảng tóm tắt món, tiền và nút đặt hàng
│  └─ index.ts
├─ hooks/
│  ├─ useOrders.ts                 # Query danh sách đơn khách hàng
│  ├─ useOrder.ts                  # Query chi tiết đơn + polling 10s
│  ├─ useCheckout.ts               # Mutation đặt hàng + xóa giỏ hàng
│  ├─ useCancelOrder.ts            # Mutation hủy đơn hàng
│  ├─ useAdminOrders.ts            # Query bảng admin + polling 15s
│  ├─ useUpdateOrderStatus.ts      # Mutation admin chuyển trạng thái
│  └─ index.ts
├─ pages/
│  ├─ CheckoutPage.tsx             # Màn hình đặt hàng & thanh toán
│  ├─ OrdersPage.tsx               # Màn hình lịch sử đơn hàng
│  ├─ OrderDetailPage.tsx          # Màn hình chi tiết & theo dõi đơn hàng
│  └─ admin/
│     ├─ AdminOrdersPage.tsx       # Bảng điều phối đơn hàng Admin
│     └─ AdminOrderDetailPage.tsx  # Chi tiết đơn & audit log Admin
├─ services/
│  ├─ orders.keys.ts               # TanStack Query keys factory
│  └─ orders.service.ts            # Axios HTTP service calls
├─ stores/
│  └─ checkout.store.ts            # Zustand store cho draft checkout
├─ schemas/
│  └─ orders.schemas.ts            # Zod validation schemas
├─ types/
│  └─ orders.types.ts              # TypeScript DTOs & Domain interfaces
├─ __tests__/
│  ├─ orders.service.test.ts       # Unit tests cho services & keys
│  ├─ orders.schemas.test.ts       # Unit tests cho validation schemas
│  ├─ orders.components.test.tsx   # Component tests (Badge, Card, Timeline, Dialog)
│  └─ orders.hooks.test.tsx        # Hook tests (polling, checkout, cancel)
├─ routes.ts                       # React Router lazy route definitions
├─ index.ts                        # Module public API exports
└─ context.md                      # Tài liệu ngữ cảnh module (file này)
```

---

## 6. Kết quả Kiểm thử & Đảm bảo Chất lượng (Quality Verification)

- **TypeScript Typecheck:** `tsc -b` qua 100% không có lỗi (`exit code 0`).
- **ESLint:** `eslint .` qua 100% không có lỗi cú pháp hoặc vi phạm ranh giới import.
- **Unit & Integration Tests:** 19/19 test files passed, 137/137 tests passed trong toàn bộ repo frontend (bao gồm 25 tests mới cho module `orders`).
