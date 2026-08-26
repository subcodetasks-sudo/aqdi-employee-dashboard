"use client";

import ContractDatePicker, { resolveCalendarType } from "../contract-date-picker";
import { fieldLabelClass, fieldLabelRowClass, inputClass } from "./field-styles";
import NativeSelect from "./NativeSelect";
import FileFieldPreview from "./FileFieldPreview";
import TenantRolesMultiField from "./TenantRolesMultiField";
import OtherConditionsListField from "./OtherConditionsListField";
import { useResolvedSelectOptions } from "./use-resolved-select-options";

function resolveSelectCurrentLabelFallback(field, orderData, formValues) {
  const labels = orderData?.contract_summary?.relation_labels ?? {};
  if (field.key === "property_place_id") {
    return (
      labels.property_region ||
      orderData?.property_region?.name_ar ||
      orderData?.step1?.property_place_name ||
      null
    );
  }
  if (field.key === "property_city_id") {
    return (
      labels.property_city ||
      orderData?.property_city?.name_ar ||
      orderData?.step1?.city_name ||
      orderData?.step1?.property_city_name ||
      null
    );
  }
  if (field.key === "unit_type_id") {
    return formValues?.unit_type_name || orderData?.step2?.unit_type_name || orderData?.unit_type_name || null;
  }
  if (field.key === "unit_usage_id") {
    return formValues?.unit_usage_name || orderData?.step2?.unit_usage_name || orderData?.unit_usage_name || null;
  }
  if (field.displayKey && formValues?.[field.displayKey]) {
    return formValues[field.displayKey];
  }
  return null;
}

