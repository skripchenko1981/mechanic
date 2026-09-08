# B2B Orders — Admin Frontend

Operator-facing web app for processing B2B orders that customers place
through a Telegram bot. Built with React 19, TypeScript, Tailwind CSS v4,
Zustand, React Router, and Framer Motion.

This repository contains **the frontend only** — one piece of the full
system:

```
Frontend  ↕  API  ↕  Database  ↕  Redis/Workers  ↕  Telegram Bot API  ↕  Admin Panel
 (this repo)
```

The frontend is built against a documented REST contract (see
`src/lib/api/orders.ts`) so backend work can proceed in parallel. Until a
real API is available, the app can run fully in-browser against realistic
fixture data — see **Mock mode** below.

## Features

- Live queue of incoming orders, grouped by status, with 15s polling
- Search by order number, company, or contact
- Order detail panel: line items, delivery address, Telegram contact,
  status history timeline, and one-tap status transitions
- "Send reorder link" — pushes a repeat-order deep link to the customer's
  Telegram chat and lets the operator copy it directly
- Fully responsive: collapses to a mobile drawer nav and full-width list
- Internal tool hardening: `noindex`/`nofollow` at both the HTML and
  nginx level, since this is never meant to be publicly indexed

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Mock mode (no backend required)

Set `VITE_USE_MOCK_API=true` in `.env.local` to run entirely against
in-memory fixture data (`src/lib/api/mockAdapter.ts`). This is the fastest
way to review the UI before the API service exists. Switching to the real
API later is a one-line change — set the flag back to `false` and point
`VITE_API_BASE_URL` at the API — no component or store code changes.

## Scripts

| Command              | Purpose                              |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Local dev server with HMR             |
| `npm run lint`        | oxlint static analysis                |
| `npm run typecheck`   | `tsc -b --noEmit`, no emitted output  |
| `npm run test`        | Vitest unit tests (store + utils)     |
| `npm run build`       | Type-checks, then produces `dist/`    |
| `npm run preview`     | Serves the production build locally   |

All of the above pass cleanly as of this commit (0 lint errors, 0 type
errors, 7/7 unit tests, clean production build).

## Environment variables

See `.env.example`:

- `VITE_API_BASE_URL` — base URL of the orders API
- `VITE_USE_MOCK_API` — `true` to use fixture data instead of a live API

## Project structure

```
src/
  types/order.ts          Domain types shared across the app
  lib/api/                Typed API client + orders endpoints + mock adapter
  lib/utils.ts             Formatting helpers (money, dates, class merging)
  store/ordersStore.ts     Zustand store: list, filters, optimistic status transitions
  components/layout/       App shell, responsive sidebar/drawer
  components/orders/       Order list, row, detail panel, status badge/timeline, filters
  pages/                   Route-level pages
```

## Docker

```bash
docker build -t b2b-orders-frontend --build-arg VITE_API_BASE_URL=https://api.example.com .
docker run -p 8080:80 b2b-orders-frontend
```

Multi-stage build: Node 22 builds the static bundle, nginx (alpine) serves
it with gzip, immutable caching on hashed assets, SPA fallback routing,
and security headers (`X-Frame-Options`, `X-Content-Type-Options`,
`X-Robots-Tag: noindex`).

## What's intentionally out of scope here

This deliverable is the frontend. It does **not** include:

- The API service, database schema/migrations, or Redis/worker queue
- The Telegram bot itself (order intake, notifications)
- Authentication issuance (the frontend expects a bearer token already
  present in `localStorage` under `b2b_admin_token`, obtained via whatever
  operator login flow the API implements)

Those are separate, substantial deliverables — happy to scope and build
any of them next.
