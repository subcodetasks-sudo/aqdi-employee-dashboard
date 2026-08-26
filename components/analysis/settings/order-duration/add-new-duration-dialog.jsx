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
import { SettingsAddTrigger } from "@/components/SystemSettings/shared";
import { getContractTypeLabel } from "@/src/lib/contract-period-utils";
import { getInstrumentTypeOptions } from "@/src/lib/instrument-types";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AddNewDurationDialog({ activeTab = "housing" }) {
  const [open, setOpen] = useState(false);
  const [durationName, setDurationName] = useState("");
  const [price, setPrice] = useState("");
  const [instrumentType, setInstrumentType] = useState("");
  const [contractType, setContractType] = useState(activeTab);
  const queryClient = useQueryClient();
  const contractLabel = getContractTypeLabel(contractType);

  useEffect(() => {
    if (open) setContractType(activeTab);
  }, [open, activeTab]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post("/admin/contract-periods/create", {
        period: durationName,
        price: Number(price),
        contract_type: contractType,
        instrument_type: instrumentType,
        note_ar: durationName,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة مدة جديدة بنجاح");
      setOpen(false);
      setDurationName("");
      setPrice("");
      setInstrumentType("");
      setContractType(activeTab);
      queryClient.invalidateQueries({ queryKey: ["contract-periods"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة مدة جديدة");
    },
  });

  const handleSubmit = () => {
    if (!durationName.trim() || !price.trim() || !instrumentType) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (!Number.isFinite(Number(price))) {
      toast.error("يرجى إدخال سعر صحيح");
      return;
    }
    mutate();
  };

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={<SettingsAddTrigger />}
      title={`مدة جديدة — ${contractLabel}`}
      onSubmit={handleSubmit}
      submitLabel="حفظ"
      isPending={isPending}
    >
      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>مدة العقد</SettingsFieldLabel>
        <Input
          placeholder="أدخل مدة العقد هنا ..."
          value={durationName}
          onChange={(e) => setDurationName(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>السعر</SettingsFieldLabel>
        <Input
          type="number"
          min="0"
          placeholder="أدخل السعر هنا ..."
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>نوع العقد</SettingsFieldLabel>
        <Select dir="rtl" value={contractType} onValueChange={setContractType}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue placeholder="اختر نوع العقد" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="housing">سكني</SelectItem>
            <SelectItem value="commercial">تجاري</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>تصنيف وثيقة الملكية</SettingsFieldLabel>
        <Select dir="rtl" value={instrumentType || undefined} onValueChange={setInstrumentType}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue placeholder="إختر تصنيف وثيقة الملكية" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {getInstrumentTypeOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </SettingsFormDialog>
  );
}
