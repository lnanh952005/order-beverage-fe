# The Beverage — Quy chuẩn Nhận diện Thương hiệu (Brand Guidelines)

Tài liệu hướng dẫn quy chuẩn ứng dụng logo và bộ nhận diện thương hiệu cho nền tảng đặt đồ uống **The Beverage**.

---

## 1. Giới thiệu & Triết lý Thương hiệu

- **Tên thương hiệu**: **The Beverage**
- **Định vị & Phong cách**: **Thủ công & Ấm cúng (Artisanal)** — Kết hợp giữa văn hóa thưởng thức cà phê đặc sản và nghệ thuật trà organic thuần khiết.
- **Khẩu hiệu (Tagline)**: *Handcrafted Taste & Purity* (Hương vị thủ công & Tinh túy tự nhiên).
- **Ý nghĩa biểu trưng (Concept B: The Artisan Woodblock Seal)**:
  - Lấy cảm hứng từ dấu triện mộc và con dấu khắc gốm truyền thống của các xưởng rang xay và tiệm trà thủ công.
  - Hình tượng **tách gốm thử nếm (cupping cup)** và **giọt tinh chất chiết xuất** được khắc chìm trong không gian âm (negative space), biểu trưng cho sự hòa quyện, chuẩn xác và tinh tế trong từng giọt đồ uống.

---

## 2. Bảng Màu Thương hiệu (Color Palette)

| Tên màu | HEX | HSL | RGB | Vai trò ứng dụng |
|---|---|---|---|---|
| **Terracotta Roast** (Màu nhận diện chính) | `#C25E2E` | `hsl(19, 62%, 47%)` | `rgb(194, 94, 46)` | Biểu tượng Master Logo, điểm nhấn thương hiệu chính, bao bì, nút CTA nổi bật |
| **Deep Espresso Umber** (Màu tối thứ cấp) | `#2B1B14` | `hsl(18, 36%, 12%)` | `rgb(43, 27, 20)` | Chữ thương hiệu (Wordmark), nền tối cao cấp, tiêu đề chính |
| **Honey Amber** (Màu hổ phách mật ong) | `#D97706` | `hsl(32, 95%, 44%)` | `rgb(217, 119, 6)` | Điểm nhấn hương vị, badge khuyến mãi, hiệu ứng hover |
| **Warm Oat Cream** (Nền kem yến mạch) | `#FAF7F2` | `hsl(40, 43%, 96%)` | `rgb(250, 247, 242)` | Nền sáng organic, thẻ sản phẩm, giấy kraft sáng |
| **Pure White** (Màu tương phản) | `#FFFFFF` | `hsl(0, 0%, 100%)` | `rgb(255, 255, 255)` | Logo đảo ngược trên nền tối, tương phản cao |

---

## 3. Hệ Thống Typography

1. **Display Serif (Chữ nhận diện chính)**:
   - Font gợi ý: **Playfair Display**, **Cinzel**, **Baskerville**
   - Áp dụng: Tiêu đề `THE BEVERAGE`, bảng hiệu, banner truyền thông.
   - Đặc tính: Chữ in hoa (uppercase), `letter-spacing: 0.08em - 0.12em`, `font-weight: 700`.
2. **Body / Interface Sans (Chữ phụ trợ & Giao diện)**:
   - Font: **Inter**, **system-ui**
   - Áp dụng: Tagline *HANDCRAFTED TASTE & PURITY*, menu, nhãn giá, nội dung web.
   - Đặc tính: Ký tự thoáng, `letter-spacing: 0.15em - 0.25em` cho tagline.

---

## 4. Quy chuẩn Kích thước & Khoảng cách an toàn

- **Khoảng cách an toàn (Clear space)**:
  - Bằng tối thiểu **1/4 chiều cao của biểu tượng** xung quanh toàn bộ 4 cạnh của logo.
  - Tuyệt đối không để chữ, hình ảnh hoặc viền lấn vào vùng an toàn này.
