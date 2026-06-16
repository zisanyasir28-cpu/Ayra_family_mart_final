# Ayra Family Mart — Full Project Audit

> Generated 2026-06-15 via a 4-scout sweep (client storefront, client admin/infra, server, config/build). 
> Items marked **✓ verified** were personally re-checked against the source. Everything else is a scout finding — 
> a strong lead, but confirm the line before acting. A few scout claims were proven false and removed (see "Corrections" at the bottom).
> 
> Priority: **P1** = bug / security / data-integrity / broken UX · **P2** = important quality · **P3** = nice-to-have.

---

## ⭐ Tackle in this order (highest leverage first)

1. **Disable prod source maps** + remove hardcoded Vercel URL (security + correctness, 5-min fix). ✓
2. **Add env validation at startup** (client + server) so missing `CLIENT_URL` / `BACKEND_URL` / `VITE_API_URL` fail loudly instead of silently falling back to `localhost`.
3. **Extract shared admin UI primitives** (`Spinner`, `StatusBadge`, `ToggleSwitch`, `useDebounce`) — duplicated 3× each.
4. **Add route-level code-splitting** (`React.lazy`) + Vite `manualChunks` — biggest perf win for first load.
5. **Standardize the TanStack Query key convention** across all admin hooks/pages.
6. **Stop demo/fallback data from reaching checkout** (FlashDeals demo IDs → order validation).
7. Work through Design / Responsiveness / a11y items below.

---

## A. FIX — bugs & correctness

- **[P1]** `client/src/components/home/FlashDeals.tsx` + `client/src/pages/customer/CheckoutPage.tsx:98-112` — Demo flash-deal products have non-UUID IDs that can reach order validation; CheckoutPage has to filter them out at runtime. **Fix:** don't render demo items in a real order path, or gate them behind an explicit `isDemo` flag that the cart refuses.
- **[P1]** `client/src/lib/api.ts:60-62` — Refresh-endpoint detection uses `.includes('/auth/refresh')` and has no bounded-retry guard; risk of an infinite 401 retry loop on permanent auth failure. **Fix:** exact-path compare + a retry counter / circuit breaker.
- **[P2]** `client/src/pages/admin/orders/OrdersListPage.tsx:172-182` & `CustomersPage.tsx:172-200` — Mobile cards cast `order`/`customer` to loosely-typed `{ user?: { name } }` via optional chaining; silently wrong if the relation is unpopulated. **Fix:** type the relation properly in shared types or add a type guard.
- **[P2]** `client/src/pages/admin/products/ProductsListPage.tsx:407-415` — `handleBulkStatus()` uses `Promise.all` with no error handling; one failure still reports "Updated X product(s)". **Fix:** collect failures, report succeeded vs failed.
- **[P3]** `server/src/controllers/coupon.controller.ts:78` — `req.user?.sub` optional-chained on a `requireAuth` route. **Fix:** `req.user!.sub` or explicit guard for strict type safety.
- **[P3]** `server/src/routes/category.route.ts` (~`/reorder` vs `/:id`) — **VERIFY:** scout flagged possible misrouting. Only a real bug if `/:id` is declared *before* `/reorder` **and** shares the HTTP method. Check ordering; product.route.ts was already correct.

## B. CHANGE — anti-patterns

- **[P2]** Admin **query-key convention is inconsistent**: hooks use single hyphenated strings (`['admin-orders']`, `['admin-customers']`) while pages use namespaced arrays (`['admin','products']`, `['admin','coupons']`). *(Not broken — each feature is internally consistent — but a maintenance trap.)* **Fix:** standardize on `['admin', <entity>, params]` everywhere.
- **[P2]** `client/src/components/home/FlashDeals.tsx:81-92` — Demo fallback bleeds into real UI/order flow. **Fix:** render nothing (or a skeleton/empty state) when no real deals exist, instead of fake products.
- **[P3]** `server/src/controllers/coupon.controller.ts:20-26` — `generateCouponCode()` uses `Math.random()`. **Fix:** `crypto.randomBytes()` for collision-resistant codes.
- **[P3]** Admin pages fire toasts *inside* service/mutation functions (`/* demo toast already fired */` comments in CouponsPage, CampaignsPage). **Fix:** lift toast handling to the page or a shared mutation hook (separation of concerns).

## C. IMPROVE — refactor & reuse

