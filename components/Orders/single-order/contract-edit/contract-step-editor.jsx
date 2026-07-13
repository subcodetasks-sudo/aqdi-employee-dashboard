"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, FileText, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  buildContractUpdatePayload,
  getStepFormValues,
} from "@/src/lib/contract-update";
import { useSingleOrderContext } from "../single-order-context";

const inputClass =
  "w-full h-[48px] bg-white border border-[#EEEEEE] rounded-[14px] px-4 text-[14px] focus:outline-none focus:border-brand-hover transition-all";

function ContractFormField({ field, value, onChange, error }) {
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
    const stepsToSave = new Set([
      resolvedStep,
      ...fields.map((f) => f.step).filter(Boolean),
    ]);
    let payload = {};
    for (const s of stepsToSave) {
      payload = { ...payload, ...buildContractUpdatePayload(s, form, initial) };
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
                error={fieldErrors[field.key]}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    [field.key]: val,
                  }))
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
