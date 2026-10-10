# Catalog Feature Context

## 1. Scope & Responsibility
- Duyệt thực đơn: Phân loại theo danh mục, tìm kiếm, lọc sản phẩm (`MenuPage`, `HomePage`).
- Chi tiết & Tùy biến món: Chọn size (S/M/L), chọn nhóm tùy chọn topping (ít đường, ít đá, trân châu...) với ràng buộc số lượng (`ProductDetailPage`).
- Quản trị danh mục & sản phẩm: Admin quản lý danh mục (`AdminCategoriesPage`), sản phẩm (`AdminProductsPage`), và nhóm tùy chọn (`AdminOptionGroupsPage`).

## 2. API Endpoints (api-spec.md §2 & §11)
- `GET /categories` — Lấy danh mục đang hoạt động (công khai).
- `GET /products` — Lấy danh sách sản phẩm theo danh mục, tìm kiếm, phân trang.
- `GET /products/:slug` — Lấy chi tiết sản phẩm kèm danh sách sizes và optionGroups.
- `GET /admin/products`, `POST /admin/products`, `PUT /admin/products/:id`, `PATCH /admin/products/:id/status` — Quản trị sản phẩm.
- `GET /admin/categories`, `POST /admin/categories`, `PUT /admin/categories/:id` — Quản trị danh mục.
- `GET /admin/option-groups`, `POST /admin/option-groups`, `PUT /admin/option-groups/:id` — Quản trị nhóm tùy chọn.

## 3. Business Rules & Constraints
- **Tính toán giá:** Backend là nguồn chân lý duy nhất về giá. Phép tính duy nhất ở client là `calcPricePreview(basePrice, selectedSize, selectedOptions)` trên trang chi tiết nhằm hiển thị ước tính trực quan cho người dùng.
- **Tùy biến món (Option Groups):** Nhóm `single` hiển thị radio input; nhóm `multiple` hiển thị checkbox kèm kiểm tra số lượng tối đa `maxSelect` và bắt buộc `minSelect`.
- **Hết hàng (`isAvailable = false`):** Vẫn hiển thị trên menu nhưng gắn nhãn "Hết hàng" và vô hiệu hóa nút thêm vào giỏ.
- **Định danh trong URL:** Dùng `slug` cho danh mục và sản phẩm trên URL thân thiện, không để lộ ID số.