- **[P2]** `Spinner` reimplemented in `ProductsListPage`, `CouponsPage`, `CampaignsPage`. **Fix:** `components/ui/Spinner.tsx`.
- **[P2]** `StatusBadge` reimplemented in `ProductsListPage`, `CouponsPage` (+ others). **Fix:** `components/ui/StatusBadge.tsx` with a single status→color map.
- **[P2]** `ToggleSwitch` reimplemented 3× (`ProductsListPage`, `CouponsPage`, `CategoriesPage`). **Fix:** `components/ui/ToggleSwitch.tsx`.
- **[P2]** `useDebounce` reimplemented 3× (`ProductsListPage`, `CouponsPage`, `InventoryPage`) under two names. **Fix:** `hooks/useDebounce.ts`.
- **[P2]** `client/src/components/CartDrawer.tsx:54-56` — Free-delivery threshold `99_900` is a bare magic number, duplicated in checkout. **Fix:** `FREE_DELIVERY_THRESHOLD_PAISA` in `shared/`.
- **[P3]** `client/src/components/product/ProductCard.tsx:35-50` — Wishlist toggle rolls back on error but shows no toast. **Fix:** add error toast + simplify optimistic flow.

## D. DESIGN & UX

- **[P2]** `client/src/pages/admin/DashboardPage.tsx:151-187` — Skeleton count (4) doesn't match the `grid-cols-2 lg:grid-cols-4` breakpoints; misaligns on tablet. **Fix:** match skeleton count to the responsive grid.
- **[P2]** `client/src/pages/admin/coupons/CouponsPage.tsx:71-90` — `UsageBar` gives no feedback when a coupon is exhausted (100%). **Fix:** "Exhausted" badge + visual disable at ≥100%.
- **[P2]** `client/src/components/home/FeatureBanners.tsx:328` — Hardcoded `"Ayra Fresh+"` label instead of the config's `b.label` (which is then unused). **Fix:** render `{b.label}`.
- **[P3]** `client/src/pages/admin/inventory/InventoryPage.tsx:62-106` — Inline stock editor has no in-flight state on save. **Fix:** disable input + spinner while `isPending`.
- **[P3]** `client/src/components/product/ProductCard.tsx:138-142` — Fallback 🛒 emoji has no accessible label. **Fix:** `role="img"` + `aria-label`.
- **[P3]** Light-mode review: `HeroBanner` image filters (e.g. `hue-rotate(-12deg)`) may shift colors off-palette in light mode. **Fix:** test/adjust per theme.

## E. PERFORMANCE

- **[P2]** `client/vite.config.ts` — No `manualChunks`; React, TanStack, Recharts all in one bundle. **Fix:** split vendor chunks for better caching.
- **[P2]** No route-level code-splitting (no `React.lazy` on pages/admin). **Fix:** lazy-load routes, esp. the admin section + Recharts.
- **[P2]** `client/src/components/layouts/CustomerLayout.tsx:618` — Search autocomplete renders all results, no windowing. **Fix:** cap results or virtualize for large lists.
- **[P2]** `client/src/pages/admin/products/ProductsListPage.tsx` (table) — Unvirtualized; 100+ rows all hit the DOM. **Fix:** keep pagination <50/page or virtualize.
- **[P2]** `client/src/hooks/useAdminStats.ts:4-10` — `refetchInterval: 60_000` runs even on hidden/background tabs. **Fix:** pause on `document.hidden` / window blur.
- **[P3]** `client/src/store/cartStore.ts:64-73` — `deliveryFeeInPaisa()` / `totalInPaisa()` re-`reduce()` the cart on every call. **Fix:** compute subtotal once / memoize. *(Note: store is a "stable contract" — coordinate before editing.)*
- **[P3]** `server/src/middleware/cache.ts:14` — Stale-while-revalidate `Math.floor(seconds/2)` has no lower bound. **Fix:** `Math.floor(Math.max(1, seconds)/2)`.
- **[ADD/Perf]** Confirm Cloudinary transforms (`f_auto,q_auto,w_…`) are applied on storefront images — verify no raw upload URLs render.

## F. ANIMATION

- **[P2]** `client/src/components/home/HeroBanner.tsx:134` ✓ — `MotionConfig reducedMotion="never"` overrides `prefers-reduced-motion` for the bokeh particles. It's *deliberate* (documented rationale: tiny/decorative), but it still ignores a user a11y setting. **Fix (judgment call):** consider honoring the preference, or reduce to a static/low-motion variant when reduced motion is set.
- **[P3]** Audit Motion usage for animating layout-affecting props (width/height/top/left) vs `transform`/`opacity`; prefer the latter to avoid reflow. (`HeroBanner` particles animate `x/y/scale/opacity` — good; spot-check others.)
- **[ADD]** No global `prefers-reduced-motion` fallback strategy. **Fix:** add a reduced-motion CSS guard for non-essential transitions.

