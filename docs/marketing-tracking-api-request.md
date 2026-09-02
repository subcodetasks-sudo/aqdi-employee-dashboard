# Marketing Tracking — wiring status & remaining backend gaps

**Date:** 2026-09-01
**Author:** frontend (Claude)
**Frontend contract:** `prompts/admin-marketing-tracking.md` + `postman/AQDI-Admin-Marketing-Tracking.postman_collection.json`
**Tested against:** `https://aqid.subcodeco.com/api` as `mohammed@aqdi.com` (role `admin` / مدير النظام, `is_system_admin: true`, has `analytics.*`).

---

## TL;DR

- The **3 core endpoints now return 200** and the frontend is **wired and verified
  field-by-field** against the live payloads (see §2). Build + lint clean.
- They return **all-zero / empty data** because there is no UTM-tagged traffic and
  no ad-spend imported yet — not a bug.
- **Still broken:** the Google Search Console side (`/admin/seo-google/*`) — missing
  `google_seo_connections` table + missing `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  env. Until that's done, keyword ranks + `top_pages` stay empty (UI already degrades
  gracefully: `—` ranks, "اربط Search Console" hint).
- **Not in the collection at all:** the التقارير (Reports) read views and the
  الربط والبكسلات (Pixels) management screens — see §4.

> ⚠️ I imported one throwaway `ad_spend_dailies` row while testing
> (`platform=google, campaign_name="t", spend=1, spent_on=2026-08-01`). Please delete it.

---

## 1. Endpoint test results (live, 2026-09-01)

| Endpoint | HTTP | Notes |
|---|---|---|
| `GET /admin/marketing-tracking?period=last_30_days` | **200 ✅** | full payload, all-zero data |
| `GET /admin/marketing-tracking?period=last_7_days` / `?period=all` / custom range | **200 ✅** | period echo + `periods[]` correct |
| `GET /admin/marketing-tracking/keywords` | **200 ✅** | `summary` + `items: []` |
| `GET /admin/marketing-tracking/channels` | **200 ✅** | `funnel[]` (4) + `channels[]` (5, fixed order) |
| `GET /admin/reports/marketing/utm-template` | **200 ✅** | richer than doc — also returns `accounts[]` with `configured` / `missing` |
| `POST /admin/reports/marketing/spend` | **200 ✅** | `{ synced: 1 }` — writes to `ad_spend_dailies` |
| `POST /admin/reports/marketing/sync` | **200** | `{ google: { skipped: true, reason: "not_configured", missing: [developer_token, client_id, client_secret, refresh_token, customer_id] } }` |
| `GET /admin/seo-google/status` | **500 ❌** | `Base table or view not found: 'google_seo_connections'` |
| `POST /admin/seo-google/connect` | **422 ❌** | `GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET غير موجودين` |
| `GET` / `POST /admin/seo-google/search-console/sites` | **422 ❌** | missing `google_seo_connections` table |

---

## 2. Live payloads observed (what the frontend is now bound to)

### `GET /admin/marketing-tracking`
```
periods[]        : { key, label_ar, selected }   // keys: today|yesterday|last_7_days|last_30_days|all|custom
period, date_from, date_to, currency ("SAR"), currency_label_ar ("ريال")
summary          : { roas|null, spend, revenue, profit, roas_caption_ar, roas_caption_en }
kpis             : { cac|null, conversion_rate, paying_customers, marketing_orders,
                     app_visits: { value, source, change_percent },
                     website_visits: { value, source, change_percent } }
chart[]          : { source, label_ar, label_en, spend, revenue }   // always 5: google, meta, tiktok, snapchat, twitter
top_keywords[]   : []        // { keyword, rank, status, status_label_ar } when populated
top_pages[]      : []        // needs Search Console
top_campaigns[]  : []        // { campaign, label_ar, color, orders } when populated
best_campaign    : null      // { campaign, label_ar, color, roas, result_key, result_label_ar, result_amount }
weakest_campaign : null
```

### `GET /admin/marketing-tracking/keywords`
```
summary : { organic_revenue, organic_clicks, decreased, increased, average_rank|null, target_keywords }
items[] : []   // { keyword, page_path, current_rank|null, rank_tone, previous_rank|null,
               //   search_volume, competition, competition_label_ar, status, status_label_ar, revenue }
