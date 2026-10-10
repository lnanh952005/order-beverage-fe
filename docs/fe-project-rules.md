# Frontend Project Rules — Beverage Ordering Website

> Audience: developers (new members) and AI coding assistants.
> Stack: React 19 · Vite · TypeScript (strict) · **Feature-based structure**.
> Contract: `../../docs/api-spec.md`. Data/business rules: `../../docs/database.md`, `../../be/docs/be-project-rules.md`, `../../be/docs/be-architecture.md`.
> One SPA serves both **customers and admins**; role decides which routes are reachable.

---

## 1. Core Principles

- Organize by **feature**, not by layer. One feature = one folder = one business capability, mirroring the backend features.
- A feature is self-contained: its API calls, hooks, components, pages, schemas, and types live together.
- Features interact **only through each other's `index.ts`** (public API).
- Code reused by 2+ features and free of business logic goes to `shared/`.
- **Server is the source of truth** for prices, totals, availability, and order status. The client displays; it never decides.
- Server state lives in TanStack Query, not in `useState`/global stores.

---

## 2. Tech Stack

| Concern | Choice | Status |
|---|---|---|
| UI | React 19, TypeScript `strict` | Given |
| Build | Vite | Given |
| Routing | React Router 7 (data router, route-level `lazy`) | Assumption |
| Server state | TanStack Query | Assumption |
| Forms + validation | React Hook Form + Zod | Assumption |
| HTTP | Axios instance with interceptors in `shared/api/http-client.ts` | Decided |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI primitives) | Decided |
| Google login | `@react-oauth/google` (Google Identity Services) | Assumption |
| Tests | Vitest + React Testing Library + MSW; Playwright for E2E | Decided |

> Confirm assumptions with the team before the first feature; changing a choice later is a project-wide change.

---

## 3. Folder Structure

```
fe/
├─ public/
└─ src/
   ├─ main.tsx                    # entry: render <App />
   ├─ app/
   │  ├─ App.tsx
   │  ├─ providers.tsx            # QueryClientProvider, AuthProvider, Toaster, ErrorBoundary
   │  ├─ router.tsx               # composes feature route modules
   │  ├─ guards/                  # RequireAuth.tsx, RequireRole.tsx
   │  └─ layouts/                 # CustomerLayout, AdminLayout, AuthLayout
   ├─ features/
   │  ├─ auth/                    # login, register, Google sign-in, session
   │  ├─ profile/                 # profile + addresses
   │  ├─ catalog/                 # menu, product detail, admin product/category/option mgmt
   │  ├─ cart/                    # cart page + cart hooks
   │  ├─ promotions/              # voucher input, admin vouchers
   │  ├─ orders/                  # checkout, my orders, tracking, admin order board
   │  ├─ payments/                # payment method selector component (for checkout), admin refund
   │  └─ admin-reports/           # sales + top-products dashboards
   ├─ shared/
   │  ├─ api/                     # http-client.ts, api-error.ts, token-storage.ts, query-client.ts
   │  ├─ components/
   │  │  ├─ ui/                   # Button, Input, Select, Modal, Badge, Table, Pagination
   │  │  └─ feedback/             # Spinner, Skeleton, ErrorState, EmptyState
   │  ├─ hooks/                   # useDebounce, usePagination, useDocumentTitle
   │  ├─ lib/                     # format-money.ts, format-date.ts, cn.ts, error-messages.ts
   │  ├─ constants/               # roles.ts, order-status.ts, routes.ts
   │  ├─ types/                   # api.types.ts (envelope, pagination), common.types.ts
   │  └─ styles/                  # globals.css, tokens
   ├─ config/
   │  └─ env.ts                   # Zod-validated import.meta.env (single place)
   └─ test/                       # setup.ts, msw handlers, test-utils.tsx
```

### Anatomy of one feature (example: `orders`)

