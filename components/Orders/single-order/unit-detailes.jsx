"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Inbox, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  ADMIN_UNIT_CORE_FIELDS,
  ADMIN_UNIT_ROOM_FIELDS,
  ADMIN_UNIT_SERVICE_FIELDS,
} from "./contract-edit/contract-field-schemas";
import { normalizeFieldValue } from "@/src/lib/contract-update";
import { useSingleOrderContext } from "./single-order-context";

const GOLD = "#B8860B";

const UNIT_FIELD_GROUPS = [
  { title: "بيانات الوحدة", fields: ADMIN_UNIT_CORE_FIELDS },
  { title: "تفاصيل الغرف", fields: ADMIN_UNIT_ROOM_FIELDS },
  { title: "الخدمات", fields: ADMIN_UNIT_SERVICE_FIELDS },
];

const ALL_UNIT_FIELDS = [
  ...ADMIN_UNIT_CORE_FIELDS,
  ...ADMIN_UNIT_ROOM_FIELDS,
  ...ADMIN_UNIT_SERVICE_FIELDS,
];

/**
 * The unit endpoint replaces the whole record, so a section save has to resend
 * every field it isn't editing — otherwise rooms/services get wiped.
 */
function getUnitFullPayload(unit) {
  const payload = {};
  for (const field of ALL_UNIT_FIELDS) {
    const value = normalizeFieldValue(unit?.[field.key], field.key);
    if (value === "" || value === null || value === undefined) continue;
    payload[field.key] = value;
  }
  return payload;
}

function getUnitInitialValues(unit, fields) {
  const entries = fields.flatMap((field) => {
    const pairs = [
      [field.key, normalizeFieldValue(unit?.[field.key], field.key)],
    ];
    if (field.displayKey && unit?.[field.displayKey] != null) {
      pairs.push([field.displayKey, unit[field.displayKey]]);
    }
    return pairs;
  });
  return Object.fromEntries(entries);
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
    unit?.updated_at,
  ];
}

function isSelectedUnit(unit, data) {
  const selectedId = data?.real_units_id ?? data?.contract_summary?.real_units_id;
  if (selectedId == null || unit?.id == null) return false;
  return Number(unit.id) === Number(selectedId);
}

function SingleUnitBlock({ unit, data, index, formRef }) {
  const { updateUnit, deleteUnit, isSavingUnit, isDeletingUnit } =
    useSingleOrderContext();
  const selected = isSelectedUnit(unit, data);

  const unitLabel =
    unit?.unit_number != null && unit.unit_number !== ""
      ? `الوحدة رقم ${unit.unit_number}`
      : `وحدة #${unit?.id ?? index + 1}`;

  const initialValues = useMemo(
    () => ({
      ...getUnitInitialValues(unit, ADMIN_UNIT_CORE_FIELDS),
      ...getUnitInitialValues(unit, ADMIN_UNIT_ROOM_FIELDS),
      ...getUnitInitialValues(unit, ADMIN_UNIT_SERVICE_FIELDS),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    unitFormDeps(unit)
  );

  const handleSaveSection = useCallback(
    async (payload) => {
      if (unit?.id == null) {
        toast.error("معرف الوحدة غير موجود");
        return;
      }
      await updateUnit(unit.id, { ...getUnitFullPayload(unit), ...payload });
    },
    [unit, updateUnit]
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

      <ContractStepEditor
        ref={formRef}
        step="step2"
        fieldGroups={UNIT_FIELD_GROUPS}
        initialValues={initialValues}
        seedFromInitialValuesOnly
        onSave={handleSaveSection}
        isSaving={isSavingUnit}
        startInEditing
        formOnly
        hideFooter
      />
    </section>
  );
}

function UnitsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-16 text-[#A3A3A3]">
      <Inbox size={36} className="text-gray-300" />
      <p className="text-sm font-bold text-gray-500">لا توجد وحدات مرتبطة بهذا العقد</p>
      <p className="text-xs">عدد الوحدات = 0</p>
    </div>
  );
}

const UnitDetailes = ({ data }) => {
  const units = Array.isArray(data?.units) ? data.units : [];
  const unitsCount = data?.units_count ?? units.length;
  const isEmpty = unitsCount === 0 || units.length === 0;
  const unitRefs = useRef(new Map());
  const [isSavingAll, setIsSavingAll] = useState(false);

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      await Promise.all(
        Array.from(unitRefs.current.values())
          .filter(Boolean)
          .map((formHandle) => formHandle.save())
      );
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
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
        <>
          <div className="space-y-6">
            {units.map((unit, index) => (
              <SingleUnitBlock
                key={unit?.id ?? `unit-${index}`}
                unit={unit}
                data={data}
                index={index}
                formRef={(handle) => {
                  const key = unit?.id ?? `unit-${index}`;
                  if (handle) unitRefs.current.set(key, handle);
                  else unitRefs.current.delete(key);
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSavingAll}
            className="flex w-full items-center justify-center gap-2 h-[52px] rounded-full text-white text-[15px] font-bold disabled:opacity-60 transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            {isSavingAll ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save size={18} />
            )}
            حفظ التعديلات
          </button>
        </>
      )}
    </div>
  );
};

export default UnitDetailes;
