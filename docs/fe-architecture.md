# Frontend Architecture — Beverage Ordering Website

> Audience: developers (new members) and AI coding assistants.
> Companion docs: `fe-project-rules.md` (coding rules) · `../../docs/api-spec.md` (API contract) · `../../be/docs/be-architecture.md` (backend flows).
> This doc explains **how the pieces fit together and why**. Rules, folder anatomy, and endpoint details are not repeated here; follow the section references.

---

## 1. Goals & Constraints

- **Goal:** a fast, mobile-friendly ordering experience (browse -> customize -> cart -> checkout -> track) and an admin console, maintainable by a 10-person team alongside the backend.
- **Constraints:** React 19 + Vite + TypeScript SPA, feature-based organization mirroring the backend, **one SPA for customers and admins**, the backend is the single source of truth.
- **Non-goals (for now):** SSR/SEO-driven rendering, native apps, offline ordering, guest checkout (the API requires login for the cart), i18n beyond locale-aware formatting.

### Quality targets (adjust to real needs)

| Attribute | Target |
|---|---|
| Performance | Menu usable < 2.5 s LCP on mid-range mobile over 4G; customer entry JS budget ~200 KB gzip (admin excluded) |
| Correctness | Prices/totals/availability/status always come from the API, never computed authoritatively on the client |
| Resilience | Every screen has loading / error / empty states; expired sessions recover silently |
| Security | No secrets in the bundle; tokens never logged; no `dangerouslySetInnerHTML` with API content |
| Maintainability | New feature added without touching other features' internals |

---

## 2. System Context

```mermaid
flowchart LR
    U1[Customer browser] --> CDN
    U2[Admin browser] --> CDN
    CDN[Static hosting / CDN<br/>React build] --> SPA
    SPA[React SPA] -->|HTTPS /api/v1<br/>Bearer access token| API[Backend monolith]
    SPA -->|Google Identity Services| G[Google]
    SPA -->|redirect when payment.checkoutUrl| PG[Payment gateway]
    PG -->|webhook| API
    API --> DB[(MySQL)]
```

