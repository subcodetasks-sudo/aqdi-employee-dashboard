"use client";

import { useState } from "react";
import Loader from "@/components/home/loader";
import PermissionGate from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/src/utils/axios";
import { mapApiValidationErrors } from "@/src/lib/contract-update";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import {
  buildTaxApplicationFeeSettingsPayload,
  emptyTaxApplicationFeeSettingsForm,
  extractTaxApplicationFeeSettings,
  TAX_APPLICATION_FEE_SETTINGS_API,
  TAX_APPLICATION_FEE_SETTINGS_FIELDS,
  TAX_APPLICATION_FEE_SETTINGS_QUERY_KEY,
} from "@/src/lib/tax-application-fee-settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TaxApplicationFeeSettingsTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyTaxApplicationFeeSettingsForm);
  const [fieldErrors, setFieldErrors] = useState({});

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [TAX_APPLICATION_FEE_SETTINGS_QUERY_KEY],
    queryFn: () =>
      axiosInstance
        .get(TAX_APPLICATION_FEE_SETTINGS_API)
        .then((res) => res?.data),
  });

  const [syncedData, setSyncedData] = useState(null);
  if (data && data !== syncedData) {
    setSyncedData(data);
    setForm(extractTaxApplicationFeeSettings(data));
    setFieldErrors({});
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance
        .post(
          TAX_APPLICATION_FEE_SETTINGS_API,
          buildTaxApplicationFeeSettingsPayload(form)
        )
        .then((res) => res?.data),
    onSuccess: (response) => {
      toast.success(response?.message || "تم حفظ الضريبة ورسوم التطبيق بنجاح");
      setFieldErrors({});
      const next = extractTaxApplicationFeeSettings(response);
      setForm(next);
      setSyncedData(response);
      queryClient.setQueryData([TAX_APPLICATION_FEE_SETTINGS_QUERY_KEY], response);
    },
    onError: (err) => {
      const mapped = mapApiValidationErrors(err?.response?.data?.errors);
      setFieldErrors(mapped);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "تعذر حفظ الضريبة ورسوم التطبيق"
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-[#FECACA] bg-[#FFF5F5] p-8 text-center dark:border-red-500/30 dark:bg-red-500/10">
        <p className="text-15 font-bold text-[#B91C1C] dark:text-red-300">
          تعذر تحميل الضريبة ورسوم التطبيق
        </p>
        <p className="mt-2 text-13 text-[#991B1B] dark:text-red-200/80">
          {error?.response?.data?.message ||
            error?.message ||
            "تأكد من توفر الـ API ثم أعد المحاولة"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-6 text-right dark:border-white/10">
        <h2 className="text-22 font-black text-black dark:text-white">
          الضريبة ورسوم التطبيق
        </h2>
        <p className="mt-2 text-13 leading-7 text-[#707070] dark:text-white/55">
          قيم تُستخدم في الخطوة الأخيرة من مالية العقد: الضريبة حسب نوع العقد
          (سكني/تجاري)، ورسوم التطبيق كمبلغ ثابت بالريال. الحقول اختيارية والحد
          الأدنى 0.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card dark:shadow-none">
        <div className="grid gap-5">
          {TAX_APPLICATION_FEE_SETTINGS_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2 text-right">
              <label className="text-sm font-bold text-black dark:text-white">
                {field.label}
              </label>
              {field.description ? (
                <p className="text-12 text-[#707070] dark:text-white/45">
                  {field.description}
                </p>
              ) : null}
              <Input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={form[field.key]}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value !== "" && Number(value) < 0) return;
                  setForm((current) => ({
                    ...current,
                    [field.key]: value,
                  }));
                  setFieldErrors((current) => {
                    if (!current[field.key]) return current;
                    const next = { ...current };
                    delete next[field.key];
                    return next;
                  });
                }}
                className={`h-12 rounded-2xl ${
                  fieldErrors[field.key]
                    ? "border-red-400"
                    : "border-surface-border bg-neutral-50 dark:border-white/10 dark:bg-white/[0.04]"
                }`}
                placeholder="0"
              />
              {fieldErrors[field.key] ? (
                <p className="text-xs font-medium text-red-500">
                  {fieldErrors[field.key]}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <PermissionGate
            section={PERMISSION_SECTIONS.settings}
            action="edit"
          >
            <Button
              type="button"
              onClick={() => mutate()}
              disabled={isPending || isFetching}
              className="h-12 min-w-[160px] rounded-full bg-brand-main px-6 font-bold text-white hover:bg-brand-hover"
            >
              {isPending ? (
                <>
                  <Loader2 className="ml-2 size-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الإعدادات"
              )}
            </Button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
