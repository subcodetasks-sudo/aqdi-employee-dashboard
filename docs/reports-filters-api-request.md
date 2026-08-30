# Backend request: Shared filters on Reports page tabs

Updated: 2026-08-30  
**Scope:** Reports page tabs only (`/home/reports`) that call **`GET /admin/reports/*`**

---

## Tabs in scope

| Tab (Arabic) | Tab id | Endpoint |
|---|---|---|
| الطلبات | `orders` | `GET /admin/reports/orders` |
| المبيعات والإيرادات | `sales` | `GET /admin/reports/sales` |
| الأرباح والتكاليف | `profits` | `GET /admin/reports/profits` |
| العملاء | `customers` | `GET /admin/reports/customers` |
| لوحة الأداء | `performance` | `GET /admin/reports/performance` |

**Out of scope for this request** (different APIs / no analytics yet):

- **الموظفون** → `GET /admin/employees/kpis`
- **المصروفات التشغيلية** → `GET /admin/operating-expenses` (own filters)
- **المصادر والتسويق** → no endpoint yet

---

## Shared filter bar (same on all in-scope tabs)

The UI at the top of `/home/reports` sends **identical query params** to whichever tab endpoint is active:

| Param | Always / conditional | Values |
|---|---|---|
| `period` | Always | `all`, `last_30_days`, `last_7_days`, `today`, `custom` |
| `date_from` | When `period=custom` + both dates set | `YYYY-MM-DD` |
| `date_to` | When `period=custom` + both dates set | `YYYY-MM-DD` |
| `contract_type` | When user picks a type | `housing`, `commercial` |
| `employee_id` | When user picks an employee | Employee PK from `GET /admin/employees` |

**Timezone:** Asia/Riyadh for period windows.

Frontend builder: `src/hooks/use-reports.js` → `getParams()`.

---

## Current frontend status (Reports tabs only)

| Tab | Sends all 5 params? |
|---|---|
| orders | ✅ Yes |
| sales | ✅ Yes |
| customers | ✅ Yes |
| performance | ✅ Yes |
| profits | ✅ Yes (wired 2026-08-30) |

We **cannot verify from the frontend** that the backend **applies** filters vs ignoring them — please confirm per endpoint.

---

## What we need from backend

For **each** of the 5 endpoints above:

1. **Accept** all query params (return `422` on invalid `employee_id` if you prefer strict validation).
2. **Apply** them to every KPI, chart series, and breakdown in the response:
   - `period` / custom dates → filter by a documented datetime field (same field across all 5 tabs).
   - `contract_type` → `housing` | `commercial` on the contract.
   - `employee_id` → orders received/claimed by that employee.
3. When filters match no rows → return `0` / `[]`, not `500`.
4. Add tests or confirm manual cases (see below).

---

## Acceptance tests

Using data with housing + commercial orders and ≥2 employees:

| # | Request | Expected |
|---|---|---|
| 1 | `?period=all` | Baseline |
| 2 | `+ contract_type=housing` | Subset; housing only |
| 3 | `+ contract_type=commercial` | Subset; commercial only |
| 4 | `+ employee_id={id}` | That employee’s orders only |
| 5 | `period=custom&date_from=…&date_to=…` | Date range only |
| 6 | All filters combined | Intersection |
| 7 | Repeat on `orders`, `sales`, `profits`, `customers`, `performance` | **Same filter semantics** on every tab |

---

## Reference

- Performance response shape: `docs/performance-report-api-request.md` (filters table matches this doc).
- Frontend hooks: `src/hooks/use-reports.js`

---

## Message for backend (copy-paste)

> Reports page (`/home/reports`) uses one filter bar for 5 tabs: **orders, sales, profits, customers, performance**.  
> Each calls `GET /admin/reports/{tab}` with: `period`, `date_from`, `date_to`, `contract_type`, `employee_id`.  
> Please confirm all 5 endpoints **apply** these filters to their aggregates (not just accept and ignore).  
> Spec + tests: **`docs/reports-filters-api-request.md`**.
