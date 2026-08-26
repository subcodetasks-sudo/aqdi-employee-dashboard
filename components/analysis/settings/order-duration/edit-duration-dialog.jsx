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
import { getInstrumentTypeOptions } from "@/src/lib/instrument-types";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function EditDurationDialog({ duration }) {
  const [open, setOpen] = useState(false);
  const [durationName, setDurationName] = useState(duration?.period || "");
  const [price, setPrice] = useState(duration?.price != null ? String(duration.price) : "");
  const [durationType, setDurationType] = useState(duration?.contract_type || "housing");
  const [instrumentType, setInstrumentType] = useState(duration?.instrument_type || "");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setDurationName(duration?.period || "");
    setPrice(duration?.price != null ? String(duration.price) : "");
    setDurationType(duration?.contract_type || "housing");
    setInstrumentType(duration?.instrument_type || "");
  }, [open, duration]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(`/admin/contract-periods/${duration?.id}`, {
        period: durationName,
        price: Number(price),
        contract_type: durationType,
        instrument_type: instrumentType,
        note_ar: durationName,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تعديل المدة بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["contract-periods"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل المدة");
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
        <SettingsFieldLabel required>مدة العقد</SettingsFieldLabel>
        <Input
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
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>نوع العقد</SettingsFieldLabel>
        <Select dir="rtl" value={durationType} onValueChange={setDurationType}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue />
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
