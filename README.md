# Coco Cloud Compute Platform

Coco is a high-performance bare-metal and virtualization compute marketplace, storefront, and cluster control plane. It coordinates server allocations, Proxmox VE hypervisor provisioning, weekly resource metering, and credit-based compute payouts.

---

## Swagger API Documentation & Integration Guides

- **Interactive Swagger UI:** [http://localhost:5001/api-docs](http://localhost:5001/api-docs) (aliases: `/docs`, `/swagger`)
- **OpenAPI 3.0 Specification:** [JSON](file:///d:/Hibarri/coco/backend/src/docs/openapi.json) | [YAML](file:///d:/Hibarri/coco/backend/src/docs/openapi.yaml)
- **Comprehensive API Reference:** [`docs/SWAGGER_AND_API_REFERENCE.md`](file:///d:/Hibarri/coco/docs/SWAGGER_AND_API_REFERENCE.md)
- **Environment & Hibarri Dashboard Integration:** [`docs/ENV_AND_HIBARRI_INTEGRATION.md`](file:///d:/Hibarri/coco/docs/ENV_AND_HIBARRI_INTEGRATION.md)

---

## 1. Cloud Compute & Billing Lifecycle

### The $20 Credit & Weekly Metering Rule
- **Upfront User Deposit:** Cloud compute consumers must maintain a prepaid credit balance (minimum $20 in credits).
- **Weekly Usage Metering:** Hypervisor compute workload (vCPU, RAM, GPU-hours, outbound bandwidth) is metered weekly.
- **Provider / Host Payouts:** After each weekly settlement cycle, metered consumption is deducted from the consumer's credit balance and disbursed as payouts to the physical server owners / datacenters hosting the workload.

---

## 2. Orders System & Admin Control

### Order Payment Statuses
- `awaiting`: Created and pending payment confirmation (typical for wire transfers or pending checkout).
- `paid`: Payment received and verified. Triggers instant provisioning of bare-metal servers / VMs.
- `processing`: Order is currently undergoing hardware allocation or provisioning.
- `cancelled`: Order canceled prior to payment.

### Orders API Endpoints

Coco exposes admin endpoints under `/api/admin` guarded by `requireInternalOrAdmin`:

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/admin/orders` | Internal Key or Coco Admin JWT | List all orders with query parameters `?status=...&method=...` |
| `POST` | `/api/admin/orders/:reference/mark-paid` | Internal Key or Coco Admin JWT | Marks an order as paid, records audit metadata, and triggers automated provisioning (`fulfillOrder`). |
| `POST` | `/api/admin/orders/:reference/cancel` | Internal Key or Coco Admin JWT | Cancels an order (unpaid only) with reason. |
| `POST` | `/api/admin/orders/:reference/assign` | Internal Key or Coco Admin JWT | Links guest/unassigned order to a user account by email. |
| `GET` | `/api/admin/servers` | Internal Key or Coco Admin JWT | List server inventory across hypervisors. |
| `PATCH` | `/api/admin/servers/:serial` | Internal Key or Coco Admin JWT | Update server metrics, status (`Online`, `Maintenance`, `Provisioning`), and alerts. |

---

## 3. Dual Authentication Model (`requireInternalOrAdmin`)

Coco admin routes support two access channels in [`src/middlewares/auth.js`](file:///d:/Hibarri/coco/backend/src/middlewares/auth.js):

1. **Browser / Direct Admin JWT:**
   - Evaluates standard `Bearer` authorization token or `coco_token` cookie.
   - Verifies user role is `'admin'`.
2. **Hibarri Superadmin Proxy (Machine-to-Machine):**
   - Evaluates the `X-Internal-Key` request header.
   - Matches against the `COCO_INTERNAL_KEY` environment variable.
   - If matched, attaches a synthetic identity (`req.user = { role: 'admin', email: 'hibarri-proxy@internal' }`) and proceeds immediately without database user lookup.

```javascript
// Example Server-to-Server Request:
fetch('http://localhost:4000/api/admin/orders', {
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-Key': process.env.COCO_INTERNAL_KEY
  }
});
```

---

## 4. Production Deployment Guide

### A. Environment Configuration (`coco/backend/.env`)

Ensure the following variables are populated in your production environment:

| Variable | Dev Default | Production Requirement | Purpose |
|---|---|---|---|
| `PORT` | `4000` | `4000` (or behind reverse proxy) | Coco backend HTTP port. |
| `NODE_ENV` | `development` | `production` | Enables production optimizations and secure cookie settings. |
| `MONGO_URI` | `mongodb://localhost:27017/coco` | `mongodb+srv://...` or clustered replica set | Persistent database connection. |
| `JWT_SECRET` | *(dev string)* | Random 64+ char secret | Signs Coco client JWT tokens. |
| `COCO_INTERNAL_KEY` | *(dev string)* | Random 64+ char secret | **Must match `COCO_INTERNAL_KEY` in Hibarri backend!** |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` | Live Stripe integration key for payments. |
| `STRIPE_WEBHOOK_SECRET`| `whsec_...` | `whsec_...` | Validates inbound Stripe webhook signatures. |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated allowed web origins | Frontends allowed to access Coco API directly. |

> [!CAUTION]
> Both `COCO_INTERNAL_KEY` and `JWT_SECRET` must be generated using cryptographically secure random bytes on production:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### B. Proxmox VE Hypervisor Setup

For nodes running Proxmox VE hypervisors:
1. Create a dedicated API user on the Proxmox cluster (e.g. `coco-api@pve`).
2. Generate an API token with permissions for VM lifecycle (`VM.Allocate`, `VM.Config.*`, `VM.PowerMgmt`).
3. Set Proxmox connection endpoints in the provisioning service.
4. Verify compute nodes can report telemetry (CPU, RAM, bandwidth metrics) back to Coco backend's telemetry ingestion endpoints.

### C. Production Process Execution

Run using PM2 or Docker:

```bash
cd d:/Hibarri/coco/backend
npm install --production
pm2 start src/server.js --name "coco-backend" --time
```

Check logs:
```bash
pm2 logs coco-backend
```

### D. Security & Network Hardening
1. **Firewall (UFW / AWS Security Group):**
   - Coco port `4000` should NOT be publicly accessible to the open internet.
   - Only allow inbound port `4000` traffic from:
     - The Nginx reverse proxy (for public `/api/checkout`, `/api/auth`, `/api/webhooks/stripe`).
     - The Hibarri Superadmin backend IP / VPC.
2. **Reverse Proxy SSL:** Terminate TLS (HTTPS) with valid Let's Encrypt / Cloudflare certificates.
