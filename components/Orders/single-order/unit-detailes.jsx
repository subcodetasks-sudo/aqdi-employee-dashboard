"use client";

import { useMemo } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP2_UNIT_FIELDS,
  STEP2_ROOM_FIELDS,
  STEP2_SERVICE_FIELDS,
  STEP2_PER_UNIT_FIELDS,
} from "./contract-edit/contract-field-schemas";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
  SECTION_ERROR_BUTTON_CLASS,
} from "./contract-summary-view";
import { asYesNo, pickFirst } from "./frontend-contract-fields";
import { normalizeFieldValue } from "@/src/lib/contract-update";

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

function ownershipLabel(value) {
  if (value === "owner") return "المالك";
  if (value === "tenant") return "المستأجر";
  return value;
}

function resolveOrderUnits(data) {
  if (Array.isArray(data?.units) && data.units.length > 0) {
    return data.units;
  }
  const single = data?.step2?.unit ?? data?.unit;
  if (single && typeof single === "object" && (single.id || single.unit_number)) {
    return [single];
  }
  return [];
}

function isSelectedUnit(unit, data) {
  const selectedId = data?.real_units_id ?? data?.contract_summary?.real_units_id;
  if (selectedId == null || unit?.id == null) return false;
  return Number(unit.id) === Number(selectedId);
}

function readUnitField(unit, data, key) {
  const step2 = data?.step2 ?? {};
  const selected = isSelectedUnit(unit, data);
  if (selected) {
    return pickFirst(unit?.[key], step2[key], step2.unit?.[key], data?.[key]);
  }
  return pickFirst(unit?.[key], null);
}

