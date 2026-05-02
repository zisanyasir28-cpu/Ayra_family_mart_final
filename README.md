# 🛒 Online Superstore — 10-Day Solo Sprint Plan

> **Realistic 10-day solo MVP plan — no fluff.**
> One developer. 10 days. The goal is a **working, shippable MVP** — not a 24-week enterprise system.
> This plan cuts scope ruthlessly and focuses only on what makes the store actually usable on day 10.

---

## 📊 At a Glance

| | |
|---|---|
| 👨‍💻 **Team size** | 1 developer |
| ⏱️ **Deadline** | 10 days |
| 🎯 **Goal** | Shippable MVP — live, paid, working |
| 🕗 **Daily hours** | 8h/day (4h backend morning · 4h frontend afternoon) |
| 💰 **Infrastructure cost** | $0 (free tier stack) |

---

## ✅ What You WILL Have in 10 Days

| Feature | Status |
|---|---|
| Live product listing with categories | ✅ Included |
| Working cart and checkout | ✅ Included |
| Payment gateway (SSLCommerz / bKash / COD) | ✅ Included |
| Simple admin panel to manage products | ✅ Included |
| Discount & coupon system | ✅ Included |
| Order management for admin | ✅ Included |
| Customer login & order history | ✅ Included |
| Deployed and publicly accessible | ✅ Included |

## ❌ What Gets DEFERRED (post-launch)

| Feature | Reason |
|---|---|
| Elasticsearch search | Use basic DB search for now |
| Push / SMS notifications | Nice-to-have, not essential |
| Loyalty points & referral system | Phase 2 |
| Product reviews & ratings | Phase 2 |
| Recommendation engine | Phase 2 |
| Advanced analytics dashboard | Phase 2 |
| Redis caching layer | Not needed at MVP traffic |
| PWA / mobile app | Phase 3 |

---

## 🛠️ Tech Stack — Trimmed for Speed

> **Philosophy:** Every tool below was chosen to eliminate setup time. Supabase saves 1 day vs raw AWS RDS. Railway saves 1 day vs Docker + EC2. Cloudinary saves half a day vs S3. All free tier. All swappable later.

### Frontend
![React](https://img.shields.io/badge/React.js-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![shadcn](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat&logo=shadcnui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-orange?style=flat)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=flat&logo=reactquery&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)

### Database & Storage
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_(Supabase)-4169E1?style=flat&logo=postgresql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white)