## G. RESPONSIVENESS

- **[P2]** `client/src/pages/admin/products/ProductsListPage.tsx:506-680` — 8-column table collides on tablet (~768px); relies on horizontal scroll. **Fix:** `hidden md:table-cell` on low-priority columns, or card view below `md`.
- **[P2]** `client/src/pages/customer/ProductDetailPage.tsx:281` — Sticky add-to-cart bar hardcodes `bottom: calc(3.5rem + safe-area)` assuming exact bottom-nav height. **Fix:** drive from a CSS var / shared layout constant.
- **[P3]** `client/src/pages/admin/orders/OrdersListPage.tsx:161-200` — Mobile card payment-status badge wraps awkwardly. **Fix:** simpler vertical layout / smaller text below `sm`.
- **[ADD]** Do a full pass on **all admin pages at 360/768/1024px** — tables and multi-column forms are the recurring weak spot.

## H. HARDCODED values

- **[P1]** `client/src/main.tsx:50` ✓ — Crash-reload button hardcodes `https://ayra-family-mart-final-client.vercel.app/`. **Fix:** `window.location.href = import.meta.env.BASE_URL` (or `'/'`).
- **[P1]** `client/public/robots.txt:4` & `client/public/sitemap.xml` — Vercel domain hardcoded throughout. **Fix:** generate at build time from a `SITE_URL` env, or template them.
- **[P2]** `server/src/controllers/payment.controller.ts:129` ✓-ish — `clientUrl()` falls back to `http://localhost:5173`; in prod a missing `CLIENT_URL` silently breaks SSLCommerz redirects. **Fix:** require the env in prod (throw on boot).
- **[P2]** `server/src/lib/sslcommerz.ts:46` — `BACKEND_URL` falls back to `http://localhost:${PORT}`; breaks IPN callbacks if unset in prod. **Fix:** require in prod.
- **[P2]** `server/src/index.ts:48` — CORS whitelist can become `[undefined]` if `CLIENT_URL` unset. **Fix:** validate at startup.
- **[P2]** `client/src/components/home/NewsletterBar.tsx:65-70` — Newsletter "submit" is a hardcoded 900 ms `setTimeout`, always fakes success. **Fix:** wire to a real endpoint or label as demo.
- **[P3]** `server/src/lib/cloudinary.ts:54` — Cloud name falls back to a hardcoded `'dzhj5tgyv'`. **Fix:** require env, fail loudly.

## I. REMOVE — dead code & noise

- **[P2]** `client/src/App.tsx:276-283` — `AdminPlaceholder` component never used. **Fix:** delete.
- **[P3]** `client/src/components/layouts/CustomerLayout.tsx:54` — Unused `TopLoadingBar` import. **Fix:** remove.
- **[P3]** `client/vite.config.ts:7` — `REPO_NAME` constant only referenced in a GH-Pages comment; base path is env-driven. **Fix:** remove dead constant.
- **[P3]** `client/vite.config.ts:78-86` — `dedupe` lists `react/jsx-runtime` etc. that Vite auto-dedupes. **Fix:** simplify to `['react','react-dom']`.
- **[P3]** `server/src/controllers/product.controller.ts:505` ✓ — `console.error` instead of pino `logger`. **Fix:** use `logger.error(...)`.
- **[Clean]** `extract-pdf.mjs`, `catalog.pdf`, `.clone/`, `server/scripts/` are untracked at repo root — confirm they belong in the repo or `.gitignore` them.

## J. ADD — what's missing

