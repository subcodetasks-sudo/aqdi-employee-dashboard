"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteUserDialog({ user, redirectTo = "/home/reports?tab=users" }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: deleteUser, isPending } = useMutation({
    mutationFn: () => axiosInstance.post(`/admin/users/${user?.id}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف المستخدم بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["usersAnalysis"] });
      queryClient.invalidateQueries({ queryKey: ["user", String(user?.id)] });
      router.push(redirectTo);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف المستخدم");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-red-600/20 text-red-600 hover:bg-red-600 hover:text-white size-8 rounded-full flex items-center justify-center p-0"
          size="icon"
        >
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] border-0" dir="rtl">
        <div className="p-8 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#FFEBEB] text-[#FF4D4F] flex items-center justify-center shadow-inner mt-4">
            <Trash2 className="size-10" />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[22px] font-black text-black">هل أنت متأكد من حذف المستخدم</h3>
            <p className="text-[18px] font-bold text-[#FF4D4F] bg-[#FFEBEB] px-4 py-1.5 rounded-full inline-block mx-auto">
              {user?.full_name || user?.name}
            </p>
          </div>

          <p className="text-[15px] font-medium text-[#737373]">
            هذا الإجراء لا يمكن التراجع عنه بعد الحذف! سيتم فقدان كافة البيانات المرتبطة بهذا المستخدم.
          </p>

          <div className="flex items-center gap-4 w-full mt-2">
            <button
              type="button"
              onClick={() => deleteUser()}
              className="flex-1 h-[54px] bg-[#FF4D4F] text-white rounded-[16px] font-bold text-[16px] hover:bg-[#E03E3E] transition-all shadow-lg shadow-[#FF4D4F]/25 flex items-center justify-center disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="animate-spin" /> : "تأكيـد الحـذف"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 h-[54px] bg-[#F5F5F5] text-[#737373] rounded-[16px] font-bold text-[16px] hover:bg-[#EEEEEE] transition-all disabled:opacity-50"
              disabled={isPending}
            >
              إلغاء
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
