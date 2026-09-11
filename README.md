# CleanSera Business Dashboard

Next.js frontend for cleaning business owners and managers.

This is the main admin interface that talks to the CleanSera API.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- FullCalendar
- ApexCharts
- Socket.io client
- Axios

## Features

- Dashboard & KPIs
- Bookings (list + calendar)
- Recurring schedules
- Cleaners management (onboard / offboard / availability)
- Customers CRM + addresses
- Services & add-ons
- Dispatch board
- Checklist templates
- Coupons & pricing
- Reports
- Reviews
- Messaging & notifications
- Business settings & branding
- Platform subscription management
- Support tickets
- Public booking widget / branded business sites (`/site/[subdomain]`)

## Getting Started

### 1. Prerequisites

- Node.js 18+
- Running CleanSera API (`cleansera_sass`)

### 2. Install

```bash
git clone https://github.com/olumuyiwaa/cleansera_sass_frontend.git
cd cleansera_sass_frontend
npm install
```

### 3. Environment

```bash
cp env.local.example .env.local
```

Key variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Authenticated business dashboard
│   ├── (full-width-pages)/
│   ├── auth/
│   ├── book-now/             # Public booking
│   ├── site/[subdomain]/    # Branded business sites
│   └── api/                  # Frontend API clients
├── components/
├── context/
├── hooks/
└── layout/
```

## Notes

- All authenticated requests go through `authFetch`.
- Real-time updates (dispatch, messaging) use Socket.io.
- The subscription page only handles **platform billing** (CleanSera → Business).  
  Job payments from end customers are handled via Stripe Connect on the backend.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Related Repos

- Backend: [cleansera_sass](https://github.com/olumuyiwaa/cleansera_sass)
- Marketing site: [cleansera_sass_website](https://github.com/olumuyiwaa/cleansera_sass_website)
