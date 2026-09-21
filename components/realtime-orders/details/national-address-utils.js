import { getOrderAddressStep } from "@/src/lib/order-detail-steps";
import {
  absolutizeMediaUrl,
  fileNameFromMediaUrl,
} from "@/src/lib/media-url";

function pick(...values) {
  for (const value of values) {
    if (value == null || value === "") continue;
    return value;
  }
  return null;
}

/** Resolve API file payloads to an absolute browser-loadable URL. */
export function resolveImageUrl(value) {
  return absolutizeMediaUrl(value);
}

export function fileNameFromUrl(url) {
  if (!url) return null;
  return fileNameFromMediaUrl(url, null);
}

export function parseCoordinate(value) {
  if (value == null || value === "") return null;
  const num = Number(String(value).trim());
  return Number.isFinite(num) ? num : null;
}

/** Extract lat/lng from common Google Maps / geo URLs. */
export function parseCoordsFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const text = url.trim();
  if (!text) return null;

  const patterns = [
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
    /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
    /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
    /geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
    /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  return null;
}

export function isLikelyImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const path = url.split("?")[0].toLowerCase();
  return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(path);
}

export function isMapsUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (parseCoordsFromUrl(url)) return true;

  const text = url.trim().toLowerCase();
  return (
    text.includes("google.com/maps") ||
    text.includes("maps.google") ||
    text.includes("goo.gl/maps") ||
    text.includes("maps.app.goo.gl") ||
    text.startsWith("geo:")
  );
}

function resolveNationalAddressType(address = {}, orderData = {}) {
  const source = String(address.address_source ?? orderData.address_source ?? "").toLowerCase();
  const imageUrl = resolveImageUrl(pick(address.image_address, orderData.image_address));
  const addressUrl = pick(address.address_url, orderData.address_url);
  const lat = parseCoordinate(pick(address.latitude, address.lat, orderData.latitude, orderData.lat));
  const lng = parseCoordinate(pick(address.longitude, address.lng, orderData.longitude, orderData.lng));

  if (source.includes("صورة") || source.includes("image") || source.includes("img")) {
    return "img";
  }
  if (
    source.includes("خرائط") ||
    source.includes("map") ||
    source.includes("location") ||
    source.includes("موقع")
  ) {
    if (imageUrl || (addressUrl && isLikelyImageUrl(addressUrl))) return "img";
    if (lat != null && lng != null) return "location";
    if (addressUrl && isMapsUrl(addressUrl)) return "location";
    return "text";
  }

  if (imageUrl || (addressUrl && isLikelyImageUrl(addressUrl))) return "img";
  if (lat != null && lng != null) return "location";
  if (addressUrl && isMapsUrl(addressUrl)) return "location";
  return "text";
}

export function resolveNationalAddress(orderData = {}) {
  const address = getOrderAddressStep(orderData);
  const summary = orderData.contract_summary ?? {};
  const addressUrl = pick(address.address_url, orderData.address_url);
  const imageUrl =
    resolveImageUrl(pick(address.image_address, orderData.image_address)) ||
    (isLikelyImageUrl(addressUrl) ? addressUrl : null);

  const fromUrl = parseCoordsFromUrl(addressUrl);
  const lat =
    parseCoordinate(pick(address.latitude, address.lat, orderData.latitude, orderData.lat)) ??
    fromUrl?.lat ??
    null;
  const lng =
    parseCoordinate(pick(address.longitude, address.lng, orderData.longitude, orderData.lng)) ??
    fromUrl?.lng ??
    null;

  const type = resolveNationalAddressType(address, orderData);

  const mapsUrl =
    lat != null && lng != null
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : addressUrl && isMapsUrl(addressUrl)
        ? addressUrl
        : null;

  const sourceLabels = {
    img: "صورة بطاقة العنوان",
    location: "رابط خرائط قوقل",
    text: pick(address.address_source, "العنوان الوطني"),
  };

  return {
    type,
    source: sourceLabels[type] || pick(address.address_source, "العنوان الوطني"),
    city: pick(
      summary.relation_labels?.property_city,
      orderData.relation_labels?.property_city,
      address.city_name,
      address.property_city_name,
      orderData.city_name
    ),
    district: pick(summary.neighborhood, address.neighborhood, orderData.neighborhood),
    building: pick(summary.building_number, address.building_number, orderData.building_number),
    street: pick(summary.street, address.street, orderData.street),
    postal_code: pick(summary.postal_code, address.postal_code, orderData.postal_code),
    additional_number: pick(
      address.extra_figure,
      address.additional_number,
      summary.additional_number,
      orderData.extra_figure
    ),
    short_address: pick(address.short_address, summary.short_address, address.national_address),
    image_url: imageUrl,
    image_name: fileNameFromUrl(imageUrl),
    address_url: addressUrl,
    lat,
    lng,
    maps_url: mapsUrl,
    embed_url:
      lat != null && lng != null
        ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
        : fromUrl
          ? `https://maps.google.com/maps?q=${fromUrl.lat},${fromUrl.lng}&z=15&output=embed`
          : null,
  };
}
