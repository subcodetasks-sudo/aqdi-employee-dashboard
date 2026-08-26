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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { toast } from "sonner";

export default function AddNewSectionItemDialog({ isEdit, item, defaultType }) {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [type, setType] = useState(defaultType || item?.type || "client");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setNameAr(item?.name_ar || "");
      setSectionId(item?.message_alert_section_id?.toString() || "");
      setType(item?.type || defaultType || "client");
    }
  }, [open, item, defaultType]);

  const { data: sectionsResponse } = useQuery({
    queryKey: ["message-alert-sections-for-items", type],
    queryFn: () =>
      axiosInstance.get(`admin/message-alert-sections/${type}/options/list`).then((res) => res.data),
    enabled: open && Boolean(type),
  });

  const sections = sectionsResponse?.data?.items || sectionsResponse?.data || [];

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEdit && item?.id) {
        return axiosInstance.post(`/admin/message-alert-section-items/${item.id}`, payload);
      }
      return axiosInstance.post("/admin/message-alert-section-items", payload);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || (isEdit ? "تم تعديل البند بنجاح" : "تم إضافة البند بنجاح"));
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["message-alert-section-items"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ ما");
    },
  });

  const handleSubmit = () => {
    if (!nameAr || !sectionId) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    mutation.mutate({
      message_alert_section_id: Number(sectionId),
      name_ar: nameAr,
      name_en: "item" + " " + Math.random(),
      sort_order: 0,
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
        <SettingsFieldLabel required>النوع</SettingsFieldLabel>
        <Select
          dir="rtl"
          value={type}
          onValueChange={(value) => {
            setType(value);
            setSectionId("");
          }}
        >
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

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>اختر القسم</SettingsFieldLabel>
        <Select dir="rtl" value={sectionId || undefined} onValueChange={setSectionId}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue placeholder="اختر القسم ..." />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {sections.map((sec) => (
              <SelectItem key={sec.id} value={sec.id?.toString()}>
                {sec.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم</SettingsFieldLabel>
        <Input
          placeholder="اكتب هنا ..."
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className={settingsFieldClass}
        />
      </label>
    </SettingsFormDialog>
  );
}
