import React, { useState } from "react";
import {
  Copy,
  Check,
  Building2,
  Sparkles,
  ChefHat,
  Bed,
  Bath,
  Sofa,
  Snowflake,
  Wind,
  Zap,
  Droplets,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP2_UNIT_FIELDS,
  STEP2_ROOM_FIELDS,
  STEP2_SERVICE_FIELDS,
} from "./contract-edit/contract-field-schemas";

const copy = (value) => {
  if (!value) return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
};

// Tailwind-safe accent palette: { icon badge, ring/border, text }
const ACCENTS = {
  blue: { badge: "bg-blue-50 text-blue-600", ring: "group-hover:border-blue-200" },
  yellow: { badge: "bg-amber-50 text-amber-600", ring: "group-hover:border-amber-200" },
  indigo: { badge: "bg-indigo-50 text-indigo-600", ring: "group-hover:border-indigo-200" },
  green: { badge: "bg-emerald-50 text-emerald-600", ring: "group-hover:border-emerald-200" },
  purple: { badge: "bg-purple-50 text-purple-600", ring: "group-hover:border-purple-200" },
  orange: { badge: "bg-orange-50 text-orange-600", ring: "group-hover:border-orange-200" },
  sky: { badge: "bg-sky-50 text-sky-600", ring: "group-hover:border-sky-200" },
  rose: { badge: "bg-rose-50 text-rose-600", ring: "group-hover:border-rose-200" },
  gray: { badge: "bg-gray-100 text-gray-400", ring: "group-hover:border-gray-200" },
};

const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="نسخ"
      onClick={(e) => {
        e.stopPropagation();
        copy(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0 text-gray-300 hover:text-brand-main"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
};

const DetailCard = ({ label, value, icon, accent = "blue", copyable = false }) => {
  const isZero = value === "لا يوجد" || value === 0;
  const isDisabled = isZero;
  const palette = ACCENTS[accent] || ACCENTS.blue;

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 transition-all duration-200 ${
        isDisabled ? "opacity-50" : `hover:shadow-md hover:-translate-y-0.5 ${palette.ring}`
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${palette.badge}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-right">
        <span className="block truncate text-[11px] font-medium text-gray-400">{label}</span>
        <span className={`block truncate text-sm font-bold ${isDisabled ? "text-gray-400" : "text-gray-800"}`}>
          {value}
        </span>
      </div>
      {copyable && !isDisabled ? <CopyButton value={value} /> : null}
    </div>
  );
};

const UnitDetailes = ({ data }) => {
  const unitType = data?.step2?.unit_type_name || data?.step2?.unit_type?.name_ar || "---";
  const unitUsage = data?.step2?.unit_usage_name || data?.step2?.unit_usage?.name_ar || "---";

  const unitGeneralDetails = [
    { label: "نوع الوحدة", value: unitType, icon: <Building2 size={18} />, accent: "yellow" },
    { label: "استخدام الوحدة", value: unitUsage, icon: <LayoutGrid size={18} />, accent: "indigo" },
    { label: "مؤثثة..؟", value: data?.step2?.furnished ? "نعم" : "لا", icon: <Sparkles size={18} />, accent: "sky" },
    { label: "مطبخ راكب", value: data?.step2?.kitchen_tank ? "نعم" : "لا", icon: <ChefHat size={18} />, accent: "orange" },
  ];

  const roomDetails = [
    { label: "دورة مياه", value: data?.step2?.The_number_of_the_toilet || "---", icon: <Bath size={18} />, accent: "blue" },
    { label: "غرفة النوم", value: data?.step2?.tootal_rooms || "---", icon: <Bed size={18} />, accent: "rose" },
    { label: "الصالة", value: data?.step2?.The_number_of_halls || "---", icon: <Sofa size={18} />, accent: "purple" },
    { label: "مطبخ", value: data?.step2?.The_number_of_kitchens || "---", icon: <ChefHat size={18} />, accent: "orange" },
    { label: "مكيف سبليت", value: data?.step2?.split_ac || "لا يوجد", icon: <Snowflake size={18} />, accent: "sky" },
    { label: "مكيف شباك", value: data?.step2?.window_ac || "لا يوجد", icon: <Wind size={18} />, accent: "gray" },
  ];

  const services = [
    { label: "عداد الكهرباء", value: data?.step2?.electricity_meter_number || "---", icon: <Zap size={18} />, accent: "orange", copyable: true },
    { label: "عداد المياه", value: data?.step2?.water_meter_number || "---", icon: <Droplets size={18} />, accent: "blue", copyable: true },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6" dir="rtl">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


        <div className="bg-gray-50/70 p-5 lg:p-6 rounded-[28px] border border-gray-100">
          <ContractStepEditor title="تفاصيل الوحدات" step="step2" fields={STEP2_UNIT_FIELDS}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unitGeneralDetails.map((item, index) => (
                <DetailCard key={index} {...item} />
              ))}
            </div>
          </ContractStepEditor>
        </div>

        <div className="bg-gray-50/70 p-5 lg:p-6 rounded-[28px] border border-gray-100">
          <ContractStepEditor title="تفاصيل الغرف" step="step2" fields={STEP2_ROOM_FIELDS}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roomDetails.map((item, index) => (
                <DetailCard key={index} {...item} />
              ))}
            </div>
          </ContractStepEditor>
        </div>
      </div>

      <div className="bg-gradient-to-l from-gray-50/70 to-white p-5 lg:p-6 rounded-[28px] border border-gray-100">
        <ContractStepEditor title="الخدمات والعدادات" step="step2" fields={STEP2_SERVICE_FIELDS}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((item, index) => (
              <DetailCard key={index} {...item} />
            ))}
          </div>
        </ContractStepEditor>
      </div>
    </div>
  );
};

export default UnitDetailes;
