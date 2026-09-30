import { buildAuthSnapshot, encodeAuthSnapshot } from "@/src/lib/server-auth";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_ME_COOKIE,
  TOKEN_EXPIRES_AT_COOKIE,
  applyAuthCookies,
  clearAuthCookies,
} from "@/src/lib/auth-cookies";
import {
  parseTokenPayload,
  shouldPersistRefreshedSession,
  shouldRefreshBeforeRequest,
  shouldRetryAfterUnauthorized,
  stripAuthSecrets,
} from "@/src/lib/auth-token";

const LOGIN_PATH = "admin/employees/login";
const REFRESH_PATH = "admin/employees/refresh-token";
const LOGOUT_PATH = "admin/employees/logout";

const RECENT_REFRESH_MS = 60_000;
// Below the browser's axios timeout, so a hung backend surfaces as a 504 with a
// message instead of the browser giving up with no response.
const UPSTREAM_TIMEOUT_MS = 20_000;

function upstreamSignal(signal) {
  const timeout = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function upstreamFailureResponse(NextResponse, error) {
  if (error?.name === "TimeoutError") {
    return NextResponse.json(
      { success: false, message: "الخادم لا يستجيب حاليا، حاول مرة أخرى لاحقا" },
      { status: 504 }
    );
  }
  return NextResponse.json({ success: false, message: "تعذر الاتصال بالخادم" }, { status: 502 });
}

// Module scope is wiped by dev recompiles. A refresh that already rotated the
// token then looks like a brand-new login to the next request, which exchanges
// the dead token and clears the session.
function getRefreshState() {
  if (!globalThis.__aqdiAuthRefresh) {
    globalThis.__aqdiAuthRefresh = {
      inflight: new Map(),
      recent: new Map(),
      superseded: new Map(),
      current: null,
    };
  }
  return globalThis.__aqdiAuthRefresh;
}

function rememberRotation(refreshToken, result) {
  const state = getRefreshState();
  const now = Date.now();
  for (const [key, value] of state.recent) {
    if (now - value.at >= RECENT_REFRESH_MS) state.recent.delete(key);
  }
  for (const [key, at] of state.superseded) {
    if (now - at >= RECENT_REFRESH_MS) state.superseded.delete(key);
  }
  state.recent.set(refreshToken, { at: now, result });
  state.superseded.set(refreshToken, now);
  if (result?.ok && result.tokens?.token && result.tokens?.refresh_token) {
    state.current = {
      at: now,
      token: result.tokens.token,
      refreshToken: result.tokens.refresh_token,
    };
  }
}

function sessionWriteAllowed(tokens) {
  const state = getRefreshState();
  return shouldPersistRefreshedSession({
    tokens,
    current: state.current,
    supersededAt: tokens?.refresh_token ? state.superseded.get(tokens.refresh_token) : undefined,
  });
}

function recentRotation(refreshToken) {
  const recent = getRefreshState().recent.get(refreshToken);
  if (!recent || Date.now() - recent.at >= RECENT_REFRESH_MS) return null;
  return recent.result?.ok ? recent.result : null;
}

export function getApiTarget() {
  const raw =
    process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://backend.aqdi.sa/api";

  return String(raw).trim().replace(/\/$/, "");
}

function readSession(request) {
  return {
    accessToken: request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || "",
    refreshToken: request.cookies.get(REFRESH_TOKEN_COOKIE)?.value || "",
    expiresAt: request.cookies.get(TOKEN_EXPIRES_AT_COOKIE)?.value || "",
    remember: request.cookies.get(REMEMBER_ME_COOKIE)?.value === "1",
  };
}

function snapshotForUser(user) {
  const snapshot = buildAuthSnapshot(user);
  if (!snapshot || (!snapshot.sa && (!snapshot.p || snapshot.p.length === 0))) return null;
  return encodeAuthSnapshot(snapshot);
}

function writeSession(response, tokens, remember, user) {
  applyAuthCookies(response.cookies, tokens, remember, snapshotForUser(user));
}

function sessionExpiredResponse(NextResponse) {
  // Do not clear cookies here. A sibling request may have just rotated the
  // session and set the new cookies; this 401 arriving last would wipe them.
  // The browser retries once, and only a confirmed dead session logs out.
  const response = NextResponse.json(
    { success: false, message: "انتهت صلاحية الجلسة" },
    { status: 401 }
  );
  response.headers.set("x-session-expired", "1");
  return response;
}

function passthroughHeaders(upstream) {
  const headers = new Headers();
  for (const name of ["content-type", "content-disposition", "cache-control", "content-language"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

async function readBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return null;
  const buffer = await request.arrayBuffer();
  return buffer.byteLength > 0 ? buffer : null;
}

function injectRefreshToken(body, contentType, refreshToken) {
  if (!refreshToken) return { body, contentType };

  const type = contentType || "";
  if (body && type && !type.includes("application/json") && !type.includes("text/plain")) {
    return { body, contentType };
  }

  let json = {};
  if (body) {
    try {
      json = JSON.parse(new TextDecoder().decode(body));
    } catch {
      return { body, contentType };
    }
    if (!json || typeof json !== "object" || Array.isArray(json)) {
      return { body, contentType };
    }
  }

  if (!json.refresh_token) json.refresh_token = refreshToken;
  return {
    body: new TextEncoder().encode(JSON.stringify(json)),
    contentType: "application/json",
  };
}

async function forwardUpstream({ targetUrl, method, accessToken, contentType, acceptLanguage, body, signal }) {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Accept-Language", acceptLanguage || "ar");
  if (contentType) headers.set("Content-Type", contentType);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const init = {
    method,
    headers,
    cache: "no-store",
    redirect: "manual",
    signal: upstreamSignal(signal),
  };

  if (body && method !== "GET" && method !== "HEAD") {
    init.body = body;
  }

  return fetch(targetUrl, init);
}

/**
 * One refresh per refresh-token value. Concurrent 401s must share it: a second
 * call would rotate the refresh token the first call is still exchanging.
 */
export function refreshAccessToken(refreshToken, apiTarget = getApiTarget()) {
  const cached = recentRotation(refreshToken);
  if (cached) return Promise.resolve(cached);

  const state = getRefreshState();
  const existing = state.inflight.get(refreshToken);
  if (existing) return existing;

  const promise = (async () => {
    let response;
    try {
      response = await fetch(`${apiTarget}/${REFRESH_PATH}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Accept-Language": "ar",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
        signal: upstreamSignal(),
      });
    } catch {
      return { ok: false, terminal: false, status: 0 };
    }

    const json = await response.json().catch(() => null);
    const tokens = parseTokenPayload(json?.data);
    if (!response.ok || !tokens) {
      const recovered = recentRotation(refreshToken);
      if (recovered) return recovered;
      const terminal = response.status === 401 || response.status === 403 || response.status === 422;
      return { ok: false, terminal, status: response.status };
    }

    const result = { ok: true, tokens, user: tokens.user };
    rememberRotation(refreshToken, result);
    return result;
  })().finally(() => {
    state.inflight.delete(refreshToken);
  });

  state.inflight.set(refreshToken, promise);
  return promise;
}

function upstreamResponse(NextResponse, upstream, sessionPatch) {
  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: passthroughHeaders(upstream),
  });

  if (sessionPatch?.clear) {
    clearAuthCookies(response.cookies);
    return response;
  }

  if (sessionPatch?.tokens && sessionWriteAllowed(sessionPatch.tokens)) {
    writeSession(response, sessionPatch.tokens, sessionPatch.remember, sessionPatch.user);
  }

  return response;
}

async function exchangeCredentials(NextResponse, request, path, body) {
  const contentType = request.headers.get("content-type") || "";
  const targetUrl = `${getApiTarget()}/${path}${request.nextUrl.search}`;

  let upstream;
  try {
    upstream = await forwardUpstream({
      targetUrl,
      method: request.method,
      accessToken: "",
      contentType,
      acceptLanguage: request.headers.get("accept-language"),
      body,
      signal: request.signal,
    });
  } catch (error) {
    return upstreamFailureResponse(NextResponse, error);
  }

  const rawText = await upstream.text();
  if (upstream.status >= 500) {
    console.error(
      `[api-proxy] ${path} ${upstream.status}`,
      rawText?.slice(0, 500) || "(empty body)"
    );
  }
  let json = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = null;
  }

  const tokens = parseTokenPayload(json?.data);
  const responseBody = json ? stripAuthSecrets(json) : rawText;
  const response = json
    ? NextResponse.json(responseBody, { status: upstream.status })
    : new NextResponse(responseBody, {
        status: upstream.status,
        headers: { "content-type": upstream.headers.get("content-type") || "text/plain" },
      });

  if (!tokens) return response;

  let remember = request.cookies.get(REMEMBER_ME_COOKIE)?.value === "1";
  if (path === LOGIN_PATH && body) {
    try {
      const loginBody = JSON.parse(new TextDecoder().decode(body));
      remember = Boolean(loginBody?.remember_me);
    } catch {
      remember = false;
    }
  }

  writeSession(response, tokens, remember, tokens.user);
  return response;
}

export async function proxyApiRequest(request, pathSegments, NextResponse) {
  const path = (Array.isArray(pathSegments) ? pathSegments : []).map(encodeURIComponent).join("/");
  if (!path) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const body = await readBody(request);
  if (path === LOGIN_PATH || path === REFRESH_PATH) {
    return exchangeCredentials(NextResponse, request, path, body);
  }

  const session = readSession(request);
  let accessToken = session.accessToken;
  let refreshToken = session.refreshToken;
  let expiresAt = session.expiresAt;
  let refreshed = null;

  // A sibling request may already have rotated this refresh token. Sending the
  // cookie's access token would 401, then refresh again. Use the rotation we
  // already have.
  const cached = recentRotation(refreshToken);
  if (cached?.ok && cached.tokens?.token && cached.tokens.token !== accessToken) {
    accessToken = cached.tokens.token;
    refreshToken = cached.tokens.refresh_token;
    expiresAt = cached.tokens.token_expires_at || expiresAt;
    refreshed = cached;
  }

  const refreshFirst = shouldRefreshBeforeRequest({
    accessToken,
    refreshToken,
    expiresAt,
  });

  if (refreshFirst) {
    refreshed = await refreshAccessToken(refreshToken);
    if (refreshed.ok) {
      accessToken = refreshed.tokens.token;
      refreshToken = refreshed.tokens.refresh_token;
    } else if (!accessToken) {
      return sessionExpiredResponse(NextResponse);
    }
  }

  const isLogout = path === LOGOUT_PATH;
  const outbound = isLogout
    ? injectRefreshToken(body, request.headers.get("content-type") || "", refreshToken)
    : { body, contentType: request.headers.get("content-type") || "" };

  const targetUrl = `${getApiTarget()}/${path}${request.nextUrl.search}`;
  const send = (token) =>
    forwardUpstream({
      targetUrl,
      method: request.method,
      accessToken: token,
      contentType: outbound.contentType,
      acceptLanguage: request.headers.get("accept-language"),
      body: outbound.body,
      signal: request.signal,
    });

  let upstream;
  try {
    upstream = await send(accessToken);
  } catch (error) {
    return upstreamFailureResponse(NextResponse, error);
  }

  if (upstream.status === 401 && !isLogout) {
    if (!refreshToken) {
      return sessionExpiredResponse(NextResponse);
    }

    const sentAccessToken = accessToken;
    if (!refreshed) {
      refreshed = await refreshAccessToken(refreshToken);
    }

    if (refreshed?.terminal) {
      return sessionExpiredResponse(NextResponse);
    }

    const nextToken = refreshed?.ok ? refreshed.tokens.token : "";
    if (
      refreshed?.ok &&
      shouldRetryAfterUnauthorized({
        sentAccessToken,
        refreshedAccessToken: nextToken,
      })
    ) {
      try {
        await upstream.body?.cancel?.();
      } catch {
        /* the failed response body is unused */
      }

      try {
        upstream = await send(nextToken);
      } catch (error) {
        return upstreamFailureResponse(NextResponse, error);
      }
    }
  }

  const patch = { remember: session.remember };
  if (isLogout) {
    patch.clear = true;
  } else if (refreshed?.ok) {
    patch.tokens = refreshed.tokens;
    patch.user = refreshed.user;
  }

  return upstreamResponse(NextResponse, upstream, patch);
}
