"use client"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog";
import { axiosInstance } from '@/src/utils/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DeleteEmployeeDialog({
  employee,
  isSingle = false,
  triggerVariant = "icon",
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  function deleteEmployee() {
    return axiosInstance.post(`/admin/employees/${employee?.id}/delete`);
  }

  const { mutate: deleteEmployeeMutate, isPending: deleteEmployeePending } = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف الموظف بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["allEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", String(employee?.id)] });
      if(isSingle) router.push("/home/roles-and-employees?tab=employees");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف الموظف");
    }
  });

  const renderTrigger = () => {
    if (triggerVariant === "outline-delete") {
      return (
        <button
          type="button"
          className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-[#FCA5A5] bg-white text-[#DC2626] text-[12px] font-semibold hover:bg-[#FEF2F2] transition-colors"
        >
          حذف
        </button>
      );
    }

    return (
      <Button
        className="bg-[#FFEBEB] text-[#FF4D4F] hover:bg-[#FF4D4F] hover:text-white w-9 h-9 rounded-full flex items-center justify-center p-0 border-0 shadow-none"
        size="icon"
      >
        <Trash2 className="size-4" />
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] border-0" dir="rtl">
        <div className="p-8 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#FFEBEB] text-[#FF4D4F] flex items-center justify-center shadow-inner mt-4">
            <Trash2 className="size-10" />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[22px] font-black text-black">
              هل أنت متأكد من حذف الموظف
            </h3>
            <p className="text-[18px] font-bold text-[#FF4D4F] bg-[#FFEBEB] px-4 py-1.5 rounded-full inline-block mx-auto">
              {employee?.name}
            </p>
          </div>

          <p className="text-[15px] font-medium text-[#737373]">
            هذا الإجراء لا يمكن التراجع عنه بعد الحذف! سيتم فقدان كافة البيانات المرتبطة بهذا الموظف.
          </p>

          <div className="flex items-center gap-4 w-full mt-2">
            <button
              onClick={() => deleteEmployeeMutate()}
              className="flex-1 h-[54px] bg-[#FF4D4F] text-white rounded-[16px] font-bold text-[16px] hover:bg-[#E03E3E] transition-all shadow-lg shadow-[#FF4D4F]/25 flex items-center justify-center"
              disabled={deleteEmployeePending}
            >
              {deleteEmployeePending ? <Loader2 className="animate-spin" /> : "تأكيـد الحـذف"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex-1 h-[54px] bg-[#F5F5F5] text-[#737373] rounded-[16px] font-bold text-[16px] hover:bg-[#EEEEEE] transition-all"
              disabled={deleteEmployeePending}
            >
              إلغاء
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
