"use client";

import Link from "next/link";
import { AlignJustify, ChevronLeft, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import Loader from "@/components/home/loader";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/src/utils/axios";
import {
  extractGeneralSettings,
  GENERAL_SETTINGS_API,
  GENERAL_SETTINGS_FIELDS,
  GENERAL_SETTINGS_QUERY_KEY,
} from "@/src/lib/general-settings";
import { SYSTEM_CATEGORIES } from "./mock-data";

export default function GeneralSettingsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [GENERAL_SETTINGS_QUERY_KEY],
    queryFn: () => axiosInstance.get(GENERAL_SETTINGS_API).then((res) => res?.data),
  });

  const toggles = extractGeneralSettings(data);

  const { mutate, isPending, variables } = useMutation({
    mutationFn: ({ key, value }) =>
      axiosInstance
        .put(`${GENERAL_SETTINGS_API}/${key}`, { value })
        .then((res) => res?.data),
    onSuccess: (response) => {
      toast.success(response?.message || "تم حفظ الإعداد بنجاح");
      queryClient.invalidateQueries({ queryKey: [GENERAL_SETTINGS_QUERY_KEY] });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "تعذر حفظ الإعداد"
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
        <p className="text-[15px] font-bold text-[#B91C1C]">تعذر تحميل الإعدادات العامة</p>
        <p className="mt-2 text-[13px] text-[#991B1B]">
          {error?.response?.data?.message || error?.message || "تأكد من توفر الـ API ثم أعد المحاولة"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-[14px] font-bold text-[#054D44]">إعدادات الموقع والتطبيق</h2>

        <div className="grid grid-cols-5 gap-3 max-[1200px]:grid-cols-3 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
          {GENERAL_SETTINGS_FIELDS.map((item) => {
            const enabled = toggles[item.key];
            const isSaving = isPending && variables?.key === item.key;
            return (
              <div
                key={item.key}
                className="flex flex-col items-center gap-3 rounded-2xl border border-[#E6EBE9] bg-white px-4 py-5 shadow-[0_4px_12px_rgba(11,83,69,0.04)] dark:bg-[#13241C] dark:border-white/10"
              >
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    enabled ? "bg-[#054D44]" : "bg-[#D1D5DB]"
                  )}
                />
                <div className="text-center">
                  <p className="text-[14px] font-bold text-[#111827] dark:text-white">
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[12px] font-bold",
                      enabled ? "text-[#054D44]" : "text-[#DC2626]"
                    )}
                  >
                    {enabled ? "مفعل" : "معطل"}
                  </p>
                </div>
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin text-[#054D44]" />
                ) : (
                  <Switch
                    dir="ltr"
                    checked={enabled}
                    disabled={isPending}
                    onCheckedChange={(checked) =>
                      mutate({ key: item.key, value: checked })
                    }
                    className="data-[state=checked]:bg-[#054D44]"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[14px] font-bold text-[#054D44]">
          إعدادات النظام ({SYSTEM_CATEGORIES.length} فئة)
        </h2>

        <div className="grid grid-cols-6 gap-3 max-[1400px]:grid-cols-4 max-[1100px]:grid-cols-3 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
          {SYSTEM_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex items-center gap-3 rounded-2xl border border-[#E6EBE9] bg-white px-3 py-3.5 shadow-[0_4px_12px_rgba(11,83,69,0.04)] transition-all hover:border-[#054D44]/30 hover:shadow-md dark:bg-[#13241C] dark:border-white/10"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F1] text-[#054D44] dark:bg-emerald-500/15 dark:text-emerald-300">
                <AlignJustify className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-[#111827] dark:text-white">
                  {category.label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-medium text-[#9CA3AF]">
                  {category.subtitle}
                </span>
              </span>
              <ChevronLeft className="size-4 shrink-0 text-[#D1D5DB] transition-colors group-hover:text-[#054D44]" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
