"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateOperatingExpense,
  useUpdateOperatingExpense,
} from "@/src/hooks/use-operating-expenses";

const EMPTY_FORM = { expense: "", amount: "" };

export default function OperatingExpenseDialog({ open, onOpenChange, expense }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEdit = Boolean(expense?.id);

  useEffect(() => {
    if (open) {
      setForm({
        expense: expense?.expense ?? "",
        amount: expense?.amount != null ? String(expense.amount) : "",
      });
    }
  }, [open, expense]);

  const { mutate: createExpense, isPending: isCreating } = useCreateOperatingExpense();
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateOperatingExpense();
  const isPending = isCreating || isUpdating;

  const canSubmit = Boolean(form.expense.trim()) && form.amount !== "" && !Number.isNaN(Number(form.amount));

  const handleSubmit = () => {
    const payload = { expense: form.expense.trim(), amount: Number(form.amount) };

    if (isEdit) {
      updateExpense(
        { id: expense.id, ...payload },
        {
          onSuccess: () => {
            onOpenChange?.(false);
            toast.success("تم تحديث المصروف");
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || "تعذر تحديث المصروف");
          },
        }
      );
    } else {
      createExpense(payload, {
        onSuccess: () => {
          onOpenChange?.(false);
          setForm(EMPTY_FORM);
          toast.success("تم إضافة المصروف");
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "تعذر إضافة المصروف");
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] p-8 rounded-[32px] border-0 dark:bg-[#13241C] dark:text-white"
        dir="rtl"
      >
        <DialogHeader className="mb-6">
          <DialogTitle className="text-[20px] font-black text-black dark:text-white border-b border-[#F5F5F5] dark:border-white/10 pb-4">
            {isEdit ? "تعديل مصروف تشغيلي" : "إضافة مصروف تشغيلي"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-[#6B7280] dark:text-white/60">
              اسم المصروف
            </span>
            <input
              type="text"
              value={form.expense}
              onChange={(e) => setForm((prev) => ({ ...prev, expense: e.target.value }))}
              placeholder="مثال: إيجار المكتب"
              className="h-11 px-3 rounded-lg border border-[#E6EBE9] text-[14px] font-semibold text-[#111827] focus:outline-none focus:border-[#0B5345] dark:bg-[#0F1C16] dark:border-white/10 dark:text-white"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-[#6B7280] dark:text-white/60">
              المبلغ (ريال)
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              className="h-11 px-3 rounded-lg border border-[#E6EBE9] text-[14px] font-semibold text-[#111827] focus:outline-none focus:border-[#0B5345] dark:bg-[#0F1C16] dark:border-white/10 dark:text-white"
            />
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canSubmit}
            className="w-full h-[50px] bg-[#0B5345] text-white rounded-[16px] font-bold text-[15px] hover:brightness-110 transition-all disabled:opacity-60 mt-2"
          >
            {isPending ? (
              <Loader2 className="animate-spin mx-auto size-5" />
            ) : isEdit ? (
              "حفظ التعديلات"
            ) : (
              "إضـــافة المصروف"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