```
features/orders/
├─ orders.api.ts                  # typed HTTP calls only (no React)
├─ orders.keys.ts                 # query key factory
├─ orders.types.ts                # DTOs from api-spec (Order, OrderSummary, OrderStatus)
├─ orders.schemas.ts              # Zod schemas for forms (checkout)
├─ orders.routes.tsx              # route objects with lazy pages (customer + admin)
├─ hooks/
│  ├─ useOrders.ts                # list (query)
│  ├─ useOrder.ts                 # detail + polling (query)
│  ├─ useCheckout.ts              # mutation
│  ├─ useCancelOrder.ts           # mutation
│  └─ useUpdateOrderStatus.ts     # admin mutation
├─ components/
│  ├─ OrderCard.tsx
│  ├─ OrderStatusBadge.tsx
│  ├─ OrderTimeline.tsx           # renders statusHistory
│  └─ CheckoutForm.tsx
├─ pages/
│  ├─ CheckoutPage.tsx
│  ├─ OrdersPage.tsx
│  ├─ OrderDetailPage.tsx
│  └─ admin/
│     ├─ AdminOrdersPage.tsx
│     └─ AdminOrderDetailPage.tsx
├─ __tests__/
└─ index.ts                       # PUBLIC API of the feature
```

- Skip files a small feature does not need (`schemas`, `keys`, admin pages).
- Do **not** create top-level `src/components`, `src/hooks`, `src/pages`, `src/services`, `src/store` folders.
- Admin screens live **inside the feature they manage** (`pages/admin/`), never in a separate `admin/` feature.

---

## 4. Layer Rules (inside a feature)

| Piece | Does | Must NOT |
|---|---|---|
| `*.api.ts` | Call endpoints via `http-client`, return typed DTOs (unwrap `data`) | Import React, touch cache, show toasts |
| `hooks/` | Wrap api calls in `useQuery`/`useMutation`, handle invalidation | Render UI |
| `components/` | Presentational + feature-specific UI, receive data via props/hooks | Call `fetch` directly |
| `pages/` | Compose components, read route params, handle page states | Contain business rules or raw HTTP |
| `*.schemas.ts` | Form validation | Import components |
| `*.types.ts` | Types matching `api-spec.md` | Contain logic |

- Direction: `pages -> components -> hooks -> api`. Never reverse.
- Pages and components never call `*.api.ts` directly; they use hooks.

```ts
// orders.api.ts
export const ordersApi = {
  checkout: (body: CheckoutInput) => http.post<Order>('/orders', body),
  getByCode: (orderCode: string) => http.get<Order>(`/orders/${orderCode}`),
};
```

```ts
// hooks/useCheckout.ts
export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.checkout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      qc.setQueryData(cartKeys.detail(), { items: [], subtotal: 0 }); // server cleared the cart
    },
  });
}
```

---

## 5. Public API & Import Boundaries

- `index.ts` exports only what other features/app need: route modules, hooks, shared-by-feature components, DTO types.
- Never export `*.api.ts`, `*.keys.ts` internals, or pages from `index.ts` (pages are reached through the routes module).
- Path aliases: `@/features/*`, `@/shared/*`, `@/app/*`, `@/config/*`.

```ts
// features/cart/index.ts
export { cartRoutes } from './cart.routes';
export { useCart, useAddToCart } from './hooks';
export { CartBadge } from './components/CartBadge';
export type { Cart, CartItem } from './cart.types';
```

```ts
// GOOD
import { useAddToCart } from '@/features/cart';

// BAD: deep import into another feature
import { cartApi } from '@/features/cart/cart.api';
```

Enforce with ESLint:

```js
'no-restricted-imports': ['error', {
  patterns: [{ group: ['@/features/*/*'], message: 'Import other features only via their index.ts' }],
}]
```

### Feature dependency map (allowed direction, no cycles)