```

### `GET /admin/marketing-tracking/channels`
```
funnel[]  : { key, label_ar, label_en, value, previous_value, change_percent, rate_from_previous, share_percent }
            // keys: impressions, clicks, leads, conversions
channels[]: { source, label_ar, label_en, color, spend, revenue, profit, roas|null,
              roas_tone ("good"|"ok"|"bad"|"muted"), conversions, cac|null, currency }
            // always 5, fixed order: google, meta, tiktok, snapchat, twitter
```

All field names match `prompts/admin-marketing-tracking.md`. No frontend changes needed
for the happy path.

---

## 3. Remaining backend work

### 3.1 Google Search Console (blocking keyword ranks + top pages)
1. Migration: create `google_seo_connections` table.
2. Set env `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (OAuth app with Search Console
   + Analytics read-only scopes).
3. Then run `POST /admin/seo-google/connect` → open `auth_url` → grant → select site.

Until then: `keywords.items[].current_rank` = null, `top_pages` = [], `top_keywords[].rank` = null.
The UI handles all three (shows `—` + a quiet "اربط Search Console" hint).

### 3.2 Ad-spend data (numbers stay 0 without it)
- Configure ad-account credentials so `POST /admin/reports/marketing/sync` works
  (Google: `developer_token, client_id, client_secret, refresh_token, customer_id`;
  Meta: `access_token, ad_account_id`; TikTok: `access_token, advertiser_id`;
  Snapchat: `client_id, client_secret, refresh_token, ad_account_id`;
  X: `account_id, bearer_token`). Current `configured: false` for all 5.
- OR import manually via `POST /admin/reports/marketing/spend`.

### 3.3 UTM attribution (so `source` / `campaign` / `keyword` aren't all "direct")
- `contracts.utm_*` columns are now present (endpoints no longer 500), but they must
  be **populated at order-creation** from the landing URL / click-ids
  (`gclid, fbclid, ttclid, twclid, sccid`) and the marketing site must tag its links
  using `GET /admin/reports/marketing/utm-template`.

### 3.4 Field-mapping confirmation (nice to have)
Once there's real data, please share one non-empty response per endpoint so we can
confirm `top_campaigns` / `best_campaign` / keyword `items` shapes and the
`*_tone` / `*_label_ar` enum values — those were coded to the prompt doc, not seen live.

---

## 4. Content & Reports — NOW BACKED AND WIRED (2026-09-02)

The backend shipped `/admin/marketing/service-pages`, `/admin/marketing/articles`,
`/admin/marketing/reports`, `/admin/marketing/reports/channels`, and
`/admin/marketing/reports/export`. All tested **200** (see
`docs/marketing-content-and-reports-api-request.md` for the payloads). Frontend wired:

| Tab | Endpoints | State |
|---|---|---|
| إدارة المحتوى → صفحات الخدمات | `GET/POST/PUT/DELETE /admin/marketing/service-pages` | ✅ list + inline create/edit/delete (tested: create 201, update 200, delete 200) |
| إدارة المحتوى → المقالات | `GET /admin/marketing/articles` + `/admin/blogs` create/edit routes | ✅ list + attribution + editorial queue; create/edit link to `/home/settings/blogs/*` |
| التقارير | `GET /admin/marketing/reports`, `/reports/channels`, `POST /reports/export` | ✅ highlights, comparison, stat cards, channel table + totals, export (pdf/xlsx/csv tested → file; email tested → 200 "أُرسل التقرير إلى بريدك") |

New hooks: `src/hooks/use-marketing-content.js`, `src/hooks/use-marketing-reports.js`.