export default function ContractFormField({
  field,
  value,
  formValues,
  onChange,
  onPatch,
  error,
  fieldErrors,
  orderData,
}) {
  const id = field.key;
  const { options: selectOptions, isLoading: optionsLoading } = useResolvedSelectOptions(
    field,
    orderData,
    formValues
  );

  if (field.type === "hidden") {
    return null;
  }

  if (field.locked) {
    return (
      <div className={`flex flex-col gap-2 ${field.colSpan === 2 ? "md:col-span-2" : ""}`}>
        <div className={fieldLabelRowClass}>
          <label className={`${fieldLabelClass} min-w-0 flex-1`}>{field.label}</label>
          <span className="shrink-0 rounded-full bg-[#F0F0F0] dark:bg-white/10 px-2.5 py-1 text-11 font-bold text-[#8A8A8A] dark:text-white/50">
            مقفل
          </span>
        </div>
        <div className="flex h-12 w-full items-center rounded-14 border border-surface-border dark:border-white/10 bg-surface-input dark:bg-white/[0.04] px-4 text-sm text-ink-subtle dark:text-white/70">
          {field.displayValue ?? value ?? "—"}
        </div>
      </div>
    );
  }

  if (field.type === "tenant-roles") {
    return <TenantRolesMultiField formValues={formValues} onPatch={onPatch} fieldErrors={fieldErrors} />;
  }

  if (field.type === "other-conditions") {
    return <OtherConditionsListField formValues={formValues} onPatch={onPatch} fieldErrors={fieldErrors} />;
  }

  if (field.type === "textarea") {
    return (
      <div
        className={`flex flex-col gap-2 ${field.colSpan === 2 ? "md:col-span-2" : ""} ${field.colSpan === 3 ? "md:col-span-3" : ""}`}
      >
        <label htmlFor={id} className={fieldLabelClass}>
          {field.label}
          {field.required ? <span className="text-[#E24444]"> *</span> : null}
        </label>
        <textarea
          id={id}
          rows={3}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white dark:bg-white/[0.04] border border-surface-border dark:border-white/10 rounded-14 p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-hover resize-none"
          placeholder={field.hint || ""}
        />
        {error ? <p className="text-xs text-[#E24444]">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className={fieldLabelClass}>
          {field.label}
          {field.required ? <span className="text-[#E24444]"> *</span> : null}
        </label>
        <NativeSelect
          id={id}
          value={value === 1 || value === "1" ? "1" : "0"}
          onChange={(e) => onChange(e.target.value === "1" ? 1 : 0)}
        >
          <option value="1">نعم</option>
          <option value="0">لا</option>
        </NativeSelect>
        {error ? <p className="text-xs text-[#E24444]">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "select") {
    const selectValue = value === null || value === undefined || value === "" ? "" : String(value);
    const currentLabelFallback = resolveSelectCurrentLabelFallback(field, orderData, formValues);

    const optionsWithCurrent =
      selectValue && !selectOptions.some((opt) => String(opt.value) === selectValue)
        ? [
            ...selectOptions,
            {
              value: selectValue,
              label: currentLabelFallback ? String(currentLabelFallback) : `الخيار الحالي (${selectValue})`,
            },
          ]
        : selectOptions;

    const isApprovedListField = Array.isArray(field.options) && field.options.length > 0 && !field.optionsSource;

    return (
      <div className="flex flex-col gap-2">
        <div className={fieldLabelRowClass}>
          <label htmlFor={id} className={`${fieldLabelClass} min-w-0 flex-1`}>
            {field.label}
            {field.required ? <span className="text-[#E24444]"> *</span> : null}
          </label>
          {isApprovedListField ? (
            <span className="shrink-0 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-11 font-bold text-[#92400E]">
              قائمة معتمدة
            </span>
          ) : null}
        </div>
        <NativeSelect
          id={id}
          value={selectValue}
          disabled={optionsLoading}
          onChange={(e) => {
            const next = e.target.value;
            if (next === "") {
              onChange("");
              return;
            }
            onChange(/^\d+$/.test(next) ? Number(next) : next);
          }}
        >
          <option value="">
            {optionsLoading
              ? "جاري التحميل..."
              : field.key === "property_city_id" && !formValues?.property_place_id && selectOptions.length === 0
                ? "اختر المنطقة أولاً"
                : "— اختر —"}
          </option>
          {optionsWithCurrent.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelect>
        {error ? <p className="text-xs text-[#E24444]">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "date") {
    const calendarType = resolveCalendarType(formValues?.[field.calendarTypeKey], value);
    const typeLabel = calendarType === "hijri" ? "هجري" : "ميلادي";

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className={fieldLabelClass}>
          {field.label}
          {field.required ? <span className="text-[#E24444]"> *</span> : null}
          <span className="mr-2 text-11 font-medium text-ink-placeholder">({typeLabel})</span>
        </label>
        <ContractDatePicker id={id} value={value} calendarType={calendarType} onChange={onChange} />
        {error ? <p className="text-xs text-[#E24444]">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div
        className={`flex flex-col gap-2 ${field.colSpan === 2 ? "md:col-span-2" : ""} ${field.colSpan === 3 ? "md:col-span-3" : ""}`}
      >
        <label htmlFor={id} className={fieldLabelClass}>
          {field.label}
          {field.required ? <span className="text-[#E24444]"> *</span> : null}
        </label>
        <input
          id={id}
          type="file"
          accept={field.accept || "image/*,application/pdf"}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onChange(file);
          }}
          className="w-full rounded-14 border border-surface-border dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-3 text-13 text-gray-900 dark:text-white file:me-3 file:rounded-lg file:border-0 file:bg-brand-hover/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-brand-hover"
        />
        <FileFieldPreview value={value} />
        {field.hint ? <p className="text-11 text-[#9E9E9E]">{field.hint}</p> : null}
        {error ? <p className="text-xs text-[#E24444]">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${field.colSpan === 2 ? "md:col-span-2" : ""}`}>
      <label htmlFor={id} className={fieldLabelClass}>
        {field.label}
      </label>
      <input
        id={id}
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={field.hint || ""}
        dir={field.key.includes("mobile") || field.key.includes("id_num") ? "ltr" : "rtl"}
      />
      {error ? <p className="text-xs text-[#E24444]">{error}</p> : null}
    </div>
  );
}
