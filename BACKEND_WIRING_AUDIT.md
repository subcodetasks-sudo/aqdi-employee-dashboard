# Backend Wiring Audit

**Reviewed:** 2026-08-24 (updated same day — client/reports exports moved client-side, operating-expense permissions added, guidance-content tab wired)
**Scope:** User-facing dashboard routes and feature components, excluding unrelated styling and static UI configuration.

## Executive Summary

Most operational workflows are connected to the backend through `axiosInstance` and React Query. The confirmed remaining gaps are:

1. The marketing analytics workspace has no backend data source.
2. Reports "email" action needs a backend endpoint (the rest of the export actions are now client-side — see [docs/reports-export-api-request.md](docs/reports-export-api-request.md)).
3. Client export and the custom discount/waiver action on the client file still need attention (export is now client-side for the current page; discount/waiver is still a no-op).

Client property/unit delete and deed-viewing are explicitly out of scope (not being implemented); the corresponding buttons have been removed from the UI. The property/unit list itself remains wired.

## Findings

### Resolved: System Settings SMS/payment-messages/meter-fees/instrument-types are now wired

[SmsSettingsTab.jsx](components/SystemSettings/tabs/SmsSettingsTab.jsx), [MeterFeesTab.jsx](components/SystemSettings/tabs/MeterFeesTab.jsx), [InstrumentTypesTab.jsx](components/SystemSettings/tabs/InstrumentTypesTab.jsx), and [PaymentMessagesTab.jsx](components/SystemSettings/tabs/PaymentMessagesTab.jsx) were previously orphaned demo components (not imported anywhere) duplicating the already-live `components/contract-settings/*` implementations. They now use the same live endpoints/lib helpers those already-wired components use (`src/lib/sms-settings.js`, `src/lib/meter-fee-settings.js`, `src/lib/instrument-type-settings.js`, `src/lib/payment-messages.js`), and [ContractSettingsTab.jsx](components/SystemSettings/ContractSettingsTab.jsx) now renders these (newer-design) versions instead of the old `contract-settings/*` ones.

### Resolved: System Settings guidance-content sub-tab is now wired

[GuidanceContentTab.jsx](components/SystemSettings/tabs/GuidanceContentTab.jsx) now fetches from the live `/admin/popup-contracts` endpoint (paginated list + used-types query) and reuses the existing, already-wired [AddPopupContractDialog](components/contract-settings/popup-contracts/add-popup-contract-dialog.jsx) / [EditPopupContractDialog](components/contract-settings/popup-contracts/edit-popup-contract-dialog.jsx) for create/edit, rather than re-implementing the rich-text-editor form. [ContractSettingsTab.jsx](components/SystemSettings/ContractSettingsTab.jsx) now renders this new-design version for the "محتوى إرشادي للعقود" sub-tab instead of the old `PopupContractsTab`.

### Resolved: Client properties list is wired; delete/deed actions dropped

The `/home/users/[userId]/properties` route now reads real data: `useClientProperties` in [src/hooks/use-clients.js](src/hooks/use-clients.js) calls `GET /admin/users/{id}` and maps `real_estates_list`/`units_list` into property cards, rendered by [components/clients/ClientPropertiesWrapper.jsx](components/clients/ClientPropertiesWrapper.jsx). The mock data file has been removed.

Delete property, delete unit, and view deed are out of scope (not being implemented) — the corresponding buttons have been removed from the UI rather than left as demo actions.

### Resolved: Client export is now client-side; discount/waiver still not connected

