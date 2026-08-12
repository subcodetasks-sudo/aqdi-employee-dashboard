"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import { invalidateContractStatusCaches } from "@/src/lib/invalidate-orders-caches";
import { CONTRACT_STATUSES_API } from "@/src/lib/contract-statuses";

const EMPTY_FORM = {
  name: "",
  description: "",
  color_text: "#000000",
  color: "#000000",
};

export default function AddContractStatusDialog({
  open,
  onOpenChange,
  onCreated,
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);

  const { mutate, isPending } = useMutation({
    mutationFn: () => axiosInstance.post(CONTRACT_STATUSES_API, form),
    onSuccess: (res) => {
      const created = res?.data?.data ?? {};
      invalidateContractStatusCaches(queryClient);
      onOpenChange?.(false);
      setForm(EMPTY_FORM);
      toast.success(res?.data?.message || "تم إضافة الحالة");
      onCreated?.({
        id: created.id,
        name: created.name || form.name,
        label: created.name || form.name,
        color: created.color || form.color,
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "تعذر إضافة الحالة");
    },
  });

  const canSubmit = Boolean(form.name.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] p-8 rounded-[32px] border-0 dark:bg-[#13241C] dark:text-white"
        dir="rtl"
      >
        <DialogHeader className="mb-6">
          <DialogTitle className="text-[22px] font-black text-black dark:text-white border-b border-[#F5F5F5] dark:border-white/10 pb-4">
            إضافة حالة العقد
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-[13px] font-bold px-1">
              اسم الحالة <span className="text-[#FF4D4F] mr-1">*</span>
            </label>
            <input
              type="text"
              placeholder="ادخل اسم الحالة هنــا ..."
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full h-[54px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] px-5 text-[15px] focus:outline-none focus:border-[#0B5345] font-medium text-right"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[13px] font-bold px-1">وصف الحالة</label>
            <textarea
              placeholder="ادخل وصف الحالة هنا ..."
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              className="w-full min-h-[96px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] px-5 py-3 text-[15px] focus:outline-none focus:border-[#0B5345] font-medium text-right resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-bold px-1">
                لون النص <span className="text-[#FF4D4F] mr-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.color_text}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, color_text: e.target.value }))
                  }
                  className="w-full h-[54px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-[#0B5345] font-bold text-right"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
                  <input
                    type="color"
                    value={form.color_text}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, color_text: e.target.value }))
                    }
                    className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-bold px-1">
                لون الخلفية <span className="text-[#FF4D4F] mr-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-full h-[54px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-[#0B5345] font-bold text-right"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => mutate()}
            disabled={isPending || !canSubmit}
            className="w-full h-[54px] bg-[#0B5345] text-white rounded-[16px] font-bold text-[16px] hover:brightness-110 transition-all disabled:opacity-60 mt-2"
          >
            {isPending ? <Loader2 className="animate-spin mx-auto" /> : "إضـــافة الحالة"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
