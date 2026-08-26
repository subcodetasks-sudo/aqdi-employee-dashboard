# Backend request: Reports — Performance tab (لوحة الأداء)

Updated: 2026-08-25
**Status: RESOLVED (2026-08-25).** `GET /admin/reports/performance` is live and
matches the shape below (both alias spellings are returned). The frontend no
longer falls back to mock data — `PERFORMANCE_REPORT_MOCK` has been removed
from `components/Reports/mock-data.js`, and `PerformanceReportTab.jsx` now
renders `ReportError` on failure like the other report tabs. Kept below for
reference on the response shape.

The Performance tab at `/home/reports?tab=performance` is fully designed in the
frontend and now reads live data from `GET /admin/reports/performance`.

Frontend source of truth:
- `components/Reports/tabs/PerformanceReportTab.jsx`
- `src/hooks/use-reports.js` → `usePerformanceReport` → `GET /admin/reports/performance`
- Related (already used): `GET/PUT /admin/reports/profit-settings`

---

## 1) Endpoint

```
GET /admin/reports/performance
```

Auth: same Bearer admin token as other `/admin/reports/*` routes.

### Query params (already sent by the frontend)

| Param | Example | Notes |
|---|---|---|
| `period` | `all` \| `last_30_days` \| `last_7_days` \| `today` \| `custom` | Required conceptually; frontend always sends it |
| `date_from` | `2026-08-01` | Only when `period=custom` |
| `date_to` | `2026-08-25` | Only when `period=custom` |
| `contract_type` | `housing` \| `commercial` | Omitted when “كل الأنواع” |
| `employee_id` | `12` | Omitted when “كل الموظفين” |

Timezone for “today” / period windows: **Asia/Riyadh**.

---

## 2) Response envelope

```json
{
  "success": true,
  "data": { ... }
}
```

The frontend reads **`response.data.data`** (the inner `data` object).

---

## 3) Required `data` object

All sections below are rendered on the tab. Prefer returning every key;
use `[]` / `0` / `null` for empty rather than omitting whole sections.

### 3.1 `period_label` (optional string)

Display label for P&L title, e.g. `"هذا الشهر"`. If omitted, frontend maps `period` itself.

### 3.2 `kpis` (object)

| Field | Type | UI label |
|---|---|---|
| `total_count` | number | إجمالي الطلبات |
| `documented_count` | number | موثّقة |
| `working_count` | number | قيد العمل |
| `canceled_count` | number | ملغاة |
| `refunded_count` | number | مسترجعة |
| `revenue` | number | الإيرادات (ريال) — numeric, no currency symbol |

Accepted aliases (already handled in UI): `total`, `done_count` / `completed_count`,
`active_count`, `cancelled_count`, `revenue_total`.

### 3.3 `conversion_funnel` (array)

Ordered stages, top → bottom of the funnel.

```json
[
  { "label": "زائر / بداية طلب", "value": 920, "from_previous_pct": null },
  { "label": "مسودة عقد", "value": 410, "from_previous_pct": 45 }
]
```

| Field | Type | Notes |
|---|---|---|
| `label` | string | Stage name |
| `value` | number | Count at this stage |
| `from_previous_pct` | number \| null | % of previous stage; UI can compute if omitted |
| `color` | string \| null | Optional hex; UI has a default palette |

### 3.4 `conversion_leakage` (object | null)

```json
{ "count": 162, "percent": 39 }
```

Alias accepted: `leakage: { count|value, percent|pct }`.

### 3.5 `conversion_rates` (array preferred)

```json
[
  { "label": "نسبة عدم الإكمال (تسرّب)", "value": 39, "tone": "gold" },
  { "label": "تحويل المسودة إلى دفع", "value": 60, "tone": "green" }
]
```

| Field | Type | Notes |
|---|---|---|
| `label` | string | |
| `value` | number \| string | Number → UI appends `%` unless `is_percent: false` or `value_display` set |
| `value_display` | string \| null | Exact string to show (skips formatting) |
| `tone` | `"gold"` \| `"green"` \| `"red"` \| `"muted"` \| null | Optional emphasis |
| `is_percent` | boolean | Default `true` |
| `suffix` | string \| null | Optional |

Object form also accepted as fallback:
`conversion_rates_map` / `rates` with keys
`incomplete_percent`, `draft_to_paid_percent`, `claimed_percent`,
`documented_percent`, `cancel_percent`, `refund_percent`.

### 3.6 `daily_orders` (array)

For the vertical bar chart (daily trend).

```json
[{ "label": "السبت", "value": 18 }, { "label": "الأحد", "value": 24 }]
```

### 3.7 `orders_by_status` (array)

```json
[{ "label": "مسودة", "value": 42 }, { "label": "مدفوع", "value": 38 }]
```

### 3.8 `by_contract_type` (array)

```json
[{ "label": "سكني", "value": 128, "revenue": 168400 }]
```

