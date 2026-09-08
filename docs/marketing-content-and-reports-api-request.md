# Prompt: Marketing — Content & Reports endpoints (the unwired tabs)

Backend request from the Aqdi admin dashboard. Arabic-first, RTL. Same conventions as
`prompts/admin-marketing-tracking.md`: **one endpoint per screen section**, shared
period filter, do not make the client compute rollups, return `*_label_ar` for every
enum, money is SAR with `currency_label_ar` (`ريال`).

Two dashboard tabs under `/home/marketing-and-content` are still on static fixtures
because no endpoint exists:

- **إدارة المحتوى** (Content) — service pages + articles
- **التقارير** (Reports) — marketing report views + export

`components/content/marketing/tabs/ContentTab.jsx` and `ReportsTab.jsx` +
`components/content/marketing/shared/mock-data.js` show the exact shapes the UI already
renders — match the field names below and the frontend wires with zero UI changes.

---

## Common

- Header: `Authorization: Bearer {employee_token}`, `Accept: application/json`
- Optional: `Accept-Language: ar | en`
- Envelope: `{ "success": true, "code": 200, "message": "...", "data": { } }`
- Empty arrays / `null` are valid.

### Shared period filter (Reports only; Content is not period-scoped)

| Query | Values |
|---|---|
| `period` | `today` \| `yesterday` \| `last_7_days` \| `last_30_days` \| `all` \| `custom` |
| `date_from` + `date_to` | `YYYY-MM-DD`, both together ⇒ `period=custom` |

Every Reports response echoes `period`, `date_from`, `date_to`, `periods[]`
(`{ key, label_ar, selected }`), `currency`, `currency_label_ar` — identical to
`/admin/marketing-tracking`.

### Permissions

| Screen | Permission |
|---|---|
| Service pages (list + CRUD) | `analytics.view` / `analytics.create` / `analytics.edit` / `analytics.delete` |
| Articles (list + CRUD) | `blogs.view` / `blogs.create` / `blogs.edit` / `blogs.delete` |
| Marketing reports (all GETs + export) | `analytics.view` |

Super admin (مدير النظام) bypasses. Hide a section entirely if the employee lacks its view permission.

---

# 1. إدارة المحتوى — Content

## 1.1 Service pages — `GET /api/admin/marketing/service-pages`

SEO landing / static pages for the marketing site. Not period-scoped.

```json
{
  "data": {
    "summary": {
      "total": 3,
      "published": 2,
      "drafts": 1
    },
    "items": [
      {
        "id": 12,
        "title": "توثيق عقد إيجار سكني",
        "path": "/residential",
        "target_keyword": "عقد إيجار سكني",
        "meta_title": "توثيق عقد إيجار سكني | عقدي",
        "meta_description": "أنجز توثيق عقد الإيجار السكني إلكترونيًا عبر عقدي.",
        "status": "published",
        "status_label_ar": "منشور",
        "updated_at": "2026-05-12",
        "url": "https://aqdi.sa/residential"
      }
    ]
  }
}
```

- `status` enum: `published` (منشور) / `draft` (مسودة) / `archived` (مؤرشف).
- `updated_at`: date only; `null` → UI shows `–`.
- `meta_title` / `meta_description`: Arabic-only SEO for the public page (empty string OK).

### Mutations

| Method | Path | Body |
|---|---|---|
| `POST` | `/api/admin/marketing/service-pages` | `{ title, path, target_keyword, meta_title?, meta_description?, status, body? }` |
| `PUT` | `/api/admin/marketing/service-pages/{id}` | same, all optional |
| `DELETE` | `/api/admin/marketing/service-pages/{id}` | — |

`meta_title` / `meta_description` are Arabic-only page SEO fields (empty string OK).
Return them on list items so the admin table can show the current meta title.

Return the created / updated row in `data`. `422` with `message` (Arabic) on validation
error (e.g. duplicate `path`).

> If a page body / rich-text editor is out of scope for now, `body` can be omitted and
> the UI keeps "edit" pointing at the CMS. The list + status + counts are the priority.

---

## 1.2 Articles — `GET /api/admin/marketing/articles`

The blog CRUD already lives at `/admin/blogs`. This endpoint is the **marketing view**
of the same content: the list plus per-article attribution and the editorial queue.
Accepts the period filter (attribution numbers are period-scoped) **and**:

