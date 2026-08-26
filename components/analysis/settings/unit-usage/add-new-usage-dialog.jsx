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

export default function AddNewUsageDialog() {
  const [open, setOpen] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [unitType, setUnitType] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post("/admin/unit-usages", {
        name_ar: unitName,
        contract_type: unitType,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة استخدام الوحدة بنجاح");
      setOpen(false);
      setUnitName("");
      setUnitType("");
      queryClient.invalidateQueries({ queryKey: ["unit-usages"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة نوع الوحدة");
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
      trigger={<SettingsAddTrigger />}
      title="عنصر جديد"
      onSubmit={handleSubmit}
      submitLabel="حفظ"
      isPending={isPending}
    >
      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>استخدام الوحدة</SettingsFieldLabel>
        <Input
          placeholder="اكتب هنا ..."
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>تصنيف الوحدة</SettingsFieldLabel>
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
