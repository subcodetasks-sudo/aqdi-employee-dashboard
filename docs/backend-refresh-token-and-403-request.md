# Backend request: refresh-token endpoint + correct 401/403 semantics

## Why

The frontend currently has no way to recover from an expired access token except forcing the user to log in again. We're adding silent token refresh, but it needs two things from the API that don't exist yet. Separately, several endpoints return `401` for permission-denied cases instead of `403`, which today forces a full logout even though the user's session is still valid — we've patched around it with a hardcoded endpoint list on the frontend, but the real fix belongs on the API side.

## 1. Add a refresh token to the login response

`POST /admin/employees/login` should return, alongside the existing `data.token`:

```json
{
  "success": true,
  "data": {
    "...": "existing user fields",
    "token": "<access-token>",
    "refresh_token": "<refresh-token>",
    "token_expires_in": 900
  }
}
```

- `token_expires_in` in seconds (suggest a short-lived access token, e.g. ~15 min).
- `refresh_token` should be longer-lived than the access token — ideally matching the two session lengths we already support client-side: ~30 days when the user checked "remember me", session-only (enforced server-side, e.g. a few hours) when they didn't.

## 2. New endpoint: `POST /admin/employees/refresh-token`

Request:
```json
{ "refresh_token": "<refresh-token>" }
```

Success (200):
```json
{
  "success": true,
  "data": {
    "token": "<new-access-token>",
    "refresh_token": "<new-or-same-refresh-token>",
    "token_expires_in": 900
  }
}
```

Failure (401): refresh token is invalid, expired, or revoked. The frontend treats this as unrecoverable and forces a full logout — no other status code is needed for this case.

**We'd prefer refresh-token rotation** (issue a new refresh token on every successful refresh, invalidate the old one) to limit the blast radius of a leaked token. Please always return the currently-valid `refresh_token` in the success response (whether or not it actually rotated), so the frontend can just overwrite what it stores each time without needing to know your rotation policy.

## 3. Fix 401 vs 403 semantics

Right now these endpoints return `401` when the authenticated user simply lacks permission for the resource, instead of `403`:
- `/admin/analytics/*`
- `/admin/reports/*`
- `/admin/dashboard-analytics`

Please switch these (and any other endpoint doing the same) to return `403` for permission-denied. We'd like the convention going forward to be:
- **401** = no valid credentials — missing, malformed, expired, or revoked access token, or an invalid/expired refresh token. Nothing else.
- **403** = valid session, but this identity isn't allowed to do this specific thing.

A stable, machine-checkable body on the 403 would help us key off it reliably instead of parsing message text, e.g.:
```json
{ "success": false, "code": "forbidden", "message": "..." }
```

## 4. Logout endpoint — should it revoke the refresh token?

`POST /admin/employees/logout` already exists and is called on manual logout. Once refresh tokens exist, should this endpoint also accept and revoke the refresh token (e.g. `{ "refresh_token": "<refresh-token>" }` in the body)? We'd like to confirm this so a logged-out session's refresh token can't be silently reused if it leaked.

## Open items we need your input on

1. Refresh-token rotation vs a single static long-lived refresh token — which will you implement? This affects whether we need to persist an updated refresh token after every refresh call.
2. Confirm access/refresh token expiry lengths (see above suggestion — happy to adjust to whatever's operationally reasonable).
3. Confirm whether `logout` should revoke the refresh token server-side (item 4 above).

## Frontend status

The frontend refresh-token plumbing (storage, request queuing/deduping, silent retry, fallback to logout on refresh failure) is already built and shipped defensively — it no-ops and behaves exactly as it does today whenever no refresh token is present, so nothing breaks while this is pending. It activates automatically the moment login starts returning `data.refresh_token`.