| Query | Values |
|---|---|
| `category` | category slug/name, or omit for all |
| `status` | `published` \| `scheduled` \| `draft` \| `archived`, or omit |

```json
{
  "data": {
    "summary": {
      "total": 6,
      "published": 4,
      "scheduled": 1,
      "archived": 0,
      "views": 14430,
      "attributed_revenue": 57200
    },
    "categories": [
      { "key": "all", "label_ar": "الكل" },
      { "key": "tenant-tips", "label_ar": "نصائح للمستأجرين" }
    ],
    "items": [
      {
        "id": 341,
        "title": "دليلك الكامل لتوثيق عقد الإيجار إلكترونيًا 2026",
        "meta_title": "دليلك لتوثيق عقد الإيجار إلكترونيًا | عقدي",
        "meta_description": "خطوات توثيق عقد الإيجار إلكترونيًا عبر منصة عقدي.",
        "category_label_ar": "أدلة إرشادية",
        "author": "ريان",
        "status": "published",
        "status_label_ar": "منشور",
        "published_at": "2026-07-15",
        "scheduled_at": null,
        "words": 1840,
        "views": 4820,
        "leads": 186,
        "attributed_revenue": 20400
      }
    ],
    "editorial_queue": [
      {
        "id": 502,
        "title": "رسوم توثيق العقود التجارية: ما تحتاج معرفته",
        "category_label_ar": "أخبار تنظيمية",
        "scheduled_at": "2026-07-27",
        "status": "scheduled",
        "status_label_ar": "مجدول"
      }
    ]
  }
}
```

- `views` / `leads` / `attributed_revenue`: attribution for the selected period
  (`0` when no data — never `null`).
- `editorial_queue`: `draft` + `scheduled` articles, soonest `scheduled_at` first.
- List items should include `meta_title` (and ideally `meta_description`) from the
  blog record — edit/create still goes through `/admin/blogs` which already accepts
  `meta_title` / `meta_description` (Arabic-only).
  unscheduled drafts have `scheduled_at: null` (UI shows «غير مجدول»).
- CRUD: reuse `/admin/blogs` (`POST` / `PUT /admin/blogs/{id}` / `DELETE`). Add a
  `scheduled_at` field there if it doesn't exist. If a create/edit needs a
  marketing-specific field (target keyword, canonical path) say so and we'll add it.

---

# 2. التقارير — Reports

One overview fetch + one channel-table fetch. Both take the shared period filter and
an optional `channel` (`google` \| `meta` \| `tiktok` \| `snapchat` \| `twitter` \| `all`).

## 2.1 Report overview — `GET /api/admin/marketing/reports`

```json
{
  "data": {
    "period": "last_30_days",
    "date_from": "2026-08-03",
    "date_to": "2026-09-01",
    "periods": [{ "key": "last_30_days", "label_ar": "آخر 30 يومًا", "selected": true }],
    "currency": "SAR",
    "currency_label_ar": "ريال",

    "highlights": [
      { "key": "best_page",     "title_ar": "أفضل صفحة",          "label": "الصفحة الرئيسية",              "badge": null,   "detail_ar": "18,200 زيارة" },
      { "key": "best_keyword",  "title_ar": "أفضل كلمة بحث",       "label": "عقد إيجار إلكتروني",           "badge": "1",    "detail_ar": "14,200 بحث/شهر · 27,600 ريال" },
      { "key": "best_campaign", "title_ar": "أفضل حملة",           "label": "بحث قوقل – كلمات النية العالية","badge": { "label_ar": "قوقل", "color": "blue" }, "detail_ar": "ROAS x3.36 · 214 طلب" },
      { "key": "best_source",   "title_ar": "أفضل مصدر للعملاء",   "label": "قوقل",                          "badge": { "label_ar": "قوقل", "color": "blue" }, "detail_ar": "323 عميل · 93,100 ريال إيراد" }
    ],

    "comparison": {
      "title_ar": "مقارنة الفترات – الحالية مقابل السابقة (31 يومًا)",
      "items": [
        { "key": "orders",             "label_ar": "الطلبات",          "value": 512,     "previous_value": 42,   "change_percent": 1119 },
        { "key": "ad_spend",           "label_ar": "الصرف الإعلاني",   "value": 57371,   "previous_value": 11730,"change_percent": 389,  "is_money": true },
        { "key": "attributed_revenue", "label_ar": "الإيراد المُسند",  "value": 146711,  "previous_value": 11760,"change_percent": 1147, "is_money": true }
      ]
    },

    "stats": [
      { "key": "new_customers",        "label_ar": "عملاء جدد",                  "value": 612,    "change_percent": 12 },
      { "key": "returning_customers",  "label_ar": "عملاء عائدون",               "value": 203,    "change_percent": 19 },
      { "key": "marketing_cost",       "label_ar": "تكلفة التسويق",              "value": 69500,  "is_money": true },
      { "key": "total_revenue",        "label_ar": "إجمالي الإيراد",             "value": 249650, "is_money": true },
      { "key": "revenue_per_riyal",    "label_ar": "إيراد لكل ريال تسويق",       "value": 3.59,   "suffix": "x" }
    ]
  }
}
```

