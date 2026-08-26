# API endpoint usage: feat/ui vs main

**Reference:** `main` (604a9f3)  
**Compared:** `feat/ui` (5d0ea29)  
**Generated:** 2026-08-25T12:42:32.119Z

Static scan of employee-dashboard JS/TS for `/admin/*` axios calls, endpoint props, and API constants. Dynamic segments normalized to `:id`. This is **frontend usage only** — confirm no other clients before deleting backend routes.

| Metric | Count |
|--------|------:|
| Paths on main | 144 |
| Paths on feat/ui | 132 |
| Shared (keep) | 120 |
| Cleanup candidates (main only) | 24 |
| New on feat/ui | 12 |

## Cleanup candidates (used on main, not on feat/ui)

| Path | Methods | Replacement / note |
|------|---------|-------------------|
| `/admin/analytics/employees/most-documented-orders` | — | Replaced by /admin/employees/kpis (and /:id/kpis) |
| `/admin/analytics/employees/most-received-orders` | — | Replaced by /admin/employees/kpis (and /:id/kpis) |
| `/admin/analytics/employees/most-returns` | — | Replaced by /admin/employees/kpis (and /:id/kpis) |
| `/admin/analytics/employees/most-unpaid-orders` | — | Replaced by /admin/employees/kpis (and /:id/kpis) |
| `/admin/analytics/top-customers/completed-orders` | GET | Folded into /admin/dashboard-analytics |
| `/admin/analytics/top-customers/incomplete-orders` | GET | Folded into /admin/dashboard-analytics |
| `/admin/analytics/top-customers/orders` | GET | Folded into /admin/dashboard-analytics |
| `/admin/analytics/top-customers/real-estates` | GET | Folded into /admin/dashboard-analytics |
| `/admin/analytics/top-customers/returns` | GET | Folded into /admin/dashboard-analytics |
| `/admin/analytics/top-customers/units` | GET | Folded into /admin/dashboard-analytics |
| `/admin/contract-statuses/:id/delete` | POST | Delete UI removed on feat/ui (update POST :id still used) |
| `/admin/contract-whatsapp` | — | List query removed; /complete and /incomplete create paths still used |
| `/admin/draft-contract-statuses/:id` | POST | Draft status edit path unused on feat/ui |
| `/admin/draft-contract-statuses/:id/delete` | POST | Draft status delete unused on feat/ui |
| `/admin/draft-contract-statuses/sync` | POST | Sync unused on feat/ui |
| `/admin/finance/expenses` | GET | Replaced by /admin/operating-expenses |
| `/admin/orders/:id/contract-status` | POST | Replaced by /admin/orders/:id/status (+ return-contract-status) |
| `/admin/orders/complete/list` | — | Use /admin/orders with filters |
| `/admin/orders/completed-draft` | — | Use /admin/orders/draft (+ status filter) |
| `/admin/orders/incomplete/list` | — | Use /admin/orders with filters |
| `/admin/orders/received` | — | Use /admin/orders + /admin/received-contracts (POST receive) |
| `/admin/orders/status/:id` | — | Use /admin/orders?status_id= |
| `/admin/real-estates` | GET | List removed; /admin/real-estates/:id detail still used |
| `/admin/unit-real-estates` | GET | Units analysis list removed |

## New on feat/ui (must keep)

| Path | Methods | Used in |
|------|---------|---------|
| `/admin/contract-statuses/active` | GET | Orders/change-status-dialog.jsx |
| `/admin/employees/:id/kpis` | GET | hooks/use-employee-kpis.js |
| `/admin/employees/kpis` | GET | hooks/use-employee-kpis.js |
| `/admin/operating-expenses` | GET, POST | hooks/use-operating-expenses.js |
| `/admin/operating-expenses/:id` | DELETE, PUT | hooks/use-operating-expenses.js |
| `/admin/orders/:id/return-contract-status` | POST | lib/order-status-api.js |
| `/admin/orders/:id/status` | POST | lib/order-status-api.js |
| `/admin/received-contracts` | POST | hooks/use-receive-contract.js |
| `/admin/reports/:reportKey` | GET | hooks/use-reports.js |
| `/admin/reports/profit-settings` | GET, PUT | hooks/use-reports.js |
| `/admin/settings/general` | GET | SystemSettings/GeneralSettingsTab.jsx |
| `/admin/settings/general/:key` | PUT | SystemSettings/GeneralSettingsTab.jsx |

## Shared paths to keep (120)