### Payments
![SSLCommerz](https://img.shields.io/badge/SSLCommerz-green?style=flat)
![bKash](https://img.shields.io/badge/bKash-E2136E?style=flat)
`COD (Cash on Delivery)`

### Deployment
![Vercel](https://img.shields.io/badge/Vercel_(frontend)-000000?style=flat&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway_(backend)-0B0D0E?style=flat&logo=railway&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase_(DB)-3ECF8E?style=flat&logo=supabase&logoColor=white)

---

## 📅 Day-by-Day Sprint Plan

> Each day = **8 hours**. Morning = backend/API. Afternoon = frontend/UI.
> Click any section below to expand the full task breakdown.

---

<details>
<summary><b>🔵 Day 1 — Project Setup + Database Schema</b> &nbsp;|&nbsp; <i>Repo, env, Prisma models, auth skeleton</i></summary>

### ☀️ Morning (4h) — Foundation

| Task | Time |
|---|---|
| Create Vite + React + Tailwind project | 45m |
| Node.js + Express backend scaffold | 30m |
| Supabase PostgreSQL project + connect | 30m |
| Prisma schema: `User`, `Product`, `Category`, `Order`, `OrderItem`, `Coupon` | 2h |
| Run migrations | 15m |

### 🌆 Afternoon (4h) — Auth & Config

| Task | Time |
|---|---|
| JWT auth: register, login, refresh token endpoints | 2h |
| Auth middleware (protect routes) | 30m |
| Cloudinary account + image upload util | 45m |
| Folder structure finalize, `.env` setup | 30m |
| Push to GitHub | 15m |

**✅ End of Day 1 deliverable:** Running dev server, connected DB, working auth API.

</details>

---

<details>
<summary><b>🟠 Day 2 — Product & Category API + Admin Product UI</b> &nbsp;|&nbsp; <i>Full CRUD for products, category tree, image upload</i></summary>

### ☀️ Morning (4h) — Product API

| Task | Time |
|---|---|
| Product CRUD endpoints (create, read, update, delete) | 2h |
| Category endpoints | 45m |
| Image upload endpoint → Cloudinary | 45m |
| Product list with filter by category + search | 30m |

### 🌆 Afternoon (4h) — Admin Product UI

| Task | Time |
|---|---|
| Admin layout in React (sidebar + header) | 1h |
| Product list table in admin | 1h |
| Add / Edit product form (name, price, image, category, stock) | 1.5h |
| Delete product with confirm modal | 30m |

**✅ End of Day 2 deliverable:** Admin can add, edit, delete products with image upload.

</details>

---

<details>
<summary><b>🟢 Day 3 — Customer Storefront — Home & Product Pages</b> &nbsp;|&nbsp; <i>Hero banner, category grid, product cards, product detail</i></summary>

### ☀️ Morning (4h) — Home Page

| Task | Time |
|---|---|
| Navbar (logo, search, cart icon, login) | 1h |
| Home page: hero banner + category strip | 1.5h |
| Product card component (image, name, price, add-to-cart) | 1h |
| Featured products section on home | 30m |

### 🌆 Afternoon (4h) — Browse & Search

| Task | Time |
|---|---|
| Product listing page with category filter | 1.5h |
| Search bar — basic DB query (name contains) | 45m |
| Product detail page (images, price, description, add-to-cart) | 1.5h |
| Footer with basic links | 15m |

**✅ End of Day 3 deliverable:** Customers can browse, filter, and view any product.

</details>

---

<details>
<summary><b>🟣 Day 4 — Cart, Auth UI & Checkout Flow</b> &nbsp;|&nbsp; <i>Cart sidebar, login/register pages, checkout form</i></summary>

### ☀️ Morning (4h) — Cart & Auth

| Task | Time |
|---|---|
| Zustand cart store (add, remove, update qty, total) | 1h |
| Cart drawer/sidebar UI | 1.5h |
| Login page + Register page UI | 1h |
| Connect auth forms to API | 30m |

### 🌆 Afternoon (4h) — Checkout

| Task | Time |
|---|---|
| Checkout page: delivery address form | 1.5h |
| Order summary panel on checkout | 45m |
| Coupon code input field + validate API call | 45m |
| Protected route guard (redirect to login if not auth) | 30m |
| Order API: create order endpoint | 30m |

**✅ End of Day 4 deliverable:** Full shopping flow works — browse → cart → checkout (no payment yet).

</details>

---

<details>
<summary><b>🔴 Day 5 — Payment Gateway Integration</b> &nbsp;|&nbsp; <i>SSLCommerz + bKash + COD option + order confirmation</i></summary>

### ☀️ Morning (4h) — Payment Backend

| Task | Time |
|---|---|
| SSLCommerz sandbox account + API keys | 30m |
| Payment initiate endpoint (server-side) | 1.5h |
| IPN (payment notification) webhook handler | 1h |
| Success / fail / cancel redirect pages | 1h |

### 🌆 Afternoon (4h) — Confirmation & Testing

| Task | Time |
|---|---|
| COD (Cash on Delivery) option as alternative | 30m |
| Order status update after payment confirmed | 45m |
| Order confirmation page (thank you screen) | 45m |
| Email order receipt via Nodemailer (Gmail SMTP) | 1h |
| End-to-end test: place order → pay → confirm | 1h |

**✅ End of Day 5 deliverable:** Real money can be accepted. Orders are confirmed by email.

</details>

---

<details>
<summary><b>🩷 Day 6 — Admin Panel — Orders, Discounts & Campaigns</b> &nbsp;|&nbsp; <i>Order management, coupon builder, flash sale, holiday offer</i></summary>

### ☀️ Morning (4h) — Orders & Coupons

| Task | Time |
|---|---|
| Orders list page (all orders, filter by status) | 1h |
| Order detail view + status update dropdown | 1h |
| Coupon CRUD: code, type (% or flat), value, expiry, usage limit | 2h |

### 🌆 Afternoon (4h) — Campaigns

| Task | Time |
|---|---|
| Flash sale: mark products with sale price + duration | 1.5h |
| Holiday offer: campaign name, date range, discount % on category | 1.5h |
| Bulk price update tool (select products, apply % change) | 1h |

**✅ End of Day 6 deliverable:** Admin can manage all orders, create coupons, and run campaigns.

</details>

---

<details>
<summary><b>🌿 Day 7 — Customer Dashboard + Admin Summary</b> &nbsp;|&nbsp; <i>My orders, profile, low-stock alerts, sales overview</i></summary>

### ☀️ Morning (4h) — Customer Account

| Task | Time |
|---|---|
| Customer "My Account" page (profile, edit info) | 1h |
| My Orders page (list + status per order) | 1.5h |
| Order detail view for customer | 1h |
| Saved addresses management | 30m |

### 🌆 Afternoon (4h) — Admin Dashboard

| Task | Time |
|---|---|
| Admin home dashboard: today's orders, revenue, new customers | 2h |
| Low stock alert list (products below threshold) | 45m |
| Customer list in admin (name, email, total orders) | 1h |
| Admin profile + password change | 15m |

**✅ End of Day 7 deliverable:** Both customer and admin have their own full dashboards.

</details>

---

<details>
<summary><b>⚫ Day 8 — UI Polish, Responsiveness & Bug Fixing</b> &nbsp;|&nbsp; <i>Mobile layout, loading states, error messages, edge cases</i></summary>

> ⚠️ **This is your buffer day.** If Day 5 or 6 ran over, absorb it here without panic.

### ☀️ Morning (4h) — Responsive & UX

| Task | Time |
|---|---|
| Mobile responsive: navbar, product grid, cart | 2h |
| Loading skeletons on product list & detail | 1h |
| Empty states (cart empty, no orders yet) | 30m |
| Toast notifications (added to cart, order placed) | 30m |

### 🌆 Afternoon (4h) — Fixes & Edge Cases

| Task | Time |
|---|---|
| Form validation errors (all forms) | 1h |
| 404 page + error boundary | 30m |
| Out-of-stock product handling (disable add-to-cart) | 30m |
| Fix bugs found during full walkthrough | 2h |

**✅ End of Day 8 deliverable:** App is polished, works on mobile, no obvious broken flows.

</details>

---

<details>
<summary><b>🟠 Day 9 — Deployment & Security Hardening</b> &nbsp;|&nbsp; <i>Railway deploy, domain, HTTPS, rate limiting, CORS</i></summary>

### ☀️ Morning (4h) — Go Live

| Task | Time |
|---|---|
| Deploy backend to Railway (env vars, start cmd) | 1h |
| Deploy frontend to Vercel (build config) | 45m |
| Connect Supabase production DB | 30m |
| Custom domain setup + HTTPS (Vercel auto) | 1h |
| Environment variables audit | 45m |

### 🌆 Afternoon (4h) — Security

| Task | Time |
|---|---|
| CORS config (allow only your domain) | 30m |
| Rate limiting on auth + payment endpoints | 45m |
| Helmet.js security headers | 20m |
| SSLCommerz: switch sandbox → production keys | 30m |
| Full end-to-end test on live URL | 1.5h |
| DB backup cron job setup | 30m |

**✅ End of Day 9 deliverable:** Site is live on a real domain with HTTPS and security basics in place.

</details>

---

<details>
<summary><b>🟢 Day 10 — Final QA, Seed Data & Go Live</b> &nbsp;|&nbsp; <i>Test every flow, add real products, launch</i></summary>

### ☀️ Morning (4h) — Real Data

| Task | Time |
|---|---|
| Add real product data via admin panel | 1.5h |
| Upload real product images | 45m |
| Create first discount coupon for launch day | 15m |
| Full test: register → browse → add to cart → pay → get email | 1.5h |

### 🌆 Afternoon (4h) — Final QA & Launch 🚀

| Task | Time |
|---|---|
| Admin panel walkthrough (all features working) | 1h |
| Mobile device test (real phone) | 45m |
| Performance check: page load under 3s | 30m |
| Fix any critical bugs found | 1h |
| **LAUNCH — share the link** 🎉 | — |

**✅ End of Day 10 deliverable:** Live, real products, real payments, real customers. Done.**

</details>

---

## 📦 Admin Panel Features (Designed for Simplicity)

> Goal: A non-technical person can run the entire store without any help.

### 🛍️ Product Management
- Add product in **under 60 seconds** — fill name, price, upload image, done
- Bulk price editor — update 100 items at once with `%` change
- One-click stock toggle (in stock / out of stock)
- Category drag-and-drop organizer
- Product duplicate for similar items

### 🎟️ Discounts & Coupons
- Create coupon in **3 clicks** — code, amount, expiry
- `%` off or flat-amount discounts
- Per-customer usage limit (e.g. use only once)
- Minimum cart amount rules
- Auto-apply discount on specific categories

### 📢 Campaigns & Offers
- Holiday sale builder — pick dates, products, discount %
- Flash sale with countdown timer visible on storefront
- Buy X Get Y free rules
- First-order special discount for new customers

### 📋 Orders & Customers
- Order list with **color-coded status** (pending / shipped / delivered)
- One-click status update + email notify customer
- Customer profile view with order history
- Low stock alert dashboard
- Daily revenue summary on home screen

---

## 🗓️ Post-Launch Roadmap

| Timeline | Features to Add |
|---|---|
| **Week 2** | Product reviews · Wishlist · Google social login · SMS notifications · Better search |
| **Week 3–4** | Redis caching · Loyalty points · Referral system · Sales analytics charts · PWA setup |
| **Month 2+** | Elasticsearch · Recommendation engine · Mobile app · AWS migration · Multi-vendor |

---

## 💡 Survival Tips for a 10-Day Solo Build

```
01  Use shadcn/ui for every UI component — never build buttons, modals, or tables from scratch.
    This alone saves 10+ hours.

02  Work backend-first each morning, frontend in the afternoon.
    Never mix them in the same session — context switching kills speed.

03  Use a pre-built admin template like Tremor or shadcn/ui admin starter.
    Don't design the admin panel from scratch.

04  If any task takes more than 2x its estimated time, timebox it and move on.
    Come back on buffer day (Day 8 is your buffer).

05  Supabase + Railway + Vercel = 0 DevOps.
    Don't spend a single hour on server config — these platforms handle it all.

06  Each day, commit your work to GitHub before sleeping.
    If something breaks the next day, you can always roll back.
```

---

## 🗂️ Folder Structure

```
superstore/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   │   ├── home/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── account/
│   │   │   └── admin/        # All admin pages
│   │   ├── store/            # Zustand state (cart, auth)
│   │   ├── hooks/            # React Query hooks
│   │   ├── lib/              # API client, utils
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── routes/           # Express routes
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, error handler
│   │   ├── services/         # Business logic
│   │   └── utils/            # Cloudinary, email, etc.
│   ├── prisma/
│   │   └── schema.prisma     # DB schema
│   └── index.js
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔐 Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://...        # Supabase connection string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# SSLCommerz
SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASS=...
SSLCOMMERZ_IS_LIVE=false             # Set to true on Day 9

# Email (Gmail SMTP)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Quick Start (Local Dev)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/superstore.git
cd superstore

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase, Cloudinary, SSLCommerz keys

# 4. Run DB migrations
cd server && npx prisma migrate dev

# 5. Start both servers
# Terminal 1 (backend)
cd server && npm run dev

# Terminal 2 (frontend)
cd client && npm run dev
```

---

<div align="center">

**Built with React · Node.js · PostgreSQL · Tailwind CSS**

*10 days. One developer. Ship it.*

</div>7
