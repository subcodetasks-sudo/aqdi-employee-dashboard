import { cookies } from "next/headers";

export const runtime = "nodejs";

const TOKEN_COOKIE = "token";

function getAllowedOrigins() {
  const origins = new Set(["https://aqid.subcodeco.com", "https://b3app.co"]);

  for (const value of [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.API_PROXY_TARGET,
  ]) {
    if (!value) continue;
    try {
      origins.add(new URL(value).origin);
    } catch {
      /* ignore invalid env URLs */
    }
  }

  return origins;
}

function isAllowedAssetUrl(url) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (!getAllowedOrigins().has(url.origin)) return false;
  return !url.pathname.startsWith("/api/");
}

function safeFilename(name) {
  const cleaned = String(name || "download")
    .replace(/[\r\n"]/g, "")
    .replace(/[/\\?*:|<>]/g, "_")
    .trim();
  return cleaned.slice(0, 180) || "download";
}

export async function GET(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");
  const filename = safeFilename(searchParams.get("filename"));

  if (!target) {
    return new Response("Missing url", { status: 400 });
  }

  let assetUrl;
  try {
    assetUrl = new URL(target);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (!isAllowedAssetUrl(assetUrl)) {
    return new Response("Forbidden", { status: 403 });
  }

  let upstream;
  try {
    upstream = await fetch(assetUrl.toString(), {
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return new Response("Upstream fetch failed", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: upstream.status || 502 });
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  const encoded = encodeURIComponent(filename);

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "private, no-store",
    },
  });
}