- **[P1-infra]** **Env validation** (Zod) at startup for both client (`import.meta.env`) and server (`process.env`) — single biggest robustness win.
- **[P2]** `client/.env.production` — `VITE_SENTRY_DSN` missing → error tracking off in prod. **Fix:** add DSN + a low `tracesSampleRate`.
- **[P2]** Real **error / empty / loading states** audit across customer + admin (several pages assume the happy path).
- **[P2]** **Accessibility pass**: alt text on decorative/product images, `aria-label`s, focus-visible rings, keyboard nav for dropdowns/drawers, real social links (currently `href="#"` in `NewsletterBar` + footer).
- **[P2]** **Testing**: no meaningful test coverage seen. Add Vitest + Testing Library for cart math, checkout, auth refresh; Supertest for auth/order/payment controllers.
- **[P3]** **Tooling**: no `.prettierrc` / shared ESLint config across workspaces — add for consistency.
- **[P3]** `OrderDetailPage` — valid status transitions are hardcoded client-side; consider sourcing from the API.
- **[P3]** Align dependency versions: Zod (`shared` 3.23 vs client/server 3.25); review Tailwind v3 vs the v4/`@tailwindcss/postcss` packages present (the in-progress v4 migration).

## K. "Best of best" — strategic upgrades

- **Code-splitting + bundle analysis** (`rollup-plugin-visualizer`) — measure, then split. Admin + Recharts should never load for customers.
- **A shared `ui/` primitive layer** (Spinner, Badge, Toggle, Modal, EmptyState, TableToolbar) — kills the duplication theme that shows up everywhere.
- **Centralized money + delivery constants** in `shared/` — one source of truth for paisa thresholds, fees, tax.
- **Env schema module** (`shared/src/env.ts`) imported by both apps — no more localhost fallbacks in prod.
- **Image discipline**: enforce Cloudinary `f_auto,q_auto` + responsive `srcset`; lazy-load below the fold.
- **Reduced-motion + a11y baseline** as a project rule, not per-component.
- **A small but real test suite** around money, checkout, and auth — the three places a bug actually costs money.

---

## Corrections to the raw scout sweep (false positives removed)

- ❌ "Admin cache invalidation is broken by key mismatch" — **false.** Each hook pairs its own key with its own invalidation; nothing breaks. Reframed as a *convention inconsistency* (B above).
- ❌ "`/admin/low-stock` misroutes as `/:slug`" — **false.** `/:slug` matches a single path segment; `/admin/low-stock` is two. The route file already orders static-before-dynamic correctly.
- ⚠️ "`reducedMotion='never'` is an accessibility violation" — **softened.** It's a deliberate, documented override for tiny decorative particles. Listed as a judgment call, not a bug.
- ⚠️ "Source maps expose code" / "hardcoded URL" — **confirmed true** and kept.

## Quick wins (high value, <15 min each)

1. `vite.config.ts:99` → `sourcemap: false` (or gate on a Sentry env).
2. `main.tsx:50` → drop the hardcoded Vercel URL.
3. Delete `AdminPlaceholder` + unused `TopLoadingBar` import.
4. `product.controller.ts:505` → pino logger.
5. Extract `FREE_DELIVERY_THRESHOLD_PAISA` to `shared/`.
6. Simplify `vite.config.ts` `dedupe`.

---

## ✅ Progress log

**2026-06-15 — Real data wired + demo subsystem removed (verified):**
- `vite.config.ts` dev proxy now points at the live Railway backend (with `cookieDomainRewrite` so auth works). Localhost + the Claude preview now show the **real 426 products** — verified via screenshot and a live API call. ⚠️ **Dev now hits PRODUCTION data** — product create/edit/delete done in the local admin affects real records.
- Deleted `client/src/lib/demoProducts.ts` and every demo fallback: `services/products.ts` (fetchProducts / featured / slug / autocomplete) and `services/categories.ts`. Removed the orphaned `buildDemoProductUrl` + `sharpen` import from `lib/cloudinary.ts` (also killed a hardcoded `dzhj5tgyv` cloud name).
- `FlashDeals.tsx` now shows only real campaign products (hides when none) — original A1 fix.
- Added a proper **error state** to `ProductsPage` (it was missing — a real API failure would have wrongly shown "adjust your filters"). `ProductDetailPage` already handled errors.
- Deleted `.github/workflows/deploy.yml` (the unused GitHub Pages deploy).
- `npm run typecheck --workspace=client` passes clean; no console errors.

