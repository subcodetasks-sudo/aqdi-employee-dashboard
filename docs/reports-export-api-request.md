# Backend request: Reports header — email delivery

Updated: 2026-08-24

## 1) What was resolved client-side (no backend needed)

The Reports header actions (`components/Reports/shared/ReportsHeader.jsx`) and the clients list
export (`components/clients/ClientsWrapper.jsx`) were previously demo toasts. They are now
implemented entirely client-side and do not need a backend endpoint:

- Reports "طباعة" (print) and "PDF": `printReportPanel()` in `src/lib/report-export.js` prints
  only the active report panel (`#reports-print-area`) via the browser's print dialog. "Save as
  PDF" in that dialog covers the PDF case.
- Reports "تصدير CSV": `exportPanelTablesToCsv()` in `src/lib/report-export.js` scrapes every
  `<table>` inside the active report panel into a CSV file. Note: report tabs that are chart/KPI-only
  (no `<table>`, e.g. Orders, Sales) have nothing to scrape, so this shows a toast saying there is
  no tabular data for that tab instead of an empty file. If those tabs should be exportable too,
  either add a table view to them, or this is a candidate for a real backend export endpoint later.
- Clients list "تصدير": `exportClientsCsv()` in `components/clients/clients-csv.js` exports the
  currently loaded page of `useClientsList` rows. It is scoped to the current page/filters only —
  it is not a full-dataset export, since the list is server-paginated.
- Invoices export was already client-side (`components/Invoices/invoices-csv.js`) — no change made.

## 2) What still needs backend support

**Reports "بريد" (email) button** — genuinely cannot be done client-side (no SMTP/mail API
available in the browser). Needed:

- Endpoint (proposal): `POST /admin/reports/email`
- Request body (proposal): `{ tab, period, date_from, date_to, contract_type, employee_id, to }`
  — same filter shape already sent to the existing `use-reports.js` report endpoints, plus a
  recipient address/list.
- Response: success/failure message only; the backend generates and sends the report itself
  (does not need to return a file to the frontend).
- Until this exists, the button stays visible but shows a "قيد التطوير" (in development) badge and
  a toast explaining it needs backend support — it does not silently pretend to succeed.

## 3) Not requested here

- Full-dataset (all pages, not just current page) CSV export for the clients list — only requested
  if product wants that; the current client-side export covers "export what I'm looking at."
- A generic backend export endpoint for chart/KPI-only report tabs — only needed if those tabs
  should be exportable and adding an in-page table isn't preferred.
