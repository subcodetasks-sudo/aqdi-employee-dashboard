"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, FileText, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  buildContractUpdatePayload,
  getStepFormValues,
  normalizeOtherConditionsList,
  parseTenantRoleIds,
  validateOtherConditionsList,
  validateTenantRoleSelection,
} from "@/src/lib/contract-update";
import { useSingleOrderContext } from "../single-order-context";
import ContractDatePicker, {
  resolveCalendarType,
} from "./contract-date-picker";
import DateObject from "react-date-object";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import arabic_ar from "react-date-object/locales/arabic_ar";
import gregorian_ar from "react-date-object/locales/gregorian_ar";
import { getTenantRoleLabel, useTenantRoles } from "@/src/hooks/use-tenant-roles";
import { usePaymentTypes } from "@/src/hooks/use-payment-types";
import { useContractPeriodsForType } from "@/src/hooks/use-contract-periods";
import { useRegions } from "@/src/hooks/use-regions";
import { useCities } from "@/src/hooks/use-cities";
import { useUnitTypes } from "@/src/hooks/use-unit-types";
import { useUnitUsages } from "@/src/hooks/use-unit-usages";

const DATE_FORMAT = "DD-MM-YYYY";

function convertDateBetweenCalendars(dateString, fromType, toType) {
  if (!dateString || fromType === toType) return dateString;
  try {
    const fromCalendar = fromType === "hijri" ? arabic : gregorian;
    const fromLocale = fromType === "hijri" ? arabic_ar : gregorian_ar;
    const toCalendar = toType === "hijri" ? arabic : gregorian;
    const toLocale = toType === "hijri" ? arabic_ar : gregorian_ar;
    const parsed = new DateObject({
      date: String(dateString).trim(),
      format: DATE_FORMAT,
      calendar: fromCalendar,
      locale: fromLocale,
    });
    if (!parsed.isValid) return dateString;
    return parsed.convert(toCalendar, toLocale).format(DATE_FORMAT);
  } catch {
    return dateString;
  }
}

const CALENDAR_TYPE_TO_DATE_KEYS = {
  type_dob_property_owner: ["property_owner_dob"],
  type_dob_property_owner_agent: ["dob_of_property_owner_agent"],
  type_tenant_dob: ["tenant_dob"],
  type_dob_tenant_agent: ["dob_of_property_tenant_agent"],
  type_contract_starting_date: ["contract_starting_date"],
};

const inputClass =
  "w-full h-[48px] bg-white border border-[#EEEEEE] rounded-[14px] px-4 text-[14px] focus:outline-none focus:border-brand-hover transition-all";

function isFieldVisible(field, formValues) {
  if (!field) return false;

  const entity = formValues?.tenant_entity;
  if (field.entity === "institution" && entity !== "institution") return false;
  if (field.entity === "person" && entity === "institution") return false;

  if (field.showWhen && typeof field.showWhen === "object") {
    return Object.entries(field.showWhen).every(([key, expected]) => {
      const actual = formValues?.[key];
      if (Array.isArray(expected)) return expected.includes(actual);
      return actual === expected;
    });
  }

  return true;
}

function resolveFileDisplayUrl(value) {
  if (!value) return null;
  if (typeof File !== "undefined" && value instanceof File) {
    return value.name;
  }
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "object") {
    return value.url || value.path || value.full_url || value.src || null;
  }
  return null;
}

