// Non-secret session profile. Access and refresh tokens live in httpOnly cookies
// (see src/lib/auth-cookies.js and src/lib/api-proxy.js), never in web storage.

const KEY_PREFIX = "aqdi_";

const KEYS = {
  accessToken: `${KEY_PREFIX}access_token`,
  refreshToken: `${KEY_PREFIX}refresh_token`,
  authUser: `${KEY_PREFIX}auth_user`,
  tokenExpiresAt: `${KEY_PREFIX}token_expires_at`,
  rememberMe: `${KEY_PREFIX}remember_me`,
};

const TOKEN_KEYS = [KEYS.accessToken, KEYS.refreshToken, KEYS.tokenExpiresAt];

function isBrowser() {
  return typeof window !== "undefined";
}

function getRememberMe() {
  if (!isBrowser()) return true;
  return localStorage.getItem(KEYS.rememberMe) !== "false";
}

function getActiveStorage(rememberMe = getRememberMe()) {
  if (!isBrowser()) return null;
  return rememberMe ? localStorage : sessionStorage;
}

function getInactiveStorage(rememberMe = getRememberMe()) {
  if (!isBrowser()) return null;
  return rememberMe ? sessionStorage : localStorage;
}

function getItem(key) {
  if (!isBrowser()) return null;
  return getActiveStorage()?.getItem(key) ?? getInactiveStorage()?.getItem(key) ?? null;
}

function setItem(key, value, rememberMe = getRememberMe()) {
  const active = getActiveStorage(rememberMe);
  const inactive = getInactiveStorage(rememberMe);
  inactive?.removeItem(key);
  active?.setItem(key, value);
}

function removeFromBothStorages(key) {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

function sanitizeUser(user) {
  if (!user || typeof user !== "object") return null;
  const {
    token,
    access_token,
    refresh_token,
    token_expires_in,
    token_expires_at,
    refresh_token_expires_at,
    ...rest
  } = user;
  return rest;
}

export function getAuthUser() {
  const raw = getItem(KEYS.authUser);
  if (!raw) return null;
  try {
    return sanitizeUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Tokens left in web storage by the previous client. Moved into httpOnly cookies once, then deleted. */
export function readLegacyTokens() {
  if (!isBrowser()) return null;

  const remember = getRememberMe();
  const primary = remember ? localStorage : sessionStorage;
  const secondary = remember ? sessionStorage : localStorage;
  const read = (key) => primary.getItem(key) ?? secondary.getItem(key);

  const accessToken = read(KEYS.accessToken);
  const refreshToken = read(KEYS.refreshToken);
  if (!accessToken || !refreshToken) return null;

  return {
    accessToken,
    refreshToken,
    expiresAt: read(KEYS.tokenExpiresAt),
    remember,
  };
}

export function clearLegacyTokens() {
  TOKEN_KEYS.forEach(removeFromBothStorages);
}

export function setAuthSession(user, rememberMe = true) {
  clearAuthSession();
  if (!isBrowser()) return;

  localStorage.setItem(KEYS.rememberMe, rememberMe ? "true" : "false");
  const safeUser = sanitizeUser(user);
  if (safeUser) setItem(KEYS.authUser, JSON.stringify(safeUser), rememberMe);
}

export function clearAuthSession() {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach(removeFromBothStorages);
}
