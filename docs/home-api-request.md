# Backend request: Home welcome dashboard

Updated: 2026-08-25

The redesigned `/home` welcome screen currently runs on **frontend mock data**
(`components/home/home-mock-data.js`). We need a single authenticated admin
endpoint that returns the live payload so we can drop the mock.

Frontend source of truth (UI wired to mock today):
- `components/home/HomeWelcomeWrapper.jsx`
- `components/home/home-mock-data.js`

---

## 1) Requested endpoint

```
GET /admin/home
```

Auth: same Bearer admin token as the rest of `/admin/*`.

Optional query (nice-to-have, not blocking):
- `activity_limit` (default `4`, max `10`) — how many recent activity rows to return

No request body.

---

## 2) Expected response shape

Please return JSON in this shape (field names can be snake_case as below).
Extra fields are fine; missing ones should be `null` or omitted so the UI can fall back.

```json
{
  "success": true,
  "data": {
    "motto": {
      "title": "الإتقــان طريــق الخلــود في الأثــر",
      "body": "الإتقان ليس في كثرة العمل، بل في صدق النية وجودة الأداء. من يعمل بضمير يترك أثراً لا يُمحى.",
      "verse": "﴿لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا﴾",
      "footnote": "العبرة بمعيار الجودة والإحسان، لا بالكثرة والقلة.",
      "brand_label": "عقدي · لوحة الموظفين"
    },
    "summary": {
      "pending_orders": 24,
      "completed_today": 11,
      "return_orders": 3,
      "new_clients_this_week": 8,
      "unreceived_realtime": 5,
      "revenue_today": 18450,
      "currency": "SAR"
    },
    "quick_actions": [
      {
        "id": "realtime-orders",
        "label": "الطلبات مباشر",
        "href": "/home/realtime-orders",
        "badge_count": 5
      },
      {
        "id": "orders",
        "label": "جميع الطلبات",
        "href": "/home/orders",
        "badge_count": null
      },
      {
        "id": "clients",
        "label": "العملاء",
        "href": "/home/clients",
        "badge_count": null
      },
      {
        "id": "return-orders",
        "label": "طلبات الاسترجاع",
        "href": "/home/return-orders",
        "badge_count": 3
      },
      {
        "id": "reports",
        "label": "التقارير",
        "href": "/home/reports",
        "badge_count": null
      },
      {
        "id": "invoices",
        "label": "الفواتير",
        "href": "/home/invoices",
        "badge_count": null
      }
    ],
    "recent_activity": [
      {
        "id": 1,
        "type": "order_completed",
        "title": "اكتمل طلب عقد إيجار سكني",
        "subtitle": "طلب #4821 · العميل: سارة الحربي",
        "href": "/home/orders/4821",
        "created_at": "2026-08-25T09:42:00+03:00"
      }
    ],
    "primary_cta": {
      "label": "ابدأ الآن",
      "href": "/home/reports"
    }
  }
}
```

---

## 3) Field definitions

### `motto` (optional CMS / config)

Static inspiration text shown on the left of the welcome panel.
If omitted, frontend keeps its hardcoded Arabic defaults.

| Field | Type | Notes |
|---|---|---|
| `title` | string | Main headline |
| `body` | string | Supporting paragraph |
| `verse` | string \| null | Quranic verse line (optional) |
| `footnote` | string \| null | Closing note |
| `brand_label` | string \| null | Small eyebrow above the title |

### `summary` (required)

Live KPI counters for the signed-in admin (scoped by their permissions if applicable).

| Field | Type | Meaning |
|---|---|---|
| `pending_orders` | number | Incomplete / in-progress orders |
| `completed_today` | number | Orders completed today (server timezone, preferably Asia/Riyadh) |
| `return_orders` | number | Open return/refund requests |
| `new_clients_this_week` | number | New clients registered in the last 7 days |
| `unreceived_realtime` | number | Unreceived realtime orders (same source as sidebar badge if possible) |
| `revenue_today` | number | Today's collected revenue (numeric, no currency symbol) |
| `currency` | string | ISO code, e.g. `"SAR"` |

### `quick_actions` (required, may be filtered by permission)

Shortcuts under the welcome card. Prefer only links the current user can open.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable key (`realtime-orders`, `orders`, …) |
| `label` | string | Arabic label |
| `href` | string | Frontend path under `/home/...` |
| `badge_count` | number \| null | Optional badge; omit/`null` when zero |

### `recent_activity` (required, can be `[]`)

Newest first. Keep it light — titles/subtitles are display strings the UI shows as-is.

| Field | Type | Notes |
|---|---|---|
| `id` | number \| string | Unique row id |
| `type` | string | One of: `order_completed`, `return_requested`, `client_registered`, `invoice_paid` (extendable) |
| `title` | string | Primary line |
| `subtitle` | string \| null | Secondary line |
| `href` | string \| null | Deep link into the dashboard |
| `created_at` | string | ISO-8601 with offset |

### `primary_cta` (optional)

Main button on the welcome desk. If omitted, frontend defaults to reports.

| Field | Type | Notes |
|---|---|---|
| `label` | string | Button label |
| `href` | string | Destination path |

---

## 4) Business rules / scoping

1. Counts should respect the authenticated admin’s visibility (same permission model as list pages) when feasible. Super-admins see global totals.
2. Timezone for “today” / “this week”: **Asia/Riyadh**.
3. `unreceived_realtime` should match whatever powers the sidebar “الطلبات مباشر” badge, so numbers do not disagree.
4. `quick_actions` and `recent_activity[].href` may be frontend paths; backend does not need to resolve React routes — just return the agreed paths above (or omit actions the user cannot access).
5. Motto may be hard-coded on the backend for v1; a CMS later is fine.

---

## 5) What we do NOT need for v1

- User profile fields (`name`, `role`, `avatar`) — already available from the auth/user store.
- Server-rendered clock/date — the UI uses the client clock.
- Pagination for activity (a short list is enough).
- Separate endpoints per KPI — one aggregated `GET /admin/home` is preferred.

---

## 6) Acceptance checklist for backend

- [ ] `GET /admin/home` returns `200` with the `data` object above for a valid admin token
- [ ] `401` when unauthenticated (same behavior as other `/admin/*` routes)
- [ ] `summary.*` numbers are real counts, not placeholders
- [ ] `recent_activity` ordered newest → oldest
- [ ] Empty states work: `recent_activity: []`, zeros in `summary` are OK
- [ ] (Optional) actions filtered by the caller’s permissions

Once this lands, frontend will replace `HOME_MOCK` with a React Query hook
(`src/hooks/use-home.js` → `axiosInstance.get('/admin/home')`).