`revenue` optional — shown as detail under the bar when present.

Alias: `contract_type_distribution`.

### 3.9 `by_employee` (array)

```json
[{ "label": "ريان", "value": 64 }]
```

Count = received/claimed orders in the period. Alias: `employee_performance`.

### 3.10 `operational_metrics` (object) — receive queue / SLA

| Field | Type | UI |
|---|---|---|
| `waiting_count` | number | عدد الطلبات المنتظرة |
| `avg_wait_seconds` | number | متوسط زمن الانتظار (seconds) |
| `longest_wait_seconds` | number | أطول انتظار حالي |
| `late_over_15m` | number | متأخرة أكثر من 15 دقيقة |
| `late_over_30m` | number | متأخرة أكثر من 30 دقيقة |
| `sla_percent` | number | نسبة الالتزام خلال 15 دقيقة |
| `unclaim_count` | number | مرّات التراجع عن الاستلام |

Aliases accepted: `pending_count`, `avg_receive_seconds`, `max_wait_seconds`,
`late_over_15_count`, `late_over_30_count`, `sla_15m_percent`, `unreceive_count`.
Also accepts root key `receive_queue` instead of `operational_metrics`.

### 3.11 `revenue_by_payment_method` (array)

```json
[{ "label": "بطاقة ائتمان", "value": 142300 }]
```

Values in SAR (number).

### 3.12 `pnl` / `income_statement` (array)

Profit & loss lines for the selected period.

```json
[
  { "label": "إجمالي الإيرادات", "value": 248650, "is_subtotal": true },
  { "label": "رسوم إيجار", "value": -31200 },
  { "label": "صافي الربح", "value": 133750, "is_total": true, "tone": "green" }
]
```

| Field | Type | Notes |
|---|---|---|
| `label` | string | |
| `value` | number | Negative = cost/expense |
| `value_display` | string \| null | Optional preformatted |
| `is_subtotal` / `is_total` / `bold` / `separator` | boolean | Layout hints |
| `tone` | string \| null | `"green"` / `"red"` / … |

### 3.13 `unit_economics` (array)

Preferred detailed path shape (renders the multi-column table):

```json
[
  {
    "label": "عقد سكني — سنة",
    "customer_pays": 899,
    "ejar": 250,
    "moyasar": 27,
    "margin": 622,
    "margin_percent": 69
  }
]
```

Aliases: `pay` / `client_pays`, `ejar_fee` / `ejar_cost`, `gateway_fee` / `moyasar_fee`,
`percent` / `pct`, `path` / `service` / `name` for label.
`highlight` / `warn` → amber row.

Optional: `unit_economics_note` (string) shown under the table.

### 3.14 `financial_summary` (array)

```json
[
  { "label": "إيراد العقود السكنية", "value": 168400 },
  { "label": "الإجمالي", "value": 248650, "is_total": true }
]
```

Alias: `revenue_by_source`.

### 3.15 `by_document_type` (array)

```json
[{ "label": "عقد إيجار", "value": 146, "revenue": 198200 }]
```

### 3.16 `correction_errors` (array)

```json
[{ "label": "بيانات المستأجر ناقصة", "value": 14 }]
```

Alias: `common_errors`. Empty `[]` is fine (“لا طلبات تصحيح بعد”).

### 3.17 Refunds

```json
"refund_requests_by_status": [
  { "label": "قيد المراجعة", "value": 3 },
  { "label": "موافق عليه", "value": 4 }
],
"refund_requests_total": 12480
```

Aliases: `refund_statuses`, `refunds_total_amount`.

---

## 4) Full example (matches current frontend mock)

See the real example payload from the backend team's confirmation (2026-08-25),
matching this shape field-for-field.

---

## 5) Related endpoint (already wired)

Financial settings inputs on the same tab use:

- `GET /admin/reports/profit-settings`
- `PUT /admin/reports/profit-settings`

Body fields the UI edits:
`moyasar_fee_percent`, `meter_fee`, `monthly_salaries`, `operating_budget`, `marketing_budget`.

If these already exist, no change needed. Performance `pnl` / unit economics
should stay consistent with these settings when possible.

---

## 6) What we do NOT need for v1

- Separate endpoints per chart/section — one aggregated `performance` response
- Server-side chart images / PDF for this tab
- Changing query param names (frontend already sends the table in §1)

---

## 7) Acceptance checklist

- [ ] `GET /admin/reports/performance?period=last_30_days` → `200` with `data` as above
- [ ] Filters `contract_type` and `employee_id` actually scope the aggregates
- [ ] Custom range works with `period=custom&date_from&date_to`
- [ ] Empty period returns zeros / `[]`, not `500`
- [ ] `401`/`403` same as other admin report routes
- [ ] Numbers are real (not hardcoded placeholders)

Live — frontend no longer falls back to mock data.
