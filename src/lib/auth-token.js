// Pure token-lifetime helpers shared by the API proxy. Refresh rotates the
// refresh token, so a 401 must not start a second refresh when this request
// already used the token that rotation just issued.

export const ACCESS_TOKEN_REFRESH_SKEW_MS = 30_000;
const DEFAULT_ACCESS_TTL_MS = 15 * 60 * 1000;

// `YYYY-MM-DD HH:mm:ss` with no offset. Laravel emits this in UTC. Date.parse
// treats it as local time, so on UTC+3 a still-valid token looks hours expired
// and every request rotates the refresh token.
const NAIVE_DATETIME = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/;

export function parseExpiryMs(expiresAt) {
  if (expiresAt == null || expiresAt === "") return NaN;

  if (typeof expiresAt === "number") {
    if (!Number.isFinite(expiresAt) || expiresAt <= 0) return NaN;
    return expiresAt > 1e12 ? expiresAt : expiresAt * 1000;
  }

  const trimmed = String(expiresAt).trim();
  if (!trimmed) return NaN;

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric) || numeric <= 0) return NaN;
    return numeric > 1e12 ? numeric : numeric * 1000;
  }

  const normalized = NAIVE_DATETIME.test(trimmed) ? `${trimmed.replace(" ", "T")}Z` : trimmed;
  return Date.parse(normalized);
}

export function resolveExpiresAt(data, now = Date.now()) {
  // Relative TTL is the backend's real lifetime (`token_expires_in: 900`).
  // Prefer it over an absolute timestamp that has no timezone.
  const seconds = Number(data?.token_expires_in);
  if (Number.isFinite(seconds) && seconds > 0) {
    return new Date(now + seconds * 1000).toISOString();
  }

  const absolute = parseExpiryMs(data?.token_expires_at);
  if (!Number.isNaN(absolute)) return new Date(absolute).toISOString();

  return new Date(now + DEFAULT_ACCESS_TTL_MS).toISOString();
}

export function parseTokenPayload(data, now = Date.now()) {
  if (!data || typeof data !== "object") return null;
  if (typeof data.token !== "string" || typeof data.refresh_token !== "string") return null;
  if (!data.token || !data.refresh_token) return null;

  return {
    token: data.token,
    refresh_token: data.refresh_token,
    token_expires_at: resolveExpiresAt(data, now),
    user: data.user && typeof data.user === "object" ? data.user : null,
  };
}

/** True when the access token is missing, unreadable, or inside the refresh skew window. */
export function isAccessTokenStale(expiresAt, now = Date.now()) {
  const expiresAtMs = parseExpiryMs(expiresAt);
  if (Number.isNaN(expiresAtMs)) return true;

  return expiresAtMs - ACCESS_TOKEN_REFRESH_SKEW_MS <= now;
}

export function shouldRefreshBeforeRequest({ accessToken, refreshToken, expiresAt, now }) {
  if (!refreshToken) return false;
  if (!accessToken) return true;
  return isAccessTokenStale(expiresAt, now);
}

/**
 * After an upstream 401: retry with a token rotation that this request did not
 * already send. A 401 that used the current token is the resource's answer —
 * refreshing again would revoke that token for every other in-flight call.
 */
export function shouldRetryAfterUnauthorized({ sentAccessToken, refreshedAccessToken }) {
  return Boolean(refreshedAccessToken) && refreshedAccessToken !== sentAccessToken;
}

/**
 * Persist a refresh result unless a newer rotation already replaced it.
 * Reusing the same refresh token still has to be saved: that token is marked
 * consumed, and skipping the write would leave the revoked access token in the
 * cookie so every later request 401s and refreshes again.
 */
export function shouldPersistRefreshedSession({
  tokens,
  current,
  supersededAt,
  now = Date.now(),
  ttlMs = 60_000,
}) {
  if (!tokens?.token || !tokens?.refresh_token) return false;

  if (
    current &&
    current.token === tokens.token &&
    current.refreshToken === tokens.refresh_token &&
    now - current.at < ttlMs
  ) {
    return true;
  }

  if (typeof supersededAt === "number" && now - supersededAt < ttlMs) return false;
  return true;
}

const SECRET_KEYS = [
  "token",
  "access_token",
  "refresh_token",
  "token_expires_in",
  "token_expires_at",
  "refresh_token_expires_at",
];

/** Drops credential fields before a login/refresh body is returned to the browser. */
export function stripAuthSecrets(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;

  const data = payload.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return payload;

  const nextData = { ...data };
  for (const key of SECRET_KEYS) {
    delete nextData[key];
  }

  return { ...payload, data: nextData };
}