| Feature | May import |
|---|---|
| `auth` | `shared` |
| `profile` | `auth`, `shared` |
| `catalog` | `auth`, `cart`, `shared` |
| `cart` | `auth`, `shared` |
| `promotions` | `shared` |
| `payments` | `shared` |
| `orders` | `auth`, `cart`, `profile`, `promotions`, `payments`, `shared` |
| `admin-reports` | `shared` |

- `auth` is foundational: any feature may use `useAuth()` / `useCurrentUser()`.
- `cart` must not import `catalog`: cart DTOs already contain the product info they need (see `api-spec.md` §3).
- If a cycle appears, move the shared piece to `shared/` or pass data via props from a parent page.

---

## 6. Routing & Guards

- Routes are defined **per feature** in `<feature>.routes.tsx` using route-level `lazy`; `app/router.tsx` only composes them.
- Pages use **named exports**; lazy loading maps them to `Component`.

```tsx
// orders.routes.tsx
export const ordersRoutes: RouteObject[] = [
  { path: 'orders', lazy: async () => ({ Component: (await import('./pages/OrdersPage')).OrdersPage }) },
  { path: 'orders/:orderCode', lazy: async () => ({ Component: (await import('./pages/OrderDetailPage')).OrderDetailPage }) },
];
export const ordersAdminRoutes: RouteObject[] = [
  { path: 'orders', lazy: async () => ({ Component: (await import('./pages/admin/AdminOrdersPage')).AdminOrdersPage }) },
];
```

### Route table

| Path | Access | Feature |
|---|---|---|
| `/` , `/menu`, `/menu/:slug` | Public | `catalog` |
| `/login`, `/register` | Public (redirect if logged in) | `auth` |
| `/cart` | Auth | `cart` |
| `/checkout` | Auth | `orders` |
| `/orders`, `/orders/:orderCode` | Auth | `orders` |
| `/profile`, `/profile/addresses` | Auth | `profile` |
| `/admin/orders`, `/admin/orders/:orderCode` | Admin | `orders` |
| `/admin/products`, `/admin/categories`, `/admin/option-groups` | Admin | `catalog` |
| `/admin/vouchers` | Admin | `promotions` |
| `/admin/users` | Admin | `auth` |
| `/admin/reports` | Admin | `admin-reports` |

- Guards: `<RequireAuth>` redirects to `/login?redirect=<path>`; `<RequireRole role="admin">` shows a 403 page.
- Roles are hierarchical (`admin > customer`): an admin passes every guard and may open customer pages too.
- Path constants live in `shared/constants/routes.ts`; no hardcoded path strings in components.
- Admin routes are a separate lazy chunk under `AdminLayout`; customers never download admin code.
- Payment gateway returns directly to `/orders/:orderCode` (no separate `/payments` route needed).

---

## 7. Server State (TanStack Query)

- **Every** read = `useQuery`, **every** write = `useMutation`. No `useEffect` + `fetch`.
- Query keys come from a per-feature key factory; never inline arrays in components.

```ts
// orders.keys.ts
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  detail: (orderCode: string) => [...orderKeys.all, 'detail', orderCode] as const,
};
```

- Do not copy server data into `useState`/stores. Derive in render.
- Mutations either `invalidateQueries` or `setQueryData` from the response (cart mutations return the full Cart: use `setQueryData`).
- Lists: `placeholderData: keepPreviousData` for smooth pagination; debounce search inputs (300 ms).

| Data | `staleTime` | Notes |
|---|---|---|
| Categories, products | 5 min | Rarely change |
| Product detail | 1 min | Availability can flip |
| Cart | 0 | Always refetch on mount/focus |
| My orders / order detail | 0 | Statuses change |
| Admin lists | 0 | Operational data |
| Reports | 1 min | Heavy queries |

### Order tracking (polling)

- `GET /orders/:orderCode` powers tracking (`statusHistory` -> `OrderTimeline`).
- Poll while the order is active; stop when it is terminal (`completed` | `cancelled`). Do not poll in background tabs.

