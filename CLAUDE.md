# Ayra Family Mart — Production Build

## Business context
Online superstore for Bangladesh. Customers buy groceries, daily goods, electronics, clothing, and household products. Admin manages products, pricing, orders, discounts, and campaigns. UI is bilingual: English primary, Bangla accents on featured headings and category labels. All prices in BDT (৳), stored as integer paisa in the DB.

## Tech stack

### Frontend (`/client`)
- **Runtime**: React 19.2 + Vite 8 + TypeScript 6 (strict mode)
- **Styling**: Tailwind CSS 3.4 (Tailwind v4 migration in progress — see Chunk A2 in the redesign plan)
- **Components**: bespoke components in `client/src/components/`; Radix UI primitives are available but the customer storefront uses custom-built primitives (`Accordion`, `RadioCard`, `Stepper`, etc.) for full design control. shadcn-style copy-in pattern is supported.
- **State**: Zustand 5 (`cartStore`, `authStore`, `themeStore`)
- **Server state**: TanStack Query 5
- **Forms**: React Hook Form 7 + `@hookform/resolvers` 3 (zod resolver)
- **Validation**: Zod 3 (shared with backend; future migration to Zod 4 tracked)
- **Routing**: React Router 7 (data routers)
- **Animation**: Motion 12 (the renamed `framer-motion` — imports are `motion/react`)
- **Icons**: lucide-react 1
- **Dates**: date-fns 4
- **Charts** (admin only): Recharts 3
- **Errors**: `@sentry/react` 10 (stubbed; activates when `VITE_SENTRY_DSN` is set)
- **PWA**: `vite-plugin-pwa` 1.3 + Workbox 7

### Backend (`/server`)
- **Runtime**: Node.js 24+ (Active LTS — Krypton, v24.16.0 as of May 2026) + Express 5 + TypeScript 6 (strict mode)
- **ORM**: Prisma 6 (PostgreSQL provider)
- **Validation**: Zod 3 (via `@superstore/shared`)
- **Security**: Helmet 7, `express-rate-limit` 7, `hpp`, `xss-clean`, `express-mongo-sanitize`, cookie-parser, CORS allow-list from env
- **Auth**: bcryptjs for password hash, jsonwebtoken for access tokens, httpOnly refresh cookie
- **Logging**: pino + pino-http (pretty in dev), morgan request log
- **Errors**: `@sentry/node` 8 (stubbed)
- **Uploads**: multer + Cloudinary 2 SDK
- **Email**: nodemailer 6 (Gmail SMTP — Resend planned for v2)
- **Compression**: `compression` middleware
- **Testing**: Vitest 4 + Supertest 7

### Shared (`/shared`)
- Re-exports `constants`, `types`, `schemas` consumed by both client and server.
- Compiled with TypeScript 6.

### Data layer
- **Database**: PostgreSQL (Supabase managed)
- **Cache + sessions**: Redis (Upstash)
- **Search**: PostgreSQL full-text + `pg_trgm` extension (Meilisearch planned for v2)
- **Storage**: Cloudinary (images served via on-the-fly transformations)

### Integrations
- **Payments**: SSLCommerz (primary) + Cash on Delivery
- **SMS**: Twilio stubbed (optional)

### Tooling
- **Monorepo**: npm workspaces (`client`, `server`, `shared`); root scripts via `concurrently`
- **Linting**: ESLint (client)
- **Testing**: Vitest 4 + Testing Library (client), Vitest 4 + Supertest (server)
- **Deployment**: Vercel (frontend) + Railway (backend) + Supabase (DB) + Upstash (Redis). Note: `client/vite.config.ts` also configures a GitHub Pages base for preview builds — confirm with the owner which is the production target before pushing release artifacts.

## Architecture
- **Monorepo layout**: `/client` (React), `/server` (Express), `/shared` (types + utils)
- **API**: RESTful, versioned at `/api/v1/`
- **Auth**: httpOnly refresh token cookie + short-lived access token (Bearer header)
- **Roles**: `CUSTOMER`, `ADMIN`, `SUPER_ADMIN`
- **Theming**: client supports `light` / `dark` / `system` via `themeStore` + inline FOUT script in `client/index.html`. All design tokens are HSL CSS variables defined in `client/src/styles/globals.css` and exposed through `client/tailwind.config.ts`. Dark mode is the default.

## Non-negotiable code-quality rules
- TypeScript strict mode everywhere — **no `any` types**.
- Every API endpoint has input validation via Zod schemas in `shared/src/schemas/`.
- Every controller wrapped in `asyncHandler` — no unhandled promise rejections.
- All secrets via environment variables — never hardcoded.
- Database queries via Prisma only — no raw SQL except for search.
- Consistent error response format: `{ success: false, error: { code, message, details? } }`.
- Consistent success response format: `{ success: true, data: {...}, meta?: { pagination } }`.
- All money values stored as integers (paisa/cents) in the DB, converted to decimal only in the response.
- Images always served via Cloudinary transformations (never raw upload URLs).
- All admin routes gated by `requireAdmin` middleware.
- Rate limiting on auth, payment, and search endpoints.
- CORS: allow only `CLIENT_URL` from env.
- HTTP security headers via Helmet.

