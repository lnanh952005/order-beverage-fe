# GEMINI.md — Frontend (`fe/`)

Frontend of the **beverage ordering website**: customer app (menu, customization, cart, checkout, order tracking) and admin console, in **one SPA**. Monolith repo.
Stack: **React 19 · Vite · TypeScript (strict)**. Code is organized by **feature**, not by layer.

## Repo layout

```
/
├─ docs/
│  ├─ api-spec.md             # API contract (source of truth for DTOs, endpoints, error codes)
│  └─ database.md             # data model background (rarely needed by FE)
├─ be/                        # backend (do not edit from frontend tasks unless asked)
└─ fe/                        # <- you are here
   ├─ GEMINI.md
   ├─ docs/
   │  ├─ fe-architecture.md   # how the frontend fits together (flows, diagrams, ADRs)
   │  └─ fe-project-rules.md  # coding rules, folder anatomy, naming, Do/Don't
   ├─ e2e/                    # Playwright flows (if present)
   └─ src/                    # app/, features/, shared/, config/, test/
```

## Read before you code

Do not load every doc up front. Read the part you need:

| If the task involves... | Read |
|---|---|
| Adding/changing a feature, folders, layers, imports, naming | `docs/fe-project-rules.md` §3–§5, §14, §17 |
| Calling an endpoint, DTO types, error codes | `../docs/api-spec.md` (matching feature section + §1 conventions + §13 error codes) |
| Routes, guards, lazy loading, admin pages | `docs/fe-project-rules.md` §6, `docs/fe-architecture.md` §6 |
| Data fetching, caching, polling, invalidation | `docs/fe-project-rules.md` §7, `docs/fe-architecture.md` §4.3 |
| Login, tokens, Google sign-in, session | `docs/fe-project-rules.md` §9, `docs/fe-architecture.md` §5.1–§5.2 |
| Cart, checkout, order tracking, admin order flow | `docs/fe-architecture.md` §5.3–§5.5, `docs/fe-project-rules.md` §11 |
| Forms, validation, money/date display | `docs/fe-project-rules.md` §10–§11 |
| Business meaning of fields/statuses | `../docs/database.md` §5 (only if the API spec is unclear) |

## Commands

Expected scripts (if `package.json` differs, **`package.json` wins**):

```bash
npm run dev          # Vite dev server
npm run build        # production build
npm run preview      # preview the build
npm run lint         # ESLint (includes import-boundary rules)
npm run typecheck    # tsc --noEmit
npm run test         # Vitest + Testing Library + MSW
npm run test:e2e     # Playwright (critical flows)
```

Before finishing any task: `lint`, `typecheck`, and `test` must pass.

## Architecture essentials

- **Feature-based:** `src/features/<name>/` is a vertical slice (`components/`, `hooks/`, `types/`, `pages/`, `services/`, `routes.ts`, `context.md`, `index.ts`). Features: `auth`, `profile`, `catalog`, `cart`, `promotions`, `orders`, `payments`, `admin-reports`.
- **Admin screens** live inside the feature they manage (`pages/admin/`) and are reached **only via lazy routes**. Never export admin pages from `index.ts` (it would leak admin code into the customer bundle).
- **Layers:** `pages -> components -> hooks -> services`. Pages/components never call `services` or `fetch`; hooks are the only bridge.
- **Import boundaries:** use other features **only** via `@/features/<name>` (`index.ts`); `shared/` imports nothing from `features/` or `app/`; no cycles. Allowed dependencies are in `docs/fe-project-rules.md` §5 (e.g. `orders` may use `cart`, `profile`, `promotions`, `payments`, `auth`; `cart` must not import `catalog`).
- **`app/`** is the composition root (providers, router, guards, layouts). **`shared/`** holds business-free code (api client, ui components, lib, constants, types).

## Hard rules

