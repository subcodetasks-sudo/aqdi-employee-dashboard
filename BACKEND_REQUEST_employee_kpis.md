# Backend request: Employee KPIs API — gaps for the Reports → "الموظفون" tab

## Context

The frontend now consumes the live `admin/employees/*/kpis` endpoints (confirmed working as of today) to
power the "الموظفون" (Employees) tab on the Reports page. Three gaps remain that block full parity with
the tab's design. Also one security note unrelated to this feature.

Current working endpoints (for reference — no changes needed to these, they're fine as-is):

- `GET /api/admin/employees/me/kpis?period=`
- `GET /api/admin/employees/kpis?period=` — list, all employees
- `GET /api/admin/employees/{id}/kpis?period=` — single employee detail
- `GET /api/admin/employees/{id}/kpis/details?period=` — identical payload to the one above

`period` currently accepts: `today | yesterday | last_7_days | last_30_days | all`.

Sample of the current `cards[]` shape per employee (from `GET /admin/employees/kpis`):

```json
{
  "employee": { "id": 1, "name": "...", "name_label": "...", "is_you": true, "role": "admin", "role_title": "...", "profile_image": null, "is_active": true, "is_online": false },
  "shift": { "name": "وردية الصباح", "start": "09:00", "end": "17:00", "label_ar": "...", "is_on_duty": true, "duty_status": "inside", "duty_status_label_ar": "..." },
  "cards": [
    { "key": "received", "label_ar": "استلم (اليوم)", "value": 0, "tone": "default" },
    { "key": "completed", "label_ar": "منجز بالفترة", "value": 0, "tone": "default" },
    { "key": "open_now", "label_ar": "مفتوح الآن", "value": 25, "tone": "default" },
    { "key": "late_over_24h", "label_ar": "متأخر > 24 س", "value": 25, "tone": "danger" }
  ],
  "avg_receive": { "key": "avg_receive_work_minutes", "label_ar": "متوسط الاستلام (د عمل)", "value": 274.7, "value_label": "274.7", "unit": "د عمل" },
  "receive_sla": { "key": "receive_sla_within_5m", "label_ar": "التزام الاستلام ≤5د", "percent": 96, "threshold_minutes": 5, "met_count": 24, "total": 25 }
}
```

This is great for **receiving SLA** (time-to-first-touch on a new order), but the Reports UI also needs a
per-employee **workload/outcome** breakdown that this payload doesn't cover at all.

## What's needed

### 1. Per-employee workload/outcome metrics

Add to each item in `GET /admin/employees/kpis` (and the single-employee endpoints), following the same
`cards[]` convention already used:

- `assigned` — count of orders/contracts currently assigned to this employee in the selected period
- `returned` — count of orders this employee's contracts had returned/refunded in the period
- `avg_process_minutes` — average time from assignment/receipt to completion (not to be confused with
  `avg_receive_work_minutes`, which only measures time-to-receive)
- `revenue` — total paid revenue attributable to this employee's completed contracts in the period, in SAR

Suggested shape, matching the existing `cards`/`avg_receive` pattern so the frontend mapping stays trivial:

```json
"cards": [
  ...existing received/completed/open_now/late_over_24h...,
  { "key": "assigned", "label_ar": "طلبات مسندة", "value": 30, "tone": "default" },
  { "key": "returned", "label_ar": "مسترجع", "value": 1, "tone": "warning" }
],
"avg_process": { "key": "avg_process_minutes", "label_ar": "متوسط المعالجة", "value": 80, "value_label": "1 س 20 د", "unit": "دقيقة" },
"revenue": { "key": "revenue_sar", "label_ar": "إيراد محقق", "value": 12400, "currency": "SAR" }
```

### 2. Custom date range support

`period` currently only accepts the 5 fixed buckets. The Reports UI has a "مدة محددة" (custom range)
filter with no backend equivalent right now — it silently falls back to `all`. Please add optional
`date_from` / `date_to` (or `period=custom&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD`) to all 4 endpoints,
consistent with however date filtering is already done elsewhere in the admin API.

### 3. (Nice to have) Aggregate summary on the list endpoint

`GET /admin/employees/kpis` returns `items[]` per employee but no rollup. The frontend currently sums
`received`/`completed`/`late_over_24h` and averages `avg_receive` client-side across `items[]` to build
the top KPI row. If it's cheap to add, a top-level `summary` object with the same aggregation would save
that client-side work and guarantee consistency, e.g.:

```json
"summary": {
  "employees_count": 5,
  "received_total": 33,
  "completed_total": 8,
  "late_over_24h_total": 25,
  "avg_receive_work_minutes": 274.7
}
```

Not blocking — the frontend already computes this — just flagging in case it's trivial on your side.

## Unrelated but worth fixing: debug mode in production

Hitting a non-existent route on `aqid.subcodeco.com` currently returns a full Laravel stack trace,
including absolute server file paths
(`/home/u664614650/domains/aqid.subcodeco.com/backend-aqdi/vendor/laravel/framework/...`). That's
`APP_DEBUG=true` (or equivalent) active on what looks like the production host. Recommend turning it off
and returning a generic 404 JSON body instead.
