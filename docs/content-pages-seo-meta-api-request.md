# Prompt: Page-level SEO meta (home, about, blogs, services, faqs)

Arabic-only public site (`aqdi.sa`). No English meta fields.

Wire admin UI + public pages to existing backend APIs. Do not invent new
endpoints. Do not add per-blog / per-service / per-FAQ-item meta here (those
stay on their own CRUD screens).

## Pages

| Admin UI | Public page | API key | Permission |
|---|---|---|---|
| محتوى → الصفحة الرئيسية → تبويب SEO | `https://aqdi.sa/` | `home` | `app_content` |
| محتوى → من نحن → تبويب SEO | `https://aqdi.sa/about` | `about` | `app_content` |
| محتوى → المقالات (بطاقة SEO أعلى الصفحة) | blogs index | `blogs` | `blogs` |
| محتوى → صفحات الخدمات (بطاقة SEO أعلى الصفحة) | services index | `services` | `analytics` |
| محتوى → الأسئلة الشائعة (بطاقة SEO أعلى الصفحة) | FAQs index | `faqs` | `faqs` |

System admin bypasses. GET → `{section}.view`, POST → `{section}.edit`.

## Frontend (wired)

- `CONTENT_PAGE_ENDPOINTS` → `home` | `about` | `blogs` | `services` | `faqs`
- `components/content/page-seo-form.jsx`
- `components/content/content-page-seo-panel.jsx`
- Home/About SEO tabs; blogs/services/faqs top SEO cards
- FAQs also under `/home/settings/faqs` (same SEO card above the table)

## Endpoints

| Method | Path |
|---|---|
| GET / POST | `/api/admin/content-pages/home` |
| GET / POST | `/api/admin/content-pages/about` |
| GET / POST | `/api/admin/content-pages/blogs` |
| GET / POST | `/api/admin/content-pages/services` |
| GET / POST | `/api/admin/content-pages/faqs` |

POST multipart (SEO only):

```
meta_title
meta_description
```

Optional nested: `meta[meta_title]`, `meta[meta_description]`.  
Frontend accepts flat or `data.meta`.

Public (no auth):

```
GET /api/v2/content-pages/{home|about|blogs|services|faqs}
```

FAQ **items** stay on `GET /api/v2/common-questions` and admin `/api/admin/faqs`.

## GET shape

```json
{
  "success": true,
  "code": 200,
  "data": {
    "page": "faqs",
    "meta_title": "الأسئلة الشائعة — عقدي",
    "meta_description": "إجابات عن توثيق عقود الإيجار إلكترونيًا.",
    "sections": {},
    "meta": {
      "meta_title": "الأسئلة الشائعة — عقدي",
      "meta_description": "إجابات عن توثيق عقود الإيجار إلكترونيًا."
    },
    "updated_at": "2026-09-08T08:00:00+00:00"
  }
}
```

- `home` / `about`: keep `sections` editor; SEO is extra.
- `blogs` / `services` / `faqs`: meta-only (`sections` = `{}`).
- Empty string = use public fallback.

| Field | Notes |
|---|---|
| `meta_title` | Arabic title / og:title (~60 preferred, max 255) |
| `meta_description` | Arabic description / og:description (~160 preferred, max 500) |

## POST rules

1. Send only meta keys for SEO saves — never empty section trees.
2. Do not wipe `sections` on home/about when saving SEO.
3. Omitting a key leaves the stored value unchanged.
4. Empty string = explicit clear.

## Public site

Non-empty meta → `<title>`, `<meta name="description">`, `og:title`, `og:description` on:

| Route | API key |
|---|---|
| `/` | `home` |
| `/about` | `about` |
| blogs index | `blogs` |
| services index | `services` |
| FAQs index | `faqs` |

Not on single blog / service / FAQ item pages.

## Acceptance

- [ ] All five keys in admin GET/POST
- [ ] SEO save does not wipe home/about sections
- [ ] FAQs admin has top SEO card (not per-question)
- [ ] Public indexes consume stored meta; empty → fallback
- [ ] Auth: view GET / edit POST (system admin bypass)
