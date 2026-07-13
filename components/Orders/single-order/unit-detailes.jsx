"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { getStepFormValues } from "@/src/lib/contract-update";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP2_UNIT_FIELDS,
  STEP2_ROOM_FIELDS,
  STEP2_SERVICE_FIELDS,
} from "./contract-edit/contract-field-schemas";

const BORDER_COLORS = [
  "border-blue-500",
  "border-amber-500",
  "border-indigo-600",
  "border-sky-400",
  "border-orange-500",
  "border-rose-500",
  "border-purple-500",
  "border-green-500",
  "border-teal-500",
  "border-gray-400",
];

const copy = (value) => {
  if (!value || value === "—") return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
};

const display = (value) => {
  if (value === null || value === undefined || value === "") return "—";
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
      {copyable && value && value !== "—" ? (
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

function resolveFieldDisplayValue(field, data) {
  const step2 = data?.step2 ?? {};
  const formValues = getStepFormValues(data, "step2");
  const rawValue = formValues[field.key];

  if (field.type === "boolean") {
    return rawValue === 1 || rawValue === "1" || rawValue === true ? "نعم" : "لا";
  }

  if (field.key === "unit_type_id") {
    return step2.unit_type_name || step2.unit_type?.name_ar || rawValue;
  }

  if (field.key === "unit_usage_id") {
    return step2.unit_usage_name || step2.unit_usage?.name_ar || rawValue;
  }

  return rawValue;
}

function buildSectionItems(fields, data) {
  return fields.map((field, index) => ({
    label: field.label,
    value: resolveFieldDisplayValue(field, data),
    borderColor: BORDER_COLORS[index % BORDER_COLORS.length],
    copyable:
      field.type !== "boolean" &&
      (field.key.includes("meter") ||
        field.key.includes("number") ||
        field.key.includes("unit_number") ||
        field.key.includes("id")),
  }));
}

const UnitDetailes = ({ data }) => {
  const unitGeneralDetails = buildSectionItems(STEP2_UNIT_FIELDS, data);
  const roomDetails = buildSectionItems(STEP2_ROOM_FIELDS, data);
  const services = buildSectionItems(STEP2_SERVICE_FIELDS, data);

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ContractStepEditor title="تفاصيل الوحدات" step="step2" fields={STEP2_UNIT_FIELDS}>
          <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {unitGeneralDetails.map((item) => (
                <DetailCard key={item.label} {...item} />
              ))}
            </div>
          </div>
        </ContractStepEditor>

        <ContractStepEditor title="تفاصيل الغرف" step="step2" fields={STEP2_ROOM_FIELDS}>
          <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {roomDetails.map((item) => (
                <DetailCard key={item.label} {...item} />
              ))}
            </div>
          </div>
        </ContractStepEditor>
      </div>

      <ContractStepEditor title="الخدمات والعدادات" step="step2" fields={STEP2_SERVICE_FIELDS}>
        <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {services.map((item) => (
              <DetailCard key={item.label} {...item} />
            ))}
          </div>
        </div>
      </ContractStepEditor>
    </div>
  );
};

export default UnitDetailes;
