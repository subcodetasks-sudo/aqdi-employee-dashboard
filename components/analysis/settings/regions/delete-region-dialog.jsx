"use client"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { axiosInstance } from '@/src/utils/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { SETTINGS_DELETE_TRIGGER_CLASS } from '@/components/SystemSettings/shared';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DeleteRegionDialog({ region }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  function deleteRegion() {
    return axiosInstance.post(`/admin/regions/${region?.id}/delete`)
  }

  const { mutate: deleteRegionMutate, isPending: deleteRegionPending } = useMutation({
    mutationFn: deleteRegion,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف المنطقة بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف المنطقة");
    }
  })

  return (
    <Dialog Dialog open={open} onOpenChange={setOpen} >

      <DialogTrigger asChild>
        <button type="button" className={SETTINGS_DELETE_TRIGGER_CLASS}>
          حذف
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] border-0" dir="rtl">

        <div className="p-8 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#FFEBEB] text-[#FF4D4F] flex items-center justify-center shadow-inner mt-4">
            <i className="fa-solid fa-trash text-[40px]"></i>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[22px] font-black text-black">
              هل أنت متأكد من حذف المنطقة
            </h3>
            <p className="text-[18px] font-bold text-[#FF4D4F] bg-[#FFEBEB] px-4 py-1.5 rounded-full inline-block mx-auto">
              {region?.name_ar}
            </p>
          </div>

          <p className="text-[15px] font-medium text-[#737373]">
            هذا الإجراء لا يمكن التراجع عنه بعد الحذف! سيتم فقدان كافة البيانات المرتبطة بهذا التصنيف.
          </p>

          <div className="flex items-center gap-4 w-full mt-2">
            <button
              onClick={() => deleteRegionMutate()}
              className="flex-1 h-[54px] bg-[#FF4D4F] text-white rounded-[16px] font-bold text-[16px] hover:bg-[#E03E3E] transition-all shadow-lg shadow-[#FF4D4F]/25"
            >
              {deleteRegionPending ? <Loader2 className="animate-spin mx-auto" /> : "تأكيـد الحـذف"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex-1 h-[54px] bg-[#F5F5F5] text-[#737373] rounded-[16px] font-bold text-[16px] hover:bg-[#EEEEEE] transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  )
}
