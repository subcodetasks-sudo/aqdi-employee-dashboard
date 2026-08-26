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
import { SETTINGS_EDIT_TRIGGER_CLASS, SettingsAddTrigger } from "@/components/SystemSettings/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { toast } from "sonner";

export default function AddNewMessageSectionDialog({ isEdit, section, defaultType }) {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [type, setType] = useState(defaultType || "client");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setNameAr(section?.name_ar || "");
      setType(section?.type || defaultType || "client");
    }
  }, [open, section, defaultType]);

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEdit && section?.id) {
        return axiosInstance.post(`/admin/message-alert-sections/${section.id}`, payload);
      }
      return axiosInstance.post("/admin/message-alert-sections", payload);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || (isEdit ? "تم تعديل القسم بنجاح" : "تم إضافة القسم بنجاح"));
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["message-alert-sections"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ ما");
    },
  });

  const handleSubmit = () => {
    if (!nameAr || !type) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    mutation.mutate({
      name_ar: nameAr,
      name_en: "section" + " " + Math.random(),
      sort_order: 0,
      type,
    });
  };

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        isEdit ? (
          <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
            تعديل
          </button>
        ) : (
          <SettingsAddTrigger />
        )
      }
      title={isEdit ? "تعديل العنصر" : "عنصر جديد"}
      onSubmit={handleSubmit}
      submitLabel="حفظ"
      isPending={mutation.isPending}
    >
      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم</SettingsFieldLabel>
        <Input
          placeholder="اكتب هنا ..."
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>النوع</SettingsFieldLabel>
        <Select dir="rtl" value={type} onValueChange={setType}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue placeholder="اختر النوع ..." />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="client">عميل</SelectItem>
            <SelectItem value="employee">موظف</SelectItem>
            <SelectItem value="property">عقار</SelectItem>
          </SelectContent>
        </Select>
      </label>
    </SettingsFormDialog>
  );
}
