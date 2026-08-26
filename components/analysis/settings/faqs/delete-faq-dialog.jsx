"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { SETTINGS_DELETE_TRIGGER_CLASS } from "@/components/SystemSettings/shared";
import { toast } from "sonner";

export default function DeleteFaqDialog({ faq }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => axiosInstance.post(`/admin/faqs/${faq?.id}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف السؤال بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف السؤال");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={SETTINGS_DELETE_TRIGGER_CLASS}>
          حذف
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-32 border-0" dir="rtl">
        <div className="p-8 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#FFEBEB] text-status-danger flex items-center justify-center shadow-inner mt-4">
            <Trash2 className="size-10" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-22 font-black text-black">هل أنت متأكد من حذف السؤال؟</h3>
            <p className="text-15 font-bold text-status-danger bg-[#FFEBEB] px-4 py-1.5 rounded-full inline-block mx-auto max-w-full line-clamp-2">
              {faq?.title_ar}
            </p>
          </div>
          <p className="text-15 font-medium text-neutral-500">
            هذا الإجراء لا يمكن التراجع عنه بعد الحذف.
          </p>
          <div className="flex items-center gap-4 w-full mt-2">
            <button
              type="button"
              onClick={() => mutate()}
              disabled={isPending}
              className="flex-1 h-13.5 bg-status-danger text-white rounded-2xl font-bold text-base hover:bg-[#E03E3E] transition-all shadow-lg shadow-status-danger/25 disabled:opacity-70"
            >
              {isPending ? <Loader2 className="animate-spin mx-auto" /> : "تأكيـد الحـذف"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 h-13.5 bg-neutral-100 text-neutral-500 rounded-2xl font-bold text-base hover:bg-surface-border transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
