# Backend request: Reports page — remaining static tabs

## Context

The Reports page (`/home/reports`) has 8 tabs. Two are already wired to live data:
`الموظفون` (Employees → `admin/employees/*/kpis`, see `BACKEND_REQUEST_employee_kpis.md`) and
`المصروفات التشغيلية` (Operating Expenses → `admin/operating-expenses`, already shipped).

The other **6 tabs are still 100% hardcoded mock data** in the frontend
(`components/Reports/mock-data.js`) — nothing below is fetched from the API. We need real endpoints
for each so the tabs can be wired up.

All endpoints below should follow the same conventions already used by `admin/employees/kpis`:

- Auth: Bearer token (employee Sanctum), same as every other `admin/*` route.
- `period` query param: `today | yesterday | last_7_days | last_30_days | all | custom` (add `custom`
  support with `date_from` / `date_to` — this is currently missing even on the employees endpoint, see
  request #2 in the other doc, and should be consistent everywhere).
- Where relevant, please also accept `contract_type` (`residential | commercial`) and `employee_id`
  filters — the Reports UI already has both dropdowns in its global filter bar, they're just not wired to
  anything yet because no endpoint accepts them.
- Money fields in SAR, plain numbers (no formatting/currency string baked in) so the frontend controls
  display.

Proposed endpoints (happy to rename to match existing naming conventions on your side — these are just
placeholders that mirror `admin/employees/kpis`):

## Permissions

The frontend gates the whole `/home/reports` page behind a single permission section, `analytics`
(`section.action` strings like `analytics.view` — see `src/lib/permissions.js`). Today that's only
enforced client-side (route guard + hiding the sidebar link). Please enforce it server-side too on every
endpoint below: return `403` if the caller's role doesn't have `analytics.view`, the same way other
`admin/*` endpoints already check their section.

Two things that need clarifying / building on top of that single check:

1. **Salaries need their own gate.** The app already has a separate, more sensitive permission section,
   `employee_salaries`, distinct from `analytics` and from `employees` — it exists specifically because
   salary figures shouldn't be visible to every role that can see general analytics. The Profits P&L in
   request #3 includes a "الرواتب" (salaries) line and the settings endpoint (#3b) includes
   `monthly_salaries`. Please gate those two specifically behind `employee_salaries.view` (in addition to
   `analytics.view` for the rest of the payload) — either by omitting the salaries line/field entirely
   when the caller lacks that permission, or by a `403` on a sub-resource if that's easier. We'll adjust
   the frontend to hide the P&L row / settings field when the API omits it.

2. **Operating-expenses CRUD has no permission gate at all right now.** The `admin/operating-expenses`
   endpoints we already integrated (list/create/update/delete) only check for a valid employee token —
   any authenticated employee can create/edit/delete expense records. Should this sit behind `analytics`
   (view for list, edit/create/delete for the mutations), or does it warrant its own section (e.g.
   `operating_expenses`) the way `employee_salaries` was split out from `employees`? Whichever you pick,
   let us know the section key so we can gate the "إضافة/تعديل/حذف" buttons with the existing
   `usePermissions().can()` hook instead of showing them to everyone who can reach the tab.

For the new `GET /admin/reports/profit-settings` write endpoint (#3b), please also confirm which action
it should require — `analytics.edit` or `settings.edit` — since it's arguably closer to global config
(`settings` section) than to viewing analytics.

---

## 1. `GET /admin/reports/orders` — "الطلبات" tab

**Params:** `period`, `date_from`, `date_to`, `contract_type`, `employee_id`

**Needed response:**

```json
{
  "data": {
    "kpis": {
      "total": 72,
      "new": 36,
      "paid": 61,
      "draft": 8,
      "incomplete": 2,
      "canceled": 3,
      "returned": 3,
      "avg_completion_minutes": 115
    },
    "by_employee": [
      { "employee_id": 1, "label": "ريان", "value": 30 }
    ],
    "by_contract_type": [
      { "label": "سكني", "value": 46 },
      { "label": "تجاري", "value": 26 }
    ],
    "by_stage": [
      { "stage": "new_request", "label": "طلب جديد", "value": 36 },
      { "stage": "received", "label": "مستلم", "value": 14 },
      { "stage": "property_update_pending", "label": "مرفوع تحديث العقار", "value": 2 },
      { "stage": "draft_pending", "label": "ينتظر مسودة العقد", "value": 4 },
      { "stage": "documented_ejar", "label": "موثق في إيجار", "value": 8 },
      { "stage": "incomplete", "label": "طلب غير مكتمل", "value": 2 },
      { "stage": "returned", "label": "مسترجع", "value": 3 },
      { "stage": "canceled", "label": "ملغي", "value": 3 }
    ]
  }
}
```

`by_stage` should ideally return whatever the canonical order/contract status list is (same source of
truth as `src/lib/contract-statuses.js` on our side) rather than a fixed set — we'll map whatever comes
back.

---

## 2. `GET /admin/reports/sales` — "المبيعات والإيرادات" tab

**Params:** `period`, `date_from`, `date_to`, `contract_type`, `employee_id`

**Needed response:**

```json
{
  "data": {
    "kpis": {
      "total_sales": 18859,
      "payments_count": 61,
      "avg_order_value": 309,
      "discounts_used": 0,
      "refunds": 847,
      "net_revenue": 18012
    },
    "by_period": [
      { "label": "اليوم", "value": 2743 },
      { "label": "هذا الشهر", "value": 18859 },
      { "label": "هذه السنة", "value": 18859 }
    ],
    "daily": [
      { "date": "2026-08-15", "value": 1200 }
    ],
    "revenue_by_contract_type": [
      { "label": "سكني", "value": 10639 },
      { "label": "تجاري", "value": 8220 }
    ],
    "revenue_by_duration": [
      { "label": "سنة واحدة", "value": 16732 },
      { "label": "3 سنوات", "value": 2127 }
    ],
    "summary": {
      "discounts_granted": 0,
      "discounted_orders_count": 0,
      "refunds_total": 847,
      "refund_rate_percent": 4,
      "net_revenue_after_refunds": 18012
    }
  }
}
```

---

## 3. `GET /admin/reports/profits` — "الأرباح والتكاليف" tab

**Params:** `period`, `date_from`, `date_to`

**Needed response:**

```json
{
  "data": {
    "kpis": {
      "customer_income": 18859,
      "gross_profit": 7898,
      "net_profit": -15935,
      "margin_percent": -88,
      "profit_per_order": 137,
      "ad_spend": 6500
    },
    "service_profitability": [
      { "service": "residential_year_1", "label": "توثيق سكني – السنة الأولى", "profit": 118, "margin_percent": 47 }
    ],
    "pnl": [
      { "label": "دخل العملاء (المحصّل)", "value": 18859 },
      { "label": "الاسترجاعات", "value": -847 },
      { "label": "صافي الإيرادات", "value": 18012, "is_subtotal": true },
      { "label": "رسوم منصة إيجار", "value": -9600 },
      { "label": "رسوم بوابة الدفع", "value": -471 },
      { "label": "تكلفة الرسائل", "value": -43 },
      { "label": "إجمالي الربح", "value": 7898, "is_subtotal": true },
      { "label": "مصاريف الإعلانات", "value": -6500 },
      { "label": "مصاريف تشغيلية", "value": -4333 },
      { "label": "الرواتب", "value": -13000 },
      { "label": "صافي الربح", "value": -15935, "is_total": true }
    ]
  }
}
```

Note: the "مصاريف تشغيلية" (operating expenses) P&L line should just be the `summary.total_amount` from
the `admin/operating-expenses` endpoint we already consume for the selected period — please compute it
the same way so the two tabs agree.

### 3b. Settings used to compute the P&L — needs to be a real, persisted resource

The "الإعدادات الحالية (حفظ تلقائي)" card currently edits 4 fields (Moyasar fee %, monthly salaries,
operating-expenses budget, marketing budget) in local React state only — nothing is saved. Please add:

- `GET /admin/reports/profit-settings` → current values
- `PUT /admin/reports/profit-settings` → body `{ moyasar_fee_percent, monthly_salaries, operating_budget, marketing_budget }`

so the "auto-save" label in the UI is actually true, and so these values feed the P&L calculation in #3
above server-side instead of being static assumptions.

---

## 4. `GET /admin/reports/customers` — "العملاء" tab

**Params:** `period`, `date_from`, `date_to`

**Needed response:**

```json
{
  "data": {
    "kpis": {
      "total": 56,
      "new": 54,
      "returning": 2,
      "avg_contracts_per_customer": 1.3,
      "incomplete": 2
    },
    "segments": [
      { "label": "عملاء جدد", "value": 54 },
      { "label": "عملاء عائدون", "value": 2 }
    ],
    "top_customers": [
      { "customer_id": 1, "name": "سعد محمد الغنام", "mobile": "0551234567", "contracts_count": 16, "paid_count": 12, "total_spending": 4057 }
    ]
  }
}
```

`top_customers` should be sorted by `total_spending` desc, capped/paginated (top 10–20 is fine).

---

## 5. `GET /admin/reports/marketing` — "المصادر والتسويق" tab

**Params:** `period`, `date_from`, `date_to`

**Needed response:**

```json
{
  "data": {
    "kpis": {
      "total_orders": 72,
      "paid_customers": 61,
      "sources_count": 5,
      "ad_spend_total": 69500
    },
    "by_source": [
      { "source": "google", "label": "Google", "orders": 21, "paid": 17, "revenue": 5200, "spend": 32000, "cac": 1912, "conversion_percent": 81 }
    ],
    "top_keywords": [
      { "keyword": "عقد إيجار إلكتروني", "revenue": 27600 }
    ],
    "weak_campaigns": [
      { "name": "إكس (تويتر) – ترويج", "roas": 0.84, "profit": -900 }
    ]
  }
}
```

**Flag for discussion:** source/keyword/campaign attribution (`orders.source`, ad spend, ROAS) likely
doesn't live in the contracts/orders DB at all — it's normally an ads-platform integration (Google
Ads/Meta/TikTok) or at minimum a manual "spend" entry per source per period. If there's no attribution
tracked on order creation today (e.g. a `source` field, UTM capture), this tab can't be real without that
groundwork first — worth a call before implementing.

---

## 6. `GET /admin/reports/performance` — "لوحة الأداء" tab

**Params:** `period`, `date_from`, `date_to`

**Needed response:**

```json
{
  "data": {
    "kpis": {
      "revenue": 16342,
      "refunded_count": 3,
      "delayed_count": 3,
      "canceled_count": 20,
      "active_count": 8,
      "total_count": 72
    },
    "conversion_funnel": [
      { "step": "visit", "label": "زيارة", "value": 420 },
      { "step": "order_started", "label": "بدء الطلب", "value": 156 },
      { "step": "paid", "label": "دفع", "value": 61 },
      { "step": "completed", "label": "إتمام", "value": 53 }
    ],
    "daily_orders": [
      { "date": "2026-08-10", "value": 8 }
    ],
    "orders_by_status": [
      { "status": "new", "label": "جديد", "value": 36 }
    ],
    "revenue_by_payment_method": [
      { "method": "card", "label": "بطاقة", "value": 16200 },
      { "method": "apple_pay", "label": "Apple Pay", "value": 1800 },
      { "method": "transfer", "label": "تحويل", "value": 842 }
    ],
    "operational_metrics": {
      "total_orders": 72,
      "avg_receive_seconds": 192,
      "longest_wait_seconds": 2700,
      "sla_percent": 96,
      "delayed_over_24h_count": 0
    },
    "unit_economics": [
      { "service": "residential_year_1", "label": "سكني – سنة", "qty": 46, "value": 10639, "percent": 57 }
    ]
  }
}
```

**Flag for discussion:** `conversion_funnel`'s first step ("زيارة" / site visits) is web-analytics data
(GA/Meta Pixel etc.), not something the admin backend tracks. Either drop that step, or point us at
whatever analytics source has it so we can decide how to merge it — the rest of the funnel (order
started → paid → completed) is derivable from the orders table.

---

## Summary table

| Tab | Endpoint | Permission | Blocking gap (if any) |
|---|---|---|---|
| الطلبات | `GET /admin/reports/orders` | `analytics.view` | — |
| المبيعات والإيرادات | `GET /admin/reports/sales` | `analytics.view` | — |
| الأرباح والتكاليف | `GET /admin/reports/profits` + `GET/PUT /admin/reports/profit-settings` | `analytics.view`, plus `employee_salaries.view` to see/edit salaries specifically | needs the 4 settings fields persisted somewhere |
| العملاء | `GET /admin/reports/customers` | `analytics.view` | — |
| المصادر والتسويق | `GET /admin/reports/marketing` | `analytics.view` | needs order source/UTM attribution + ad spend tracked somewhere first |
| لوحة الأداء | `GET /admin/reports/performance` | `analytics.view` | needs a site-visit/analytics number for the funnel's first step, or we drop that step |
| المصروفات التشغيلية (already shipped) | `admin/operating-expenses` CRUD | **none enforced today** — needs a section key assigned | — |

Once these land we'll swap out the corresponding `mock-data.js` exports for real hooks, same pattern as
`use-employee-kpis.js` / `use-operating-expenses.js`.
