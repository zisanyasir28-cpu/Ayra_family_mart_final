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
- **Runtime**: Node.js 22+ + Express 5 + TypeScript 6 (strict mode)
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
