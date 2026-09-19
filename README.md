# CleanSera Business Dashboard (Frontend)

Next.js App Router frontend for **CleanSera** — multi-tenant cleaning business SaaS.

Businesses use this app to manage roster, bookings, dispatch, payroll, branding, and more. Customers book and manage jobs through a **unified branded experience** per business. Cleaners are owned by their employer business (onboard / offboard), not by a marketplace.

**Backend:** [cleansera_sass](https://github.com/olumuyiwaa/cleansera_sass)

---

## Table of contents

- [What this app includes](#what-this-app-includes)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Key routes](#key-routes)
- [URL redirects](#url-redirects)
- [Features by area](#features-by-area)
- [Realtime](#realtime)
- [Scripts](#scripts)
- [Related repositories](#related-repositories)

---

## What this app includes

| Surface | Description |
|---------|-------------|
| **Business dashboard** | Authenticated workspace for owners and managers |
| **Public site** | Branded marketing + booking pages per business (`/[subdomain]`) |
| **Customer portal** | Self-service bookings under the same brand (`/[subdomain]/portal`) |
| **Book now / widget** | Customer booking flows (`/book-now/[slug]`, embeddable widget) |
| **Auth** | Sign in, register business, invites, 2FA |
| **Platform admin** | Super-admin tooling under `/admin` |

Customer-facing pages share one tree so the storefront and “My Account” feel like a single product, not two apps.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Charts | ApexCharts |
| Calendar | FullCalendar |
| Maps | react-jvectormap (+ Google Maps via env) |
| Drag & drop | react-dnd |
| Realtime | socket.io-client |
| HTTP | Axios |
| PDF / export | jsPDF, xlsx |
| Other | react-toastify, flatpickr, swiper, lottie-react |

---

## Repository structure

```
cleansera_sass_frontend/
├── public/
│   └── embed.js                 # Embeddable booking widget script
├── src/
│   ├── app/
│   │   ├── (dashboard)/         # Authenticated business UI
│   │   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   ├── calendar/
│   │   │   ├── dispatch/
│   │   │   ├── cleaners/
│   │   │   ├── customers/
│   │   │   ├── services/
│   │   │   ├── pricing/
│   │   │   ├── payroll/
│   │   │   ├── inventory/
│   │   │   ├── compliance/
│   │   │   ├── website/         # Branding & public site content
│   │   │   ├── subscription/
│   │   │   ├── team/
│   │   │   ├── messages/
│   │   │   ├── reports/
│   │   │   └── …
│   │   ├── (full-width-pages)/
│   │   ├── [subdomain]/        # Unified customer experience
│   │   │   ├── layout.tsx       # Shared branded layout
│   │   │   ├── page.tsx         # Public storefront
│   │   │   └── portal/
│   │   │       └── page.tsx     # Customer self-service portal
│   │   ├── admin/               # Platform admin
│   │   ├── auth/
│   │   ├── book-now/[slug]/    # Standalone booking flow
│   │   ├── api/                 # Client API modules & types
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── site/                # Storefront sections (hero, services, …)
│   │   ├── widget/              # Booking modal / form
│   │   └── …
│   ├── context/
│   ├── hooks/
│   ├── icons/
│   ├── layout/
│   └── lib/
├── env.frontend.example
├── env.local.example
├── next.config.ts               # Includes legacy URL redirects
└── package.json
```

---

## Prerequisites

- Node.js 18+ (20 recommended)
- Running CleanSera API ([cleansera_sass](https://github.com/olumuyiwaa/cleansera_sass)) on the URL you configure
- Stripe publishable key (test) for subscription UI
- Optional: Google Maps API key for address / service-area UX

---

## Local setup

```bash
# 1. Clone
git clone https://github.com/olumuyiwaa/cleansera_sass_frontend.git
cd cleansera_sass_frontend

# 2. Install
npm install

# 3. Environment
cp env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_BASE_URL to your API
# (default http://localhost:8000/api/v1)

# 4. Start
npm run dev
```

App runs at `http://localhost:3000` by default.

Ensure the backend is running and CORS / `FRONTEND_URL` on the API allow this origin.

### Smoke-test customer routes

| URL | Expected |
|-----|----------|
| `http://localhost:3000/{subdomain}` | Public storefront |
| `http://localhost:3000/{subdomain}/portal` | Customer portal (OTP login) |
| `http://localhost:3000/book-now/{subdomain}` | Booking flow |
| `http://localhost:3000/site/{subdomain}` | Redirects → `/{subdomain}` |
| `http://localhost:3000/portal/{subdomain}` | Redirects → `/{subdomain}/portal` |

Replace `{subdomain}` with a real business subdomain from your seed/API data.

---

## Environment variables

Copy from `env.local.example` or `env.frontend.example`. Important keys:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Canonical app URL |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base (`…/api/v1`) |
| `API_URL` | Server-side API base (usually same host) |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io origin for live dispatch / messaging |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Platform subscription checkout |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps & geocoding in the UI |
| `NEXT_PUBLIC_DO_SPACES_CDN` | Public CDN base for uploaded assets |
| `NEXT_PUBLIC_FEATURE_*` | Feature flags (subscription, reports, chat, 2FA, SMS) |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support contact |
| `NEXT_PUBLIC_PRIVACY_POLICY_URL` / `NEXT_PUBLIC_TERMS_URL` | Legal links |

Do not commit `.env.local`.

---

## Key routes

### Dashboard (authenticated)

| Path | Area |
|------|------|
| `/dashboard` | Overview |
| `/bookings` | Job list & detail |
| `/calendar` | Calendar views |
| `/dispatch` | Assignment / capacity |
| `/cleaners` | Roster, invite, status, documents |
| `/customers` | Customer CRM |
| `/services` | Service catalog |
| `/pricing` | Rates, deposits, cancellation policy |
| `/coupons` / `/gift-cards` / `/waitlist` | Offers & demand |
| `/recurring-schedules` | Recurring templates |
| `/payroll` | Earnings & payouts |
| `/inventory` | Stock & locations |
| `/compliance` | Documents, training, audits |
| `/checklist-templates` | Job checklists |
| `/website` | Branding, theme, public content |
| `/team` | Staff invites & roles |
| `/messages` / `/notifications` | Communication |
| `/reports` | Analytics |
| `/reviews` | Customer reviews |
| `/subscription` | CleanSera plan billing (platform fee only) |
| `/business-settings` | Business profile, hours, service areas |
| `/onboarding` | First-run setup checklist |
| `/support-tickets` | Support |
| `/audit-trail` | Audit log |
| `/profile` | User profile |

### Public & customer (unified)

| Path | Area |
|------|------|
| `/[subdomain]` | Branded public storefront |
| `/[subdomain]/portal` | Customer portal (OTP, bookings, cancel / reschedule / review / tip) |
| `/book-now/[slug]` | Full-page booking flow |
| `/auth/*` | Login, register, invites |

Job payments use **Stripe Connect** on the business account. The `/subscription` page is only for the business’s CleanSera plan.

### Admin

| Path | Area |
|------|------|
| `/admin/*` | Platform administration |

---

## URL redirects

Legacy paths remain valid via permanent redirects in `next.config.ts`:

| Old | New |
|-----|-----|
| `/site/:subdomain` | `/:subdomain` |
| `/site/:subdomain/:path*` | `/:subdomain/:path*` |
| `/portal/:slug` | `/:slug/portal` |
| `/portal/:slug/:path*` | `/:slug/portal/:path*` |

Update emails, SMS, and dashboard-generated links to the new paths when convenient. Redirects keep old links working in the meantime.

---

## Features by area

### Business operations

- Bookings (one-time + recurring), calendar, dispatch
- Cleaner lifecycle: invite → documents → activate → suspend / offboard
- Team roles: owner, manager, org admin (multi-location)
- Services, pricing engine, coupons, gift cards, waitlist
- Payroll: compensation rules, earnings, payout batches
- Inventory & compliance modules
- Checklists and job workflows
- Messaging and notifications
- Reports and audit trail

### Public experience

- Themed public site (colors, hero, about, testimonials, FAQ, gallery, social)
- Subdomain and custom-domain ready (configured via API)
- Booking modal on the storefront + full `/book-now` flow
- Customer portal under the same subdomain (`/[subdomain]/portal`)
- Header “My Account” links storefront → portal

### Platform

- Subscription management (Starter / Growth / Pro style plans)
- Stripe Connect status for accepting customer payments
- Feature flags for gradual rollout

---

## Realtime

Socket.io client connects to `NEXT_PUBLIC_SOCKET_URL` for live updates (dispatch board, messaging, etc.). Ensure the backend Socket.io server is running and CORS is configured.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

---

## Related repositories

| Repo | Role |
|------|------|
| [cleansera_sass](https://github.com/olumuyiwaa/cleansera_sass) | Backend API |
| [cleansera_cleaner_app](https://github.com/olumuyiwaa/cleansera_cleaner_app) | Cleaner mobile app (Flutter) |
| [cleansera_sass_website](https://github.com/olumuyiwaa/cleansera_sass_website) | Marketing site |

---

## License

Private — all rights reserved.