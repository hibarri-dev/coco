# CoCo Cloud Backend API Reference & Swagger Documentation

Welcome to the official API documentation for **CoCo Cloud** by Hibarri. This documentation specifies all RESTful endpoints, data schemas, authentication flows, rate limits, and cross-system integrations.

---

## 1. Accessing Interactive Swagger UI

CoCo Cloud backend includes a built-in, real-time interactive **Swagger UI** for testing endpoints directly in the browser:

| Resource | Route | Description |
| :--- | :--- | :--- |
| **Interactive Swagger UI** | `GET /api-docs` | Full interactive API explorer with "Try it out", parameter builders, and authorization controls |
| **OpenAPI Specification (JSON)** | `GET /api-docs/openapi.json` | Machine-readable OpenAPI 3.0.3 specification in JSON format |
| **OpenAPI Specification (YAML)** | `GET /api-docs/openapi.yaml` | Machine-readable OpenAPI 3.0.3 specification in YAML format |
| **Legacy Aliases** | `GET /docs`, `GET /swagger` | Automatically redirect to `/api-docs` |

> [!NOTE]
> When running locally, open [http://localhost:5001/api-docs](http://localhost:5001/api-docs) in your browser.
> The Swagger interface is styled with CoCo's dark theme and purple accents (`#9e00ff`) and pre-configured with Helmet CSP bypass rules.

---

## 2. Authentication Architecture

CoCo features a multi-tiered authentication architecture designed for browser clients, machine-to-machine integrations, and distributed orchestrators:

```
                    ┌────────────────────────────┐
                    │      Client / Request      │
                    └─────────────┬──────────────┘
                                  │
       ┌──────────────────────────┼──────────────────────────┐
       │                          │                          │
       ▼                          ▼                          ▼
[Browser Flow]           [Hibarri Proxy M2M]      [Compute Orchestrator]
Bearer JWT or Cookie:     Header:                  Header:
`coco_token`              `X-Internal-Key`         `X-Meter-Key`
       │                          │                          │
       ▼                          ▼                          ▼
`authenticate()`        `requireInternalOrAdmin`    `POST /api/dev/usage/ingest`
User / Investor / Admin  Hibarri Superadmin Bypass  Metric Sample Storage
```

### 1. Browser User / Investor JWT (`bearerAuth` or `cookieAuth`)
- Token transmitted via either:
  - Header: `Authorization: Bearer <jwt_token>`
  - Cookie: `coco_token=<jwt_token>` (`HttpOnly; SameSite=Lax; Path=/`)
- Signed with `process.env.JWT_SECRET`, default expiry `7d`.

### 2. Hibarri Superadmin Machine-to-Machine Proxy (`internalKeyAuth`)
- Used exclusively by the **Hibarri Central Dashboard Backend** to manage CoCo orders, servers, users, credits, and payouts without requiring an active browser JWT session.
- Header: `X-Internal-Key: <COCO_INTERNAL_KEY>`
- Optional Header: `X-Admin-Email: <superadmin_email>` (used by audit log records to identify the executing person).
- Protected by constant-time SHA-256 digest comparison (`timingSafeEqual`) to prevent timing side-channel attacks.

### 3. Compute Usage Metering Key (`meterKeyAuth`)
- Header: `X-Meter-Key: <METER_INGEST_KEY>`
- Used by distributed runtime container agents and hypervisors calling `POST /api/dev/usage/ingest`.

---

## 3. API Module Breakdown & Endpoint Directory

### A. Health & System
- `GET /api/health`
  - Returns service status, node app name (`coco-cloud-backend`), and ISO timestamp.

### B. Hibarri Central Integration & Funnel Leads
- `POST /api/coco/leads`
  - Relays marketing funnel entries to `process.env.LEADS_ENDPOINT` (`https://api.hibarri.com/api/coco/leads`).
  - Accepts `text/plain` or JSON body (avoids CORS preflight from legacy landing pages).
  - Returns `200 { success: true }`, `502 { error: 'relay_failed' }`, or `503 { error: 'not_configured' }`.

### C. Authentication (`/api/auth`)
- `POST /api/auth/register`: Create account (`name`, `email`, `password`, `role`, `phone`, `company`). Rate limited: 20/15m.
- `POST /api/auth/login`: Authenticate with email and password. Sets `coco_token` cookie. Rate limited: 20/15m.
- `POST /api/auth/investor/register`: Registers account with `role: 'investor'`.
- `POST /api/auth/investor/login`: Dedicated investor login endpoint.
- `GET /api/auth/me`: Get current authenticated user profile.
- `POST /api/auth/logout`: Clears `coco_token` cookie.

### D. Checkout & Hardware Payments (`/api/checkout`)
- `POST /api/checkout` & `POST /api/checkout/create-session`:
  - Creates a Stripe Checkout Session for server hardware and prepaid 24-month datacenter colocation space.
  - Automatically tags Stripe metadata with `app: 'coco'`, order ID, buyer details, and datacenter ship-to address.
  - Returns `{ url, reference }`.
- `GET /api/checkout` & `GET /api/checkout/session/:sessionId`:
  - Verifies payment status with Stripe and triggers idempotent fulfillment backup if webhook was delayed.
- `POST /api/checkout/wire`:
  - Registers order in `awaiting` state for wire transfer payment. Admin can mark paid upon bank clearance.

### E. Orders (`/api/orders`)
- `GET /api/orders`: List all orders placed by the authenticated user.
- `GET /api/orders/:reference`: Retrieve order details by reference code (e.g. `COCO-A8F29C14`).

### F. Servers & Hardware Portfolio (`/api/servers`)
- `GET /api/servers`: List investor's hardware servers with live CPU/RAM utilization, monthly revenue, and alerts.
- `GET /api/servers/portfolio`: Aggregated investor portfolio stats:
  - Total compute cores/vCPU and compute sold
  - Capacity utilization %
  - Current month revenue, last month revenue, and 6-month historical trajectory
  - CoCo 20% platform fee calculation (`cocoFeeRate: 0.20`)
  - Estimated and settled weekly payouts breakdown
- `GET /api/servers/:id`: Retrieve single server telemetry by serial number.
- `POST /api/servers/:id/disconnect-request`: Request hardware offboarding and workload migration.

### G. Hardware Store Catalog (`/api/store`)
- `GET /api/store/products`:
  - Queries real-time server inventory from **Ingram Micro Xvantage** API.
  - Automatic fallback to **TD SYNNEX** catalog if Ingram Micro is unreachable.
  - Rate limited: 60/min.
- `GET /api/store/products/:id`:
  - Retrieve detailed product specifications and distributor pricing.

### H. Developer Cloud Platform (`/api/dev`)
- `POST /api/dev/usage/ingest`:
  - Ingest raw vCPU and RAM seconds from worker nodes. Authenticated via `X-Meter-Key`.
- `GET /api/dev/overview`: High-level summary of projects, services, active services, billing, and recent deployments.
- `GET /api/dev/projects`: List user developer projects with active service counts.
- `POST /api/dev/projects`: Create project in specified region (`us-east`, `us-west`, `eu-central`, `ap-southeast`).
- `GET /api/dev/projects/:id`: Get project and child services.
- `PATCH /api/dev/projects/:id`: Rename project or adjust default region.
- `DELETE /api/dev/projects/:id`: Cascade delete services, deployments, and free server allocations.
- `POST /api/dev/services`: Create microservice (`web`, `worker`, `db`, `cron`).
- `GET /api/dev/services/:id`: Get service details, deployment history, and 24-hour resource graphs.
- `PATCH /api/dev/services/:id`: Update resource allocations (vCPU, memory, replicas).
- `DELETE /api/dev/services/:id`: Delete service and deallocate server resources.
- `POST /api/dev/services/:id/deploy`: Verify account balance/subscription, schedule placement, and launch build.
- `POST /api/dev/services/:id/stop`: Stop service containers and release compute.
- `GET /api/dev/deployments/:id`: Inspect deployment logs.
- `GET /api/dev/usage`: Query usage time series (`7d`, `30d`, `90d`).
- `GET /api/dev/billing`: Current plan tier, funded credit balance, and spend.
- `POST /api/dev/billing/subscribe`: Subscribe to monthly Developer Plan (`hobby` $5/mo, `pro` $25/mo).
- `POST /api/dev/billing/portal`: Open Stripe Customer Portal.
- `POST /api/dev/credits/topup`: Top up prepaid compute credits via Stripe Checkout (min $20).
- `GET /api/dev/credits/ledger`: Detailed debit/credit ledger history.

### I. Admin Operations & Hibarri Proxy Integration (`/api/admin`)
*Protected by `requireInternalOrAdmin` (Admin JWT OR `X-Internal-Key`)*
- `GET /api/admin/orders`: Filter orders by payment status and method.
- `POST /api/admin/orders/:reference/mark-paid`: Confirms wire transfer, runs `fulfillOrder()`, and provisions physical hardware servers.
- `POST /api/admin/orders/:reference/cancel`: Cancels unpaid order with reason note.
- `POST /api/admin/orders/:reference/assign`: Links legacy/unassigned order to user account by email.
- `GET /api/admin/servers`: List all physical servers in the fleet across all owners.
- `PATCH /api/admin/servers/:serial`: Update telemetry, load arrays, status, datacenter costs, or push operator alerts.
- `GET /api/admin/users`: List users filtered by role.
- `GET /api/admin/credits`: List all developer accounts with funded compute balances.
- `GET /api/admin/credits/:userId/ledger`: Audit full credit ledger for specific developer.
- `POST /api/admin/credits/:userId/adjust`: Inject promotional credits or apply debits (up to ±$10,000).
- `GET /api/admin/payouts`: Review weekly server host payouts (pending, held, paid).
- `POST /api/admin/payouts/settle`: Manually trigger weekly payout settlement calculation engine.
- `POST /api/admin/payouts/:id/:action`: Approve payout (`mark-paid` with wire ref), `hold`, or `release`.

### J. Transactional Email (`/api/email`)
- `POST /api/email`:
  - Rate limited: 5/10m.
  - Template `broadcast-registration`: Generates and sends calendar `.ics` invite for daily broadcast.
  - Template `whitepaper`: Delivers download link for the White Paper on Compute.

### K. Stripe Webhooks (`/api/webhook/stripe`)
- `POST /api/webhook/stripe`:
  - Verified with raw JSON buffer and `Stripe-Signature`.
  - Dispatches `checkout.session.completed`, credit top-ups, and developer subscription lifecycle events.
  - **Hibarri Lead Forwarding:** Automatically relays completed order metadata to `process.env.LEADS_ENDPOINT`.

---

## 4. Rate Limiting Policy

CoCo implements defense-in-depth rate limiting using `express-rate-limit` with standard draft-8 headers:

| Route Group | Window | Max Requests | Response on Breach |
| :--- | :--- | :--- | :--- |
| **Global `/api/*`** | 15 minutes | 600 requests | `429 { error: 'rate_limited', message: 'Too many requests. Please slow down.' }` |
| **Credentials (`/api/auth/*`)** | 15 minutes | 20 requests | `429 { error: 'rate_limited', message: 'Too many attempts. Please wait a few minutes and try again.' }` |
| **Store Catalog (`/api/store/*`)** | 1 minute | 60 requests | `429 { error: 'rate_limited', message: 'Too many store requests. Please slow down.' }` |
| **Transactional Email (`/api/email`)** | 10 minutes | 5 requests | `429 { error: 'rate_limited' }` |
| **Swagger UI (`/api-docs`)** | Exempt | Unlimited | N/A |