```ts
export function useOrder(orderCode: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderCode),
    queryFn: () => ordersApi.getByCode(orderCode),
    refetchInterval: (q) =>
      q.state.data && ['completed', 'cancelled'].includes(q.state.data.status) ? false : 10_000,
  });
}
```

- Admin order board: poll the list every 15 s.

---

## 8. API Client & Error Handling

- One `http-client.ts` creates and configures an **Axios instance**: base URL from env, JSON headers, `Authorization` Bearer header via request interceptor, **unwraps the success envelope** (`data`, `meta`) via response interceptor, and throws `ApiError` for the error envelope.

```ts
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string,
              public details?: { field: string; message: string }[]) { super(message); }
}
```

- **Token refresh (single-flight):** on `401 UNAUTHENTICATED`, call `POST /auth/refresh` once (shared promise for concurrent requests), retry the original request once; if refresh fails (`INVALID_REFRESH_TOKEN`), clear session and redirect to `/login`.
- Do not retry non-idempotent mutations automatically (`POST /orders`, `/cart/items`).
- Query default `retry`: no retry on `4xx`; max 2 retries on network/`5xx` for queries only.
- **Show user-friendly messages by error `code`**, never raw server text for unknown codes. Central map in `shared/lib/error-messages.ts` + per-feature overrides.

```ts
const messages: Record<string, string> = {
  CART_EMPTY: 'Your cart is empty.',
  PRODUCT_UNAVAILABLE: 'Some items are no longer available. Please review your cart.',
  VOUCHER_EXPIRED: 'This voucher has expired.',
  ORDER_NOT_CANCELLABLE: 'Order cannot be cancelled at this stage.',
};
```

- `VALIDATION_ERROR.details` -> map to form fields with React Hook Form `setError`.
- Every page handles four states: **loading** (skeleton), **error** (`ErrorState` with retry), **empty** (`EmptyState`), **success**.
- Route-level `errorElement` + a global `ErrorBoundary`; unexpected errors show a generic message and are logged.

---

## 9. Authentication & Session

- Access token: kept **in memory only** (module variable in `token-storage.ts`). Refresh token: `localStorage`, accessed **only** through `token-storage.ts`.
- On app start: if a refresh token exists, call `/auth/refresh`, then `GET /auth/me`; show a splash until resolved.
- `AuthProvider` exposes `useAuth()`: `{ user, isAuthenticated, isAdmin, login, loginWithGoogle, logout }`. Session user comes from the `['auth','me']` query.
- **Google login:** render the Google button on `/login` and `/register`; send the returned `credential` (ID token) to `POST /auth/google`. Never decode or trust it client-side. Env: `VITE_GOOGLE_CLIENT_ID`.
- `hasPassword=false` accounts: hide password-change UI; `USE_GOOGLE_SIGN_IN` error shows "Please continue with Google".
- Profile page offers "Unlink Google" only when `hasPassword = true` (`DELETE /auth/identities/google`).
- Logout: call `POST /auth/logout`, clear tokens, clear the whole query cache.
- Hiding admin menus by role is **UX only**; the backend enforces permissions.
- Security note: storing the refresh token in `localStorage` is exposed to XSS. Prefer an `httpOnly` cookie in the future (needs a backend change).

---

## 10. Forms & Validation

- React Hook Form + Zod resolver. One Zod schema per form in `<feature>.schemas.ts`; infer the TS type from it.
- Client rules **mirror** `../../docs/api-spec.md` (e.g. password >= 8, quantity 1–99, note <= 255) but the server remains the authority.

```ts
export const addressSchema = z.object({
  recipientName: z.string().min(1).max(120),
  phone: z.string().min(8).max(20),
  addressLine: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  isDefault: z.boolean().default(false),
});
export type AddressForm = z.infer<typeof addressSchema>;
```

- Disable the submit button while the mutation is pending; show field errors inline.
- Product customization form: render option groups from `optionGroups`; enforce `minSelect`/`maxSelect` in the UI (`single` -> radio, `multiple` -> checkboxes with max). The server re-validates.

