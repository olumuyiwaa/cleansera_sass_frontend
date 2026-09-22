# CleanSera Business Dashboard (Frontend)

Next.js App Router frontend for **CleanSera** — a multi-tenant cleaning
business SaaS. Businesses manage roster, bookings, dispatch, payroll, and
branding here; customers book and self-serve through a unified, branded
experience per business. Cleaners are owned by their employer business
(invited, onboarded, offboarded) — never by a shared marketplace.

Backend: [cleansera_sass](https://github.com/olumuyiwaa/cleansera_sass)

---

## Table of contents

- [What this app includes](#what-this-app-includes)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Routing](#routing)
- [Custom domains](#custom-domains)
- [Scripts](#scripts)
- [Related repositories](#related-repositories)

---

## What this app includes

| Surface | Description |
|---|---|
| **Business dashboard** | Authenticated workspace under `(dashboard)` — bookings, calendar, dispatch, roster, payroll, compliance, inventory, reports, branding |
| **Public storefront + portal** | Branded per-business experience at `/[subdomain]` and `/[subdomain]/portal`, sharing one route tree so they read as one product |
| **Book now / widget** | Standalone booking flow at `/book-now/[slug]`, and an embeddable widget script served from `/public/embed.js` |
| **Auth** | Sign in, register business, invites |
| **Platform admin** | Super-admin tooling under `/admin` — businesses, subscriptions, tickets, users |

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Charts | ApexCharts |
| Calendar | FullCalendar |
| Maps | react-jvectormap (world map), Google Maps JS API via env key |
| Drag & drop | react-dnd |
| Realtime | socket.io-client |
| HTTP | Axios |
| PDF / export | jsPDF (+ autotable), xlsx |
| Other | react-toastify, flatpickr, swiper, lottie-react, react-dropzone |

## Repository structure

```
cleansera_sass_frontend/
├── public/
│   └── embed.js                 # Embeddable booking widget script
├── src/
│   ├── middleware.ts             # Host-based tenancy — subdomain & custom-domain rewrite
│   ├── app/
│   │   ├── (dashboard)/          # Authenticated business UI
│   │   │   ├── bookings/ calendar/ dispatch/ cleaners/ customers/
│   │   │   ├── services/ pricing/ coupons/ gift-cards/ waitlist/
│   │   │   ├── recurring-schedules/ payroll/ inventory/ compliance/
│   │   │   ├── checklist-templates/ website/ subscription/ team/
│   │   │   ├── messages/ notifications/ reports/ reviews/
│   │   │   ├── business-settings/ onboarding/ support-tickets/
│   │   │   ├── audit-trail/ profile/ cleaner-documents/ dashboard/
│   │   ├── (full-width-pages)/
│   │   │   ├── (auth)/           # Sign in, register, invites
│   │   │   └── portal/
│   │   ├── [subdomain]/          # Unified customer experience
│   │   │   ├── layout.tsx        # Shared branded layout
│   │   │   ├── page.tsx          # Public storefront
│   │   │   └── portal/page.tsx   # Customer self-service portal
│   │   ├── admin/                # businesses/ subscriptions/ tickets/ users/
│   │   ├── auth/
│   │   ├── book-now/[slug]/      # Standalone booking flow
│   │   ├── services/
│   │   └── api/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── icons/
│   ├── layout/
│   └── lib/
├── env.frontend.example
├── env.local.example
├── next.config.ts
└── package.json
```

## Local setup

```bash
git clone https://github.com/olumuyiwaa/cleansera_sass_frontend.git
cd cleansera_sass_frontend
npm install
cp env.local.example .env.local
# set NEXT_PUBLIC_API_BASE_URL to your running cleansera_sass instance
npm run dev
```

Runs at `http://localhost:3000`. Make sure the backend's CORS /
`FRONTEND_URL` allows this origin.

### Smoke-test customer routes

| URL | Expected |
|---|---|
| `/{subdomain}` | Public storefront |
| `/{subdomain}/portal` | Customer portal |
| `/book-now/{subdomain}` | Booking flow |

Replace `{subdomain}` with a real business subdomain from your seed data.

## Environment variables

See `env.local.example` for the full list. Notable ones:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL`, `API_URL` | Backend API base |
| `NEXT_PUBLIC_SOCKET_URL` | Live dispatch/messaging updates |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Address autocomplete, service-area geofencing (defaults centered on Amsterdam) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Platform *subscription* checkout only — job payments happen on the business's own Stripe Connect account and don't touch this key |
| `NEXT_PUBLIC_DO_SPACES_CDN` | Public CDN base for uploaded photos/documents |
| `NEXT_PUBLIC_FEATURE_*` | Feature flags: subscription, reports, chat, 2FA, SMS |
| `NEXT_PUBLIC_APP_HOSTS` | Hostnames that serve this app itself (dashboard/admin/auth) — see Routing below |
| `NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN` | Root domain whose subdomains are tenant storefronts |

Do not commit `.env.local`.

## Routing

`src/middleware.ts` decides, per request, whether the Host header belongs
to this app itself or to a tenant storefront:

- A host in `NEXT_PUBLIC_APP_HOSTS` (e.g. `app.cleansera.nl`) is served
  as-is — dashboard, admin, auth, `/book-now` all resolve normally.
- A subdomain of `NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN` (e.g.
  `acme.cleansera.nl`) is rewritten to `/acme/...`.
- Anything else is checked against the backend's public domain resolver —
  if it matches a **verified** custom domain, it's rewritten the same way;
  otherwise the request 404s rather than falling through to an internal
  route.

A fixed set of subdomains (`www`, `app`, `api`, `admin`, `auth`,
`dashboard`, `book-now`, `widget`, ...) is reserved so a business can never
register a subdomain that collides with a top-level app route — enforced
here defensively and, authoritatively, at business registration on the
backend.

## Custom domains

A business sets their domain from `/business-settings` (backend:
`POST /businesses/me/custom-domain`), gets a TXT record to add at their DNS
host, and clicks verify once it propagates. Only a **verified** domain is
ever routed to — see the backend README's [Custom domains](https://github.com/olumuyiwaa/cleansera_sass#custom-domains)
section for the ownership-proof and TLS-issuance details.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

## Related repositories

| Repo | Role |
|---|---|
| [cleansera_sass](https://github.com/olumuyiwaa/cleansera_sass) | Backend API |
| [cleansera_cleaner_app](https://github.com/olumuyiwaa/cleansera_cleaner_app) | Cleaner mobile app (Flutter) |
| [cleansera_sass_website](https://github.com/olumuyiwaa/cleansera_sass_website) | Marketing site |

## License

Private — all rights reserved.