- `/admin/analytics/refunds/contracts` (GET)
- `/admin/analytics/refunds/contracts/:id` (POST)
- `/admin/blogs` (POST, GET)
- `/admin/blogs/:id` (GET, PUT)
- `/admin/cities` (GET, POST)
- `/admin/cities/:id` (POST)
- `/admin/cities/:id/delete` (POST)
- `/admin/content-pages/about` (—)
- `/admin/content-pages/home` (—)
- `/admin/content/privacy` (GET, POST)
- `/admin/content/terms-and-conditions` (GET, POST)
- `/admin/contract-paid-by-employees` (GET, POST)
- `/admin/contract-paid-by-employees/:id` (GET)
- `/admin/contract-periods` (GET)
- `/admin/contract-periods/:id` (POST)
- `/admin/contract-periods/create` (POST)
- `/admin/contract-statuses` (GET, POST)
- `/admin/contract-statuses/:id` (POST)
- `/admin/contract-whatsapp/complete` (—)
- `/admin/contract-whatsapp/incomplete` (—)
- `/admin/coupons` (GET)
- `/admin/coupons/:id` (—)
- `/admin/coupons/:id/:id` (POST)
- `/admin/coupons/:id/delete` (POST)
- `/admin/customer-messages` (POST)
- `/admin/customer-messages/:id` (POST)
- `/admin/customer-messages/:id/delete` (POST)
- `/admin/customer-messages/all` (GET)
- `/admin/dashboard-analytics` (GET)
- `/admin/draft-contract-statuses` (GET, POST)
- `/admin/draft-contract-statuses/active` (GET)
- `/admin/employees` (GET)
- `/admin/employees/:id` (GET)
- `/admin/employees/:id/block` (POST)
- `/admin/employees/:id/delete` (POST)
- `/admin/employees/:id/note` (POST)
- `/admin/employees/:id/salary` (POST)
- `/admin/employees/:id/toggle-status` (POST)
- `/admin/employees/:id/unblock` (POST)
- `/admin/employees/login` (POST)
- `/admin/employees/logout` (POST)
- `/admin/faqs` (POST)
- `/admin/faqs/:id` (POST)
- `/admin/faqs/:id/delete` (POST)
- `/admin/message-alert-section-items` (GET, POST)
- `/admin/message-alert-section-items/:id` (DELETE, POST)
- `/admin/message-alert-section-items/:id/delete` (POST)
- `/admin/message-alert-sections` (POST)
- `/admin/message-alert-sections/:id` (DELETE, POST)
- `/admin/message-alert-sections/:id/delete` (POST)
- `/admin/message-alert-sections/:id/options/list` (GET)
- `/admin/message-alert-sections/employee/options/list` (GET)
- `/admin/message-alert-sections/property/options/list` (GET)
- `/admin/message-alerts/employee` (GET, POST)
- `/admin/message-alerts/employee/:id` (POST)
- `/admin/message-alerts/employee/:id/delete` (POST)
- `/admin/message-alerts/property` (GET, POST)
- `/admin/message-alerts/property/:id` (DELETE, POST)
- `/admin/message-alerts/property/:id/delete` (POST)
- `/admin/meter-fee-settings` (GET)
- `/admin/notifications/all-employees` (GET)
- `/admin/notifications/all-users` (GET)
- `/admin/notifications/custom-user` (GET)
- `/admin/notifications/employee` (GET)
- `/admin/notifications/user` (GET)
- `/admin/orders` (GET)
- `/admin/orders/:id` (GET)
- `/admin/orders/:id/comments` (GET, POST)
- `/admin/orders/:id/delete` (POST)
- `/admin/orders/:id/draft-contract-status` (POST)
- `/admin/orders/:id/units/:id` (—)
- `/admin/orders/:id/units/:id/delete` (—)
- `/admin/orders/draft` (—)
- `/admin/orders/draft/status` (—)
- `/admin/paperworks` (GET, POST)
- `/admin/paperworks/:id` (GET, POST)
- `/admin/paperworks/:id/delete` (POST)
- `/admin/payment-gateway/:id` (GET)
- `/admin/payment-messages` (GET, POST)
- `/admin/payment-messages/:id` (POST)
- `/admin/payment-types` (GET)
- `/admin/payment-types/:id` (POST)
- `/admin/payment-types/create` (POST)
- `/admin/payments` (GET)
- `/admin/permissions/by-section` (GET)
- `/admin/popup-contracts` (POST)
- `/admin/popup-contracts/:id` (POST)
- `/admin/popup-contracts/:id/delete` (POST)
- `/admin/real-estate-types` (POST)
- `/admin/real-estate-types/:id` (POST)
- `/admin/real-estate-types/:id/delete` (POST)
- `/admin/real-estate-usages` (POST)
- `/admin/real-estate-usages/:id` (POST)
- `/admin/real-estate-usages/:id/delete` (POST)
- `/admin/real-estates/:id` (GET)
- `/admin/refundable-contracts` (POST)
- `/admin/regions` (GET, POST)
- `/admin/regions/:id` (POST)
- `/admin/regions/:id/delete` (POST)
- `/admin/roles` (GET, POST)
- `/admin/roles/:id` (GET, POST)
- `/admin/roles/:id/delete` (POST)
- `/admin/setting-contracts` (GET, POST)
- `/admin/setting-contracts/:id` (POST)
- `/admin/sms-settings` (GET)
- `/admin/sms/message` (—)
- `/admin/sms/send` (—)
- `/admin/tenant-roles` (GET, POST)
- `/admin/tenant-roles/:id` (POST)
- `/admin/tenant-roles/:id/delete` (POST)
- `/admin/unit-types` (GET, POST)
- `/admin/unit-types/:id` (POST)
- `/admin/unit-types/:id/delete` (POST)
- `/admin/unit-usages` (GET, POST)
- `/admin/unit-usages/:id` (POST)
- `/admin/unit-usages/:id/delete` (POST)
- `/admin/users` (GET)
- `/admin/users/:id` (GET)
- `/admin/users/:id/block` (POST)
- `/admin/users/:id/delete` (POST)

## Migration cheat sheet

1. `POST /admin/orders/:id/contract-status` → `POST /admin/orders/:id/status` (+ `return-contract-status`)
2. Staff analytics `/admin/analytics/employees/most-*` → `GET /admin/employees/kpis` / `/:id/kpis`
3. Top-customer `/admin/analytics/top-customers/*` → `GET /admin/dashboard-analytics`
4. `GET /admin/finance/expenses` → `/admin/operating-expenses` CRUD
5. Split order lists → `GET /admin/orders` with filters; receive via `POST /admin/received-contracts`
