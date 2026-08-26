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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function EditCityDialog({ city }) {
  const [open, setOpen] = useState(false);
  const [cityName, setCityName] = useState(city?.name_ar || "");
  const [regionType, setRegionType] = useState(
    city?.regions?.id != null ? String(city.regions.id) : ""
  );
  const queryClient = useQueryClient();

  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: () => axiosInstance.get("/admin/regions"),
  });
  const data = regions?.data?.data?.items;

  useEffect(() => {
    if (open) {
      setCityName(city?.name_ar || "");
      setRegionType(city?.regions?.id != null ? String(city.regions.id) : "");
    }
  }, [open, city]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(`/admin/cities/${city?.id}`, {
        name_ar: cityName,
        region_id: regionType,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تعديل مدينة بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل مدينة");
    },
  });

  const handleSubmit = () => {
    if (!cityName.trim() || !regionType) {
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
        <SettingsFieldLabel required>اسم المدينة</SettingsFieldLabel>
        <Input
          placeholder="اكتب هنا ..."
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>المنطقة</SettingsFieldLabel>
        <Select dir="rtl" value={regionType || undefined} onValueChange={setRegionType}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue placeholder="اختر المنطقة" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {data?.map((region) => (
              <SelectItem key={region.id} value={String(region.id)}>
                {region.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </SettingsFormDialog>
  );
}
