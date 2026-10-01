"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, ExternalLink, ImagePlus, Link2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import { STEP1_ADDRESS_FIELDS } from "./contract-edit/contract-field-schemas";
import { useImageZoomPan } from "./use-image-zoom-pan";
import { isEmptyDisplayValue } from "./contract-summary-view";
import { pickFirst } from "./frontend-contract-fields";
import { getOrderAddressStep } from "@/src/lib/order-detail-steps";
import { isPlaceholderCoordinate } from "@/components/realtime-orders/details/national-address-utils";
import { absolutizeMediaUrl } from "@/src/lib/media-url";

const copy = (value) => {
  if (isEmptyDisplayValue(value)) return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
};

function parseCoordinate(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(String(value).trim());
  return Number.isFinite(num) ? num : null;
}

/** Extract lat/lng from common Google Maps / geo URLs. */
function parseCoordsFromUrl(url) {
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

function isImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const path = url.split("?")[0].toLowerCase();
  return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(path);
}

function resolveMapLocation(data) {
  const address = getOrderAddressStep(data);
  const summary = data?.contract_summary ?? {};
  const addressUrl = pickFirst(
    address.address_url,
    summary.address_url,
    data?.step2?.address_url,
    data?.step1?.address_url,
    data?.address_url
  );
  const locationUrl = addressUrl && !isImageUrl(addressUrl) ? addressUrl : null;
  const fromUrl = parseCoordsFromUrl(locationUrl);

  // Prefer the saved link. Stored lat/lng are often a default city center
  // and would hide the link the client actually submitted.
  if (locationUrl) {
    return {
      lat: fromUrl?.lat ?? null,
      lng: fromUrl?.lng ?? null,
      addressUrl: locationUrl,
      mapsUrl: locationUrl,
      embedUrl: fromUrl
        ? `https://maps.google.com/maps?q=${fromUrl.lat},${fromUrl.lng}&z=15&output=embed`
        : null,
    };
  }

  const lat = parseCoordinate(
    pickFirst(address.latitude, data?.latitude, summary.latitude, address.lat, data?.lat)
  );
  const lng = parseCoordinate(
    pickFirst(address.longitude, data?.longitude, summary.longitude, address.lng, data?.lng)
  );

  if (lat != null && lng != null && !isPlaceholderCoordinate(lat, lng)) {
    return {
      lat,
      lng,
      addressUrl: null,
      mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
      embedUrl: `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`,
    };
  }

  return null;
}

const resolveImageUrl = (value) => absolutizeMediaUrl(value);

function usePreviewUrl(source) {
  const isFile = typeof File !== "undefined" && source instanceof File;
  const [objectPreview, setObjectPreview] = useState(null);

  useEffect(() => {
    if (!isFile) return undefined;
    const url = URL.createObjectURL(source);
    // An object URL is an external resource: it must be created and revoked in the same effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectPreview({ file: source, url });
    return () => URL.revokeObjectURL(url);
  }, [isFile, source]);

  if (isFile) return objectPreview?.file === source ? objectPreview.url : null;
  return typeof source === "string" && source.trim() ? source : null;
}

const AddressImageViewer = ({ source, onReplace }) => {
  const src = usePreviewUrl(source);
  const {
    scale,
    position,
    containerRef,
    handleMouseDown,
    resetTransform,
    cursorClass,
  } = useImageZoomPan({
    enabled: Boolean(src),
    resetDeps: [src],
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#E8E8E8]">
      <div
        ref={containerRef}
        className={`flex min-h-[320px] items-center justify-center p-4 ${cursorClass}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={resetTransform}
      >
        {src ? (
          <div
            className="relative will-change-transform"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center center",
              transition:
                cursorClass === "cursor-grabbing" ? "none" : "transform 0.15s ease-out",
            }}
          >
            <img
              src={src}
              alt="صورة العنوان"
              className="h-auto max-h-[min(56vh,480px)] w-auto max-w-full select-none object-contain"
              draggable={false}
            />
          </div>
        ) : null}
      </div>
      {onReplace ? (
        <label className="absolute top-3 start-3 z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm hover:bg-white">
          <ImagePlus className="size-3.5" />
          تغيير الصورة
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              event.target.value = "";
              if (file) onReplace(file);
            }}
          />
        </label>
      ) : null}
    </div>
  );
};

const PropertyLocationMap = ({ location }) => {
  if (!location) return null;

  const { mapsUrl, addressUrl, lat, lng } = location;

  return (
    <div className="overflow-hidden rounded-20 border border-surface-border dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-right">
          <MapPin size={16} className="text-brand-hover" />
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-white">رابط الموقع</p>
            {addressUrl ? (
              <a
                href={addressUrl}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                title={addressUrl}
                className="block max-w-[280px] truncate text-11 text-brand-hover underline decoration-brand-hover/30 hover:decoration-brand-hover"
              >
                {addressUrl}
              </a>
            ) : lat != null && lng != null ? (
              <p className="text-11 text-ink-placeholder dark:text-white/40" dir="ltr">
                {lat}, {lng}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(addressUrl || mapsUrl) && (
            <button
              type="button"
              onClick={() => copy(addressUrl || mapsUrl)}
              title="نسخ الرابط"
              className="inline-flex items-center gap-1.5 rounded-full border border-surface-border dark:border-white/10 bg-neutral-50 dark:bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-ink-subtle dark:text-white/70 hover:border-brand-hover hover:text-brand-hover"
            >
              <Copy size={13} />
              نسخ
            </button>
          )}
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="فتح في الخرائط"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-hover px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-hover/90"
            >
              <ExternalLink size={13} />
              فتح الخريطة
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default function PropertyDetails({ data }) {
  const editorRef = useRef(null);
  const [addressImage, setAddressImage] = useState(undefined);
  const address = getOrderAddressStep(data);

  const imageAddress = resolveImageUrl(
    pickFirst(address.image_address, data?.image_address)
  );
  const previewSource =
    addressImage instanceof File || (typeof addressImage === "string" && addressImage.trim())
      ? addressImage
      : imageAddress;

  const location = useMemo(() => resolveMapLocation(data), [data]);

  const hasImageAddress = Boolean(previewSource);

  const handleFormChange = useCallback((next) => {
    if (!next || !Object.prototype.hasOwnProperty.call(next, "image_address")) return;
    setAddressImage((current) =>
      Object.is(current, next.image_address) ? current : next.image_address
    );
  }, []);

  const handleReplaceImage = (file) => {
    setAddressImage(file);
    editorRef.current?.setField("image_address", file);
  };

  return (
    <div dir="rtl" className="space-y-6">
      {hasImageAddress || location ? (
        <div className="space-y-5 rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
          {hasImageAddress ? (
            <AddressImageViewer source={previewSource} onReplace={handleReplaceImage} />
          ) : null}

          {location ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <Link2 size={14} />
                الموقع على الخريطة
              </div>
              <PropertyLocationMap location={location} />
            </div>
          ) : null}
        </div>
      ) : null}

      <ContractStepEditor
        ref={editorRef}
        title="العنوان الوطني للعقار"
        step="step2"
        fields={STEP1_ADDRESS_FIELDS}
        startInEditing
        formOnly
        onFormChange={handleFormChange}
      />
    </div>
  );
}
