"use client";

import React from "react";
import Image from "next/image";
import { Copy, MapPin, Home, Link2, ExternalLink, Inbox, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP1_ADDRESS_FIELDS,
  STEP1_PROPERTY_FIELDS,
} from "./contract-edit/contract-field-schemas";
import { useImageZoomPan } from "./use-image-zoom-pan";

const OrderSectionErrorMenu = dynamic(
  () => import("@/components/Orders/messages/order-section-error-menu"),
  { ssr: false }
);

const copy = (value) => {
  if (!value) return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
};

const hasValue = (value) => value !== null && value !== undefined && value !== "";

const display = (value) => {
  if (!hasValue(value)) return "—";
  return String(value);
};

const DetailCard = ({
  label,
  value,
  copyable = false,
  borderColor = "border-gray-200",
}) => (
  <div className={`rounded-[16px] border-r-4 bg-white p-4 shadow-sm ${borderColor}`}>
    <span className="mb-1 block text-right text-xs font-medium text-gray-400">{label}</span>
    <p className="flex items-center justify-end gap-2 text-sm font-bold text-gray-800 lg:text-base">
      {copyable && hasValue(value) ? (
        <button
          type="button"
          onClick={() => copy(value)}
          className="text-gray-400 hover:text-brand-main"
          title="نسخ"
        >
          <Copy size={14} />
        </button>
      ) : null}
      <span>{display(value)}</span>
    </p>
  </div>
);

const resolveImageUrl = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "object") {
    return value.url || value.path || value.full_url || value.src || null;
  }
  return null;
};

const formatPropertyAge = (value) => {
  if (!hasValue(value)) return null;
  const text = String(value);
  if (text.includes("سنة") || text.includes("عام")) return text;
  return `${text} سنوات`;
};

