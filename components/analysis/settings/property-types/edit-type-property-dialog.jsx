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

export default function EditTypePropertyDialog({ unit }) {
  const [open, setOpen] = useState(false);
  const [unitName, setUnitName] = useState(unit?.name_ar || "");
  const [unitType, setUnitType] = useState(unit?.contract_type || "");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setUnitName(unit?.name_ar || "");
      setUnitType(unit?.contract_type || "");
    }
  }, [open, unit]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(`/admin/real-estate-types/${unit.id}`, {
        name_ar: unitName,
        contract_type: unitType,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تعديل نوع العقار بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["property-types"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل نوع العقار");
    },
  });

  const handleSubmit = () => {
    if (!unitName.trim() || !unitType) {
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
        <SettingsFieldLabel required>نوع العقار</SettingsFieldLabel>
        <Input
          placeholder="اكتب هنا ..."
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>تصنيف العقار</SettingsFieldLabel>
        <Select dir="rtl" value={unitType || undefined} onValueChange={setUnitType}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue placeholder="سكني أو تجاري" />
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
