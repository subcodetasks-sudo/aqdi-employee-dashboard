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

export default function AddNewPropertyTypeDialog() {
  const [open, setOpen] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post("/admin/real-estate-types", {
        name_ar: propertyName,
        contract_type: propertyType,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة نوع العقار بنجاح");
      setOpen(false);
      setPropertyName("");
      setPropertyType("");
      queryClient.invalidateQueries({ queryKey: ["property-types"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة نوع العقار");
    },
  });

  const handleSubmit = () => {
    if (!propertyName.trim() || !propertyType) {
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
        <SettingsFieldLabel required>نوع العقار</SettingsFieldLabel>
        <Input
          placeholder="اكتب هنا ..."
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>تصنيف العقار</SettingsFieldLabel>
        <Select dir="rtl" value={propertyType || undefined} onValueChange={setPropertyType}>
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
