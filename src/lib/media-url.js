/**
 * Resolve and absolutize media/file URLs returned by the API
 * (full URLs, relative `/storage/...` paths, or bare storage keys).
 */

function pickString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** Origin of the API host (e.g. https://aqid.subcodeco.com), without `/api`. */
export function getMediaOrigin() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.API_PROXY_TARGET ||
    "https://aqid.subcodeco.com/api";

  try {
    const url = new URL(base);
    return url.origin;
  } catch {
    return "https://aqid.subcodeco.com";
  }
}

/** Extract a usable URL string from API string/object file payloads. */
export function resolveMediaUrl(value) {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "object") {
    return pickString(value.url, value.path, value.full_url, value.src);
  }
  return null;
}

/** Turn relative storage paths into absolute URLs the browser can load. */
export function absolutizeMediaUrl(value) {
  const raw = resolveMediaUrl(value);
  if (!raw) return null;

  if (
    /^https?:\/\//i.test(raw) ||
    raw.startsWith("blob:") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }

  const origin = getMediaOrigin();

  if (raw.startsWith("//")) {
    try {
      return new URL(`${origin.split(":")[0]}:${raw}`).href;
    } catch {
      return `https:${raw}`;
    }
  }

  if (raw.startsWith("/")) return `${origin}${raw}`;
  return `${origin}/${raw.replace(/^\.\//, "")}`;
}

export function fileNameFromMediaUrl(url, fallback = "file") {
  if (!url) return fallback;
  try {
    const path = String(url).split("?")[0];
    const name = decodeURIComponent(path.split("/").pop() || "");
    return name || fallback;
  } catch {
    return fallback;
  }
}

export function isPdfMediaUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

/**
 * Force a file download. Blob fetch works for CORS-enabled cross-origin
 * assets; falls back to opening the URL when fetch is blocked.
 */
export async function downloadMedia(url, filename) {
  const href = absolutizeMediaUrl(url);
  if (!href) return false;

  const name = filename || fileNameFromMediaUrl(href, "download");

  try {
    const response = await fetch(href, { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error("fetch failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
    return true;
  } catch {
    const link = document.createElement("a");
    link.href = href;
    link.download = name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return false;
  }
}
