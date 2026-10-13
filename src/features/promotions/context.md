# Promotions Feature Context & Specification

Summary documentation covering the architecture, workflows, file structure, UI components, and API integration for the **Promotions** feature (`fe/src/features/promotions/`).

---

## 1. Scope & Responsibility

- **Voucher Validation (Customer Checkout)**:
  - Provides the API service and mutation hook (`useValidateVoucher` / `promotionsService.validateVoucher`) allowing customers to preview discount calculations (`VoucherValidateResult`) on the checkout view (`CheckoutVoucherSection`).
  - Displays instant visual feedback (discount amount, updated final total, or error reasons such as expired, not started, or minimum subtotal not met).

- **Voucher Management (Admin Dashboard)**:
  - Provides a comprehensive management view (`AdminVouchersPage` at `/admin/vouchers`), including:
    - **KPI Summary Cards (`VoucherMetricsCards`)**: Key metrics at a glance (Total Vouchers, Active, Paused / Expired, Total Redemptions).
    - **Search & Filter Toolbar (`VoucherSearchBar`)**: 300ms debounced search by code or description, segmented status filter (*All*, *Active*, *Paused*), and a reset button.
    - **Voucher Data Table**: Displays code (with 1-click clipboard copy), discount rules, minimum order requirement, dynamic status badge (`VoucherStatusBadge`), usage progress bar (`VoucherUsageProgress`), date validity window, and inline status toggle switch.
    - **Create & Edit Dialog (`VoucherFormModal`)**: Validated form (React Hook Form + Zod) supporting percentage discounts (with optional maximum cap) and fixed amount discounts, datetime inputs, and quota limits.
    - **Detail Modal (`VoucherDetailModal`)**: Quick inspection view showing all voucher terms and redemption progress.
    - **Quick Status Toggle (`useToggleVoucherStatus`)**: Instant activation/deactivation switch with cache invalidation and Sonner toast feedback.

---

## 2. API Endpoints (`docs/api-spec.md` §8)

- `POST /vouchers/validate` — Customer endpoint to check validity and preview discount calculations for an order subtotal.
- `GET /admin/vouchers` — Admin endpoint to fetch paginated vouchers with keyword search (`q`) and active status filtering (`isActive`).
- `GET /admin/vouchers/:id` — Admin endpoint to fetch single voucher details.
- `POST /admin/vouchers` — Admin endpoint to create a new promotional voucher.
- `PATCH /admin/vouchers/:id` — Admin endpoint to update voucher properties or toggle active status (`usedCount` and `id` are immutable).

---

## 3. Business Rules & Constraints

- **Client-Side Preview Only**:
  - `POST /vouchers/validate` is strictly a non-mutating preview. The actual voucher consumption and final order discount are locked in the backend database transaction during order creation (`POST /orders`).
- **No Hard Deletes**:
  - Vouchers are never deleted because historical orders reference them via `orders.voucher_id`. Inactive campaigns are paused by setting `isActive: false` (displayed as "Tạm dừng" in the UI).
- **Discount Types & Caps**:
  - `percent`: Percentage discount (1% - 100%) with an optional `maxDiscount` monetary ceiling.
  - `fixed`: Fixed monetary amount deducted from the subtotal.
  - Subtotal qualification requires `subtotal >= minOrderValue`.
- **Date Window Validation**:
  - Effective window requires `endsAt > startsAt`. Vouchers with `startsAt` in the future are badged as "Sắp diễn ra"; expired vouchers are badged as "Hết hạn".

---

## 4. Directory Structure

```
fe/src/features/promotions/
├── components/
│   ├── VoucherDetailModal.tsx     # Inspection modal with 1-click code copying
│   ├── VoucherFormModal.tsx       # Create & edit modal (React Hook Form + Zod)
│   ├── VoucherMetricsCards.tsx    # 4 KPI overview cards for admin
│   ├── VoucherSearchBar.tsx       # Debounced search & segmented status filter
│   ├── VoucherStatusBadge.tsx     # Dynamic badge based on active state, dates & quotas
│   └── VoucherUsageProgress.tsx   # Progress meter with color-coded warning thresholds
├── hooks/
│   ├── useAdminVouchers.ts        # TanStack Query hooks for list and single voucher
│   └── useVoucherMutations.ts     # Create, update, toggle status, and preview validate
├── pages/
│   └── admin/
│       └── AdminVouchersPage.tsx  # Full admin management page
├── schemas/
│   └── promotions.schemas.ts      # Zod validation schema and form types
├── services/
│   ├── promotions.keys.ts         # Query key factory
│   └── promotions.service.ts      # HTTP API calls via shared httpClient
├── types/
│   └── promotions.types.ts        # TypeScript DTOs and query types
├── __tests__/
│   ├── promotions.components.test.tsx
│   ├── promotions.hooks.test.tsx
│   ├── promotions.schemas.test.ts
│   └── promotions.service.test.ts
├── context.md                     # Feature architectural context (this document)
└── index.ts                       # Public API barrel export
```
