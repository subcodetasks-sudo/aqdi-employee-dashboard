"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SettingsFormDialog, {
  SettingsFieldLabel,
  settingsFieldClass,
} from "@/components/SystemSettings/SettingsFormDialog";
import { SETTINGS_EDIT_TRIGGER_CLASS } from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

  const handleSubmit = () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    mutate();
  };

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
          تعديل
        </button>
      }
      title="تعديل العنصر"
      onSubmit={handleSubmit}
      submitLabel="حفظ"
      isPending={isPending}
    >
      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم بالعربية</SettingsFieldLabel>
        <Input
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم بالإنجليزية</SettingsFieldLabel>
        <Input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className={settingsFieldClass}
          dir="ltr"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel>نوع العقد</SettingsFieldLabel>
        <Select dir="rtl" value={contractType} onValueChange={setContractType}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="housing">سكني</SelectItem>
            <SelectItem value="commercial">تجاري</SelectItem>
          </SelectContent>
        </Select>
      </label>
    </SettingsFormDialog>
  );
}
