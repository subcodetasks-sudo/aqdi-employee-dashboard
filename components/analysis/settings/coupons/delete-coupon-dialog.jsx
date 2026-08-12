"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { SETTINGS_DELETE_TRIGGER_CLASS } from "@/components/SystemSettings/shared";
import { toast } from "sonner";

export default function DeleteCouponDialog({ coupon }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteCoupon, isPending } = useMutation({
    mutationFn: () => {
      return axiosInstance.post(`/admin/coupons/${coupon.id}/delete`);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف الخصم بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الخصم");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={SETTINGS_DELETE_TRIGGER_CLASS}>
          حذف
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] border-0 shadow-2xl" dir="rtl">
        <div className="p-8 flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#FFEBEB] text-[#FF4D4F] flex items-center justify-center shadow-inner mt-4">
            <Trash2 className="size-10" />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[22px] font-black text-black">
              هل أنت متأكد من حذف الخصم؟
            </h3>
            <p className="text-[17px] font-bold text-[#FF4D4F] bg-[#FFEBEB] px-4 py-1.5 rounded-full inline-block mx-auto">
              {coupon?.name} ({coupon?.code_coupon || coupon?.code || "---"})
            </p>
          </div>

          <p className="text-[14px] font-medium text-[#737373] max-w-[340px]">
            هذا الإجراء نهائي ولا يمكن التراجع عنه بعد إتمامه! سيتم إلغاء مفعول الكود ولن يتمكن العملاء من استخدامه.
          </p>

          <div className="flex items-center gap-4 w-full mt-2">
            <button
              onClick={() => deleteCoupon()}
              disabled={isPending}
              className="flex-1 h-[52px] bg-[#FF4D4F] text-white rounded-[16px] font-bold text-[15px] hover:bg-[#E03E3E] transition-all shadow-lg flex items-center justify-center"
            >
              {isPending ? <Loader2 className="animate-spin" /> : "تأكيـد الحـذف"}
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="flex-1 h-[52px] bg-[#F5F5F5] text-[#737373] rounded-[16px] font-bold text-[15px] hover:bg-[#EEEEEE] transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
