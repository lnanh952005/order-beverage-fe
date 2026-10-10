# Cart Feature Context

## 1. Scope & Responsibility
- Quản lý giỏ hàng: Hiển thị danh sách món, số lượng, size, topping kèm theo (`CartPage`).
- Thao tác giỏ hàng: Thêm món (`useAddToCart`), cập nhật số lượng (`useUpdateCartItem`), xóa món (`useRemoveCartItem`), làm trống giỏ hàng.
- Huy hiệu giỏ hàng (`CartBadge` trên Header): Hiển thị tổng số lượng món đang có.

## 2. API Endpoints (api-spec.md §3)
- `GET /cart` — Lấy chi tiết giỏ hàng hiện tại của khách hàng.
- `POST /cart/items` — Thêm sản phẩm cùng size và danh sách option vào giỏ.
- `PUT /cart/items/:id` — Cập nhật số lượng của dòng sản phẩm trong giỏ.
- `DELETE /cart/items/:id` — Xóa một dòng món khỏi giỏ hàng.
- `DELETE /cart` — Làm trống toàn bộ giỏ hàng.

## 3. Business Rules & Constraints
- **Server State:** Giỏ hàng là trạng thái lưu trên server (1 khách hàng = 1 giỏ hàng duy nhất). Không lưu bản sao giỏ hàng vào `localStorage` hay Redux/Zustand.
- **Cache Invalidation / Optimistic:** Các thao tác `POST`/`PUT`/`DELETE` trên giỏ hàng đều trả về toàn bộ `Cart` mới; hook sử dụng `qc.setQueryData(cartKeys.detail(), newCart)` để đồng bộ tức thì.
- **Tính khả dụng:** Nếu dòng giỏ hàng có `isAvailable = false` (sản phẩm hoặc topping đã hết hàng), giỏ hàng hiển thị cảnh báo đỏ và khóa nút bấm chuyển sang thanh toán.
- **Độc lập phụ thuộc:** `cart` không được import từ `catalog` vì DTO của giỏ hàng đã có đầy đủ thông tin tên món, slug, ảnh đại diện, giá.
