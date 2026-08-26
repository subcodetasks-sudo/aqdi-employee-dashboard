> **Status: section-key mapping answered by backend (config/permissions.php).** All ambiguous
> mappings below are resolved and wired into the frontend. Kept for history/reference. Two items
> remain open — see "Still open" at the bottom — because the screen itself doesn't exist yet, not
> because the permission key is unclear.

# Backend answers: permission section-key catalog

No new section keys were needed. Every settings/marketing screen maps onto an existing catalog key.
Source of truth: `config/permissions.php` → `screens` / `duplicate_screens`.

## Resolved mappings (wired into the frontend)

- **`property_reference`** — أنواع الوحدات (`unit-types`), استخدام الوحدة (`unit-usage`), أنواع
  العقار (`property-types`), استخدام العقار (`property-usage`). All four share this one key.
- **`message_alerts`** — أقسام الرسائل (`message-sections`), بنود أقسام الرسائل
  (`message-section-items`), رسائل توضيحية للموظفين (`message-for-employee`), رسائل توضيحية للعقار
  (`message-for-property`).
- **`app_content`** — الرسائل التطبيقية للعميل (`customer-app-messages`), طرق الدفع
  (`payment-types`), الشروط والأحكام (`terms`), سياسة الخصوصية (`privacy`).
  `message-for-clients` was a duplicate route of `customer-app-messages` (same `MessageAlert
  type=client` data) — the route was deleted; the underlying dialog components are still used by
  the canonical `customer-app-messages` page.
- **`contract_periods`** — مدة الطلب (`order-duration`).
- **`seo_crawl`** — both `?tab=seo` sub-views (technical crawl and keyword rankings) share this key.
- **`settings`** — رسوم العدادات (`meter-fees`, in contract-settings) stays generic; it's config, not
  `contract_payments` (which is employee collections).
- **`analytics`** — marketing tabs نظرة عامة / الحملات / التقارير / الربط والبكسلات, plus the
  "صفحات الخدمات" sub-view of إدارة المحتوى.
- **`blogs`** — the "المقالات" sub-view of إدارة المحتوى (marketing tab), separate from the
  `blogs` settings CMS pages which already used this key.
- **`contract_statuses`** — the completed-order status catalog dialog on `/home/realtime-orders`
  and `/home/orders` (`ManageContractStatusesDialog`, create/edit). Queue-level status filters and
  changing an order's status stay on `request_classification`, unchanged.
- **`draft_contract_statuses`** — the "add draft status" action inside the draft-order status
  dropdown (`components/Orders/change-draft-status-dialog.jsx`) now requires
  `draft_contract_statuses.create`.

## Still open — screen doesn't exist yet, not a key question

### `contract_whatsapp`

No distinct "WhatsApp-originated orders" list screen exists anywhere in the app today — only the
generic completed/incomplete order tabs (gated by `completed_whatsapp_request`/
`incomplete_whatsapp_request`, which are declared in the permission catalog but not yet wired to
any UI beyond the route-level OR-group). Nothing to gate until this screen is built — flagging
before we build new UI on a guess at its shape.

### `instruction_sections`

`components/analysis/settings/instructions/` is an empty, unrouted directory — no page, no list,
no upload/toggle UI exists yet. Building it (list + toggle + upload, seeded keys like `new-client`/
`deed`/`tenant`, update-only per the spec) is new feature work, not a gating change to an existing
screen. Let us know if you want that screen built now or scheduled separately — we didn't want to
guess at layout/fields for a brand-new admin page without a design pass.