- **Kích thước tối thiểu**:
  - Dạng biểu trưng (Symbol): Tối thiểu **16px × 16px** (hiển thị sắc nét trên favicon và status bar).
  - Dạng khóa ngang (Horizontal Lockup): Chiều cao tối thiểu **28px** trên màn hình số, **12mm** trong in ấn.
  - Dạng khóa dọc (Stacked Lockup): Chiều cao tối thiểu **48px** trên màn hình số, **20mm** trong in ấn.

---

## 5. Danh mục Tài nguyên (Asset Manifest)

Tất cả tài nguyên logo đã được kết xuất sẵn trong thư mục `fe/public/brand/` và `fe/public/`:

```
fe/public/
├─ favicon.ico                          # Favicon đa kích thước (16/32/48px)
├─ favicon.svg                          # Vector Favicon hiện đại cho trình duyệt
├─ apple-touch-icon.png                 # Icon iOS Home Screen (180x180)
├─ icon-192.png                         # PWA Icon (192x192)
├─ icon-512.png                         # PWA Splash Icon (512x512)
├─ site.webmanifest                     # Cấu hình PWA & theme-color
└─ brand/
   ├─ the-beverage-symbol.svg           # Master Symbol (Màu Terracotta)
   ├─ the-beverage-symbol-black.svg     # Symbol 1 màu Đen
   ├─ the-beverage-symbol-white.svg     # Symbol 1 màu Trắng (Reversed cho nền tối)
   ├─ the-beverage-symbol-mono-2b1b14.svg # Symbol Espresso Umber
   ├─ the-beverage-symbol-mono-d97706.svg # Symbol Honey Amber
   ├─ the-beverage-symbol-square.svg    # Symbol căn giữa canvas vuông (Avatar/Social)
   ├─ the-beverage-symbol-app-icon.svg  # App icon bo góc hoàn chỉnh
   ├─ the-beverage-horizontal.svg       # Master Horizontal Lockup
   ├─ the-beverage-horizontal-black.svg # Khóa ngang 1 màu Đen
   ├─ the-beverage-horizontal-white.svg # Khóa ngang 1 màu Trắng
   ├─ the-beverage-vertical.svg         # Stacked Lockup (Dùng cho bao bì, poster)
   └─ presentation/
      ├─ presentation.html              # Bảng trình diễn mockup khách hàng
      └─ slides/                        # Bộ ảnh slide mockup thực tế (cup, bag, signage, ...)
```

---

## 6. Thành phần Code Tích hợp (React Component)

Đã tích hợp component tái sử dụng tại `fe/src/shared/components/brand/BrandLogo.tsx`:

```tsx
import { BrandLogo } from '@/shared/components/brand';

// Hiển thị logo đầy đủ (mặc định)
<BrandLogo className="h-8 w-auto" />

// Hiển thị chỉ biểu tượng dấu triện
<BrandLogo variant="symbol" className="h-9 w-9" symbolColor="#C25E2E" />

// Hiển thị bố cục dọc (cho footer hoặc splash)
<BrandLogo variant="vertical" className="h-32 w-auto" />
```

---

## 7. Các điều cấm kỵ (Don'ts)

1. **Không bóp méo tỉ lệ**: Luôn giữ nguyên tỉ lệ aspect ratio khi co giãn logo.
2. **Không đổi màu không gian âm**: Tách gốm và giọt nước bên trong luôn là không gian âm rỗng trong suốt (hiển thị màu nền tự nhiên).
3. **Không xoay nghiêng dấu triện**: Biểu tượng tròn và đường chân đế tách gốm phải luôn nằm ngang thăng bằng.
4. **Không thêm hiệu ứng đổ bóng (drop shadow) phức tạp hay dải màu gradient sặc sỡ**: Giữ nguyên tinh thần phẳng, mộc mạc và sang trọng của dấu mộc thủ công.
