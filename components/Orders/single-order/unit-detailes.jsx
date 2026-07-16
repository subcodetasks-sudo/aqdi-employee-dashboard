"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP2_UNIT_FIELDS,
  STEP2_ROOM_FIELDS,
  STEP2_SERVICE_FIELDS,
} from "./contract-edit/contract-field-schemas";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
  SECTION_ERROR_BUTTON_CLASS,
} from "./contract-summary-view";
import { asYesNo, pickFirst } from "./frontend-contract-fields";

const OrderSectionErrorMenu = dynamic(
  () => import("@/components/Orders/messages/order-section-error-menu"),
  { ssr: false }
);

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
  if (isEmptyDisplayValue(value)) return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
};

const DetailCard = ({
  label,
  value,
  copyable = false,
  borderColor = "border-gray-200",
}) => {
  const empty = isEmptyDisplayValue(value);
  return (
    <div
      className={`rounded-[16px] border-r-4 bg-white p-4 shadow-sm ${borderColor} ${
        empty ? "opacity-45" : ""
      }`}
    >
      <span className="mb-1 block text-right text-xs font-medium text-gray-400">
        {label}
      </span>
      <p
        className={`flex items-center justify-end gap-2 text-sm font-bold lg:text-base ${
          empty ? "text-[#A3A3A3]" : "text-gray-800"
        }`}
      >
        {copyable && !empty ? (
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

function readUnitValue(data, key) {
  const step2 = data?.step2 ?? {};
  const unit = step2.unit ?? data?.unit ?? {};
  return pickFirst(step2[key], unit[key], data?.[key]);
}

function ownershipLabel(value) {
  if (value === "owner") return "المالك";
  if (value === "tenant") return "المستأجر";
  return value;
}

function resolveFieldDisplayValue(field, data) {
  const rawValue = readUnitValue(data, field.key);

  if (field.type === "boolean") {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return null;
    }
    return asYesNo(rawValue);
  }

  if (field.key === "unit_type_id") {
    return pickFirst(
      data?.step2?.unit_type_name,
      data?.step2?.unit_type?.name_ar,
      data?.step2?.unit_type?.name_trans,
      data?.unit_type?.name_trans,
      data?.unit_type?.name_ar,
      data?.unit_type?.name,
      rawValue
    );
  }

  if (field.key === "unit_usage_id") {
    return pickFirst(
      data?.step2?.unit_usage_name,
      data?.step2?.unit_usage?.name_ar,
      data?.unit_usage?.name_ar,
      data?.unit_usage?.name_en,
      rawValue
    );
  }

  if (
    field.key === "electricity_meter_ownership" ||
    field.key === "water_meter_ownership"
  ) {
    return ownershipLabel(rawValue);
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

  const servicesPayload = pickFirst(data?.step2?.Services, data?.Services);
  const servicesDisplay =
    Array.isArray(servicesPayload) && servicesPayload.length === 0
      ? "—"
      : Array.isArray(servicesPayload)
        ? servicesPayload.join("، ")
        : servicesPayload === 0 || servicesPayload === "0"
          ? "—"
          : servicesPayload;

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ContractStepEditor
              title="تفاصيل الوحدات"
              step="step2"
              fields={STEP2_UNIT_FIELDS}
            >
              <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {unitGeneralDetails.map((item) => (
                    <DetailCard key={item.label} {...item} />
                  ))}
                </div>
              </div>
            </ContractStepEditor>

            <ContractStepEditor
              title="تفاصيل الغرف"
              step="step2"
              fields={STEP2_ROOM_FIELDS}
            >
              <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {roomDetails.map((item) => (
                    <DetailCard key={item.label} {...item} />
                  ))}
                </div>
              </div>
            </ContractStepEditor>
          </div>

          <ContractStepEditor
            title="الخدمات والعدادات"
            step="step2"
            fields={STEP2_SERVICE_FIELDS}
          >
            <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {services.map((item) => (
                  <DetailCard key={item.label} {...item} />
                ))}
              </div>
            </div>
          </ContractStepEditor>
        </div>

        <OrderSectionErrorMenu
          label="إرسال خطأ للعميل"
          orderData={data}
          context="unitDetails"
          buttonClassName={SECTION_ERROR_BUTTON_CLASS}
        />
      </div>
    </div>
  );
};

export default UnitDetailes;
