"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import SettingsFormDialog, {
  SettingsFieldLabel,
  settingsFieldClass,
} from "@/components/SystemSettings/SettingsFormDialog";
import { SETTINGS_EDIT_TRIGGER_CLASS } from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function EditRegionDialog({ region }) {
  const [open, setOpen] = useState(false);
  const [regionName, setRegionName] = useState(region?.name_ar || "");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) setRegionName(region?.name_ar || "");
  }, [open, region]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(`/admin/regions/${region?.id}`, { name_ar: regionName }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تعديل المنطقة بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل المنطقة");
    },
  });

  const handleSubmit = () => {
    if (!regionName.trim()) {
      toast.error("يرجى إدخال اسم المنطقة");
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
        <SettingsFieldLabel required>الاسم</SettingsFieldLabel>
        <Input
          placeholder="مثال: الرياض"
          value={regionName}
          onChange={(e) => setRegionName(e.target.value)}
          className={settingsFieldClass}
        />
      </label>
    </SettingsFormDialog>
  );
}