---

## 11. Money, Prices & Business Display Rules

- **Never compute authoritative totals on the client.** Cart, checkout, and order pages display `unitPrice`, `lineTotal`, `subtotal`, `discountAmount`, `shippingFee`, `totalAmount` exactly as returned.
- Server calculates shipping fee (flat 15,000 VND; free if subtotal >= 150,000 VND; 0 VND for pickup). Client displays the returned value.
- The only allowed client calculation is a **price preview** on the product page (`basePrice + size.priceDelta + Σ option.priceDelta`), implemented once in `catalog` (`calcPricePreview`) and labeled as an estimate.
- Money formatting: one helper `formatMoney(amount)` using `Intl.NumberFormat` with currency/locale from env (`VITE_CURRENCY`, `VITE_LOCALE`). No manual string concatenation.
- Dates: API returns UTC ISO strings; format in the user's locale with `formatDate` / `formatDateTime`.
- Order status labels and colors come from one map in `shared/constants/order-status.ts` (used by `OrderStatusBadge`).
- **Cancellation display:** Customers can only cancel orders in `pending` or `confirmed` status. Once `preparing` begins, the cancel button is hidden or disabled for customers.
- Sold-out products (`isAvailable=false`) are shown but not purchasable; cart lines with `isAvailable=false` are flagged and block checkout.
- Voucher: `POST /vouchers/validate` is a **preview**; the final discount is whatever `POST /orders` returns.
- Checkout: the form sends only `{ fulfillmentType, addressId?, voucherCode?, paymentMethod, note? }`. Never send items or prices.
- Online payments: if `payment.checkoutUrl` is present after checkout, redirect the user there; otherwise go to `/orders/:orderCode`.
- Show `orderCode` to users; never numeric order IDs.

---

## 12. State Management

| State type | Where |
|---|---|
| Server data (menu, cart, orders, profile) | TanStack Query |
| Session user | `AuthProvider` + `['auth','me']` query |
| Form state | React Hook Form |
| Filters/pagination/sort | **URL search params** (shareable, back-button friendly) |
| Local UI (modal open, tabs) | `useState` in the component |
| Cross-page UI only (e.g. cart drawer) | Small context or Zustand store, **never server data** |

- No Redux. Introduce a global store only for UI state that truly spans pages.

---

## 13. Components & Styling

- Function components + hooks only. Props typed with an explicit `interface`/`type`; no `any`; avoid `React.FC`.
- React 19: pass `ref` as a regular prop (no `forwardRef`).
- `shared/components/ui` holds generic, **business-free** components; feature components may compose them.
- A component > ~150 lines or with multiple concerns gets split; lift logic into hooks.
- Tailwind utility classes; extract repeated patterns into components, not into `@apply` soup. Merge classes with `cn()`.
- Design tokens (colors, spacing, radius) defined once in `shared/styles`; no hardcoded hex values in components.
- Responsive **mobile-first** (customers order from phones); admin screens must work on tablet width.
- Accessibility: semantic HTML, labels for every input, keyboard-reachable controls, visible focus, `alt` on images, `aria-live` for toasts and order-status changes.
- Never use `dangerouslySetInnerHTML` for API content; product descriptions are plain text.

---

## 14. Naming & Code Style

