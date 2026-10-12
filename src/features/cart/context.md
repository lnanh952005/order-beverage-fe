# Cart Feature Context & Specification

Summary documentation covering the architecture, workflows, file structure, state management, and API specifications for the **Cart** feature (`fe/src/features/cart/`).

---

## 1. Scope & Responsibility

- **Customer Cart Screen (`CartPage`)**: Displays the customer's active items, sizes, options, custom notes, unit prices, line totals, and subtotal.
- **Cart Operations**:
  - Add to cart (`useAddToCart`): Called from product detail customization. Redirects to `/login?redirect=/menu/:slug` if unauthenticated.
  - Quantity & custom updates (`useUpdateCartItem`): Supports incrementing/decrementing (bounds 1–99) and merging lines.
  - Item removal (`useRemoveCartItem`): Removes individual line items.
  - Clear cart (`useClearCart`): Empties the entire cart with confirmation.
- **Navigation Cart Badge (`CartBadge`)**: Renders on the application Header, displaying real-time item count badge.
- **Availability Enforcement**: Highlights any unavailable line items (`isAvailable = false`) with an alert badge and blocks the checkout CTA until removed or adjusted.

---

## 2. API Endpoints (`docs/api-spec.md` §7)

All endpoints require authentication (`Bearer <accessToken>`):
- `GET /cart` — Retrieve the current customer's cart with computed catalog prices.
- `POST /cart/items` — Add a product, size, options, quantity, and note to cart (returns `201` + full `Cart`).
- `PATCH /cart/items/:id` — Update quantity or customization for a line item (returns `200` + full `Cart`).
- `DELETE /cart/items/:id` — Delete a line item (returns `200` + full `Cart`).
- `DELETE /cart` — Clear all items (returns `204 No Content`).

---

## 3. Business Rules & Architecture Constraints

- **Server State (TanStack Query)**: The cart is authoritative server state. No copy is persisted to `localStorage` or client stores.
- **Direct Cache Sync**: Because backend mutations return the entire updated `Cart` object, mutation hooks update the TanStack Query cache directly with `qc.setQueryData(cartKeys.detail(), newCart)`.
- **Zero Stale Time**: `staleTime: 0` ensures cart is refreshed upon page mount and focus.
- **Route Guard**: The `/cart` route is protected by `<RequireAuth>`, redirecting unauthenticated users to `/login?redirect=/cart`.
- **Dependency Isolation**: `cart` does not import `catalog` because the cart DTO already encapsulates complete product info (`product.id`, `product.name`, `product.slug`, `product.imageUrl`).

---

## 4. File Structure

```
fe/src/features/cart/
├── components/
│   ├── CartBadge.tsx         # Header cart badge with count
│   ├── CartItemCard.tsx      # Individual line item card with controls
│   ├── CartSummary.tsx       # Subtotal summary, policy hints, and checkout CTA
│   └── index.ts              # Component exports
├── hooks/
│   ├── useCart.ts            # Query hook with itemCount and availability helpers
│   ├── useAddToCart.ts       # Mutation hook for adding items
│   ├── useUpdateCartItem.ts  # Mutation hook for adjusting quantity
│   ├── useRemoveCartItem.ts  # Mutation hook for deleting items
│   ├── useClearCart.ts       # Mutation hook for clearing cart
│   └── index.ts              # Hook exports
├── pages/
│   └── CartPage.tsx          # Cart page with loading, empty, error, success states
├── services/
│   ├── cart.keys.ts          # TanStack Query key factory
│   └── cart.service.ts       # Axios HTTP client calls
├── types/
│   └── cart.types.ts         # TypeScript DTOs and input types
├── routes.ts                 # Feature route guarded by RequireAuth
├── context.md                # This specification document
├── __tests__/                # Unit & component integration tests
└── index.ts                  # Public feature boundary
```