- `badge`: `null`, or `"1"` (rank pill), or `{ label_ar, color }` where `color` ∈
  `blue | purple | black | yellow | gray` (same tokens as `marketing-tracking`).
- `change_percent`: signed integer vs the previous equal-length period; `null` if N/A.
  Green ▲ when ≥ 0, red ▼ when < 0.
- `is_money: true` ⇒ append `currency_label_ar`. `suffix` ⇒ append literally.
- Do **not** send pre-formatted strings for `value` — send the number.

## 2.2 Channel report table — `GET /api/admin/marketing/reports/channels`

Same 5 channels, fixed order (Google, Meta, TikTok, Snapchat, X). Like
`/admin/marketing-tracking/channels` but **with `leads` and a totals row**.

```json
{
  "data": {
    "range_label_ar": "تقرير القنوات: 03-08-2026 ← 01-09-2026 · 5 صفوف",
    "rows": [
      {
        "source": "google", "label_ar": "قوقل", "color": "blue",
        "spend": 24500, "revenue": 84500,
        "roas": 3.45, "roas_tone": "good",
        "leads": 800, "conversions": 292,
        "cac": 84, "profit": 60000
      }
    ],
    "total": {
      "spend": 57371, "revenue": 146711,
      "roas": 2.56, "roas_tone": "good",
      "leads": 1898, "conversions": 512,
      "cac": 812, "profit": 89340
    }
  }
}
```

- `roas` / `cac`: `null` ⇒ UI shows `—`. `roas_tone`: `good | ok | bad | muted`.
- `profit`: signed number; UI prefixes `+` when > 0.

## 2.3 Export — `POST /api/admin/marketing/reports/export`

```json
// request
{ "format": "pdf", "period": "last_30_days", "date_from": null, "date_to": null, "channel": "all" }
```

- `format`: `pdf` \| `xlsx` \| `csv` \| `email`.
- `pdf` / `xlsx` / `csv` → return the file (binary, correct `Content-Type` +
  `Content-Disposition`), or `{ "data": { "url": "https://…" } }` to a short-lived link.
- `email` → send to the current employee, respond `{ "success": true, "message": "أُرسل التقرير إلى بريدك" }`.
- If `email` overlaps the pending generic `POST /admin/reports/email` request
  (see `BACKEND_WIRING_AUDIT.md` / `docs/reports-export-api-request.md`), reuse that
  and this endpoint only handles the file formats.

---

## Suggested routes recap

| Path | Endpoint(s) |
|---|---|
| `/home/marketing-and-content?tab=content` (services) | `GET/POST/PUT/DELETE /admin/marketing/service-pages` |
| `/home/marketing-and-content?tab=content` (articles) | `GET /admin/marketing/articles` + `/admin/blogs` CRUD |
| `/home/marketing-and-content?tab=reports` | `GET /admin/marketing/reports`, `GET /admin/marketing/reports/channels`, `POST /admin/marketing/reports/export` |

## Do / don't

- **Do** send numbers, not formatted strings; **do** send `*_label_ar` for every enum.
- **Do** keep the 5 channels + fixed order in 2.2, with a totals row.
- **Don't** compute ROAS / CAC / change % on the client.
- **Don't** period-scope the service-pages list (it's content, not analytics).
