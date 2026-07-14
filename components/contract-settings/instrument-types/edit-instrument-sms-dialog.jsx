"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/src/utils/axios";
import {
  buildSettingContractPayload,
  emptySettingContractSmsForm,
  SETTING_CONTRACTS_API,
  SETTING_CONTRACTS_QUERY_KEY,
  SETTING_CONTRACT_SMS_FIELDS,
} from "@/src/lib/instrument-type-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquareText, X } from "lucide-react";
import { toast } from "sonner";

export default function EditInstrumentSmsDialog({ item }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptySettingContractSmsForm(item));
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(emptySettingContractSmsForm(item));
    }
  }, [open, item]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = buildSettingContractPayload({
        ...item,
        ...form,
      });

      if (item?.id) {
        return axiosInstance.post(`${SETTING_CONTRACTS_API}/${item.id}`, payload);
      }

      return axiosInstance.post(SETTING_CONTRACTS_API, payload);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حفظ رسائل الصك بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [SETTING_CONTRACTS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "تعذر حفظ رسائل الصك"
      );
    },
  });

  return (
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-10 rounded-full border-[#E4E4E4] bg-white px-4 text-[12px] font-bold text-[#424242] hover:border-brand-main hover:text-brand-main"
      >
        <MessageSquareText className="ml-2 size-4" />
        رسائل SMS
      </Button>

      <DialogContent closeButton={false} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-5">
            <div className="text-right">
              <h2 className="text-xl font-black text-black">رسائل نوع الصك</h2>
              <p className="mt-1 text-sm text-[#737373]">
                {item?.type_name || item?.label || "—"}
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
          {SETTING_CONTRACT_SMS_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2 text-right">
              <label className="text-sm font-bold text-black">{field.label}</label>
              <p className="text-[12px] text-[#A3A3A3]">{field.description}</p>
              <Textarea
                value={form[field.key]}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    [field.key]: e.target.value,
                  }))
                }
                rows={3}
                className="min-h-[96px] rounded-[16px] resize-none"
                placeholder={field.label}
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
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
              disabled={isPending}
              className="h-11 rounded-full bg-brand-main px-6 font-bold text-white hover:bg-brand-hover"
            >
              {isPending ? (
                <>
                  <Loader2 className="ml-2 size-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الرسائل"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
