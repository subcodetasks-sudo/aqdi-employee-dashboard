"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import SettingsFormDialog, {
  SettingsFieldLabel,
  settingsFieldClass,
} from "@/components/system-settings/settings-form-dialog";
import { SettingsAddTrigger } from "@/components/system-settings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AddNewRegionDialog() {
  const [open, setOpen] = useState(false);
  const [regionName, setRegionName] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => axiosInstance.post("/admin/regions", { name_ar: regionName }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة المنطقة بنجاح");
      setOpen(false);
      setRegionName("");
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة المنطقة");
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
      trigger={<SettingsAddTrigger />}
      title="عنصر جديد"
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