## Customer storefront design language
The customer-facing storefront is being redesigned in small chunks (see `.claude/plans/`). Target visual direction:
- Deep purple / navy background with soft glow
- Hot pink / magenta primary CTAs
- Gold / yellow highlights for offers and discounts
- Fresh emerald for the "Ayra Fresh+" / organic line
- Orange for "Bazar Deal" promotional surfaces
- Display font: Plus Jakarta Sans; script accent: Caveat; body: Inter; Bangla: Hind Siliguri (used sparingly on accent phrases only)
- Persistent left vertical sidebar nav on desktop (`lg+`); existing mobile drawer + bottom tab bar preserved

All Zustand stores, TanStack Query hooks, and API service modules are stable contracts — UI work must not modify them.

---

## Phase I — Pixel-Parity Redesign Progress

**Goal**: Component-by-component carbon copy of the dark-mode reference screenshot. Light mode deferred until dark mode parity is complete.

**Live preview**: https://zisanyasir28-cpu.github.io/Ayra_family_mart_final/

**Worktree**: `.claude/worktrees/intelligent-kepler-372c38` (branch `claude/intelligent-kepler-372c38`)
**Git flow**: commit on worktree branch → push → ff-merge to `main` → push → GH Pages auto-deploys

**Full plan file**: `.claude/plans/goofy-watching-babbage.md`

### Completed chunks ✅

| Chunk | Component | What was done |
|---|---|---|
| I1 | `Logo.tsx` | Horizontal layout — leaf LEFT, "Ayra® / FAMILY MART" text column RIGHT |
| I2 | `CustomerLayout.tsx` header | All Categories dropdown, Location selector, Gold Member badge, search bar rework |
| I3 | `HeroBanner.tsx` | Real Unsplash circular photo inside neon ring, ring wrapper sizing |
| I4 | `HeroBanner.tsx` CTAs | Shop Now: pink→orange gradient pill. Explore Deals: glass-gradient ring border |
| I5 | `ProductCard.tsx` | Hot-pink discount chip (`bg-saffron`), always-on glow on `+` button |
| I6 | `CustomerSidebar.tsx` | Chevron on active pill, 28px outlined icon circles, basket photo, gradient headphone avatar, 24/7 + Live Chat |
| I7 | `FeatureBanners.tsx` | Real Unsplash product photos (veggie crate / cooking oil / produce bag) replacing all emojis |
| I8 | `CustomerSidebar.tsx` | Glass-gradient ring borders on both bottom cards (`p-[1.5px]` wrapper), plum→sage for Shop Now |
| I9 | `CustomerSidebar.tsx` | Decorative background art (CSS blur orbs + inline SVG watermarks), sage "Shop Now", text-shadow on buttons |
| I10 | `PromoStrip.tsx` | SVG delivery-truck watermark on Free Delivery card; SVG coin-stack watermark on Ayra Points card |
| I11 | `CategoryStrip.tsx` | Inline sage `<Leaf>` icon replaces 🌿 emoji in section heading |
| I12 | `FlashDeals.tsx` | Removed redundant ⚡ emoji from h2 (Zap icon circle already handles it) |
| I13 | `WhyShopWithUs.tsx` | Ambient sage/saffron/plum glow orbs added to section background |
| I14 | `NewsletterBar.tsx` | Colorful Google Play SVG + Apple SVG replace ▶ and 🍎 emoji in app-download buttons |

### Key design patterns established (reuse these)

- **Gradient ring border** (Explore Deals, both sidebar cards): outer `div` with `bg-gradient-to-r ... p-[1.5px] rounded-2xl`, inner `div` with `bg-bg/60 backdrop-blur-md rounded-[calc(1rem-1.5px)]`
- **Glass shine overlay**: `pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(0_0%_100%/0.10)_0%,transparent_55%)]`
- **CSS glow orbs**: `pointer-events-none absolute h-28 w-28 rounded-full bg-<token>/<opacity> blur-3xl`
- **SVG watermarks**: inline `<svg aria-hidden className="pointer-events-none absolute ... opacity-[0.08]">` with lucide paths
- **Text shadow on buttons**: `[text-shadow:0_1px_4px_rgba(0,0,0,0.4)]`
- **Active sidebar pill**: `bg-gradient-to-r from-saffron to-blush text-bg font-bold shadow-[...]` + `<ChevronRight>` on right
- **Inactive icon circles**: `ring-1 ring-line/40 h-7 w-7 rounded-full flex items-center justify-center`

### Up next (user will share reference crops)
- Footer — 4-column layout check (I15)
- Then: remaining customer pages (Products, ProductDetail, Checkout, Orders, Account, Wishlist)
