import { describe, expect, it } from "vitest";
import {
  isAccessTokenStale,
  parseTokenPayload,
  resolveExpiresAt,
  shouldPersistRefreshedSession,
  shouldRefreshBeforeRequest,
  shouldRetryAfterUnauthorized,
  stripAuthSecrets,
} from "./auth-token";

const NOW = Date.parse("2026-09-29T12:00:00.000Z");

describe("resolveExpiresAt", () => {
  it("uses the server timestamp when it parses", () => {
    expect(resolveExpiresAt({ token_expires_at: "2026-09-29T12:15:00.000Z" }, NOW)).toBe(
      "2026-09-29T12:15:00.000Z"
    );
  });

  it("converts token_expires_in seconds into an absolute expiry", () => {
    expect(resolveExpiresAt({ token_expires_in: 900 }, NOW)).toBe("2026-09-29T12:15:00.000Z");
  });

  it("prefers token_expires_in over a timezone-less timestamp", () => {
    expect(
      resolveExpiresAt(
        { token_expires_in: 900, token_expires_at: "2026-09-29 12:00:00" },
        NOW
      )
    ).toBe("2026-09-29T12:15:00.000Z");
  });

  it("reads a timezone-less timestamp as UTC", () => {
    expect(resolveExpiresAt({ token_expires_at: "2026-09-29 12:15:00" }, NOW)).toBe(
      "2026-09-29T12:15:00.000Z"
    );
  });

  it("reads a unix expiry in seconds", () => {
    expect(resolveExpiresAt({ token_expires_at: 1790691300 }, NOW)).toBe("2026-09-29T14:15:00.000Z");
  });
});

describe("isAccessTokenStale", () => {
  it("treats a missing expiry as stale", () => {
    expect(isAccessTokenStale(null, NOW)).toBe(true);
  });

  it("reads an epoch-millisecond cookie as an absolute expiry", () => {
    expect(isAccessTokenStale(String(NOW + 10 * 60 * 1000), NOW)).toBe(false);
  });

  it("treats a token inside the skew window as stale", () => {
    expect(isAccessTokenStale("2026-09-29T12:00:20.000Z", NOW)).toBe(true);
  });

  it("keeps a token that still has time left", () => {
    expect(isAccessTokenStale("2026-09-29T12:10:00.000Z", NOW)).toBe(false);
  });
});

describe("shouldRefreshBeforeRequest", () => {
  it("does not refresh when the access token is still valid", () => {
    expect(
      shouldRefreshBeforeRequest({
        accessToken: "access-a",
        refreshToken: "refresh-a",
        expiresAt: "2026-09-29T12:10:00.000Z",
        now: NOW,
      })
    ).toBe(false);
  });

  it("refreshes before the request when the access token is about to expire", () => {
    expect(
      shouldRefreshBeforeRequest({
        accessToken: "access-a",
        refreshToken: "refresh-a",
        expiresAt: "2026-09-29T12:00:10.000Z",
        now: NOW,
      })
    ).toBe(true);
  });
});

describe("shouldRetryAfterUnauthorized", () => {
  it("retries when refresh issued a token this request did not send", () => {
    expect(
      shouldRetryAfterUnauthorized({
        sentAccessToken: "access-old",
        refreshedAccessToken: "access-new",
      })
    ).toBe(true);
  });

  it("does not refresh again when the 401 already used the current token", () => {
    expect(
      shouldRetryAfterUnauthorized({
        sentAccessToken: "access-new",
        refreshedAccessToken: "access-new",
      })
    ).toBe(false);
  });
});

describe("shouldPersistRefreshedSession", () => {
  const current = {
    token: "access-new",
    refreshToken: "refresh-same",
    at: NOW,
  };

  it("saves the latest access token when the refresh token is reused", () => {
    expect(
      shouldPersistRefreshedSession({
        tokens: { token: "access-new", refresh_token: "refresh-same" },
        current,
        supersededAt: NOW,
        now: NOW,
      })
    ).toBe(true);
  });

  it("does not let an older access token overwrite the latest rotation", () => {
    expect(
      shouldPersistRefreshedSession({
        tokens: { token: "access-old", refresh_token: "refresh-same" },
        current,
        supersededAt: NOW,
        now: NOW,
      })
    ).toBe(false);
  });

  it("does not write a refresh token that a newer rotation already consumed", () => {
    expect(
      shouldPersistRefreshedSession({
        tokens: { token: "access-stale", refresh_token: "refresh-old" },
        current: { token: "access-new", refreshToken: "refresh-new", at: NOW },
        supersededAt: NOW,
        now: NOW,
      })
    ).toBe(false);
  });
});

describe("parseTokenPayload", () => {
  it("rejects a body that is missing either token", () => {
    expect(parseTokenPayload({ token: "access" }, NOW)).toBeNull();
  });

  it("reads the employee refresh payload", () => {
    expect(
      parseTokenPayload(
        {
          token: "access",
          refresh_token: "refresh",
          token_expires_in: 900,
          user: { id: 7 },
        },
        NOW
      )
    ).toEqual({
      token: "access",
      refresh_token: "refresh",
      token_expires_at: "2026-09-29T12:15:00.000Z",
      user: { id: 7 },
    });
  });
});

describe("stripAuthSecrets", () => {
  it("removes credential fields from the login data object", () => {
    expect(
      stripAuthSecrets({
        success: true,
        data: {
          token: "access",
          refresh_token: "refresh",
          token_expires_in: 900,
          user: { id: 7 },
        },
      })
    ).toEqual({
      success: true,
      data: { user: { id: 7 } },
    });
  });
});
