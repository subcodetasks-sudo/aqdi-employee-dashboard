"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { SETTINGS_EDIT_TRIGGER_CLASS } from "@/components/SystemSettings/shared";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditPaymentTypeDialog({ paymentType }) {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState(paymentType?.name_ar || "");
  const [nameEn, setNameEn] = useState(paymentType?.name_en || "");
  const [contractType, setContractType] = useState(paymentType?.contract_type || "housing");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setNameAr(paymentType?.name_ar || "");
    setNameEn(paymentType?.name_en || "");
    setContractType(paymentType?.contract_type || "housing");
  }, [open, paymentType]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(`/admin/payment-types/${paymentType?.id}`, {
        name_ar: nameAr,
        name_en: nameEn,
        contract_type: contractType,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تعديل طريقة الدفع بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["payment-types"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل طريقة الدفع");
    },
  });

  return (
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
          تعديل
        </button>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-6">
            <h2 className="text-xl font-bold">تعديل طريقة الدفع</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4 text-right">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                الاسم بالعربية <span className="text-red-500">*</span>
              </label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                الاسم بالإنجليزية <span className="text-red-500">*</span>
              </label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="h-12"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">نوع العقد</label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="housing">سكني</SelectItem>
                  <SelectItem value="commercial">تجاري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              disabled={isPending || !nameAr.trim() || !nameEn.trim()}
              onClick={() => mutate()}
              className="mx-auto block h-12 bg-brand-hover"
            >
              {isPending ? <Loader2 className="animate-spin" /> : "تعديل"}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
