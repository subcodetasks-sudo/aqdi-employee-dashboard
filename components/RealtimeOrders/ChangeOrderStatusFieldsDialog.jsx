"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function fieldLabel(field) {
  return field?.label_ar || field?.label_en || field?.name || "";
}

function optionLabel(option) {
  return option?.label_ar || option?.label_en || option?.value || "";
}

function isFieldRequired(field, values) {
  if (field?.required) return true;
  const requiredIf = field?.required_if;
  if (!Array.isArray(requiredIf) || requiredIf.length < 2) return false;
  const [otherName, expected] = requiredIf;
  return String(values?.[otherName] ?? "") === String(expected);
}

function isFieldVisible(field, values) {
  const requiredIf = field?.required_if;
  if (!Array.isArray(requiredIf) || requiredIf.length < 2) return true;
  return isFieldRequired(field, values) || String(values?.[requiredIf[0]] ?? "") === String(requiredIf[1]);
}

export function getStatusCaseFields(status) {
  const fields = status?.status_case?.fields;
  return Array.isArray(fields) ? fields : [];
}

export function statusRequiresExtraFields(status) {
  return getStatusCaseFields(status).length > 0;
}

export { buildOrderStatusChangePayload } from "@/src/lib/order-status-api";

export default function ChangeOrderStatusFieldsDialog({
  open,
  onOpenChange,
  status,
  isPending = false,
  onSubmit,
}) {
  const fields = useMemo(() => getStatusCaseFields(status), [status]);
  const [values, setValues] = useState({});

  useEffect(() => {
    if (!open) {
      setValues({});
      return;
    }
    const next = {};
    fields.forEach((field) => {
      next[field.name] = field.type === "file" ? null : "";
    });
    setValues(next);
  }, [open, fields]);

  const missingRequired = fields.some(
    (field) =>
      isFieldRequired(field, values) &&
      isFieldVisible(field, values) &&
      (values[field.name] == null || values[field.name] === "")
  );

  const handleSubmit = () => {
    if (missingRequired || isPending) return;
    onSubmit?.(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[560px] p-8 rounded-[32px] border-0 dark:bg-[#13241C] dark:text-white"
        dir="rtl"
      >
        <DialogHeader className="mb-6">
          <DialogTitle className="text-[22px] font-black text-black dark:text-white border-b border-[#F5F5F5] dark:border-white/10 pb-4">
            {status?.name || status?.label || "تغيير الحالة"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {fields.map((field) => {
            if (!isFieldVisible(field, values)) return null;
            const required = isFieldRequired(field, values);
            const label = fieldLabel(field);

            if (field.type === "select") {
              return (
                <label key={field.name} className="flex flex-col gap-2">
                  <span className="text-[13px] font-bold px-1">
                    {label}
                    {required ? <span className="text-[#FF4D4F] mr-1">*</span> : null}
                  </span>
                  <Select
                    dir="rtl"
                    value={values[field.name] || undefined}
                    onValueChange={(value) =>
                      setValues((prev) => ({ ...prev, [field.name]: value }))
                    }
                  >
                    <SelectTrigger className="h-[54px] rounded-[16px] bg-[#F9F9F9] dark:bg-white/[0.04] border-[#EEEEEE] dark:border-white/10">
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      {(field.options ?? []).map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {optionLabel(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              );
            }

            if (field.type === "file") {
              return (
                <label key={field.name} className="flex flex-col gap-2">
                  <span className="text-[13px] font-bold px-1">
                    {label}
                    {required ? <span className="text-[#FF4D4F] mr-1">*</span> : null}
                  </span>
                  <input
                    type="file"
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.name]: e.target.files?.[0] ?? null,
                      }))
                    }
                    className="w-full h-[54px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] px-5 py-3 text-[13px]"
                  />
                </label>
              );
            }

            const isTextarea = field.type === "text";
            const InputTag = isTextarea ? "textarea" : "input";

            return (
              <label key={field.name} className="flex flex-col gap-2">
                <span className="text-[13px] font-bold px-1">
                  {label}
                  {required ? <span className="text-[#FF4D4F] mr-1">*</span> : null}
                </span>
                <InputTag
                  value={values[field.name] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  rows={isTextarea ? 3 : undefined}
                  className={
                    isTextarea
                      ? "w-full min-h-[96px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] px-5 py-3 text-[15px] focus:outline-none focus:border-[#0B5345] font-medium text-right resize-none"
                      : "w-full h-[54px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] px-5 text-[15px] focus:outline-none focus:border-[#0B5345] font-medium text-right"
                  }
                />
              </label>
            );
          })}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || missingRequired}
            className="w-full h-[54px] bg-[#0B5345] text-white rounded-[16px] font-bold text-[16px] hover:brightness-110 transition-all disabled:opacity-60 mt-2"
          >
            {isPending ? <Loader2 className="animate-spin mx-auto" /> : "تأكيد تغيير الحالة"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