function resolveFieldDisplayValue(field, unit, data) {
  const rawValue = readUnitField(unit, data, field.key);

  if (field.type === "boolean") {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return null;
    }
    return asYesNo(rawValue);
  }

  if (field.key === "unit_type_id") {
    return pickFirst(
      unit?.unit_type_name,
      unit?.unit_type?.name_ar,
      unit?.unit_type?.name_trans,
      isSelectedUnit(unit, data)
        ? pickFirst(
            data?.step2?.unit_type_name,
            data?.step2?.unit_type?.name_ar,
            data?.unit_type?.name_trans,
            data?.unit_type?.name_ar,
            data?.unit_type?.name
          )
        : null,
      rawValue
    );
  }

  if (field.key === "unit_usage_id") {
    return pickFirst(
      unit?.unit_usage_name,
      unit?.unit_usage?.name_ar,
      isSelectedUnit(unit, data)
        ? pickFirst(
            data?.step2?.unit_usage_name,
            data?.step2?.unit_usage?.name_ar,
            data?.unit_usage?.name_ar,
            data?.unit_usage?.name_en
          )
        : null,
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

function buildSectionItems(fields, unit, data) {
  return fields.map((field, index) => ({
    label: field.label,
    value: resolveFieldDisplayValue(field, unit, data),
    borderColor: BORDER_COLORS[index % BORDER_COLORS.length],
    copyable:
      field.type !== "boolean" &&
      (field.key.includes("meter") ||
        field.key.includes("number") ||
        field.key.includes("unit_number") ||
        field.key.includes("id")),
  }));
}

function getUnitInitialValues(unit, fields) {
  return Object.fromEntries(
    fields.map((field) => [
      field.key,
      normalizeFieldValue(unit?.[field.key], field.key),
    ])
  );
}

function resolveFieldDisplayValueFromData(field, data) {
  const step2 = data?.step2 ?? {};
  const unit = step2.unit ?? data?.unit ?? {};
  const rawValue = pickFirst(step2[field.key], unit[field.key], data?.[field.key]);

  if (field.type === "boolean") {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return null;
    }
    return asYesNo(rawValue);
  }

  if (field.key === "unit_type_id") {
    return pickFirst(
      step2.unit_type_name,
      step2.unit_type?.name_ar,
      data?.unit_type?.name_trans,
      data?.unit_type?.name_ar,
      data?.unit_type?.name,
      rawValue
    );
  }

  if (field.key === "unit_usage_id") {
    return pickFirst(
      step2.unit_usage_name,
      step2.unit_usage?.name_ar,
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

function buildContractSectionItems(fields, data) {
  return fields.map((field, index) => ({
    label: field.label,
    value: resolveFieldDisplayValueFromData(field, data),
    borderColor: BORDER_COLORS[index % BORDER_COLORS.length],
    copyable:
      field.type !== "boolean" &&
      (field.key.includes("meter") ||
        field.key.includes("number") ||
        field.key.includes("unit_number") ||
        field.key.includes("id")),
  }));
}

function ContractUnitFallback({ data }) {
  const unitGeneralDetails = buildContractSectionItems(STEP2_UNIT_FIELDS, data);
  const roomDetails = buildContractSectionItems(STEP2_ROOM_FIELDS, data);
  const services = buildContractSectionItems(STEP2_SERVICE_FIELDS, data);

  return (
    <div className="space-y-6">
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
  );
}

function SingleUnitBlock({ unit, data, index }) {
  const selected = isSelectedUnit(unit, data);
  const unitLabel =
    unit?.unit_number != null && unit.unit_number !== ""
      ? `الوحدة رقم ${unit.unit_number}`
      : `وحدة #${unit?.id ?? index + 1}`;

  const editFields = useMemo(() => {
    if (!selected) return STEP2_PER_UNIT_FIELDS;
    const usageField = STEP2_UNIT_FIELDS.find((f) => f.key === "unit_usage_id");
    return usageField
      ? [...STEP2_PER_UNIT_FIELDS, usageField]
      : STEP2_PER_UNIT_FIELDS;
  }, [selected]);

  const perUnitItems = buildSectionItems(editFields, unit, data);
  const roomDetails = selected
    ? buildSectionItems(STEP2_ROOM_FIELDS, unit, data)
    : [];
  const serviceExtras = selected
    ? buildSectionItems(
        STEP2_SERVICE_FIELDS.filter(
          (f) =>
            ![
              "electricity_meter_number",
              "water_meter_number",
              "electricity_meter_ownership",
              "water_meter_ownership",
            ].includes(f.key)
        ),
        unit,
        data
      )
    : [];

  const unitInitialValues = useMemo(() => {
    const fromUnit = getUnitInitialValues(unit, STEP2_PER_UNIT_FIELDS);
    if (!selected) return fromUnit;
    return {
      ...fromUnit,
      unit_usage_id: normalizeFieldValue(
        pickFirst(
          unit?.unit_usage_id,
          data?.step2?.unit_usage_id,
          data?.unit_usage_id
        ),
        "unit_usage_id"
      ),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selected,
    unit?.id,
    unit?.unit_number,
    unit?.floor_number,
    unit?.unit_area,
    unit?.unit_type_id,
    unit?.electricity_meter_number,
    unit?.water_meter_number,
    unit?.electricity_meter_ownership,
    unit?.water_meter_ownership,
    unit?.unit_usage_id,
    data?.step2?.unit_usage_id,
    data?.unit_usage_id,
  ]);

  const payloadExtras = useMemo(
    () => (unit?.id != null ? { real_units_id: unit.id } : null),
    [unit?.id]
  );

  return (
    <section
      className={`rounded-[28px] border p-5 lg:p-6 ${
        selected
          ? "border-brand-hover/40 bg-brand-hover/5"
          : "border-gray-100 bg-gray-50/80"
      }`}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h3 className="text-base font-bold text-gray-900">{unitLabel}</h3>
        {selected ? (
          <span className="rounded-full bg-brand-hover px-3 py-1 text-[11px] font-bold text-white">
            الوحدة المختارة في العقد
          </span>
        ) : null}
        {unit?.id != null ? (
          <span className="text-xs font-medium text-[#A3A3A3]" dir="ltr">
            ID: {unit.id}
          </span>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ContractStepEditor
            title="بيانات الوحدة"
            step="step2"
            fields={editFields}
            initialValues={unitInitialValues}
            payloadExtras={payloadExtras}
          >
            <div className="rounded-[20px] border border-gray-100 bg-white p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {perUnitItems.map((item) => (
                  <DetailCard key={item.label} {...item} />
                ))}
              </div>
            </div>
          </ContractStepEditor>

          {selected ? (
            <ContractStepEditor
              title="تفاصيل الغرف"
              step="step2"
              fields={STEP2_ROOM_FIELDS}
              payloadExtras={payloadExtras}
            >
              <div className="rounded-[20px] border border-gray-100 bg-white p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {roomDetails.map((item) => (
                    <DetailCard key={item.label} {...item} />
                  ))}
                </div>
              </div>
            </ContractStepEditor>
          ) : null}
        </div>

        {selected ? (
          <ContractStepEditor
            title="الخدمات"
            step="step2"
            fields={STEP2_SERVICE_FIELDS.filter(
              (f) =>
                ![
                  "electricity_meter_number",
                  "water_meter_number",
                  "electricity_meter_ownership",
                  "water_meter_ownership",
                ].includes(f.key)
            )}
            payloadExtras={payloadExtras}
          >
            <div className="rounded-[20px] border border-gray-100 bg-white p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {serviceExtras.map((item) => (
                  <DetailCard key={item.label} {...item} />
                ))}
              </div>
            </div>
          </ContractStepEditor>
        ) : null}
      </div>
    </section>
  );
}

const UnitDetailes = ({ data }) => {
  const units = resolveOrderUnits(data);
  const hasMultipleUnits = Array.isArray(data?.units) && data.units.length > 0;

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-6">
          {hasMultipleUnits ? (
            <>
              <div className="flex flex-wrap items-center gap-2 px-1">
                <p className="text-sm font-bold text-gray-800">
                  وحدات العقار ({data?.units_count ?? units.length})
                </p>
                {data?.is_real == 1 || data?.is_real === true ? (
                  <span className="text-xs text-[#A3A3A3]">من عقار موجود</span>
                ) : null}
              </div>
              {units.map((unit, index) => (
                <SingleUnitBlock
                  key={unit?.id ?? `unit-${index}`}
                  unit={unit}
                  data={data}
                  index={index}
                />
              ))}
            </>
          ) : (
            <ContractUnitFallback data={data} />
          )}
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