**New finding discovered during this work (added to backlog):**
- **[P2] [HARDCODED / RULE-VIOLATION]** Product images are hot-linked from `chaldn.com` (external URLs returned as-is by `getOptimizedImageUrl`), **not** served through Cloudinary — this breaks the CLAUDE.md "images always via Cloudinary transformations" rule (loses optimization, and you depend on a competitor's CDN staying up). Fix: re-host product images to Cloudinary, or route external URLs through Cloudinary fetch.

**2026-06-15 — Section A (FIX) completed:**
- ✅ A1 Flash Deals — real campaign products only (folded into the demo removal above).
- ✅ `lib/api.ts` — the "infinite refresh loop" P1 was a **false alarm** (`_retry` already guards it). Applied 2 minor hardenings anyway: queued retries now set `_retry`; refresh-path check uses `.endsWith` not `.includes`.
- ✅ Admin type safety — added `user?: { id; name; email }` to `ApiOrder`; removed all **5** inline `(order as {...})` casts in DashboardPage, OrdersListPage (×2), OrderDetailPage (×2).
- ✅ Bulk status change (ProductsListPage) — `Promise.all` → `Promise.allSettled` with accurate ok/failed counts; always clears selection + invalidates cache.
- ❌ Verified **false positives** (no change): coupon `req.user?.sub` (already correct — the suggested `!` would be worse), and category `/reorder` route order (GET `/:slug` vs POST `/reorder` — different methods can't collide).
- Every change passes `tsc` clean.

**2026-06-15 — Section C (IMPROVE) completed:**
- ✅ Extracted shared primitives: `hooks/useDebounce.ts`, `components/ui/Spinner.tsx`, `components/ui/ToggleSwitch.tsx`, `components/ui/Badge.tsx` (tone-based). Replaced ~10 duplicated copies across ProductsListPage, CouponsPage, CampaignsPage, InventoryPage.
- ✅ The 3 status badges (product / coupon / campaign) now map their own status→tone and render the shared `<Badge>` — chrome + color palette centralized, call sites unchanged.
- ✅ `ProductCard` wishlist toggle now shows an error toast on failure (was silent).
- ✅ Delivery pricing centralized in `shared/`: `FREE_DELIVERY_THRESHOLD_PAISA`, `DELIVERY_FEE_PAISA`, `COD_SURCHARGE_PAISA`. Wired across CartDrawer, OrderSummary, CheckoutPage **and** `server/order.controller.ts` — client display and server charge can no longer diverge.
- ⏭️ Left `cartStore.ts` hardcoding `99_900`/`6_000` (stable-contract rule) — values still match shared; should adopt the shared constants when the contract freeze lifts.
- ❌ Scout inaccuracy: `ToggleSwitch` was 2 copies, not 3 — CategoriesPage has a *different* labeled `Switch` (left alone).
- Verified: `shared` build + client `tsc` + server build all clean; storefront renders (16 product links, 0 console errors).
- 🔭 New backlog item: the order total is still computed in 3 places (store, OrderSummary, CheckoutPage header) — constants are now shared, but the *calculation* could be unified into one shared helper next.

---

# Phase II — Homepage feature build-out

Decided 2026-06-15. Goal: make the homepage real — every label works, nothing fake (or clearly "Coming soon"). Each item verified with `tsc` + preview before moving on.

**Decisions made:**
- **Free delivery → ৳1500** (was ৳999). ⚠️ Revenue change. Correct implementation must update `cartStore` (the stable-contract store that actually computes the fee) or the cart will *show* ৳1500 while still giving free delivery at ৳999 — confirm before touching the store.
- **Promo % banners (40% off, extra 15%) → keep as-is** this round (not wired to live campaigns).
- **Member Exclusive + Ayra Points → deferred**; show **"Coming soon"** labels until built as dedicated projects.
- **Ayra Fresh+** = curated collection of existing fresh categories: Fresh Produce, Fruits, Vegetables, Dairy & Eggs, Fish & Seafood, Meat & Poultry, Bakery & Bread (no schema change).

| # | Feature | Plan | Size | Status |
|---|---|---|---|---|
| 1 | Help Center | New `/help` FAQ/support page + wire the dead nav link | 🟢 | ✅ done |
| 2 | Returns | New `/returns` policy page + wire link (request workflow = later) | 🟢 | ✅ done |
| 3 | New Arrivals | Home section + route using existing `newest` sort + nav link | 🟢 | ✅ done |
| 4 | Ayra Fresh+ | Fresh-categories collection landing + nav | 🟡 | ✅ done (filter needs deploy) |
| 5 | Best Sellers | Backend aggregate (top by units sold) + endpoint + section + nav | 🟡 | ✅ done (ranking needs deploy) |
| 6 | Free delivery ৳1500 | Shared constant + `cartStore` + consistent display text | 🟢 | ✅ done |
| 7 | "Coming soon" labels | Tag the Member Exclusive + Ayra Points UI | 🟢 | ✅ done |

**Later (planned projects, not this batch):** Ayra Points loyalty system · Membership system · Returns request workflow.

**Feature 5 — Best Sellers (2026-06-16):** Ranked via a `groupBy` on `order_items` (real units sold, excluding CANCELLED/REFUNDED, ACTIVE products only), routed through the existing `collection=best-sellers` param — one code path serves both the home section and the paginated page (no new endpoint, no schema migration). Self-contained branch in `getProducts` paginates over the ranked-ID set and preserves rank order; cached 10 min. ProductsPage shows a "Best Sellers" heading and hides the filter sidebar + sort (curated ranked view). Nav links fixed (sidebar + footer `?sort=popular` → `?collection=best-sellers`). ⚠️ **Ranking is server-side** — live Railway strips the unknown param pre-deploy and shows the default list under the right heading (same caveat as Fresh+). Verified spotlight layout + rank medallions live.

**Home sections redesign (2026-06-16):** Featured / Best Sellers / New Arrivals were three near-identical grids. Redesigned into one cohesive system, three distinct rhythms — shared themed `SectionHeader` (icon chip · English eyebrow · small Bengali accent · heading), reusing `ProductCard` (no cart-logic duplication, no contract changes):
- **Featured** — plum, "নির্বাচিত", calm editorial grid (baseline).
- **Best Sellers** — gold, "সবার পছন্দ", #1 spotlight (hero ~368px) + 2×2 ranked runners-up with medallions + "#1 Best Seller · জনপ্রিয়" trophy ribbon.
- **New Arrivals** — pink, "নতুন এসেছে", horizontal "just landed" scroll rail (snap + desktop arrows + edge fades) + "NEW · নতুন" card badges.
English-primary, small meaningful Bengali (Hind Siliguri) per the design language. Verified mobile (screenshots) + desktop (DOM measurements). Typechecks clean.

**Feature 6 — Free delivery ৳1500 (2026-06-16):** Bumped `FREE_DELIVERY_THRESHOLD_PAISA` 99_900 → 150_000 in `shared/`. Critically, `cartStore` now **imports** the shared constants (was hardcoding `99_900`/`6_000`) so the cart *charges* the same threshold it *displays* — public store API unchanged. Updated copy: home marquee + header announcement bar `৳999 → ৳1,500` (PromoStrip + HelpPage already said ৳1,500 — now consistent). Server `order.controller` already aliases the shared constant (live after deploy). Updated the `orders.test.ts` free-shipping test to the new threshold; all 18 server tests pass. Verified live: cart drawer shows "Add ৳1432.00 more for free delivery" (= 1500 − 68), proving the new threshold is active (no stale-bundle bug).

**Feature 7 — "Coming soon" labels (2026-06-16):** Member Exclusive + Ayra Points PromoStrip cards now carry a "⏰ Coming Soon" badge and their fake CTAs ("Join Now" → unrelated link, "Redeem Now" → /account) are replaced with non-actionable "Coming Soon" placeholders. Dropped the misleading "640 more to Platinum tier" personal-data line. Also fixed the header "Gold Member" badge, which falsely told *every* logged-in user they were a Gold Member (and linked to fresh-plus) → now a non-asserting "Gold · Soon" teaser. Teaser visuals kept (clearly upcoming, not live).

**Bonus fix (2026-06-15):** Added a global `ScrollToTop` (`components/common/ScrollToTop.tsx`) so client-side navigation starts at the top (respects browser back/forward). Verified: scroll 1500→0 on link click.

**Finding — broken nav params (still to address):** several nav links pass query params `ProductsPage` ignores → they silently show the default list: `?onSale=true` (Offers), `?view=brands` (Brands), `?deals=true` (Flash Deals), `?isFeatured=true` (Featured "view all"). `?sort=popular` (Best Sellers) handled in feature #5; `?collection=fresh-plus` (Ayra Fresh+) in #4; New Arrivals fixed.

**Feature 4 + contextual heading (2026-06-15):** Added a `collection=fresh-plus` query param (shared schema → server filter by the 7 fresh category slugs → client wiring) and a **contextual page heading** on `ProductsPage` (Ayra Fresh+ / New Arrivals / category name / search results / All Products) — so clicking a nav item lands on a clearly-labeled page. Verified headings render. ⚠️ **The Fresh+ *filter* runs server-side** — until the server is redeployed to Railway, the page shows all products under the right heading. (Same applies to the earlier `order.controller` delivery-constant change.)
