"use client";

import React from "react";
import { Copy, MapPin, Home, Link2, ExternalLink, Inbox } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import { STEP1_ADDRESS_FIELDS } from "./contract-edit/contract-field-schemas";

const OrderSectionErrorMenu = dynamic(
  () => import("@/components/Orders/messages/order-section-error-menu"),
  { ssr: false }
);

const copy = (value) => {
  if (!value) return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
};

const DetailCard = ({ label, value, icon, borderColor = "border-gray-200" }) => (
  <div
    className={`bg-white p-4 rounded-[16px] shadow-sm flex items-center justify-between border-r-4 ${borderColor} relative transition-all hover:shadow-md`}
  >
    <div className="flex flex-col gap-1 text-right w-full">
      <span className="text-gray-400 text-xs font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {icon && (
          <div className="text-gray-400 cursor-pointer" onClick={() => copy(value)}>
            {icon}
          </div>
        )}
        <span className="text-gray-800 font-bold text-sm lg:text-base">{value}</span>
      </div>
    </div>
  </div>
);

const hasValue = (value) => value !== null && value !== undefined && value !== "";

const NoData = ({ label = "لا توجد بيانات" }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-14 px-4 bg-white rounded-[16px] border border-dashed border-gray-200 text-[#A3A3A3]">
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

const ImageAddressCard = ({ src }) => (
  <div className="bg-white p-4 rounded-[16px] shadow-sm border-r-4 border-teal-500">
    <span className="text-gray-400 text-xs font-medium block mb-3 text-right">صورة العنوان</span>
    <a href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[12px] border border-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="صورة العنوان" className="w-full max-h-[360px] object-contain" />
    </a>
  </div>
);

const AddressUrlCard = ({ url }) => (
  <div className="bg-white p-4 rounded-[16px] shadow-sm border-r-4 border-blue-500 flex items-center justify-between gap-3">
    <div className="flex flex-col gap-1 text-right flex-1 min-w-0">
      <span className="text-gray-400 text-xs font-medium">رابط الموقع</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="text-brand-hover font-bold text-sm lg:text-base truncate hover:underline"
        title={url}
      >
        {url}
      </a>
    </div>
    <div className="flex items-center gap-3 shrink-0 text-gray-400">
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

  const nationalAddress = [
    {
      label: "المدينة",
      value: step1.city_name || step1.property_city_id,
      icon: <Copy size={14} />,
      borderColor: "border-blue-500",
    },
    {
      label: "المنطقة",
      value: step1.property_place_name || step1.property_place_id,
      icon: <Copy size={14} />,
      borderColor: "border-pink-500",
    },
    { label: "الشارع", value: step1.street, icon: <Copy size={14} />, borderColor: "border-orange-500" },
    { label: "الحي", value: step1.neighborhood, icon: <Copy size={14} />, borderColor: "border-purple-500" },
    { label: "رقم الإضافي", value: step1.extra_figure, icon: <Copy size={14} />, borderColor: "border-green-500" },
    { label: "رقم المبنى", value: step1.building_number, icon: <Copy size={14} />, borderColor: "border-blue-400" },
    { label: "الرمز البريدي", value: step1.postal_code, icon: <Copy size={14} />, borderColor: "border-gray-800" },
  ].filter((item) => hasValue(item.value));

  const hasCoordinates = hasValue(step1.latitude) && hasValue(step1.longitude);
  const addressUrl = step1.address_url;
  const hasAddressUrl = hasValue(addressUrl);
  const imageAddress = step1.image_address;
  const hasImageAddress = hasValue(imageAddress);
  const hasAddressDetails = nationalAddress.length > 0 || hasImageAddress;
  const showLocationSection = hasAddressDetails || hasCoordinates || hasAddressUrl;

  if (!showLocationSection) return null;

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
        <div className="space-y-4">
          {nationalAddress.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nationalAddress.map((item, index) => (
                <DetailCard key={index} {...item} />
              ))}
            </div>
          )}
          {hasImageAddress && <ImageAddressCard src={imageAddress} />}
        </div>
      ) : (
        <NoData label="لا توجد بيانات للعنوان الوطني" />
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
    <div dir="rtl">
      <ContractStepEditor
        title="العنوان الوطني للعقار"
        step="step1"
        fields={STEP1_ADDRESS_FIELDS}
      >
        <div className="flex justify-between gap-4 items-start">
          <div className="bg-gray-100/50 p-6 rounded-[28px] border border-gray-100 flex-1">
            <Tabs defaultValue={tabs[0].value} dir="rtl">
              <TabsList className="h-fit w-full flex-wrap justify-start gap-2 bg-transparent p-0 mb-4">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full bg-white border border-gray-200 text-gray-500 shadow-none data-[state=active]:bg-brand-hover data-[state=active]:text-white data-[state=active]:border-transparent transition-colors"
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
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
    </div>
  );
}
