"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Copy, ExternalLink, Link2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import { STEP1_ADDRESS_FIELDS } from "./contract-edit/contract-field-schemas";
import { useImageZoomPan } from "./use-image-zoom-pan";
import { isEmptyDisplayValue } from "./contract-summary-view";
import { pickFirst } from "./frontend-contract-fields";

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

function resolveMapLocation(data) {
  const step1 = data?.step1 ?? {};
  const lat = parseCoordinate(
    pickFirst(step1.latitude, data?.latitude, step1.lat, data?.lat)
  );
  const lng = parseCoordinate(
    pickFirst(step1.longitude, data?.longitude, step1.lng, data?.lng)
  );
  const addressUrl = pickFirst(step1.address_url, data?.address_url);
  const fromUrl = parseCoordsFromUrl(addressUrl);

  if (lat != null && lng != null) {
    return {
      lat,
      lng,
      addressUrl: addressUrl || null,
      mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
      embedUrl: `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`,
    };
  }

  if (fromUrl) {
    return {
      lat: fromUrl.lat,
      lng: fromUrl.lng,
      addressUrl: addressUrl || null,
      mapsUrl: addressUrl || `https://www.google.com/maps?q=${fromUrl.lat},${fromUrl.lng}`,
      embedUrl: `https://maps.google.com/maps?q=${fromUrl.lat},${fromUrl.lng}&z=15&output=embed`,
    };
  }

  if (addressUrl) {
    return {
      lat: null,
      lng: null,
      addressUrl,
      mapsUrl: addressUrl,
      embedUrl: null,
    };
  }

  return null;
}

const resolveImageUrl = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "object") {
    return value.url || value.path || value.full_url || value.src || null;
  }
  return null;
};

const AddressImageViewer = ({ src }) => {
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
    <div className="overflow-hidden rounded-[16px] border border-gray-200 bg-[#E8E8E8]">
      <div
        ref={containerRef}
        className={`flex min-h-[320px] items-center justify-center p-4 ${cursorClass}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={resetTransform}
      >
        <div
          className="relative will-change-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition:
              cursorClass === "cursor-grabbing" ? "none" : "transform 0.15s ease-out",
          }}
        >
          <Image
            src={src}
            alt="صورة العنوان"
            width={720}
            height={540}
            className="h-auto max-h-[min(56vh,480px)] w-auto max-w-full select-none object-contain"
            draggable={false}
            unoptimized
          />
        </div>
      </div>
    </div>
  );
};

const PropertyLocationMap = ({ location }) => {
  if (!location) return null;

  const { mapsUrl, addressUrl, lat, lng } = location;

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#EEEEEE] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-right">
          <MapPin size={16} className="text-brand-hover" />
          <div>
            <p className="text-sm font-bold text-gray-800">رابط الموقع</p>
            {lat != null && lng != null ? (
              <p className="text-[11px] text-[#A3A3A3]" dir="ltr">
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
              className="inline-flex items-center gap-1.5 rounded-full border border-[#EEEEEE] bg-[#FAFAFA] px-3 py-1.5 text-xs font-bold text-[#4D4D4D] hover:border-brand-hover hover:text-brand-hover"
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
  const step1 = data?.step1 ?? {};

  const imageAddress = resolveImageUrl(
    pickFirst(step1.image_address, data?.image_address)
  );

  const location = useMemo(() => resolveMapLocation(data), [data]);

  const hasImageAddress = Boolean(imageAddress);

  return (
    <div dir="rtl" className="space-y-6">
      {hasImageAddress || location ? (
        <div className="space-y-5 rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
          {hasImageAddress ? <AddressImageViewer src={imageAddress} /> : null}

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
        title="العنوان الوطني للعقار"
        step="step1"
        fields={STEP1_ADDRESS_FIELDS}
        startInEditing
        formOnly
      />
    </div>
  );
}
