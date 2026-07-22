"use client";

import { useCallback, useMemo } from "react";
import { Copy, Inbox, Trash2 } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  ADMIN_UNIT_CORE_FIELDS,
  ADMIN_UNIT_ROOM_FIELDS,
  ADMIN_UNIT_SERVICE_FIELDS,
} from "./contract-edit/contract-field-schemas";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
  SECTION_ERROR_BUTTON_CLASS,
} from "./contract-summary-view";
import { asYesNo } from "./frontend-contract-fields";
import { normalizeFieldValue } from "@/src/lib/contract-update";
import { useSingleOrderContext } from "./single-order-context";

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

/** Source of truth: unit object only — never contract root / step2. */
function resolveUnitFieldValue(field, unit) {
  const displayKey = field.displayKey;
  const rawValue =
    displayKey && unit?.[displayKey] != null && unit[displayKey] !== ""
      ? unit[displayKey]
      : unit?.[field.key];

  if (field.type === "boolean") {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return null;
    }
    return asYesNo(rawValue);
  }

  if (
    field.key === "electricity_meter_ownership" ||
    field.key === "water_meter_ownership"
  ) {
    return ownershipLabel(rawValue);
  }

  return rawValue;
}

function buildSectionItems(fields, unit) {
  return fields.map((field, index) => ({
    label: field.label,
    value: resolveUnitFieldValue(field, unit),
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

function unitFormDeps(unit) {
  return [
    unit?.id,
    unit?.unit_number,
    unit?.floor_number,
    unit?.unit_area,
    unit?.unit_type_id,
    unit?.unit_usage_id,
    unit?.tootal_rooms,
    unit?.The_number_of_halls,
    unit?.The_number_of_kitchens,
    unit?.The_number_of_toilets,
    unit?.window_ac,
    unit?.split_ac,
    unit?.kitchen_tank,
    unit?.furnished,
    unit?.type_furnished,
    unit?.electricity_meter,
    unit?.electricity_meter_number,
    unit?.electricity_meter_ownership,
    unit?.water_meter,
    unit?.water_meter_number,
    unit?.water_meter_ownership,
    unit?.Number_parking_spaces,
    unit?.updated_at,
  ];
}

function isSelectedUnit(unit, data) {
  const selectedId = data?.real_units_id ?? data?.contract_summary?.real_units_id;
  if (selectedId == null || unit?.id == null) return false;
  return Number(unit.id) === Number(selectedId);
}

function SingleUnitBlock({ unit, data, index }) {
  const { updateUnit, deleteUnit, isSavingUnit, isDeletingUnit } =
    useSingleOrderContext();
  const selected = isSelectedUnit(unit, data);

  const unitLabel =
    unit?.unit_number != null && unit.unit_number !== ""
      ? `الوحدة رقم ${unit.unit_number}`
      : `وحدة #${unit?.id ?? index + 1}`;

  const coreItems = buildSectionItems(ADMIN_UNIT_CORE_FIELDS, unit);
  const roomItems = buildSectionItems(ADMIN_UNIT_ROOM_FIELDS, unit);
  const serviceItems = buildSectionItems(ADMIN_UNIT_SERVICE_FIELDS, unit);

  const coreInitial = useMemo(
    () => getUnitInitialValues(unit, ADMIN_UNIT_CORE_FIELDS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    unitFormDeps(unit)
  );
  const roomInitial = useMemo(
    () => getUnitInitialValues(unit, ADMIN_UNIT_ROOM_FIELDS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    unitFormDeps(unit)
  );
  const serviceInitial = useMemo(
    () => getUnitInitialValues(unit, ADMIN_UNIT_SERVICE_FIELDS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    unitFormDeps(unit)
  );

  const handleSaveSection = useCallback(
    async (payload) => {
      if (unit?.id == null) {
        toast.error("معرف الوحدة غير موجود");
        return;
      }
      await updateUnit(unit.id, payload);
    },
    [unit?.id, updateUnit]
  );

  const handleDetach = async () => {
    if (unit?.id == null) return;
    const ok = window.confirm(
      `فصل الوحدة ${unitLabel} عن هذا العقد؟ لن تُحذف الوحدة من العقار.`
    );
    if (!ok) return;
    try {
      await deleteUnit(unit.id);
    } catch {
      /* toast handled in mutation */
    }
  };

  return (
    <section
      className={`rounded-[28px] border p-5 lg:p-6 ${
        selected
          ? "border-brand-hover/40 bg-brand-hover/5"
          : "border-gray-100 bg-gray-50/80"
      }`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
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
        {unit?.id != null ? (
          <button
            type="button"
            onClick={handleDetach}
            disabled={isDeletingUnit}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 size={14} />
            فصل عن العقد
          </button>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ContractStepEditor
            title="بيانات الوحدة"
            step="step2"
            fields={ADMIN_UNIT_CORE_FIELDS}
            initialValues={coreInitial}
            seedFromInitialValuesOnly
            onSave={handleSaveSection}
            isSaving={isSavingUnit}
          >
            <div className="rounded-[20px] border border-gray-100 bg-white p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {coreItems.map((item) => (
                  <DetailCard key={item.label} {...item} />
                ))}
              </div>
            </div>
          </ContractStepEditor>

          <ContractStepEditor
            title="تفاصيل الغرف"
            step="step2"
            fields={ADMIN_UNIT_ROOM_FIELDS}
            initialValues={roomInitial}
            seedFromInitialValuesOnly
            onSave={handleSaveSection}
            isSaving={isSavingUnit}
          >
            <div className="rounded-[20px] border border-gray-100 bg-white p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {roomItems.map((item) => (
                  <DetailCard key={item.label} {...item} />
                ))}
              </div>
            </div>
          </ContractStepEditor>
        </div>

        <ContractStepEditor
          title="الخدمات"
          step="step2"
          fields={ADMIN_UNIT_SERVICE_FIELDS}
          initialValues={serviceInitial}
          seedFromInitialValuesOnly
          onSave={handleSaveSection}
          isSaving={isSavingUnit}
        >
          <div className="rounded-[20px] border border-gray-100 bg-white p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {serviceItems.map((item) => (
                <DetailCard key={item.label} {...item} />
              ))}
            </div>
          </div>
        </ContractStepEditor>
      </div>
    </section>
  );
}

function UnitsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-16 text-[#A3A3A3]">
      <Inbox size={36} className="text-gray-300" />
      <p className="text-sm font-bold text-gray-500">لا توجد وحدات مرتبطة بهذا العقد</p>
      <p className="text-xs">units_count = 0</p>
    </div>
  );
}

const UnitDetailes = ({ data }) => {
  const units = Array.isArray(data?.units) ? data.units : [];
  const unitsCount = data?.units_count ?? units.length;
  const isEmpty = unitsCount === 0 || units.length === 0;

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-wrap items-center gap-2 px-1">
            <p className="text-sm font-bold text-gray-800">
              وحدات العقد
              <span className="mr-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">
                {unitsCount}
              </span>
            </p>
          </div>

          {isEmpty ? (
            <UnitsEmptyState />
          ) : (
            units.map((unit, index) => (
              <SingleUnitBlock
                key={unit?.id ?? `unit-${index}`}
                unit={unit}
                data={data}
                index={index}
              />
            ))
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
