# Superstore — Production Build

## Business context
Online superstore for Bangladesh. Customers buy groceries, daily goods, electronics, clothing, household products. Admin manages products, pricing, orders, discounts, and campaigns.

## Tech stack
Frontend: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Zustand + TanStack Query v5 + React Hook Form + Zod + React Router v6 + Framer Motion
Backend: Node.js 20 + Express 5 + TypeScript + Prisma ORM + Zod (validation) + Helmet + express-rate-limit + morgan
Database: PostgreSQL (Supabase) + Redis (Upstash, for caching + sessions)
Storage: Cloudinary (images)
Search: PostgreSQL full-text search (pg_trgm extension) — upgrade to Meilisearch in v2
Payments: SSLCommerz (primary) + COD
Email: Nodemailer (Gmail SMTP) — upgrade to Resend in v2
SMS: optional Twilio integration (stubbed)
Deployment: Vercel (frontend) + Railway (backend) + Supabase (DB) + Upstash (Redis)
Monitoring: Sentry (errors) — stub the integration
Testing: Vitest (unit) + Supertest (API integration tests)

## Architecture
Monorepo: /client (React), /server (Express), /shared (types + utils used by both)
API: RESTful, versioned at /api/v1/
Auth: httpOnly refresh token cookie + short-lived access token (Bearer)
Roles: CUSTOMER, ADMIN, SUPER_ADMIN

## Non-negotiable code quality rules
- TypeScript strict mode everywhere — no `any` types
- Every API endpoint has input validation (Zod schemas in /shared/schemas/)
- Every controller wrapped in asyncHandler — no unhandled promise rejections
- All secrets via environment variables — never hardcoded
- Database queries via Prisma only — no raw SQL except for search
- Consistent error response format: { success: false, error: { code, message, details? } }
- Consistent success response format: { success: true, data: {...}, meta?: { pagination } }
- All money values stored as integers (paisa/cents) in DB, converted to decimal only in response
- Images always served via Cloudinary transformations (never raw upload URLs)
- All admin routes gated by requireAdmin middleware
- Rate limiting on auth, payment, and search endpoints
- CORS: allow only CLIENT_URL from env
- HTTP security headers via Helmet
