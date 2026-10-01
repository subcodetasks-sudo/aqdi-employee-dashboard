import { NextResponse } from "next/server";
import { applyAuthCookies } from "@/src/lib/auth-cookies";
import { parseTokenPayload, resolveExpiresAt } from "@/src/lib/auth-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-time move of a session that was stored in localStorage into httpOnly cookies.
 * The browser already held these tokens; after this they are removed from script storage.
 */
export async function POST(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ success: false }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ success: false }, { status: 403 });
    }
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const tokens = parseTokenPayload(
    {
      token: body?.token,
      refresh_token: body?.refresh_token,
      token_expires_at: resolveExpiresAt({
        token_expires_at: body?.token_expires_at,
        token_expires_in: body?.token_expires_in,
      }),
    }
  );

  if (!tokens) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  applyAuthCookies(response.cookies, tokens, Boolean(body?.remember));
  return response;
}
