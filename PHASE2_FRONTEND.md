# CleanSera Phase 2 — Frontend

## What was added

### API clients
- `src/app/api/bookings.api.ts` — `cancelBooking`, `rescheduleBooking`, `updateBookingPayment`
- `src/app/api/customers.api.ts` — search, delete, address CRUD
- `src/app/api/reports.api.ts` — KPIs, revenue-by-day, cleaner performance
- `src/app/api/portal.api.ts` — public customer portal client
- `cleansera-types.ts` — `paymentStatus` includes `REFUNDED`

### Dashboard
- **Bookings** — Cancel / Reschedule / Payment actions + modals
- **Reports** — new page `/reports` with KPI cards, revenue list, cleaner table
- **Sidebar** — Reports nav item

### Customer portal
- `/portal` — phone OTP login, list bookings, cancel, reschedule, leave review

## Apply with backend Phase 1
Frontend expects the Phase 1 backend endpoints (`/bookings/:id/cancel`, `/portal`, `/reports/kpis`, etc.).

## Notes
- Portal resolves business from request Host (same as widget) — set `NEXT_PUBLIC_API_BASE_URL` and ensure Host header reaches the API.
- Customer portal token is stored in `localStorage` (`cleansera_portal_token`).
