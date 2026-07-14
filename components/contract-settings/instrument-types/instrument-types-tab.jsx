"use client";

import { useState } from "react";
import Loader from "@/components/home/loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { axiosInstance } from "@/src/utils/axios";
import {
  buildSettingContractPayload,
  extractSettingContracts,
  mergeSettingContracts,
  SETTING_CONTRACTS_API,
  SETTING_CONTRACTS_QUERY_KEY,
} from "@/src/lib/instrument-type-settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";

const tableHeaders = [
  "اسم الصك",
  "الاسم الظاهر",
  "إظهار في العقار",
  "إظهار في العقد",
];

function VisibilitySwitch({ checked, disabled, onCheckedChange }) {
  return (
    <div className="flex items-center justify-center">
      <Switch
        dir="ltr"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function EditLabelDialog({ item }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(item?.label || "");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = buildSettingContractPayload({
        ...item,
        label,
      });

      if (item?.id) {
        return axiosInstance.post(`${SETTING_CONTRACTS_API}/${item.id}`, payload);
      }

      return axiosInstance.post(SETTING_CONTRACTS_API, payload);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تحديث النص الظاهر بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [SETTING_CONTRACTS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "تعذر تحديث النص الظاهر"
      );
    },
  });

  return (
    <Dialog
      dir="rtl"
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setLabel(item?.label || "");
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-black hover:text-brand-main"
      >
        <span className="max-w-[220px] truncate">{item?.label || "—"}</span>
        <Pencil className="size-3.5 shrink-0 text-[#A3A3A3]" />
      </button>

      <DialogContent closeButton={false} className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-5">
            <div className="text-right">
              <h2 className="text-xl font-black text-black">تعديل الاسم الظاهر</h2>
              <p className="mt-1 text-sm text-[#737373]">
                {item?.type_name || "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-[#737373] hover:bg-[#F5F5F5]"
            >
              <X className="size-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2" dir="rtl">
          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-black">الاسم الظاهر (label)</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-12 rounded-[16px]"
              placeholder="الاسم الظاهر مع نوع الصك"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-11 rounded-full px-6"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={() => mutate()}
              disabled={isPending || !label.trim()}
              className="h-11 rounded-full bg-brand-main px-6 font-bold text-white hover:bg-brand-hover"
            >
              {isPending ? (
                <>
                  <Loader2 className="ml-2 size-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function InstrumentTypesTab() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [SETTING_CONTRACTS_QUERY_KEY],
    queryFn: () =>
      axiosInstance.get(SETTING_CONTRACTS_API).then((res) => res?.data),
  });

  const items = mergeSettingContracts(extractSettingContracts(data));

  const updateMutation = useMutation({
    mutationFn: async ({ item, field, value }) => {
      const payload = buildSettingContractPayload({
        ...item,
        [field]: value,
      });

      if (item.id) {
        return axiosInstance
          .post(`${SETTING_CONTRACTS_API}/${item.id}`, payload)
          .then((res) => res?.data);
      }

      return axiosInstance
        .post(SETTING_CONTRACTS_API, payload)
        .then((res) => res?.data);
    },
    onSuccess: (response) => {
      toast.success(response?.message || "تم تحديث إظهار نوع الصك بنجاح");
      queryClient.invalidateQueries({
        queryKey: [SETTING_CONTRACTS_QUERY_KEY],
      });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "تعذر تحديث إظهار نوع الصك"
      );
    },
  });

  const pendingKey =
    updateMutation.isPending && updateMutation.variables
      ? `${updateMutation.variables.item.instrument_type}:${updateMutation.variables.field}`
      : null;

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
          تعذر تحميل إعدادات أنواع الصكوك
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
        <h2 className="text-[22px] font-black text-black">أنواع الصكوك</h2>
        <p className="mt-2 text-[13px] leading-7 text-[#707070]">
          قائمة أنواع الصكوك ثابتة ولا يمكن حذفها. تحكم في الإظهار في العقار والعقد،
          وعدّل الاسم الظاهر (label) لكل نوع.
          {items.length > 0 && (
            <span className="mr-2 text-brand-main">({items.length} نوع)</span>
          )}
        </p>
      </div>

      <div className="w-full overflow-x-auto rounded-[24px] border border-[#E4E4E4] bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-[#FAFAFA]">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap border-b border-[#E4E4E4] p-[15px_20px] text-right text-[13px] font-medium text-[#A3A3A3]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const contractPending =
                pendingKey === `${item.instrument_type}:contract`;
              const realestatePending =
                pendingKey === `${item.instrument_type}:realestate`;

              return (
                <tr
                  key={item.instrument_type}
                  className="border-b border-[#F5F5F5] transition-all last:border-0 hover:bg-[#fafafa]"
                >
                  <td className="p-[15px_20px] align-middle">
                    <span className="text-[13px] font-bold text-black">
                      {item.type_name}
                    </span>
                  </td>
                  <td className="p-[15px_20px] align-middle">
                    <EditLabelDialog item={item} />
                  </td>
                  <td className="p-[15px_20px] align-middle">
                    <div className="flex items-center justify-center gap-2">
                      {realestatePending ? (
                        <Loader2 className="size-4 animate-spin text-brand-main" />
                      ) : null}
                      <VisibilitySwitch
                        checked={item.realestate}
                        disabled={updateMutation.isPending}
                        onCheckedChange={(value) =>
                          updateMutation.mutate({
                            item,
                            field: "realestate",
                            value,
                          })
                        }
                      />
                    </div>
                  </td>
                  <td className="p-[15px_20px] align-middle">
                    <div className="flex items-center justify-center gap-2">
                      {contractPending ? (
                        <Loader2 className="size-4 animate-spin text-brand-main" />
                      ) : null}
                      <VisibilitySwitch
                        checked={item.contract}
                        disabled={updateMutation.isPending}
                        onCheckedChange={(value) =>
                          updateMutation.mutate({
                            item,
                            field: "contract",
                            value,
                          })
                        }
                      />
                    </div>
                  </td>
                  {/* <td className="p-[15px_20px] align-middle">
                    <EditInstrumentSmsDialog item={item} />
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
