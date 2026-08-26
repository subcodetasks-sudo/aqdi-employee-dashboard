"use client"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { axiosInstance } from '@/src/utils/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, Calendar, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function BlockEmployeeDialog({ employee }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [blockedUntil, setBlockedUntil] = useState('');
  const queryClient = useQueryClient();

  const isBlocked = employee?.is_blocked;

  // Unblock mutation
  const { mutate: unblockEmployee, isPending: isUnblocking } = useMutation({
    mutationFn: () => axiosInstance.post(`/admin/employees/${employee?.id}/unblock`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إلغاء حظر الموظف بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["allEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", String(employee?.id)] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إلغاء الحظر");
    }
  });

  // Block mutation
  const { mutate: blockEmployee, isPending: isBlocking } = useMutation({
    mutationFn: () => axiosInstance.post(`/admin/employees/${employee?.id}/block`, {
      reason_of_block: reason,
      blocked_until: blockedUntil || null
    }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حظر الموظف بنجاح");
      setOpen(false);
      setReason('');
      setBlockedUntil('');
      queryClient.invalidateQueries({ queryKey: ["allEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", String(employee?.id)] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حظر الموظف");
    }
  });

  const handleConfirm = () => {
    if (isBlocked) {
      unblockEmployee();
    } else {
      if (!reason.trim()) {
        toast.error("الرجاء إدخال سبب الحظر");
        return;
      }
      blockEmployee();
    }
  };

  const isPending = isBlocking || isUnblocking;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`w-9 h-9 rounded-full border-0 transition-all shadow-none ${
            isBlocked
              ? "bg-[#E6FFE6] text-brand-accent hover:bg-brand-accent hover:text-white"
              : "bg-neutral-100 text-[#1A1A1A] hover:bg-[#E8E8E8]"
          }`}
        >
          <Ban className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-32 border-0" dir="rtl">
        <div className="p-8 flex flex-col items-center gap-6">
          
          {/* Top Status Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner mt-4 ${
            isBlocked ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
          }`}>
            {isBlocked ? <ShieldCheck className="size-10" /> : <Ban className="size-10" />}
          </div>

          {/* Title & Target name */}
          <div className="flex flex-col gap-2 text-center w-full">
            <h3 className="text-22 font-black text-black">
              {isBlocked ? "إلغاء حظر الموظف" : "حظر الموظف"}
            </h3>
            <p className={`text-base font-bold px-4 py-1.5 rounded-full inline-block mx-auto ${
              isBlocked ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            }`}>
              {employee?.name}
            </p>
          </div>

          {/* Dialog Body Content */}
          {isBlocked ? (
            <p className="text-15 font-medium text-neutral-500 text-center max-w-sm">
              هل أنت متأكد من إلغاء حظر هذا الموظف؟ سيتمكن من تسجيل الدخول واستئناف أنشطته بشكل طبيعي.
            </p>
          ) : (
            <div className="w-full space-y-4 text-right">
              {/* Reason Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black flex items-center gap-1.5">
                  <FileText className="size-4 text-ink-placeholder" />
                  سبب الحظر <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="أدخل سبب حظر الموظف هنا..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-24 p-3 text-sm bg-surface-input border border-surface-border rounded-2xl resize-none focus:outline-none focus:border-brand-main focus:bg-white transition-all shadow-inner"
                />
              </div>

              {/* Block Until Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black flex items-center gap-1.5">
                  <Calendar className="size-4 text-ink-placeholder" />
                  حظر حتى تاريخ (اختياري)
                </label>
                <input
                  type="date"
                  value={blockedUntil}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBlockedUntil(e.target.value)}
                  className="w-full h-[46px] px-4 text-sm bg-surface-input border border-surface-border rounded-2xl focus:outline-none focus:border-brand-main focus:bg-white transition-all shadow-inner text-right"
                />
                <p className="text-xs text-ink-placeholder">اتركه فارغاً للحظر الدائم</p>
              </div>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex items-center gap-4 w-full mt-4">
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className={`flex-1 h-13.5 text-white rounded-2xl font-bold text-base transition-all shadow-lg flex items-center justify-center ${
                isBlocked
                  ? "bg-green-600 hover:bg-green-700 shadow-green-600/25"
                  : "bg-red-500 hover:bg-red-600 shadow-red-500/25"
              } disabled:opacity-50`}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                isBlocked ? "تأكيد إلغاء الحظر" : "تأكيـد الحـظر"
              )}
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={isPending}
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
