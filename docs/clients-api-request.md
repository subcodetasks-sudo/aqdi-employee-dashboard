# Backend request: /home/clients endpoints (current)

Updated: 2026-08-23

This document now keeps only what the frontend currently uses and still needs from backend.
The clients screens use /admin/users* (no separate /admin/clients* namespace).

## 1) Live endpoints used by the current UI

Used by:
- /home/clients (list)
- /home/users/{id}?from=/home/clients (client file)
- orders table inside the client file

Endpoints:
- GET /admin/users
- GET /admin/users/{id}
- POST /admin/users/{id}/block
- POST /admin/users/{id}/delete
- GET /admin/orders?user_id={id}

Frontend source of truth:
- src/hooks/use-clients.js
- components/clients/ClientsWrapper.jsx
- components/clients/ClientDetailsWrapper.jsx

## 2) Endpoint checks performed (production)

Test account used:
- mohammed@aqdi.com

Checked against:
- https://aqid.subcodeco.com/api

Results:
- GET /admin/users?page=1&per_page=10 -> 200
- GET /admin/users/new -> 200
- GET /admin/users/contracts-complete -> 200
- GET /admin/users/27 -> 200
- GET /admin/orders?user_id=27 -> 200
- POST /admin/users/999999/block -> 404 (expected for missing user; route exists)
- POST /admin/users/999999/delete -> 404 (expected for missing user; route exists)

Note:
- Previous SQL 500 errors are no longer reproducible.

## 3) Minimum response fields currently required by frontend

GET /admin/users expects data.summary, data.items, data.pagination.

From each item in data.items, the UI currently reads these fields (fallbacks supported in code):
- id
- customer_number
- full_name or name
- mobile or phone
- email
- photo_path
- joined_at or created_at
- platform
- platform_label
- completed_orders_count or completed
- draft_orders_count or draft
- incomplete_orders_count or uncompleted_orders_count
- real_estate_count or properties_count or real_estates
- units_count or units
- total_paid_amount or paid
- refunded_amount or refunded
- net_amount or net
- is_banned
- contracts

Pagination currently used:
- current_page
- last_page
- total
- per_page

GET /admin/users/{id} expects data.user (or data payload directly), and contracts for the orders section.

GET /admin/orders?user_id={id} is already used and returns contract rows for that user.

## 4) What we still need from backend (only missing integrations)

1. Export endpoint for clients list
- Current UI export button is not wired yet.
- Requested endpoint: GET /admin/users/export
- Use same filters as GET /admin/users (at minimum: page, per_page, search if applicable).
- Response: file download (CSV or XLSX).

2. Custom discount/waiver action on client file
- Current "خصم/إعفاء مخصص" button is a no-op.
- Needed endpoint (proposal): POST /admin/users/{id}/discount
- Need confirmed request schema and business rules.

3. Client properties/units backend for /home/users/{id}/properties
- Current page uses mock data only (not connected to API).
- Needed:
  - GET /admin/users/{id}/properties
  - DELETE /admin/users/{id}/properties/{propertyId}
  - DELETE /admin/users/{id}/units/{unitId}
  - GET /admin/users/{id}/properties/{propertyId}/deed (or equivalent file endpoint)

## 5) Not needed for this clients UI right now

- No /admin/clients* namespace is needed.
- /admin/users/new and /admin/users/contracts-complete are not consumed by /home/clients at the moment.
