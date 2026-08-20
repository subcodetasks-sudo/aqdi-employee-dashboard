# Backend request: `/home/clients` endpoints

The "العملاء" (Clients) section of the dashboard (`/home/clients` list, client detail, client
properties) is currently built against local mock data only
(`components/clients/mock-data.js`) — no real endpoints are wired up yet. This doc lists what
the frontend needs so the backend team can confirm/adjust paths, params, and response shapes.

Existing convention we're following (from already-working features): all admin endpoints are
under `/admin/...`, authenticated via Bearer token, list responses shaped as
`{ data: { items: [...], pagination: { current_page, last_page, total } } }`, single-resource
responses as `{ data: {...} }`.

There's a closely related existing endpoint, `GET /admin/users` + `GET /admin/users/{id}`
(used by the "Users Analysis" report), which returns most of the fields we need already. Please
tell us: **should the clients screens reuse/extend `/admin/users*`, or do you want a separate
`/admin/clients*` namespace?** The table below assumes a separate `clients` namespace for
clarity, but we're flexible either way — whichever is less work on your end.

---

## 1. Clients list — `GET /admin/clients`

Powers the client table + summary cards at `/home/clients`.

**Query params needed:**
| Param | Type | Notes |
|---|---|---|
| `page` | int | |
| `per_page` | int | default page size options: 10 / 25 / 50 |
| `search` | string | matches against name, mobile, client code |
| `sort_by` | string | e.g. `joined_at` |
| `sort_dir` | `asc`\|`desc` | |
| `platform` | string (optional) | filter by `website`\|`google_play`\|`app_store` |
| `blocked` | bool (optional) | filter blocked clients |

**Response — per item:**
```
id, client_code, name, mobile, joined_at (datetime),
platform (website | google_play | app_store),
for_programmer (bool),          // "طلبات تجريبية/داخلية" flag shown as a badge
completed_orders_count, draft_orders_count,
properties_count, units_count,
returned_amount, paid_amount, net_amount
```
Plus `pagination: { current_page, last_page, total }`.

**Question:** is `for_programmer` a real field on your side, or should we drop that badge from
the UI?

## 2. Clients summary stats — `GET /admin/clients/stats`

Powers the stat cards above the table. Could be folded into the list response instead if
that's easier for you — let us know.

**Response:**
```
{ total, blocked, website, google_play, app_store }
```

## 3. Clients export — `GET /admin/clients/export`

Same filter params as the list endpoint. Returns a file (CSV or XLSX — either is fine, tell us
which). Currently this button is a no-op in the UI.

## 4. Client detail — `GET /admin/clients/{id}`

Powers `/home/users/{id}` when opened from the clients list (this route is currently shared
with the legacy "Users Analysis" detail page).

**Response:**
```
client: {
  id, client_code, name, mobile, display_phone, platform,
  joined_at, initial (avatar letter)
}
stats: {
  completed, draft, incomplete, properties, units,
  returned (amount), paid (amount), net (amount)
}
orders: [
  { id, type ("سكني" | "تجاري"), status, fee }
]
```

We also need the possible values/labels for order `status` (there are 7 filter tabs in the UI
today: all / completed / draft / incomplete / returned / canceled / processing) — please confirm
the exact status codes/names you use so we can map them correctly.

## 5. Block client — `POST /admin/clients/{id}/block`

Toggles the client's blocked state. (Mirrors the existing
`POST /admin/users/{id}/block` used elsewhere — reuse that one if it already covers clients.)

**Response:** `{ message }`

## 6. Custom discount / waiver — `POST /admin/clients/{id}/discount`

New endpoint, no existing analogue. The UI currently has a "خصم/إعفاء مخصص" button that's a
no-op — we need to know the intended request shape before we can build the form/dialog for it.

**Questions for backend:**
- Is this a flat discount amount, a percentage, or a waiver of a specific charge?
- Does it need a reason/note field?
- Does it apply going forward, or against a specific existing order?

Proposed request body (please correct): `{ type: "amount" | "percentage" | "waiver", value, reason }`
**Response:** `{ message }`

## 7. Client properties/units — `GET /admin/clients/{id}/properties`

Powers `/home/users/{id}/properties`.

**Response:**
```
properties: [
  {
    id, city, district, street, building_number, added_at,
    order_id, property_name, document_type, deed_number, region,
    owner_id, owner_mobile,
    units: [
      { id, type (شقة|دور|محل|مكتب|فيلا), number, area, floor, rooms, usage (سكني|تجاري) }
    ]
  }
]
totals: { properties, units }
```

## 8. Delete property — `DELETE /admin/clients/{id}/properties/{propertyId}`

Currently a no-op button. **Response:** `{ message }`

## 9. Delete unit — `DELETE /admin/clients/{id}/units/{unitId}`

Currently a no-op button. **Response:** `{ message }`

## 10. View deed document — `GET /admin/clients/{id}/properties/{propertyId}/deed`

Currently a no-op ("عرض الصك") button. Need to know: does this return a file directly, a
signed URL, or JSON with a `file_url` field?

---

## Permissions note (for us to resolve, FYI to backend)

`/home/clients` itself is currently open to any authenticated user in the frontend's permission
config, but the detail routes it links to (`/home/users/[id]` and `.../properties`) are gated
behind the `analytics` permission section. We'll need to decide whether clients gets its own
permission section or reuses `analytics` — flagging here in case that affects how you scope
these endpoints on your side too.