const NoData = ({ label = "لا توجد بيانات" }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-gray-200 bg-white px-4 py-14 text-[#A3A3A3]">
    <Inbox size={28} className="text-gray-300" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const PropertyLocationMap = ({ latitude, longitude }) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`;

  return (
    <div className="overflow-hidden rounded-[16px] border border-gray-200">
      <iframe
        title="موقع العقار"
        src={mapSrc}
        className="h-[320px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
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
            transition: cursorClass === "cursor-grabbing" ? "none" : "transform 0.15s ease-out",
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

const AddressUrlCard = ({ url }) => (
  <div className="flex items-center justify-between gap-3 rounded-[16px] border-r-4 border-blue-500 bg-white p-4 shadow-sm">
    <div className="min-w-0 flex-1 text-right">
      <span className="text-xs font-medium text-gray-400">رابط الموقع</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="mt-1 block truncate text-sm font-bold text-brand-hover hover:underline lg:text-base"
        title={url}
      >
        {url}
      </a>
    </div>
    <div className="flex shrink-0 items-center gap-3 text-gray-400">
      <button type="button" onClick={() => copy(url)} title="نسخ الرابط" className="hover:text-gray-600">
        <Copy size={16} />
      </button>
      <a href={url} target="_blank" rel="noopener noreferrer" title="فتح الرابط" className="hover:text-gray-600">
        <ExternalLink size={16} />
      </a>
    </div>
  </div>
);

export default function PropertyDetails({ data }) {
  const step1 = data?.step1 ?? {};
  const summary = data?.contract_summary ?? {};

  const propertyDetails = [
    {
      label: "استخدام العقار",
      value: step1.property_usages_name,
      borderColor: "border-blue-600",
    },
    {
      label: "نوع العقار",
      value: step1.property_type_name,
      borderColor: "border-gray-800",
    },
    {
      label: "إجمالي عدد الوحدات في كل طابق",
      value: step1.number_of_units_per_floor,
      borderColor: "border-orange-500",
    },
    {
      label: "رقم العقار",
      value: step1.property_number ?? step1.real_estate_id ?? data?.real_estate_id,
      borderColor: "border-green-500",
    },
    {
      label: "إجمالي عدد الطوابق",
      value: step1.number_of_floors,
      borderColor: "border-slate-400",
    },
    {
      label: "عمر العقار",
      value: formatPropertyAge(step1.age_of_the_property),
      borderColor: "border-sky-400",
    },
    {
      label: "إجمالي عدد الوحدات في العقار",
      value: step1.number_of_units_in_realestate,
      borderColor: "border-purple-500",
    },
    {
      label: "إسم العقار",
      value: step1.name_real_estate || step1.property_name || summary.name_owner,
      borderColor: "border-gray-400",
      copyable: true,
    },
  ].filter((item) => hasValue(item.value));

  const nationalAddress = [
    {
      label: "المدينة",
      value: step1.city_name || step1.property_city_id,
      borderColor: "border-blue-500",
      copyable: true,
    },
    {
      label: "المنطقة",
      value: step1.property_place_name || step1.property_place_id,
      borderColor: "border-pink-500",
      copyable: true,
    },
    { label: "الشارع", value: step1.street, borderColor: "border-orange-500", copyable: true },
    { label: "الحي", value: step1.neighborhood, borderColor: "border-purple-500", copyable: true },
    { label: "رقم الإضافي", value: step1.extra_figure, borderColor: "border-green-500", copyable: true },
    { label: "رقم المبنى", value: step1.building_number, borderColor: "border-blue-400", copyable: true },
    { label: "الرمز البريدي", value: step1.postal_code, borderColor: "border-gray-800", copyable: true },
  ].filter((item) => hasValue(item.value));

  const hasCoordinates = hasValue(step1.latitude) && hasValue(step1.longitude);
  const addressUrl = step1.address_url;
  const hasAddressUrl = hasValue(addressUrl);
  const imageAddress = resolveImageUrl(step1.image_address);
  const hasImageAddress = hasValue(imageAddress);
  const hasAddressDetails = nationalAddress.length > 0;
  const showLocationSection = hasAddressDetails || hasCoordinates || hasAddressUrl || hasImageAddress;

  if (!propertyDetails.length && !showLocationSection) return null;

  const tabs = [
    {
      value: "map",
      label: "الخريطة",
      icon: <MapPin size={16} />,
      content: hasCoordinates ? (
        <PropertyLocationMap latitude={step1.latitude} longitude={step1.longitude} />
      ) : (
        <NoData label="لا توجد بيانات لموقع العقار على الخريطة" />
      ),
    },
    {
      value: "national-address",
      label: "تفاصيل العنوان",
      icon: <Home size={16} />,
      content: hasAddressDetails ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {nationalAddress.map((item, index) => (
            <DetailCard key={index} {...item} />
          ))}
        </div>
      ) : (
        <NoData label="لا توجد بيانات للعنوان الوطني" />
      ),
    },
    {
      value: "image-address",
      label: "صورة العنوان",
      icon: <ImageIcon size={16} />,
      content: hasImageAddress ? (
        <AddressImageViewer src={imageAddress} />
      ) : (
        <NoData label="لا توجد صورة للعنوان" />
      ),
    },
    {
      value: "address-url",
      label: "رابط الموقع",
      icon: <Link2 size={16} />,
      content: hasAddressUrl ? (
        <AddressUrlCard url={addressUrl} />
      ) : (
        <NoData label="لا يوجد رابط لموقع العقار" />
      ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      {propertyDetails.length > 0 ? (
        <ContractStepEditor
          title="تفاصيل العقار"
          step="step1"
          fields={STEP1_PROPERTY_FIELDS}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {propertyDetails.map((item, index) => (
                  <DetailCard key={index} {...item} />
                ))}
              </div>
            </div>
            <OrderSectionErrorMenu
              label="إرسال خطأ للعميل"
              orderData={data}
              context="propertyDetails"
            />
          </div>
        </ContractStepEditor>
      ) : null}

      {showLocationSection ? (
        <ContractStepEditor
          title="العنوان الوطني للعقار"
          step="step1"
          fields={STEP1_ADDRESS_FIELDS}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
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
            </div>
            <OrderSectionErrorMenu
              label="إرسال خطأ للعميل"
              orderData={data}
              context="propertyAddress"
            />
          </div>
        </ContractStepEditor>
      ) : null}
    </div>
  );
}
