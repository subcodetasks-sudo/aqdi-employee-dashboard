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
import {
  CONTRACT_STATUSES_API,
  buildContractStatusWritePayload,
  emptyContractStatusForm,
} from "@/src/lib/contract-statuses";
import ContractStatusFormFields from "./ContractStatusFormFields";

export default function AddContractStatusDialog({
  open,
  onOpenChange,
  onCreated,
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyContractStatusForm);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(CONTRACT_STATUSES_API, buildContractStatusWritePayload(form)),
    onSuccess: (res) => {
      const created = res?.data?.data ?? {};
      invalidateContractStatusCaches(queryClient);
      onOpenChange?.(false);
      setForm(emptyContractStatusForm);
      toast.success(res?.data?.message || "تم إضافة الحالة");
      onCreated?.({
        id: created.id,
        name: created.name || form.name,
        label: created.name || form.name,
        color: created.color || form.color,
        status_case: created.status_case ?? null,
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
        className="sm:max-w-[600px] p-8 rounded-32 border-0 dark:bg-card dark:text-white"
        dir="rtl"
      >
        <DialogHeader className="mb-6">
          <DialogTitle className="text-22 font-black text-black dark:text-white border-b border-neutral-100 dark:border-white/10 pb-4">
            إضافة حالة العقد
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <ContractStatusFormFields values={form} onChange={setForm} />

          <button
            type="button"
            onClick={() => mutate()}
            disabled={isPending || !canSubmit}
            className="w-full h-13.5 bg-brand-dark text-white rounded-2xl font-bold text-base hover:brightness-110 transition-all disabled:opacity-60 mt-2"
          >
            {isPending ? <Loader2 className="animate-spin mx-auto" /> : "إضـــافة الحالة"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
