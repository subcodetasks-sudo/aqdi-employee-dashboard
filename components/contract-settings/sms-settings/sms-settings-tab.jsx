"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/home/loader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/src/utils/axios";
import { mapApiValidationErrors } from "@/src/lib/contract-update";
import {
  buildSmsSettingsPayload,
  emptySmsSettingsForm,
  extractSmsSettings,
  SMS_SETTINGS_API,
  SMS_SETTINGS_FIELDS,
  SMS_SETTINGS_QUERY_KEY,
} from "@/src/lib/sms-settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SmsSettingsTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptySmsSettingsForm);
  const [fieldErrors, setFieldErrors] = useState({});

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [SMS_SETTINGS_QUERY_KEY],
    queryFn: () => axiosInstance.get(SMS_SETTINGS_API).then((res) => res?.data),
  });

  useEffect(() => {
    if (!data) return;
    setForm(extractSmsSettings(data));
    setFieldErrors({});
  }, [data]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance
        .post(SMS_SETTINGS_API, buildSmsSettingsPayload(form))
        .then((res) => res?.data),
    onSuccess: (response) => {
      toast.success(response?.message || "تم حفظ إعدادات رسائل SMS بنجاح");
      setFieldErrors({});
      queryClient.invalidateQueries({ queryKey: [SMS_SETTINGS_QUERY_KEY] });
    },
    onError: (err) => {
      const mapped = mapApiValidationErrors(err?.response?.data?.errors);
      setFieldErrors(mapped);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "تعذر حفظ إعدادات رسائل SMS"
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
          تعذر تحميل إعدادات رسائل SMS
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
        <h2 className="text-[22px] font-black text-black">إعدادات رسائل SMS</h2>
        <p className="mt-2 text-[13px] leading-7 text-[#707070]">
          قوالب رسائل SMS عامة لكل المشروع (مرة واحدة). ليست مرتبطة بنوع صك أو عقد.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 rounded-[24px] border border-[#E4E4E4] bg-white p-6 shadow-sm">
        {SMS_SETTINGS_FIELDS.map((field) => (
          <div key={field.key} className="space-y-2 text-right">
            <label className="text-sm font-bold text-black">{field.label}</label>
            <p className="text-[12px] text-[#A3A3A3]">{field.description}</p>
            <Textarea
              value={form[field.key]}
              onChange={(e) => {
                setForm((current) => ({
                  ...current,
                  [field.key]: e.target.value,
                }));
                setFieldErrors((current) => {
                  if (!current[field.key]) return current;
                  const next = { ...current };
                  delete next[field.key];
                  return next;
                });
              }}
              rows={4}
              className={`min-h-[110px] rounded-[16px] resize-none ${
                fieldErrors[field.key] ? "border-red-400" : "border-[#EEEEEE]"
              }`}
              placeholder={field.label}
            />
            {fieldErrors[field.key] ? (
              <p className="text-[12px] font-medium text-red-500">
                {fieldErrors[field.key]}
              </p>
            ) : null}
          </div>
        ))}

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
              "حفظ الإعدادات"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