- Client export in [components/clients/ClientsWrapper.jsx](components/clients/ClientsWrapper.jsx) now generates a CSV client-side via [clients-csv.js](components/clients/clients-csv.js) — scoped to the currently loaded page/filters (the list is server-paginated, so this isn't a full-dataset export). See [docs/reports-export-api-request.md](docs/reports-export-api-request.md) section 3 if a full-dataset export is wanted later.
- The custom discount/waiver action on the client file is still a no-op/demo action; proposed endpoint documented in [docs/clients-api-request.md](docs/clients-api-request.md).

### High: Marketing analytics workspace has no backend data source

The marketing analytics tabs import static fixtures from [components/content/marketing/shared/mock-data.js](components/content/marketing/shared/mock-data.js). This includes overview, campaigns, SEO, marketing reports, and pixel/connection presentation data. Filters change local state only.

This is separate from the home/about content-admin forms, which do use content-page API endpoints and mutations.

### Medium: Reports marketing tab is not wired

The main Reports page is wired for Orders, Sales, Profits, Customers, Performance, Employees, Operating Expenses, and Profit Settings through [src/hooks/use-reports.js](src/hooks/use-reports.js) and related hooks.

The Reports marketing tab remains intentionally unavailable and renders an explanatory message in [components/Reports/tabs/MarketingReportTab.jsx](components/Reports/tabs/MarketingReportTab.jsx). It has no query hook or endpoint call.

### Resolved (mostly): Report header actions are wired client-side; email still needs backend

Print, PDF, and CSV in [components/Reports/shared/ReportsHeader.jsx](components/Reports/shared/ReportsHeader.jsx) are now real: `printReportPanel()`/`exportPanelTablesToCsv()` in [src/lib/report-export.js](src/lib/report-export.js) print or CSV-export only the active report panel (scoped via `#reports-print-area`, styled through the new `@media print` rule in [globals.css](src/app/globals.css)). CSV export only works for tabs that render an actual `<table>` (e.g. Operating Expenses) — chart/KPI-only tabs (Orders, Sales, etc.) show a toast instead of an empty file. Email genuinely cannot be done client-side; it still shows a "قيد التطوير" badge and a toast explaining it needs backend support. Backend request documented in [docs/reports-export-api-request.md](docs/reports-export-api-request.md).

### Low: Invoice export is local-only

Invoice rows are fetched from `/admin/payments` through [src/hooks/use-payments.js](src/hooks/use-payments.js), so invoice data is backend-backed. Search, filters, pagination, and statistics are computed in the browser, and CSV export is generated locally by [components/Invoices/invoices-csv.js](components/Invoices/invoices-csv.js).

This is acceptable for small datasets, but a backend export endpoint is needed for complete/export-all behavior and large result sets.

### Resolved: Operating-expense mutations are now permission-gated

[OperatingExpensesReportTab.jsx](components/Reports/tabs/OperatingExpensesReportTab.jsx) now gates "إضافة مصروف" / edit / delete behind `usePermissions().can(PERMISSION_SECTIONS.analytics, 'create'|'edit'|'delete')` — reusing the existing `analytics` section (already required to view `/home/reports` at all) rather than introducing a new permission section, so no backend schema change is needed. This only takes effect once roles are actually granted `analytics.create`/`analytics.edit`/`analytics.delete` in addition to `analytics.view`; until then, only users with those explicit action grants (or super-admins) see the buttons.

## Confirmed Live Areas

The following areas have current API/query or mutation wiring and were not identified as mock-backed business flows:

- Orders and order details
- Realtime orders, receiving, status changes, returns, and payment links
- Employee list/details and employee KPI reporting
- Roles and permissions
- Client list and client detail base data
- Reports: Orders, Sales, Profits, Customers, Performance, Employees, Operating Expenses, and Profit Settings tabs (via [src/hooks/use-reports.js](src/hooks/use-reports.js))
- Invoice/payment list data
- System Settings: SMS settings, payment messages, meter fees, instrument type visibility/labels, contract popup content (guidance-content CRUD)
- Home/about content-admin forms
- Notifications

Static arrays used only for labels, filter options, colors, or fallback display values are not counted as backend gaps here.

## Recommended Backend Work Order

1. Add marketing analytics endpoints for attribution, campaign data, SEO metrics, and pixel integrations (also covers the Reports "marketing" tab, which shares the same data gap).
2. Add a report-email endpoint (`POST /admin/reports/email` proposal) — see [docs/reports-export-api-request.md](docs/reports-export-api-request.md) section 2. Print/PDF/CSV no longer need backend work.
3. Add the custom discount/waiver endpoint for the client file (see [docs/clients-api-request.md](docs/clients-api-request.md)).
4. On the roles/permissions side: grant `analytics.create`/`analytics.edit`/`analytics.delete` to whichever roles should manage operating expenses (the frontend gate is already in place).

## Validation Notes

There is no automated test suite configured in `package.json`. This audit is based on source-level tracing of route components, hooks, imports, and mutation handlers; backend endpoint availability still requires authenticated environment testing.