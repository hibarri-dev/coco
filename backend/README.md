# CoCo backend

Express + MongoDB API for accounts, orders, Stripe checkout, server provisioning and the partner dashboard.
The frontend calls it on the same origin at `/api` (Vite dev proxy locally, `frontend/middleware.js` on Vercel),
so the httpOnly session cookie works without CORS credentials.

## Run locally

```bash
cp .env.example .env   # set MONGODB_URI and JWT_SECRET at minimum
npm install
npm run dev            # http://localhost:5001, frontend dev server proxies /api here
```

## Swagger & API Documentation

Interactive Swagger UI and machine-readable OpenAPI 3.0 specifications are served directly by the backend:

- **Interactive Swagger UI:** `http://localhost:5001/api-docs` (or `/docs`, `/swagger`)
- **OpenAPI 3.0 Spec (JSON):** `http://localhost:5001/api-docs/openapi.json`
- **OpenAPI 3.0 Spec (YAML):** `http://localhost:5001/api-docs/openapi.yaml`
- **Architectural Markdown Guides:**
  - Full API Reference: [`docs/SWAGGER_AND_API_REFERENCE.md`](../docs/SWAGGER_AND_API_REFERENCE.md)
  - Environment & Hibarri Integration Guide: [`docs/ENV_AND_HIBARRI_INTEGRATION.md`](../docs/ENV_AND_HIBARRI_INTEGRATION.md)

## Hibarri Central Dashboard Integration

CoCo connects to the Hibarri Central Superadmin via two key touchpoints:
1. **Inbound Admin Proxy:** Hibarri Central calls `/api/admin/*` server-to-server passing `X-Internal-Key: <COCO_INTERNAL_KEY>` and optional `X-Admin-Email: <email>`. No browser JWT session is required.
2. **Outbound Lead Relay:** Marketing funnel submissions (`POST /api/coco/leads`) and paid server orders (`checkout.session.completed` in Stripe webhook) forward lead data to `process.env.LEADS_ENDPOINT` (`https://api.hibarri.com/api/coco/leads`).


## Deploy

1. Host this folder on any Node 20+ host (Render, Railway, Fly, a VM). Start command: `npm start`.
2. Set the variables from `.env.example` on the host. In production the server refuses to start without
   `MONGODB_URI`, `JWT_SECRET` (32+ chars), `CLIENT_URL`, `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
   Set `NODE_ENV=production` so cookies are `Secure`.
3. In the Vercel project, set `COCO_BACKEND_URL` to the backend's URL (e.g. `https://coco-production-79bd.up.railway.app`)
   and redeploy the frontend. The Vercel project's Root Directory must be `frontend`, otherwise `middleware.js` is ignored.
   `CLIENT_URL` must be the public site (e.g. `https://coco.hibarri.com`); its first entry is used in Stripe return links and emails.
4. In Stripe > Developers > Webhooks, add `https://<your-site>/api/webhook/stripe` with the events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
   and `checkout.session.expired`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
5. Create the first admin: `npm run create-admin -- you@hibarri.com '<password, 12+ chars>' Your Name`.

## How an order becomes a server

1. A signed-in user checks out (`POST /api/checkout` for card, `POST /api/checkout/wire` for wire).
   The server prices the selection, generates the `CC-…` reference and stores the order against the account.
2. Card: Stripe's webhook (or the return page) confirms payment. Wire: an admin marks the order paid.
3. Fulfilment creates one server per unit, tagged with the chosen data center and ship-to address, and the
   buyer becomes a Cloud Partner. The servers appear in their dashboard immediately with status `Ordered`.
4. Admins move each server through `Procuring → Shipping → Racking → Provisioning → Online` and record
   usage and revenue; the dashboard shows exactly what is stored.

## Store (`/store`)

`GET /api/store/products?q=&page=` lists servers from the first supplier that answers:

1. **Ingram Micro Xvantage**: set `INGRAM_CLIENT_ID`, `INGRAM_CLIENT_SECRET` and `INGRAM_CUSTOMER_NUMBER`
   (from developer.ingrammicro.com). Use `INGRAM_API_BASE=https://api.ingrammicro.com:443/sandbox` while testing.
2. **TD SYNNEX** (backup): set the `TDSYNNEX_*` variables with the URLs and credentials TD SYNNEX issues.
   Confirm the field mapping in `src/services/suppliers/tdsynnex.js` against their docs once access is granted.
3. Neither configured or both failing: the built-in sample catalog.

Lists are cached for 10 minutes. A product can be bought online only when its price is in USD and its rack
units and cores can be read from the description; otherwise the card offers "Request a quote". At checkout the
price is fetched live from the supplier again (store IDs start with `im-` or `td-`), and the order records the
supplier, SKU and cost so procurement knows exactly what to buy.

## Admin API

All routes need an admin session (sign in at `/api/auth/login`; the cookie is sent automatically in a browser).

| Method | Path | Body |
| --- | --- | --- |
| GET | `/api/admin/orders?status=&method=` | |
| POST | `/api/admin/orders/:reference/mark-paid` | `{ "note": "Wire received 13 Oct" }` |
| POST | `/api/admin/orders/:reference/cancel` | `{ "reason": "..." }` |
| POST | `/api/admin/orders/:reference/assign` | `{ "email": "buyer@company.com" }` links an order placed before accounts existed |
| GET | `/api/admin/servers?status=` | |
| PATCH | `/api/admin/servers/:serial` | any of `status`, `statusNote`, `cpuUtil`, `ramUtil`, `storageUtil`, `networkUtil`, `gpuUtil`, `uptime`, `customers`, `allocatedVcpu`, `allocatedRamGb`, `revenue`, `revenueToDate`, `load`, `alert: { level, title, detail }` |
| GET | `/api/admin/users?role=` | |
| GET | `/api/admin/credits?q=` | accounts with prepaid credit, or any account matching `q` |
| GET | `/api/admin/credits/:userId/ledger` | |
| POST | `/api/admin/credits/:userId/adjust` | `{ "amountCents": 2500, "note": "Outage refund" }` (negative deducts) |
| GET | `/api/admin/payouts?status=pending\|held\|paid` | |
| POST | `/api/admin/payouts/settle` | settles any finished week now |
| POST | `/api/admin/payouts/:id/mark-paid` | `{ "reference": "ACH 4471", "note": "" }` |
| POST | `/api/admin/payouts/:id/hold` / `release` | `{ "note": "" }` |

Server utilization on the dashboard is `allocatedVcpu / total vCPU`; services placed on a server keep
`allocatedVcpu`, `allocatedRamGb` and `customers` in sync automatically.

### Prepaid credits and weekly payouts

- Developers prepay credit through Stripe Checkout (`POST /api/dev/credits/topup`, minimum $20). Deploying needs
  $20 paid in at some point and a positive balance. Active Hobby/Pro subscribers and admins are not charged credit.
- Every 5 minutes, uncharged metered usage is debited from the balance (`CreditLedger`, one entry per user per hour).
  Under $5 the user is emailed once; at $0 their running services are stopped (data kept) until they top up and redeploy.
- Each service is placed on an Online server with free vCPU. Usage records carry that server, so its owner earns it.
- Weeks run Monday 00:00 to Monday 00:00 UTC. About a day after a week ends (usage samples older than 24h are
  rejected, so the week is final), one `Payout` per server owner is created: usage revenue minus CoCo's 20% fee.
  Rack space is prepaid for 24 months, so nothing else is deducted. Admins mark payouts paid with the bank reference.
- Timers are lease-locked in Mongo (`JobLock`), so running several backend instances never charges or settles twice.
- Payouts settled while `DEV_RUNTIME` is not `external` come from simulated usage and are flagged; never pay them out.
