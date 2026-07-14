"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, FileText, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  buildContractUpdatePayload,
  getStepFormValues,
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

function ContractFormField({ field, value, formValues, onChange, error }) {
  const id = field.key;

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
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-[13px] font-bold text-black text-right">
          {field.label}
        </label>
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          <option value="">—</option>
          {field.options?.map((opt) => (
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
}) {
  const { orderData, updateContract, isSaving } = useSingleOrderContext();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [initial, setInitial] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const resolvedStep = step;

  const syncForm = useMemo(() => {
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
    return { ...base, ...extra };
  }, [orderData, resolvedStep, fields]);

  useEffect(() => {
    setForm(syncForm);
    setInitial(syncForm);
    setFieldErrors({});
  }, [syncForm]);

  const handleSave = async () => {
    const editableKeys = new Set(fields.map((f) => f.key));
    const stepsToSave = new Set([
      resolvedStep,
      ...fields.map((f) => f.step).filter(Boolean),
    ]);

    // Only send changes for fields shown in this section (even if empty).
    const scopedForm = Object.fromEntries(
      Object.entries(form).filter(([key]) => editableKeys.has(key))
    );
    const scopedInitial = Object.fromEntries(
      Object.entries(initial).filter(([key]) => editableKeys.has(key))
    );

    let payload = {};
    for (const s of stepsToSave) {
      payload = {
        ...payload,
        ...buildContractUpdatePayload(s, scopedForm, scopedInitial),
      };
    }

    if (Object.keys(payload).length === 0) {
      toast.info("لا توجد تغييرات للحفظ");
      return;
    }

    try {
      setFieldErrors({});
      await updateContract(payload);
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
            {fields.map((field) => (
              <ContractFormField
                key={field.key}
                field={field}
                value={form[field.key]}
                formValues={form}
                error={fieldErrors[field.key]}
                onChange={(val) =>
                  setForm((prev) => {
                    const next = { ...prev, [field.key]: val };

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
