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

export default function DeleteCityDialog({ city }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  function deleteCity() {
    return axiosInstance.post(`/admin/cities/${city?.id}/delete`)
  }

  const { mutate: deleteCityMutate, isPending: deleteCityPending } = useMutation({
    mutationFn: deleteCity,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف المدينة بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف المدينة");
    }
  })

  return (
    <Dialog Dialog open={open} onOpenChange={setOpen} >

      <DialogTrigger asChild>
        <button type="button" className={SETTINGS_DELETE_TRIGGER_CLASS}>
          حذف
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-32 border-0" dir="rtl">

        <div className="p-8 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#FFEBEB] text-status-danger flex items-center justify-center shadow-inner mt-4">
            <i className="fa-solid fa-trash text-[40px]"></i>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-22 font-black text-black">
              هل أنت متأكد من حذف المدينة
            </h3>
            <p className="text-lg font-bold text-status-danger bg-[#FFEBEB] px-4 py-1.5 rounded-full inline-block mx-auto">
              {city?.name_ar}
            </p>
          </div>

          <p className="text-15 font-medium text-neutral-500">
            هذا الإجراء لا يمكن التراجع عنه بعد الحذف! سيتم فقدان كافة البيانات المرتبطة بهذا التصنيف.
          </p>

          <div className="flex items-center gap-4 w-full mt-2">
            <button
              onClick={() => deleteCityMutate()}
              className="flex-1 h-13.5 bg-status-danger text-white rounded-2xl font-bold text-base hover:bg-[#E03E3E] transition-all shadow-lg shadow-status-danger/25"
            >
              {deleteCityPending ? <Loader2 className="animate-spin mx-auto" /> : "تأكيـد الحـذف"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex-1 h-13.5 bg-neutral-100 text-neutral-500 rounded-2xl font-bold text-base hover:bg-surface-border transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  )
}
