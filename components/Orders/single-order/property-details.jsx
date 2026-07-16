"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Copy, Home, Link2, ExternalLink, Inbox, ImageIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import { STEP1_ADDRESS_FIELDS } from "./contract-edit/contract-field-schemas";
import { useImageZoomPan } from "./use-image-zoom-pan";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
  SECTION_ERROR_BUTTON_CLASS,
} from "./contract-summary-view";
import {
  ADDRESS_FIELDS,
  pickFirst,
  resolveAddressFieldValue,
} from "./frontend-contract-fields";

const OrderSectionErrorMenu = dynamic(
  () => import("@/components/Orders/messages/order-section-error-menu"),
  { ssr: false }
);

const BORDER_COLORS = [
  "border-blue-500",
  "border-pink-500",
  "border-orange-500",
  "border-purple-500",
  "border-green-500",
  "border-blue-400",
  "border-gray-800",
  "border-slate-500",
  "border-teal-500",
  "border-indigo-500",
];

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

const DetailCard = ({
  label,
  value,
  copyable = false,
  borderColor = "border-gray-200",
}) => {
  return (
    <div
      className={`rounded-[16px] border-r-4 bg-white p-4 shadow-sm ${borderColor}`}
    >
      <span className="mb-1 block text-right text-xs font-medium text-gray-400">
        {label}
      </span>
      <p className="flex items-center justify-end gap-2 text-sm font-bold text-gray-800 lg:text-base">
        {copyable ? (
          <button
            type="button"
            onClick={() => copy(value)}
            className="text-gray-400 hover:text-brand-main"
            title="نسخ"
          >
            <Copy size={14} />
          </button>
        ) : null}
        <span>{formatDisplayValue(value)}</span>
      </p>
    </div>
  );
};

const resolveImageUrl = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "object") {
    return value.url || value.path || value.full_url || value.src || null;
  }
  return null;
};

const NoData = ({ label = "لا توجد بيانات" }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-gray-200 bg-white px-4 py-14 text-[#A3A3A3] opacity-45">
    <Inbox size={28} className="text-gray-300" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

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
  if (!location) {
    return <NoData label="لا يوجد موقع للعقار على الخريطة" />;
  }

  const { embedUrl, mapsUrl, addressUrl, lat, lng } = location;

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#EEEEEE] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F0F0] px-4 py-3">
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

      {embedUrl ? (
        <iframe
          title="موقع العقار"
          src={embedUrl}
          className="h-[360px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
          <Inbox size={28} className="text-gray-300" />
          <p className="text-sm text-[#A3A3A3]">
            لا يمكن عرض الخريطة مباشرة — افتح الرابط في الخرائط
          </p>
          {addressUrl ? (
            <a
              href={addressUrl}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="max-w-full truncate text-sm font-bold text-brand-hover hover:underline"
            >
              {addressUrl}
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default function PropertyDetails({ data }) {
  const step1 = data?.step1 ?? {};

  const nationalAddress = ADDRESS_FIELDS.filter(
    (field) => !["address_url"].includes(field.key)
  )
    .map((field, index) => ({
      label: field.label,
      value: resolveAddressFieldValue(data, field),
      borderColor: BORDER_COLORS[index % BORDER_COLORS.length],
      copyable: true,
    }))
    .filter((item) => !isEmptyDisplayValue(item.value));

  const imageAddress = resolveImageUrl(
    pickFirst(step1.image_address, data?.image_address)
  );

  const location = useMemo(() => resolveMapLocation(data), [data]);

  const tabs = [
    {
      value: "national-address",
      label: "تفاصيل العنوان",
      icon: <Home size={16} />,
      content:
        nationalAddress.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {nationalAddress.map((item) => (
              <DetailCard key={item.label} {...item} />
            ))}
          </div>
        ) : (
          <NoData label="لا توجد تفاصيل عنوان متاحة" />
        ),
    },
    {
      value: "image-address",
      label: "صورة العنوان",
      icon: <ImageIcon size={16} />,
      content: imageAddress ? (
        <AddressImageViewer src={imageAddress} />
      ) : (
        <NoData label="لا توجد صورة للعنوان" />
      ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      <ContractStepEditor
        title="العنوان الوطني للعقار"
        step="step1"
        fields={STEP1_ADDRESS_FIELDS}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-5 rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
            <Tabs defaultValue={tabs[0].value} dir="rtl">
              <TabsList className="mb-4 h-fit w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-500 shadow-none transition-colors data-[state=active]:border-transparent data-[state=active]:bg-brand-hover data-[state=active]:text-white"
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <Link2 size={14} />
                الموقع على الخريطة
              </div>
              <PropertyLocationMap location={location} />
            </div>
          </div>
          <OrderSectionErrorMenu
            label="إرسال خطأ للعميل"
            orderData={data}
            context="propertyAddress"
            buttonClassName={SECTION_ERROR_BUTTON_CLASS}
          />
        </div>
      </ContractStepEditor>
    </div>
  );
}