- **Server is the source of truth.** Never compute authoritative prices, discounts, shipping, or totals on the client. Show `unitPrice`, `lineTotal`, `subtotal`, `discountAmount`, `shippingFee`, `totalAmount` as returned. The only client calculation is the **price preview** on the product page (`calcPricePreview`), labeled as an estimate.
- **Checkout request** sends only `{ fulfillmentType, addressId?, voucherCode?, paymentMethod, note? }`. Never items or prices. `POST /vouchers/validate` is a preview only.
- **Server state = TanStack Query.** Every read is `useQuery`, every write is `useMutation`; no `useEffect` + `fetch`; never copy server data into `useState`/Zustand. The **cart is server state** (login required).
- **Query keys** come from per-feature key factories. Mutations invalidate or `setQueryData` from the response (cart mutations return the full cart).
- **URL is state** for filters, search, sort, and pagination.
- **API client:** all requests via `shared/api/http-client.ts` (configured Axios instance with interceptors for Bearer header, single-flight refresh on `401`, envelope unwrap, and `ApiError`). Never auto-retry `POST /orders` or `POST /cart/items`.
- **Tokens:** access token in memory, refresh token in `localStorage`, both only through `shared/api/token-storage.ts`. Never log or put tokens in URLs. Logout clears tokens and the whole query cache.
- **Errors:** map by error `code` (central map + feature overrides), never raw server text for unknown codes. Map `VALIDATION_ERROR.details` to form fields. Every page handles loading / error / empty / success.
- **Roles:** hierarchical (`admin > customer`); admin passes every guard. UI hiding is UX only; the backend enforces permissions.
- **Order tracking:** poll `GET /orders/:orderCode` (~10 s) while the order is not `completed`/`cancelled` and the tab is visible. Payment results arrive through the order (backend webhook), not directly.
- **Money/dates:** use `formatMoney` / `formatDate`; API money is a `number`, dates are UTC ISO strings. Order status labels/colors come from `shared/constants/order-status.ts`.
- **URLs:** `orderCode` for orders, `slug` for products; never numeric order IDs. Redirect targets (`?redirect=`, `payment.checkoutUrl`) must be validated (internal path / `https:`).
- **Config:** read env only via `src/config/env.ts` (`VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_CURRENCY`, `VITE_LOCALE`). No secrets in the bundle.

## Workflow

1. Identify which **feature** owns the change; work inside that feature folder.
2. Read the relevant docs (table above) and the endpoint section in `../docs/api-spec.md`. Follow existing patterns in the feature.
3. Types come from `api-spec.md` (`camelCase`, exactly as documented). **Do not invent endpoints or fields.** If the API is missing something the UI needs, stop and flag it to the user (the backend and `../docs/api-spec.md` must change first).
4. Build with hooks + components + pages; add the feature's `422` error-code messages; use Zod + React Hook Form for forms.
5. Register routes in `<feature>.routes.tsx` (lazy) and compose them in `app/router.tsx`; add paths to `shared/constants/routes.ts`.
6. Update the dependency map / route table in `docs/fe-project-rules.md` if they change; update `docs/fe-architecture.md` if a flow changes.
7. Add tests (MSW handlers matching `api-spec.md`, including error cases) and run `lint`, `typecheck`, `test`.

## When docs conflict or are silent

- Authority: `../docs/api-spec.md` for the API contract, `docs/fe-project-rules.md` for code conventions, `docs/fe-architecture.md` for design intent.
- If docs disagree or a rule is missing, **do not guess silently**: state the assumption, pick the option that keeps the contract stable, and flag it to the user.
- Known open points: the gateway return URL is assumed to be `/orders/:orderCode` (no separate payment-result route); refresh-token storage in `localStorage` is a known XSS trade-off pending a possible `httpOnly` cookie change; polling (not SSE) for tracking at launch.

## Do / Don't

**Do**
- Keep new code inside the owning feature; export only routes, hooks, shared-by-feature components, and DTO types from `index.ts`.
- Use `shared/components/ui` primitives; Tailwind with design tokens; mobile-first layouts; accessible markup (labels, focus, `aria-live` for status changes).
- Keep lists paginated via the API; debounce search (300 ms).

**Don't**
- Don't create top-level `components/`, `hooks/`, `pages/`, `services/`, `store/` folders.
- Don't call `fetch`/`axios` in components, or read `import.meta.env` outside `config/env.ts`.
- Don't keep a local cart or send prices/totals to the API.
- Don't use `dangerouslySetInnerHTML` with API content, `any`, default exports, or deep imports across features.
- Don't edit `../be/` or shared docs beyond what the task requires.
