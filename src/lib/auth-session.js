// Storage layer for the auth session (access/refresh tokens, user, expiry).
// Single source of truth for src/utils/axios.js's request/refresh interceptors
// and src/stores/user-store.js's reactive cache.

const KEY_PREFIX = 'aqdi_';

const KEYS = {
  accessToken: `${KEY_PREFIX}access_token`,
  refreshToken: `${KEY_PREFIX}refresh_token`,
  authUser: `${KEY_PREFIX}auth_user`,
  tokenExpiresAt: `${KEY_PREFIX}token_expires_at`,
  rememberMe: `${KEY_PREFIX}remember_me`,
};

// Matches the backend's actual access-token lifetime (token_expires_in: 900).
// Client-side only — used to decide when to proactively refresh.
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

function isBrowser() {
  return typeof window !== 'undefined';
}

// rememberMe always lives in localStorage, regardless of which storage the
// rest of the session is currently using.
function getRememberMe() {
  if (!isBrowser()) return true;
  return localStorage.getItem(KEYS.rememberMe) !== 'false';
}

function getActiveStorage(rememberMe = getRememberMe()) {
  if (!isBrowser()) return null;
  return rememberMe ? localStorage : sessionStorage;
}

function getInactiveStorage(rememberMe = getRememberMe()) {
  if (!isBrowser()) return null;
  return rememberMe ? sessionStorage : localStorage;
}

// Reads from the active storage first, falling back to the other one — so a
// stale rememberMe flag or a session started under different settings never
// silently reads back null.
function getItem(key) {
  if (!isBrowser()) return null;
  return getActiveStorage()?.getItem(key) ?? getInactiveStorage()?.getItem(key) ?? null;
}

function setItem(key, value, rememberMe = getRememberMe()) {
  getActiveStorage(rememberMe)?.setItem(key, value);
}

function removeFromBothStorages(key) {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export function getAccessToken() {
  return getItem(KEYS.accessToken);
}

export function getRefreshToken() {
  return getItem(KEYS.refreshToken);
}

export function getAuthUser() {
  const raw = getItem(KEYS.authUser);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAccessTokenExpired() {
  const expiresAt = Number(getItem(KEYS.tokenExpiresAt));
  if (!expiresAt) return true;
  return Date.now() >= expiresAt;
}

/** Full login: clears any prior session, then writes tokens/user/expiry to the chosen storage. */
export function setAuthSession(tokens, user, rememberMe = true) {
  clearAuthSession();
  if (!isBrowser()) return;

  localStorage.setItem(KEYS.rememberMe, rememberMe ? 'true' : 'false');

  const expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS;
  setItem(KEYS.accessToken, tokens.accessToken, rememberMe);
  setItem(KEYS.refreshToken, tokens.refreshToken, rememberMe);
  setItem(KEYS.tokenExpiresAt, String(expiresAt), rememberMe);
  if (user) setItem(KEYS.authUser, JSON.stringify(user), rememberMe);
}

/**
 * Post-refresh update: writes to whichever storage is already active — never
 * re-decides remember-me. Always overwrites the refresh token; it's dead the
 * instant the server issues a new one.
 */
export function setAuthTokens(accessToken, refreshToken, user) {
  if (!isBrowser()) return;
  const rememberMe = getRememberMe();
  const expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS;

  setItem(KEYS.accessToken, accessToken, rememberMe);
  setItem(KEYS.refreshToken, refreshToken, rememberMe);
  setItem(KEYS.tokenExpiresAt, String(expiresAt), rememberMe);
  if (user) setItem(KEYS.authUser, JSON.stringify(user), rememberMe);
}

export function clearAuthSession() {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach(removeFromBothStorages);
}