- The SPA talks **only** to the backend API (plus Google's sign-in script and gateway redirects).
- Customers and admins load the same `index.html`; the role decides which routes and lazy chunks they can reach.
- The backend authorizes everything. The SPA's role-based hiding is UX only.

---

## 3. Logical Architecture

### 3.1 Module layout

```mermaid
flowchart TB
    subgraph app[app/ — composition root]
      P[providers.tsx<br/>Query, Auth, Toaster, ErrorBoundary]
      R[router.tsx<br/>composes feature routes, lazy]
      G[guards + layouts]
    end
    subgraph features[features/ — vertical slices]
      A[auth] --- PR[profile] --- CA[catalog] --- CT[cart]
      PM[promotions] --- OR[orders] --- PY[payments] --- RP[admin-reports]
    end
    subgraph shared[shared/ — no business logic]
      API[api: http-client, token-storage]
      UI[components: ui, feedback]
      LIB[lib, hooks, constants, types]
    end
    CFG[config/env.ts]
    app --> features
    features --> shared
    app --> shared
    shared --> CFG
```

- `app/` is the only layer that knows every feature. `shared/` never imports `features/` or `app/`.
- Each feature is a vertical slice: `api -> hooks -> components -> pages`, plus types, schemas, and routes.

### 3.2 Feature responsibilities

| Feature | UI responsibility | Main API groups (see `api-spec.md`) |
|---|---|---|
| `auth` | Login, register, Google sign-in, session, admin user management | `/auth/*`, `/admin/users` |
| `profile` | Profile, addresses | `/profile`, `/profile/addresses` |
| `catalog` | Menu, product detail + customization, admin products/categories/options | `/categories`, `/products`, `/admin/products...` |
| `cart` | Cart page, mini-cart badge, cart mutations | `/cart`, `/cart/items` |
| `promotions` | Voucher input/preview, admin vouchers | `/vouchers/validate`, `/admin/vouchers` |
| `orders` | Checkout, my orders, tracking, admin order board | `/orders`, `/admin/orders` |
| `payments` | Payment method selection, admin refund | `payment` in order DTO, `/admin/payments/:id/refund` |
| `admin-reports` | Sales and top-products dashboards | `/admin/reports/*` |

- Admin screens live **inside the feature they manage** (`pages/admin/`), loaded lazily under `AdminLayout`.
- Constraint: a feature's `index.ts` must **not** statically import admin pages; routes reach them through `lazy()`, otherwise admin code leaks into the customer bundle.

### 3.3 Dependency graph (allowed direction)

```mermaid
flowchart LR
    orders --> cart
    orders --> profile
    orders --> promotions
    orders --> payments
    catalog --> cart
    profile --> auth
    cart --> auth
    catalog --> auth
    orders --> auth
    classDef base fill:#eee,stroke:#999
    class auth base
```

- `auth` is foundational (`useAuth()` / `useCurrentUser()`), so any feature may use it. `promotions`, `payments`, `admin-reports` depend only on `shared`.
- `cart` does **not** import `catalog`: cart DTOs already carry the product info they need.
- `catalog` imports `cart` because the product page triggers `useAddToCart()`.
- Cross-feature imports go through `@/features/<name>` only (ESLint-enforced). No cycles.
- Where the backend uses events (`payments` -> `orders`), the frontend needs none: the SPA learns about payment results by **polling the order** (see §5.4).

---

## 4. Runtime Architecture

### 4.1 Rendering and bootstrap

```mermaid
sequenceDiagram
    participant B as Browser
    participant M as main.tsx / App
    participant S as token-storage
    participant API as Backend
    B->>M: load index.html + shell chunk
    M->>S: read refresh token
    alt refresh token exists
      M->>API: POST /auth/refresh
      API-->>M: new access + refresh token
      M->>API: GET /auth/me
      API-->>M: user (role, hasPassword, ...)
    else none
      M->>M: anonymous session
    end
    M->>B: render router (splash until session resolved)
    B->>M: navigate -> lazy feature chunk
```

- Splash is shown only until the session is resolved; public pages (menu) then render for everyone.
- Tokens: access token **in memory**; refresh token in `localStorage`, both only via `token-storage.ts`.

### 4.2 Layered call path inside a feature

```mermaid
flowchart LR
    Page --> Component --> Hook --> Services[services/] --> HC[http-client] --> BE[(Backend)]
    Hook <--> QC[(TanStack Query cache)]
```

- Pages/components never call `services/` or `fetch`; hooks are the only bridge.
- `http-client` unwraps the success envelope and throws `ApiError` for the error envelope.

### 4.3 State architecture

| State | Home | Why |
|---|---|---|
| Server data (menu, cart, orders, profile) | TanStack Query cache | One cache, automatic refetch/invalidation |
| Session user | `AuthProvider` + `['auth','me']` query | Derived from server |
| Form state | React Hook Form | Local to the form |
| Filters / pagination / sort | URL search params | Shareable, back-button friendly |
| Local UI (modal, tabs) | `useState` | Short-lived |
| Cross-page UI (cart drawer) | Small context/Zustand, never server data | Rare |

- The **cart is server state** (one cart per user on the backend); no local cart copy.
- Freshness policy (`staleTime`): categories/products 5 min, product detail 1 min, reports 1 min, cart/orders/admin lists 0.

---

## 5. Key Flows

### 5.1 Authenticated request with single-flight token refresh

```mermaid
sequenceDiagram
    participant C as Component / Hook
    participant H as http-client
    participant API as Backend
    C->>H: request A
    C->>H: request B (concurrent)
    H->>API: A with Bearer
    H->>API: B with Bearer
    API-->>H: 401 UNAUTHENTICATED (A)
    API-->>H: 401 UNAUTHENTICATED (B)
    H->>API: POST /auth/refresh (one shared promise)
    API-->>H: new tokens
    H->>API: retry A once
    H->>API: retry B once
    API-->>H: 200 / 200
    Note over H: if refresh fails (INVALID_REFRESH_TOKEN):<br/>clear session, clear query cache, go to /login
```

- Mutations such as `POST /orders` and `POST /cart/items` are **never auto-retried** on failure (only the one post-refresh replay of the original request).

### 5.2 Google login

```mermaid
sequenceDiagram
    participant U as User
    participant GB as Google button (GIS)
    participant FE as auth feature
    participant API as Backend
    U->>GB: click
    GB-->>FE: credential (ID token)
    FE->>API: POST /auth/google { idToken }
    API-->>FE: user + tokens + isNewUser
    FE->>FE: store tokens, set ['auth','me'], redirect
```

- The ID token is forwarded untouched; the SPA never decodes or trusts it.
- `hasPassword=false` accounts: hide password-change UI; `USE_GOOGLE_SIGN_IN` on password login shows "Please continue with Google". "Unlink Google" appears only when `hasPassword=true`.

### 5.3 Add to cart and checkout

```mermaid
sequenceDiagram
    participant U as User
    participant CA as catalog (product page)
    participant CT as cart
    participant OR as orders (checkout)
    participant API as Backend
    U->>CA: customize product (size, options)
    Note over CA: price preview (estimate only)
    CA->>CT: useAddToCart
    alt not logged in
      CT-->>U: redirect /login?redirect=/menu/:slug
    else logged in
      CT->>API: POST /cart/items
      API-->>CT: full Cart
      CT->>CT: setQueryData(cart)
    end
    U->>OR: open /checkout
    OR->>API: GET /cart, GET /profile/addresses
    U->>OR: pick delivery/pickup, voucher, payment method
    OR->>API: POST /vouchers/validate (preview)
    OR->>API: POST /orders { fulfillmentType, addressId?, voucherCode?, paymentMethod, note? }
    API-->>OR: 201 Order
    OR->>OR: invalidate orders lists, clear cart cache
    alt payment.checkoutUrl (https)
      OR->>U: redirect to gateway
    else
      OR->>U: navigate /orders/:orderCode
    end
```

- The checkout request carries **no items or prices**; the server builds the order from the cart.
- On `CART_EMPTY` / `PRODUCT_UNAVAILABLE`: refetch cart, show a message, go back to the cart. Cart lines with `isAvailable=false` block checkout in the UI.
- Double submit: the button is disabled while pending; the backend also protects (second request gets `CART_EMPTY`).

### 5.4 Order tracking and payment result (polling)

```mermaid
sequenceDiagram
    participant U as User
    participant OD as OrderDetailPage
    participant Q as useOrder (query)
    participant API as Backend
    participant PG as Gateway
    U->>OD: open /orders/:orderCode
    loop every 10 s while status not terminal and tab visible
      Q->>API: GET /orders/:orderCode
      API-->>Q: order + statusHistory + payment
      Q-->>OD: render OrderTimeline
    end
    PG->>API: webhook (backend marks paid, confirms order)
    Note over Q,API: next poll shows payment.status = paid, status = confirmed
    Note over Q: stop polling at completed / cancelled
```

- The SPA never receives payment webhooks; it **observes** the result through the order. The gateway return URL points to `/orders/:orderCode` (no separate payment-result route is required).
- Admin order board polls the list every 15 s.
- **Cancel button display:** The cancel order button is displayed to customers **only** when the status is `pending` or `confirmed`. Once status becomes `preparing` or `ready`, the button is hidden/disabled (as the kitchen has begun preparation).

### 5.5 Admin processes an order

```mermaid
sequenceDiagram
    participant A as Admin
    participant AB as AdminOrdersPage
    participant API as Backend
    A->>AB: filter status=pending (URL params)
    AB->>API: GET /admin/orders?status=pending
    A->>AB: click "Confirm"
    AB->>API: PATCH /admin/orders/:code/status { status: confirmed }
    alt 200
      API-->>AB: Order
      AB->>AB: invalidate admin list + order detail
    else 422 INVALID_ORDER_TRANSITION
      AB->>AB: show message, refetch to show real status
    end
```

- Buttons show only valid next steps (a client hint mirroring the backend status machine; `delivering` is skipped for `pickup`). The backend stays authoritative.

---

## 6. Routing Architecture

- Each feature exports route objects (`<feature>.routes.tsx`, customer + admin arrays) using route-level `lazy`; `app/router.tsx` composes them under layouts.
- Layouts: `CustomerLayout` (menu, cart badge), `AuthLayout` (login/register), `AdminLayout` (admin nav).
- Guards: `RequireAuth` -> `/login?redirect=<path>`; `RequireRole(['staff', 'admin'])` for staff operational boards, `RequireRole('admin')` -> 403 page. Mirrors backend RBAC permissions.
- Chunking model:

| Chunk | Loaded by | Contains |
|---|---|---|
| Shell | everyone | app, providers, router, shared, `auth` basics |
| Customer features | on navigation | menu, product, cart, checkout, orders, profile |
| Admin | admin users only | all `pages/admin/*`, `admin-reports` (+ charts library) |

- Path constants live in `shared/constants/routes.ts`; no hardcoded paths.

---

## 7. API Integration Architecture

- **Contract-first:** `../../docs/api-spec.md` is the contract; DTO types in each feature's `*.types.ts` mirror it.
- **Conventions handled centrally** in `http-client` (Axios instance with interceptors): base URL from env, JSON headers, Bearer header, envelope unwrapping, `ApiError(status, code, message, details)`.
- **Error pipeline:**

```mermaid
flowchart LR
    R[HTTP response] --> HC[http-client<br/>-> ApiError]
    HC --> Q[Query/Mutation error]
    Q --> M[error-messages map by code<br/>+ feature overrides]
    Q --> F[VALIDATION_ERROR.details -> form setError]
    Q --> B[Route errorElement / ErrorBoundary]
```

- Messages are chosen by **error code**, never raw server text for unknown codes.
- Retry policy: queries retry up to 2 times on network/`5xx`, never on `4xx`; mutations are not retried.

### Money, dates, and display data

- Money is a JSON `number`; one `formatMoney` helper (Intl, currency/locale from env). Dates arrive as UTC ISO and are formatted in the user's locale.
- The only client-side price calculation is the **product price preview** (`calcPricePreview` in `catalog`), labeled as an estimate. Cart, checkout, and order screens show server totals as returned.
- Order status labels/colors come from one map (`shared/constants/order-status.ts`).

---

## 8. Cross-Cutting Concerns

| Concern | Approach |
|---|---|
| Authentication | In-memory access token, `localStorage` refresh token via `token-storage.ts`, single-flight refresh |
| Authorization (UI) | `RequireAuth` / `RequireRole` (customer, staff, admin); UX only, backend enforces |
| Error handling | `ApiError` -> code-based messages -> form errors / route error elements / global `ErrorBoundary` |
| Loading/empty/error | Every page renders four states via `shared/components/feedback` |
| Configuration | `config/env.ts` (Zod-validated `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_CURRENCY`, `VITE_LOCALE`) |
| Accessibility | Semantic HTML, labelled inputs, focus visibility, `aria-live` for toasts and order-status changes |
| Styling | Tailwind with shared design tokens; mobile-first, admin usable at tablet width |
| Logging | No tokens/payloads in logs; unexpected errors reported through the global boundary |
| Testing | Vitest + RTL + MSW per feature; Playwright for critical journeys |

---

## 9. Build, Deployment & Environments

```mermaid
flowchart LR
    DEV[Developer push] --> CI[CI: lint incl. import boundaries -> type-check -> tests -> build]
    CI --> ART[Static artifact dist/]
    ART --> HOST[Static hosting + CDN]
    HOST --> USER[Browser]
    USER -->|CORS allow-listed origin| API[Backend API]
```

- Output is a **static bundle** (HTML/JS/CSS/assets) served from a CDN; no Node runtime in production.
- `VITE_*` values are baked in at build time, so build **once per environment** (`staging`, `production`) with that environment's `.env`.
- Hosting rules: SPA fallback to `index.html` for client routes; hashed assets cached as immutable; `index.html` not cached long-term.
- Backend CORS must allow the frontend origin (see `../../be/docs/be-architecture.md` §7); alternatively serve both behind one origin and proxy `/api`.
- Security headers/CSP set at the host: allow only the API origin, Google Identity Services, and the image CDN.
- Assumptions (confirm with the team): separate frontend origin on a CDN; product images served from `imageUrl` on a CDN.

---

## 10. Performance Architecture

- **Code splitting** per route/feature; admin and chart libraries only in the admin chunk.
- **Cache strategy** via TanStack Query `staleTime` (see §4.3); `keepPreviousData` for paginated lists; debounced search (300 ms).
- **Polling discipline:** only for active orders, paused in background tabs, stopped on terminal status.
- **Images:** lazy-loaded with explicit dimensions; responsive sizes.
- **Lists:** server-side pagination everywhere; never fetch "all products" or "all orders" client-side.
- Memoization only after profiling shows a need.

---

## 11. Security Architecture

- **Token model:** access token in memory (lost on reload, restored by refresh), refresh token in `localStorage`. This is exposed to XSS, so XSS prevention is the main control: no `dangerouslySetInnerHTML` with API content, strict CSP, dependency hygiene.
- Tokens are accessed **only** through `token-storage.ts`; never logged or placed in URLs.
- The Google ID token is passed straight to the backend; Google access tokens are never used.
- All `VITE_*` values are public; no secrets in the bundle.
- Admin UI hiding is cosmetic. Every sensitive action is authorized by the backend (`403` is handled gracefully).
- Logout clears tokens **and** the entire query cache so the next user never sees prior data.
- Future hardening: move the refresh token to an `httpOnly` cookie (requires a backend change).

---

## 12. Scalability & Evolution Path

Start simple; evolve when real needs appear.

1. **Now:** single SPA, feature slices, TanStack Query cache, polling for tracking.
2. **Typed contract:** generate API types from OpenAPI (derived from backend Zod) and validate drift in CI.
3. **Realtime:** replace polling with SSE/WebSocket for order status when the backend adds it (`../../be/docs/be-architecture.md` §9); the hook `useOrder` keeps the same interface, so pages do not change.
4. **Session hardening:** `httpOnly` cookie refresh flow.
5. **Guest browsing -> guest cart:** needs a backend change (cart is login-only today).
6. **i18n:** introduce a translation layer when a second language is required (currently only locale-aware formatting).
7. **Split admin into its own app** (same repo/workspace, shared `shared/` package) if bundle size or security policy demands it. Feature slices and `pages/admin/` isolation make this a move, not a rewrite.
8. **Team scaling:** assign feature ownership per team; import-boundary lint and the dependency map prevent hidden coupling.

### Known risks

| Risk | Mitigation |
|---|---|
| Hidden coupling between features | ESLint import boundaries, dependency map review in PRs |
| Admin code leaking into the customer bundle | Lazy routes only; `index.ts` never imports admin pages; bundle-size check in CI |
| Token theft via XSS (`localStorage` refresh token) | Strict CSP, no HTML injection, plan for `httpOnly` cookie |
| Stale UI vs fast-changing data (availability, status) | `staleTime: 0` for cart/orders, polling for active orders, handle `422` by refetch |
| Client/server rule drift (validation, status transitions, price preview) | Rules centralized (`schemas`, status map, `calcPricePreview`), contract tests/MSW from `../../docs/api-spec.md`, backend remains authoritative |
| Polling load as order volume grows | Interval discipline, stop on terminal status, move to SSE |
| DTO drift from the API | OpenAPI-generated types; MSW handlers updated with the spec |

---

## 13. Architecture Decision Records (summary)

| # | Decision | Why | Trade-off |
|---|---|---|---|
| 1 | Feature-based vertical slices mirroring backend | Matches team ownership, easy navigation | Needs discipline on boundaries |
| 2 | One SPA for customers and admins | One codebase, shared UI/auth | Admin code must be lazily isolated |
| 3 | Admin pages inside their owning feature (`pages/admin/`) | Admin and customer views share types/hooks | Risk of bundle leakage; guarded by lazy routes |
| 4 | TanStack Query for all server state | Caching, invalidation, polling built in | Learning curve; discipline to avoid duplicating state |
| 5 | Cart is server state only | Backend owns the cart; no sync bugs | Login required to add to cart |
| 6 | URL as the state for filters/pagination | Shareable, back-button friendly | More param plumbing |
| 7 | Polling for order tracking and payment result | Simple, no realtime infra needed | Latency up to the interval; upgrade path to SSE |
| 8 | Access token in memory, refresh token in `localStorage` | Matches current API (tokens in body) | XSS exposure; cookie flow planned |
| 9 | No client-authoritative money logic (preview only) | Prevents price tampering and drift | Preview may differ slightly from the server |
| 10 | Route-level lazy loading, admin as separate chunk | Fast customer entry | Extra loading states on navigation |
| 11 | Static build deployed to CDN, env baked at build time | Simple, cheap, cacheable | One build per environment |
| 12 | RBAC role model mirrored from the backend | Staff and Admin access operational features; admin passes all guards | Fine-tuned route guarding; extend as roles grow |

---

## 14. Key Decisions & Agreements

- **Payment return URL:** Gateway returns users directly to `/orders/:orderCode` (no separate payment-result route; order detail polling displays payment status).
- **Customer Cancellation:** Customers may only cancel during `pending` and `confirmed`. Once `preparing` begins, only staff and admin can cancel.
- **Refresh token storage:** `localStorage` for now with single-flight refresh; planned move to `httpOnly` cookie later.
- **Hosting topology:** Separate frontend origin on CDN with backend CORS allow-list.
- **Realtime tracking:** Polling (~10 s) for active orders at launch; path to SSE defined.

---

## 15. Where to Look (quick index)

- Coding rules, folder anatomy, naming, Do/Don't -> `fe-project-rules.md`
- Endpoints, schemas, error codes -> `../../docs/api-spec.md`
- Backend flows (checkout, payment webhook, order lifecycle) -> `../../be/docs/be-architecture.md`
- Adding a feature -> `fe-project-rules.md` §17
- Changing a flow in §5 -> update the diagram here in the same PR
