// Cookie names and writers for the auth session. Access and refresh tokens are
// httpOnly so page JavaScript cannot read them (localStorage is XSS-readable).

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const TOKEN_EXPIRES_AT_COOKIE = "token_expires_at";
export const REMEMBER_ME_COOKIE = "auth_remember";
export const SNAPSHOT_COOKIE = "auth_snapshot";
/** Previous non-httpOnly cookie. Cleared so it is never forwarded upstream. */
export const LEGACY_TOKEN_COOKIE = "token";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function authCookieOptions(remember = true) {
  const options = {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };

  if (remember) {
    options.maxAge = SESSION_MAX_AGE;
  }

  return options;
}

export function applyAuthCookies(store, tokens, remember = true, encodedSnapshot = null) {
  const options = authCookieOptions(remember);

  store.set(ACCESS_TOKEN_COOKIE, tokens.token, options);
  store.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, options);
  store.set(TOKEN_EXPIRES_AT_COOKIE, tokens.token_expires_at, options);
  store.set(REMEMBER_ME_COOKIE, remember ? "1" : "0", options);

  if (encodedSnapshot) {
    store.set(SNAPSHOT_COOKIE, encodedSnapshot, options);
  }

  store.set(LEGACY_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
}

export function clearAuthCookies(store) {
  const expired = {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };

  for (const name of [
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    TOKEN_EXPIRES_AT_COOKIE,
    REMEMBER_ME_COOKIE,
    SNAPSHOT_COOKIE,
    LEGACY_TOKEN_COOKIE,
  ]) {
    if (typeof store.delete === "function") {
      store.delete(name);
    }
    store.set(name, "", expired);
  }
}