Minor backend follow-ups (non-blocking, UI already tolerates):
- articles `category_label_ar` / `author` come back `null` (blogs table has no such columns);
  `categories` only returns `all`. Populate when the blog schema gains them.
- `reports.stats[].revenue_per_riyal.value` is `null` when `marketing_cost = 0` — UI shows `—`.

---

## 4b. Still not covered by any collection — needs a separate backend decision

`prompts/admin-marketing-tracking.md` scopes itself to 3 read endpoints + the "Related"
group (Search Console connect, ad-spend import/sync, UTM template). It says nothing about:

### 4.1 إدارة المحتوى (Content tab) — still mock
- **صفحات الخدمات (SEO landing pages):** no endpoint. Needs list + CRUD
  (`title, path, target_keyword, status, updated_at` + counts).
- **المقالات (articles):** CRUD already exists at `/admin/blogs` — wire list/create/edit
  to that. Missing: per-article `views` / `leads` / `attributed_revenue`, the article
  summary card, `scheduled_at` + an editorial-queue/calendar query, category list.

### 4.2 إدارة المحتوى + التقارير — **RESOLVED**, see §4 above.

### 4.3 الربط والبكسلات (Pixels tab) — partially mock
No CRUD for pixels / connections / event log / analytics sources (GTM, GA4, Meta CAPI …).
Only the UTM builder is backed — it can be pointed at
`GET /admin/reports/marketing/utm-template` (works today, returns `template`, `sources[]`,
`click_ids[]`, `accounts[]`). Everything else on this tab is unbacked.

---

## 5. What the frontend wired (this task)

New hooks:
- `src/hooks/use-marketing-tracking.js` — `useMarketingOverview` / `useMarketingKeywords`
  / `useMarketingChannels` + `useMarketingPeriod` (shared period filter in the URL,
  `analytics.view`-gated).
- `src/hooks/use-marketing-integrations.js` — `useUtmTemplate`, `useImportAdSpend`,
  `useSyncAdSpend`, `useGoogleSeoStatus`, `useConnectGoogleSeo`,
  `useSearchConsoleSites`, `useSelectSearchConsoleSite`.
- `components/content/marketing/shared/tracking-ui.jsx` — formatting per the prompt's
  rules (never recomputes ROAS/CAC/funnel %), tone-driven chips, `PeriodFilterBar`,
  loading/error/empty `TrackingState`.

| Tab | Endpoint(s) | State |
|---|---|---|
| نظرة عامة (`OverviewTab`) | `marketing-tracking` + `/channels` | ✅ fully wired |
| الحملات (`CampaignsTab`) | `marketing-tracking` + `/channels` + `reports/marketing/sync` + `utm-template` | ✅ wired (summary, channels, `top_campaigns`, live sync button + connected-platform strip). The old per-campaign detail table has no endpoint and was dropped. |
| SEO → الكلمات المفتاحية (`SeoTab`) | `marketing-tracking/keywords` + `seo-google/status` + `seo-google/connect` | ✅ wired incl. a Google-connection card (degrades to "not provisioned" while `seo-google/*` 500s) |
| SEO → فحص الموقع | `/admin/seo-crawl` | ✅ pre-existing, unrelated |
| الربط والبكسلات (`PixelsTab`) | `reports/marketing/utm-template` + `/spend` + `/sync` | ✅ wired: ad-account status from `accounts[]`, per-account + bulk sync, manual ad-spend import form, UTM builder seeded from the template. The pixel/analytics-source inventory + tracked-events table stay presentation-only (no endpoint — labelled as such in the UI). |
| إدارة المحتوى (`ContentTab`) | `marketing/service-pages` (+CRUD), `marketing/articles`, `/admin/blogs` | ✅ wired (§4) |
| التقارير (`ReportsTab`) | `marketing/reports`, `/reports/channels`, `/reports/export` | ✅ wired (§4) |

New hooks (Content & Reports): `src/hooks/use-marketing-content.js`,
`src/hooks/use-marketing-reports.js`.
