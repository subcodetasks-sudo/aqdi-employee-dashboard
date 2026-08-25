"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, FolderCheck, FolderX, Loader2, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BlockUserDialog({ user }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const isActive = user?.is_blocked != null ? !user.is_blocked : Boolean(user?.status);

  const { mutate: toggleBlock, isPending } = useMutation({
    mutationFn: () => axiosInstance.post(`/admin/users/${user?.id}/block`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تحديث حالة المستخدم بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["user", String(user?.id)] });
      queryClient.invalidateQueries({ queryKey: ["usersAnalysis"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تحديث حالة المستخدم");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`size-8 rounded-full border transition-all ${
            isActive
              ? "text-gray-500 hover:bg-red-50 hover:text-red-500 border-neutral-200"
              : "bg-red-50 text-red-500 hover:bg-red-100 border-red-200"
          }`}
        >
          {isActive ? <Ban className="size-4" /> : <ShieldCheck className="size-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent
        closeButton={false}
        className="max-w-[520px] rounded-3xl p-0 overflow-hidden border border-[#F0F0F0] shadow-2xl bg-white gap-0"
        dir="rtl"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
          <DialogTitle className="text-lg font-bold text-black m-0">
            {isActive ? "إيقاف حساب" : "تفعيل حساب"}
          </DialogTitle>
          <button
            type="button"
            className="text-ink-subtle hover:opacity-70 transition-opacity"
            onClick={() => setOpen(false)}
            disabled={isPending}
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-6 py-10 flex flex-col items-center text-center">
          <div
            className={`w-[88px] h-[88px] rounded-full flex items-center justify-center mb-8 ${
              isActive ? "bg-brand-hover" : "bg-green-600"
            }`}
          >
            {isActive ? (
              <FolderX className="size-8 text-white stroke-[1.5]" />
            ) : (
              <FolderCheck className="size-8 text-white stroke-[1.5]" />
            )}
          </div>
          <h3 className="text-[20px] font-bold text-black mb-3 leading-relaxed">
            {isActive ? (
              <>
                هل أنت متأكد من <span className="text-brand-hover">إيقاف</span> حساب الضيف !
              </>
            ) : (
              <>
                هل أنت متأكد من <span className="text-green-600">تفعيل</span> حساب الضيف !
              </>
            )}
          </h3>
          <p className="text-sm font-medium text-ink-placeholder">
            هذا الإجراء يمكن التراجع عنه بعد التأكيد !
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            className={`flex-1 h-13 rounded-full text-white font-bold text-base hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center ${
              isActive ? "bg-brand-hover" : "bg-green-600"
            }`}
            onClick={() => toggleBlock()}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-6 animate-spin" />
            ) : isActive ? (
              "تأكيد الإيقاف"
            ) : (
              "تأكيد التفعيل"
            )}
          </button>
          <button
            type="button"
            className="flex-1 h-13 rounded-full bg-neutral-100 text-ink-subtle font-bold text-base hover:bg-surface-border transition-all disabled:opacity-50"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            إلغاء
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
