"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/home/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/src/utils/axios";
import { mapApiValidationErrors } from "@/src/lib/contract-update";
import {
  buildMeterFeeSettingsPayload,
  emptyMeterFeeSettingsForm,
  extractMeterFeeSettings,
  METER_FEE_SETTINGS_API,
  METER_FEE_SETTINGS_FIELDS,
  METER_FEE_SETTINGS_QUERY_KEY,
} from "@/src/lib/meter-fee-settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MeterFeeSettingsTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyMeterFeeSettingsForm);
  const [fieldErrors, setFieldErrors] = useState({});

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [METER_FEE_SETTINGS_QUERY_KEY],
    queryFn: () =>
      axiosInstance.get(METER_FEE_SETTINGS_API).then((res) => res?.data),
  });

  useEffect(() => {
    if (!data) return;
    setForm(extractMeterFeeSettings(data));
    setFieldErrors({});
  }, [data]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance
        .post(METER_FEE_SETTINGS_API, buildMeterFeeSettingsPayload(form))
        .then((res) => res?.data),
    onSuccess: (response) => {
      toast.success(response?.message || "تم حفظ رسوم العدادات بنجاح");
      setFieldErrors({});
      queryClient.invalidateQueries({
        queryKey: [METER_FEE_SETTINGS_QUERY_KEY],
      });
    },
    onError: (err) => {
      const mapped = mapApiValidationErrors(err?.response?.data?.errors);
      setFieldErrors(mapped);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "تعذر حفظ رسوم العدادات"
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
      <div className="rounded-[24px] border border-[#FECACA] bg-[#FFF5F5] p-8 text-center">
        <p className="text-[15px] font-bold text-[#B91C1C]">
          تعذر تحميل رسوم العدادات
        </p>
        <p className="mt-2 text-[13px] text-[#991B1B]">
          {error?.response?.data?.message ||
            error?.message ||
            "تأكد من توفر الـ API ثم أعد المحاولة"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#F5F5F5] pb-6 text-right">
        <h2 className="text-[22px] font-black text-black">رسوم العدادات</h2>
        <p className="mt-2 text-[13px] leading-7 text-[#707070]">
          4 رسوم ثابتة على مستوى المشروع للمستأجر السكني والتجاري. الحقول اختيارية،
          والحد الأدنى 0.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 rounded-[24px] border border-[#E4E4E4] bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          {METER_FEE_SETTINGS_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2 text-right">
              <label className="text-sm font-bold text-black">{field.label}</label>
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
                className={`h-12 rounded-[16px] ${
                  fieldErrors[field.key]
                    ? "border-red-400"
                    : "border-[#EEEEEE] bg-[#FAFAFA]"
                }`}
                placeholder="0"
              />
              {fieldErrors[field.key] ? (
                <p className="text-[12px] font-medium text-red-500">
                  {fieldErrors[field.key]}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
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
              "حفظ الرسوم"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
