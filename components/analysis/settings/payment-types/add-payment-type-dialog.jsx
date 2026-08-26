"use client";

import { useState } from "react";
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
import { SettingsAddTrigger } from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AddPaymentTypeDialog() {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [contractType, setContractType] = useState("housing");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post("/admin/payment-types/create", {
        name_ar: nameAr,
        name_en: nameEn,
        contract_type: contractType,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة طريقة الدفع بنجاح");
      setOpen(false);
      setNameAr("");
      setNameEn("");
      setContractType("housing");
      queryClient.invalidateQueries({ queryKey: ["payment-types"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة طريقة الدفع");
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
      trigger={<SettingsAddTrigger />}
      title="عنصر جديد"
      onSubmit={handleSubmit}
      submitLabel="حفظ"
      isPending={isPending}
    >
      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم بالعربية</SettingsFieldLabel>
        <Input
          placeholder="أدخل الاسم بالعربية ..."
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم بالإنجليزية</SettingsFieldLabel>
        <Input
          placeholder="Enter English name ..."
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className={settingsFieldClass}
          dir="ltr"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>نوع العقد</SettingsFieldLabel>
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