| Item | Convention | Example |
|---|---|---|
| Feature folders | `kebab-case` | `admin-reports` |
| Components, pages | `PascalCase.tsx`, one per file | `OrderCard.tsx` |
| Hooks | `useXxx.ts` | `useCheckout.ts` |
| Non-component files | `<feature>.<role>.ts` | `orders.api.ts`, `orders.keys.ts` |
| Types/interfaces | `PascalCase` | `OrderSummary` |
| Variables/functions | `camelCase` | `formatMoney` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_QUANTITY` |
| Env vars | `VITE_UPPER_SNAKE_CASE` | `VITE_API_BASE_URL` |
| Test files | `*.test.ts(x)` in `__tests__/` | `OrderTimeline.test.tsx` |

- TypeScript `strict: true`, no `any` (use `unknown` + narrowing), union types over enums (`type OrderStatus = 'pending' | ...`).
- Named exports only (no default exports), except where a tool requires one (Vite config).
- API DTO fields are `camelCase` exactly as in `../../docs/api-spec.md`.
- Prettier + ESLint (`react-hooks`, import boundaries, `no-explicit-any`) run in CI and pre-commit.

---

## 15. Config, Security & Performance

- All env access via `config/env.ts` (Zod-validated); **no `import.meta.env` elsewhere**. Required: `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_CURRENCY`, `VITE_LOCALE`.
- No secrets in the frontend; every `VITE_*` value is public.
- Never log tokens, passwords, or full API payloads.
- Code-split per route (lazy); admin is a separate chunk. Import heavy libs (charts) only inside `admin-reports`.
- Images: `loading="lazy"`, explicit `width`/`height`, responsive sizes; product images come from `imageUrl`.
- Avoid unnecessary re-renders: stable keys, memoize only when profiling shows a need.
- Lists use pagination from the API; never fetch "all products" client-side.

---

## 16. Testing

- Unit/component tests live in the feature's `__tests__/`; use React Testing Library + **MSW** to mock the API at the network level (never mock hooks of other features).
- Must-have tests: option min/max selection UI, price preview, cart mutations, checkout form (delivery vs pickup), order status badge/timeline, route guards (customer vs admin), token refresh single-flight, error-code -> message mapping.
- E2E (Playwright) for critical flows: Google/password login -> add to cart -> checkout -> track order; admin confirms and advances an order.
- Test by user behavior (roles, labels, text), not implementation details.

---

## 17. Adding a New Feature (Checklist)

1. Create `features/<name>/` with only the files needed (see §3).
2. Define DTO types from `../../docs/api-spec.md`, then `*.api.ts`, `*.keys.ts`, hooks.
3. Build components and pages; handle loading/error/empty states.
4. Add `<name>.routes.tsx` (customer + admin arrays) and export it in `index.ts`.
5. Compose it in `app/router.tsx`; add paths to `shared/constants/routes.ts`.
6. Update the dependency map (§5) and the route table (§6); ensure no cycles.
7. Add error-code messages for the feature's `422` codes.
8. Add tests; run lint (import boundaries), type-check, and build.

---

## 18. Rules for AI Coding Assistants

**Do**
- Put new code in the owning feature folder and follow the anatomy in §3.
- Import other features only via `@/features/<name>` (`index.ts`).
- Use TanStack Query for all server data, key factories for query keys, and hooks as the only bridge to `*.api.ts`.
- Use React Hook Form + Zod for forms; map `VALIDATION_ERROR.details` to fields.
- Display prices/totals exactly as the API returns them; format with `formatMoney`.
- Use `orderCode` in URLs; keep filters/pagination in URL search params.
- Handle loading, error, empty, and success states on every page.
- Use route constants and `RequireAuth` / `RequireRole` guards; admin pages under `/admin/*`.

**Don't**
- Don't create top-level `components/`, `hooks/`, `pages/`, `services/`, `store/` folders.
- Don't call `fetch`/`axios` from components or pages, and don't use `useEffect` for data fetching.
- Don't store server data in `useState`, Redux, or Zustand.
- Don't compute order totals, discounts, or shipping on the client, and don't send prices to the API.
- Don't deep-import another feature's files; don't create feature cycles.
- Don't read `import.meta.env` outside `config/env.ts`; don't put secrets in `VITE_*`.
- Don't store the access token in `localStorage`; don't touch tokens outside `token-storage.ts`.
- Don't use `dangerouslySetInnerHTML` with API content, `any`, or default exports.
- Don't rely on hiding UI as security; the backend is the authority for permissions.
