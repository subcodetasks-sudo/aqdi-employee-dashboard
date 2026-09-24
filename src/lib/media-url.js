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

function triggerBlobDownload(blob, name) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

async function fetchAsBlob(href, credentials) {
  const response = await fetch(href, { credentials });
  if (!response.ok) throw new Error("fetch failed");
  return response.blob();
}

/**
 * Force a file download in the current tab. Tries a direct blob fetch first,
 * then the same-origin `/media-download` proxy when CORS blocks the file host.
 * Never opens a new tab.
 */
export async function downloadMedia(url, filename) {
  const href = absolutizeMediaUrl(url);
  if (!href) return false;

  const name = filename || fileNameFromMediaUrl(href, "download");

  if (href.startsWith("blob:") || href.startsWith("data:")) {
    const link = document.createElement("a");
    link.href = href;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  }

  try {
    triggerBlobDownload(await fetchAsBlob(href, "omit"), name);
    return true;
  } catch {
    /* CORS or host headers blocked a direct download */
  }

  try {
    const proxy = `/media-download?url=${encodeURIComponent(href)}&filename=${encodeURIComponent(name)}`;
    triggerBlobDownload(await fetchAsBlob(proxy, "same-origin"), name);
    return true;
  } catch {
    return false;
  }
}