function FileFieldPreview({ value }) {
  const isFile = typeof File !== "undefined" && value instanceof File;
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!isFile || !value.type?.startsWith("image/")) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [isFile, value]);

  if (isFile) {
    return (
      <div className="flex items-center gap-3">
        {objectUrl ? (
          <img
            src={objectUrl}
            alt=""
            className="size-14 rounded-xl border border-[#EEEEEE] object-cover"
          />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-xl border border-[#EEEEEE] bg-[#FAFAFA]">
            <FileText className="size-5 text-[#E24444]" />
          </span>
        )}
        <p className="min-w-0 flex-1 truncate text-[12px] font-bold text-[#4D4D4D]">
          {value.name}
        </p>
      </div>
    );
  }

  const currentUrl = resolveFileDisplayUrl(value);
  if (!currentUrl) return null;

  const isImage = !currentUrl.split("?")[0].toLowerCase().endsWith(".pdf");

  return (
    <div className="flex items-center gap-3">
      {isImage ? (
        <img
          src={currentUrl}
          alt=""
          className="size-14 rounded-xl border border-[#EEEEEE] object-cover"
        />
      ) : (
        <span className="flex size-14 items-center justify-center rounded-xl border border-[#EEEEEE] bg-[#FAFAFA]">
          <FileText className="size-5 text-[#E24444]" />
        </span>
      )}
      <a
        href={currentUrl}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="min-w-0 flex-1 truncate text-[12px] text-[#737373] hover:text-brand-hover"
      >
        {currentUrl}
      </a>
    </div>
  );
}

function resolveOrderContractType(orderData) {
  return (
    orderData?.contract_type ||
    orderData?.contract_summary?.contract_type ||
    orderData?.step4?.contract_type ||
    null
  );
}

function useResolvedSelectOptions(field, orderData, formValues) {
  const contractType = resolveOrderContractType(orderData);

  const needsTenantRoles =
    field?.optionsSource === "tenant-roles" || field?.key === "tenant_role_id";
  const needsPaymentTypes =
    field?.optionsSource === "payment-types" ||
    field?.key === "payment_type_id";
  const needsContractPeriods =
    field?.optionsSource === "contract-periods" ||
    field?.key === "contract_term_in_years" ||
    field?.key === "contract_period_id";
  const needsRegions =
    field?.optionsSource === "regions" || field?.key === "property_place_id";
  const needsCities =
    field?.optionsSource === "cities" || field?.key === "property_city_id";
  const needsUnitTypes =
    field?.optionsSource === "unit-types" || field?.key === "unit_type_id";
  const needsUnitUsages =
    field?.optionsSource === "unit-usages" || field?.key === "unit_usage_id";

  const regionId =
    formValues?.property_place_id ??
    orderData?.step1?.property_place_id ??
    orderData?.property_place_id ??
    null;

  const { options: tenantOptions, isLoading: tenantLoading } =
    useTenantRoles(needsTenantRoles);
  const { options: paymentOptions, isLoading: paymentLoading } =
    usePaymentTypes(contractType || "housing", needsPaymentTypes);
  const { options: periodOptions, isLoading: periodsLoading } =
    useContractPeriodsForType(contractType || "housing", {
      enabled: needsContractPeriods,
    });
  const { options: regionOptions, isLoading: regionsLoading } =
    useRegions(needsRegions);
  const { options: cityOptions, isLoading: citiesLoading } = useCities({
    enabled: needsCities,
    regionId: needsCities ? regionId : null,
  });
  const { options: unitTypeOptions, isLoading: unitTypesLoading } =
    useUnitTypes(contractType || "housing", needsUnitTypes);
  const { options: unitUsageOptions, isLoading: unitUsagesLoading } =
    useUnitUsages(contractType || "housing", needsUnitUsages);

  if (Array.isArray(field?.options) && field.options.length > 0) {
    return { options: field.options, isLoading: false };
  }

  if (needsTenantRoles) {
    return { options: tenantOptions, isLoading: tenantLoading };
  }

  if (needsPaymentTypes) {
    return { options: paymentOptions, isLoading: paymentLoading };
  }

  if (needsContractPeriods) {
    return { options: periodOptions, isLoading: periodsLoading };
  }

  if (needsRegions) {
    return { options: regionOptions, isLoading: regionsLoading };
  }

  if (needsCities) {
    return { options: cityOptions, isLoading: citiesLoading };
  }

  if (needsUnitTypes) {
    return { options: unitTypeOptions, isLoading: unitTypesLoading };
  }

  if (needsUnitUsages) {
    return { options: unitUsageOptions, isLoading: unitUsagesLoading };
  }

  return { options: field?.options ?? [], isLoading: false };
}

function TenantRolesMultiField({ formValues, onPatch, fieldErrors = {} }) {
  const { items: roles, isLoading } = useTenantRoles(true);
  const selectedIds = parseTenantRoleIds(formValues?.tenant_role_ids);
  const selectedSet = new Set(selectedIds.map(String));
  const values = formValues?.tenant_role_values || {};

  const emit = (ids, nextValues) => {
    onPatch({
      tenant_role_ids: ids,
      tenant_role_values: nextValues,
      tenant_roles: ids.length > 0 ? 1 : 0,
    });
  };

  const toggleRole = (roleId, checked) => {
    const idNum = Number(roleId);
    const nextIds = checked
      ? [...selectedIds.filter((id) => id !== idNum), idNum]
      : selectedIds.filter((id) => id !== idNum);
    const nextValues = { ...values };
    if (!checked) {
      delete nextValues[String(roleId)];
    }
    emit(nextIds, nextValues);
  };

  const setRoleValue = (roleId, value) => {
    emit(selectedIds, {
      ...values,
      [String(roleId)]: value,
    });
  };

  if (isLoading) {
    return (
      <div className="md:col-span-2 lg:col-span-3 flex items-center gap-2 text-sm text-[#A3A3A3]">
        <Loader2 className="size-4 animate-spin" />
        جاري تحميل صلاحيات المستأجر...
      </div>
    );
  }

  if (!roles.length) {
    return (
      <div className="md:col-span-2 lg:col-span-3 text-sm text-[#A3A3A3]">
        لا توجد صلاحيات متاحة حالياً
      </div>
    );
  }

  return (
    <div className="md:col-span-2 lg:col-span-3 space-y-3">
      <p className="text-[13px] font-bold text-black text-right">
        صلاحيات المستأجر
      </p>
      <div className="space-y-3">
        {roles.map((role) => {
          const id = String(role.id);
          const checked = selectedSet.has(id);
          const valueError =
            fieldErrors[`tenant_role_values.${id}`] ||
            fieldErrors[`tenant_role_values.${role.id}`];

          return (
            <div
              key={role.id}
              className={`rounded-[16px] border bg-white p-4 ${
                checked ? "border-brand-hover/40" : "border-[#EEEEEE]"
              }`}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-[var(--brand-hover,#0C6055)]"
                  checked={checked}
                  onChange={(e) => toggleRole(role.id, e.target.checked)}
                />
                <span className="min-w-0 flex-1 text-right">
                  <span className="block text-sm font-bold text-gray-800">
                    {getTenantRoleLabel(role)}
                  </span>
                  {role.service_definition ? (
                    <span className="mt-1 block text-[12px] text-[#737373] whitespace-pre-wrap">
                      {role.service_definition}
                    </span>
                  ) : null}
                </span>
              </label>

              {checked && role.has_user_input ? (
                <div className="mt-3 space-y-1.5 pr-7">
                  <label className="block text-[12px] font-medium text-gray-500 text-right">
                    {role.input_field_label || "القيمة"}
                    <span className="text-red-500"> *</span>
                  </label>
                  <input
                    type={role.input_field_type === "number" ? "number" : "text"}
                    value={values[id] ?? ""}
                    onChange={(e) => setRoleValue(role.id, e.target.value)}
                    className={inputClass}
                    placeholder={role.input_field_label || ""}
                    dir="ltr"
                  />
                  {valueError ? (
                    <p className="text-[12px] text-[#E24444] text-right">
                      {valueError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {fieldErrors.tenant_role_ids ? (
        <p className="text-[12px] text-[#E24444] text-right">
          {fieldErrors.tenant_role_ids}
        </p>
      ) : null}
    </div>
  );
}

const MAX_OTHER_CONDITIONS = 50;

function OtherConditionsListField({ formValues, onPatch, fieldErrors = {} }) {
  const enabled =
    formValues?.conditions === true ||
    formValues?.conditions === 1 ||
    formValues?.conditions === "1";
  const items = normalizeOtherConditionsList(formValues?.other_conditions_list);
  const displayItems =
    enabled && items.length === 0 ? [""] : items;

  const setEnabled = (nextEnabled) => {
    onPatch({
      conditions: nextEnabled ? 1 : 0,
      other_conditions_list: nextEnabled
        ? items.length > 0
          ? items
          : [""]
        : [],
    });
  };

  const setItems = (nextItems) => {
    onPatch({
      conditions: 1,
      other_conditions_list: nextItems.slice(0, MAX_OTHER_CONDITIONS),
    });
  };

  const updateItem = (index, value) => {
    const next = [...displayItems];
    next[index] = value;
    setItems(next);
  };

  const addItem = () => {
    if (displayItems.length >= MAX_OTHER_CONDITIONS) return;
    setItems([...displayItems, ""]);
  };

  const removeItem = (index) => {
    if (displayItems.length <= 1) {
      setItems([""]);
      return;
    }
    setItems(displayItems.filter((_, i) => i !== index));
  };

  return (
    <div className="md:col-span-2 lg:col-span-3 space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-black text-right">
          هل توجد شروط أخرى؟
        </label>
        <select
          value={enabled ? "1" : "0"}
          onChange={(e) => setEnabled(e.target.value === "1")}
          className={inputClass}
        >
          <option value="1">نعم</option>
          <option value="0">لا</option>
        </select>
      </div>

      {enabled ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-bold text-black text-right">
              قائمة الشروط
            </p>
            <button
              type="button"
              onClick={addItem}
              disabled={displayItems.length >= MAX_OTHER_CONDITIONS}
              className="flex items-center gap-1.5 rounded-full border border-brand-hover/30 bg-brand-hover/10 px-3 py-1.5 text-xs font-bold text-brand-hover disabled:opacity-50"
            >
              <Plus size={14} />
              إضافة شرط
            </button>
          </div>

          {displayItems.map((item, index) => {
            const rowError =
              fieldErrors[`other_conditions_list.${index}`] ||
              fieldErrors[`other_conditions_list.${index + 1}`];
            return (
              <div key={`condition-${index}`} className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={`الشرط ${index + 1}`}
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-[#EEEEEE] text-[#A3A3A3] hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {rowError ? (
                  <p className="text-[12px] text-[#E24444] text-right">
                    {rowError}
                  </p>
                ) : null}
              </div>
            );
          })}

          {fieldErrors.other_conditions_list ? (
            <p className="text-[12px] text-[#E24444] text-right">
              {fieldErrors.other_conditions_list}
            </p>
          ) : null}
          <p className="text-[11px] text-[#A3A3A3] text-right">
            الحد الأدنى شرط واحد · الحد الأقصى {MAX_OTHER_CONDITIONS}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ContractFormField({
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
  const { options: selectOptions, isLoading: optionsLoading } =
    useResolvedSelectOptions(field, orderData, formValues);

  if (field.type === "hidden") {
    return null;
  }

  if (field.type === "tenant-roles") {
    return (
      <TenantRolesMultiField
        formValues={formValues}
        onPatch={onPatch}
        fieldErrors={fieldErrors}
      />
    );
  }

  if (field.type === "other-conditions") {
    return (
      <OtherConditionsListField
        formValues={formValues}
        onPatch={onPatch}
        fieldErrors={fieldErrors}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={`flex flex-col gap-2 ${field.colSpan === 2 ? "md:col-span-2" : ""} ${field.colSpan === 3 ? "md:col-span-3" : ""}`}>
        <label htmlFor={id} className="text-[13px] font-bold text-black text-right">
          {field.label}
        </label>
        <textarea
          id={id}
          rows={3}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-[#EEEEEE] rounded-[14px] p-4 text-[14px] focus:outline-none focus:border-brand-hover resize-none"
          placeholder={field.hint || ""}
        />
        {error ? <p className="text-[12px] text-[#E24444]">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-[13px] font-bold text-black text-right">
          {field.label}
        </label>
        <select
          id={id}
          value={value === 1 || value === "1" ? "1" : "0"}
          onChange={(e) => onChange(e.target.value === "1" ? 1 : 0)}
          className={inputClass}
        >
          <option value="1">نعم</option>
          <option value="0">لا</option>
        </select>
        {error ? <p className="text-[12px] text-[#E24444]">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "select") {
    const selectValue =
      value === null || value === undefined || value === ""
        ? ""
        : String(value);

    const currentLabelFallback = (() => {
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
        return (
          formValues?.unit_type_name ||
          orderData?.step2?.unit_type_name ||
          orderData?.unit_type_name ||
          null
        );
      }
      if (field.key === "unit_usage_id") {
        return (
          formValues?.unit_usage_name ||
          orderData?.step2?.unit_usage_name ||
          orderData?.unit_usage_name ||
          null
        );
      }
      if (field.displayKey && formValues?.[field.displayKey]) {
        return formValues[field.displayKey];
      }
      return null;
    })();

    const optionsWithCurrent =
      selectValue &&
      !selectOptions.some((opt) => String(opt.value) === selectValue)
        ? [
            ...selectOptions,
            {
              value: selectValue,
              label: currentLabelFallback
                ? String(currentLabelFallback)
                : `الخيار الحالي (${selectValue})`,
            },
          ]
        : selectOptions;

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-[13px] font-bold text-black text-right">
          {field.label}
        </label>
        <select
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
          className={inputClass}
        >
          <option value="">
            {optionsLoading
              ? "جاري التحميل..."
              : field.key === "property_city_id" &&
                  !formValues?.property_place_id &&
                  selectOptions.length === 0
                ? "اختر المنطقة أولاً"
                : "— اختر —"}
          </option>
          {optionsWithCurrent.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-[12px] text-[#E24444]">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "date") {
    const calendarType = resolveCalendarType(
      formValues?.[field.calendarTypeKey],
      value
    );
    const typeLabel = calendarType === "hijri" ? "هجري" : "ميلادي";

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-[13px] font-bold text-black text-right">
          {field.label}
          <span className="mr-2 text-[11px] font-medium text-[#A3A3A3]">
            ({typeLabel})
          </span>
        </label>
        <ContractDatePicker
          id={id}
          value={value}
          calendarType={calendarType}
          onChange={onChange}
        />
        {error ? <p className="text-[12px] text-[#E24444]">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div className={`flex flex-col gap-2 ${field.colSpan === 2 ? "md:col-span-2" : ""} ${field.colSpan === 3 ? "md:col-span-3" : ""}`}>
        <label htmlFor={id} className="text-[13px] font-bold text-black text-right">
          {field.label}
        </label>
        <input
          id={id}
          type="file"
          accept={field.accept || "image/*,application/pdf"}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onChange(file);
          }}
          className="w-full rounded-[14px] border border-[#EEEEEE] bg-white px-4 py-3 text-[13px] file:me-3 file:rounded-lg file:border-0 file:bg-brand-hover/10 file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-brand-hover"
        />
        <FileFieldPreview value={value} />
        {field.hint ? (
          <p className="text-[11px] text-[#9E9E9E]">{field.hint}</p>
        ) : null}
        {error ? <p className="text-[12px] text-[#E24444]">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${field.colSpan === 2 ? "md:col-span-2" : ""}`}>
      <label htmlFor={id} className="text-[13px] font-bold text-black text-right">
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
      {error ? <p className="text-[12px] text-[#E24444]">{error}</p> : null}
    </div>
  );
}

export function ContractStepEditor({
  title,
  step,
  fields,
  children,
  className = "",
  showEdit = true,
  /** Override form seed values (e.g. per-unit edit). Merged over step values. */
  initialValues = null,
  /** When true, form is seeded only from initialValues (no contract step merge). */
  seedFromInitialValuesOnly = false,
  /** Extra keys always merged into the save payload (e.g. real_units_id). */
  payloadExtras = null,
  /** Custom save — receives changed-fields payload. Skips default contract update. */
  onSave = null,
  /** Override saving spinner (e.g. unit mutation pending). */
  isSaving: isSavingProp = null,
}) {
  const { orderData, updateContract, isSaving: contextSaving } = useSingleOrderContext();
  const isSaving = isSavingProp ?? contextSaving;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [initial, setInitial] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const needsTenantRolesCatalog = fields.some(
    (field) => field.type === "tenant-roles"
  );
  const { items: tenantRolesCatalog } = useTenantRoles(needsTenantRolesCatalog);

  const resolvedStep = step;

  const syncForm = useMemo(() => {
    if (seedFromInitialValuesOnly) {
      return initialValues && typeof initialValues === "object" ? { ...initialValues } : {};
    }
    if (!orderData) return {};
    const base = getStepFormValues(orderData, resolvedStep);
    const extra = {};
    for (const f of fields) {
      if (f.step && f.step !== resolvedStep) {
        const stepValues = getStepFormValues(orderData, f.step);
        extra[f.key] = stepValues[f.key] ?? "";
        if (f.calendarTypeKey) {
          extra[f.calendarTypeKey] =
            stepValues[f.calendarTypeKey] ?? base[f.calendarTypeKey] ?? "";
        }
      } else if (f.calendarTypeKey && base[f.calendarTypeKey] == null) {
        // Ensure linked calendar-type keys stay available even if not edited here.
        for (const maybeStep of ["summary", "step3", "step4"]) {
          const stepValues = getStepFormValues(orderData, maybeStep);
          if (stepValues[f.calendarTypeKey] != null && stepValues[f.calendarTypeKey] !== "") {
            extra[f.calendarTypeKey] = stepValues[f.calendarTypeKey];
            break;
          }
        }
      }
    }
    const merged = { ...base, ...extra };
    if (initialValues && typeof initialValues === "object") {
      return { ...merged, ...initialValues };
    }
    return merged;
  }, [orderData, resolvedStep, fields, initialValues, seedFromInitialValuesOnly]);

  useEffect(() => {
    // Re-seeding mid-edit would discard what the user typed or the file they
    // picked, so wait until the section leaves edit mode.
    if (editing) return;
    setForm(syncForm);
    setInitial(syncForm);
    setFieldErrors({});
  }, [syncForm, editing]);

  const handleSave = async () => {
    const editableKeys = new Set(fields.map((f) => f.key));

    if (editableKeys.has("tenant_role_ids")) {
      const roleErrors = validateTenantRoleSelection(
        form.tenant_role_ids,
        form.tenant_role_values,
        tenantRolesCatalog
      );
      if (Object.keys(roleErrors).length > 0) {
        setFieldErrors(roleErrors);
        toast.error(Object.values(roleErrors)[0]);
        return;
      }
    }

    if (editableKeys.has("other_conditions_list")) {
      const conditionErrors = validateOtherConditionsList(
        form.conditions,
        form.other_conditions_list
      );
      if (Object.keys(conditionErrors).length > 0) {
        setFieldErrors(conditionErrors);
        toast.error(Object.values(conditionErrors)[0]);
        return;
      }
    }

    // Only send changes for fields shown in this section (even if empty).
    const scopedForm = Object.fromEntries(
      Object.entries(form).filter(([key]) => editableKeys.has(key))
    );
    const scopedInitial = Object.fromEntries(
      Object.entries(initial).filter(([key]) => editableKeys.has(key))
    );

    let payload = {};

    if (typeof onSave === "function") {
      for (const key of editableKeys) {
        const value = scopedForm[key];
        const prev = scopedInitial[key];
        if (value === prev) continue;
        if (value === "" && (prev === "" || prev === undefined)) continue;
        payload[key] = value;
      }
    } else {
      const stepsToSave = new Set([
        resolvedStep,
        ...fields.map((f) => f.step).filter(Boolean),
      ]);
      for (const s of stepsToSave) {
        payload = {
          ...payload,
          ...buildContractUpdatePayload(s, scopedForm, scopedInitial),
        };
      }
    }

    if (payloadExtras && typeof payloadExtras === "object") {
      payload = { ...payload, ...payloadExtras };
    }

    const extrasKeys = new Set(
      payloadExtras && typeof payloadExtras === "object"
        ? Object.keys(payloadExtras)
        : []
    );
    const changedFieldKeys = Object.keys(payload).filter(
      (key) => !extrasKeys.has(key)
    );
    if (changedFieldKeys.length === 0) {
      toast.info("لا توجد تغييرات للحفظ");
      return;
    }

    try {
      setFieldErrors({});
      if (typeof onSave === "function") {
        await onSave(payload);
      } else {
        await updateContract(payload);
      }
      setInitial({ ...form });
      setEditing(false);
    } catch (err) {
      if (err?.fieldErrors) setFieldErrors(err.fieldErrors);
    }
  };

  const handleCancel = () => {
    setForm(initial);
    setFieldErrors({});
    setEditing(false);
  };

  return (
    <div className={className} dir="rtl">
      <div className="mb-4 flex flex-wrap items-center gap-3 px-2">
      <div className="flex items-center gap-2">
          <FileText className="size-4 text-green-600" />
          <h3 className="text-sm! font-bold text-gray-800">{title}</h3>
        </div>
        {showEdit ? (
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-full border border-[#E4E4E4] px-3 py-2 text-sm font-bold text-[#737373] hover:bg-[#F5F5F5]"
                >
                  <X size={16} />
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-full bg-brand-hover px-4 py-2 text-sm font-bold text-white hover:bg-brand-hover/90 disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  حفظ
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className=" flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700"
              >
                <span>تعديل</span>
                <Edit />
              </button>
            )}
          </div>
        ) : null}

      </div>

      {editing ? (
        <div className="rounded-[28px] border border-[#EEEEEE] bg-[#F9F9F9] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields
              .filter((field) => isFieldVisible(field, form))
              .map((field) => (
              <ContractFormField
                key={field.key}
                field={field}
                value={form[field.key]}
                formValues={form}
                orderData={orderData}
                error={fieldErrors[field.key]}
                fieldErrors={fieldErrors}
                onPatch={(patch) =>
                  setForm((prev) => ({ ...prev, ...patch }))
                }
                onChange={(val) =>
                  setForm((prev) => {
                    const next = { ...prev, [field.key]: val };

                    // Region change: reset city so it stays within the selected region.
                    if (
                      field.key === "property_place_id" &&
                      String(prev.property_place_id ?? "") !== String(val ?? "")
                    ) {
                      next.property_city_id = "";
                    }

                    // Switching Hijri/Gregorian: convert linked date fields.
                    const linkedDateKeys = CALENDAR_TYPE_TO_DATE_KEYS[field.key];
                    if (linkedDateKeys) {
                      const fromType = resolveCalendarType(prev[field.key], prev[linkedDateKeys[0]]);
                      const toType = resolveCalendarType(val, prev[linkedDateKeys[0]]);
                      for (const dateKey of linkedDateKeys) {
                        if (!prev[dateKey]) continue;
                        next[dateKey] = convertDateBetweenCalendars(
                          prev[dateKey],
                          fromType,
                          toType
                        );
                        if (dateKey === "tenant_dob" && next[dateKey]) {
                          const parts = String(next[dateKey]).split("-");
                          if (parts.length === 3) {
                            next.tenant_dob_day = parts[0];
                            next.tenant_dob_month = parts[1];
                            next.tenant_dob_year = parts[2];
                          }
                        }
                        if (dateKey === "dob_of_property_tenant_agent" && next[dateKey]) {
                          const parts = String(next[dateKey]).split("-");
                          if (parts.length === 3) {
                            next.dob_of_property_tenant_agent_day = parts[0];
                            next.dob_of_property_tenant_agent_month = parts[1];
                            next.dob_of_property_tenant_agent_year = parts[2];
                          }
                        }
                      }
                    }

                    // Keep day/month/year parts in sync when the main date changes.
                    if (field.type === "date" && typeof val === "string") {
                      const parts = val.split("-");
                      if (parts.length === 3) {
                        if (field.key === "tenant_dob") {
                          next.tenant_dob_day = parts[0];
                          next.tenant_dob_month = parts[1];
                          next.tenant_dob_year = parts[2];
                        }
                        if (field.key === "dob_of_property_tenant_agent") {
                          next.dob_of_property_tenant_agent_day = parts[0];
                          next.dob_of_property_tenant_agent_month = parts[1];
                          next.dob_of_property_tenant_agent_year = parts[2];
                        }
                      }
                    }

                    return next;
                  })
                }
              />
            ))}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
