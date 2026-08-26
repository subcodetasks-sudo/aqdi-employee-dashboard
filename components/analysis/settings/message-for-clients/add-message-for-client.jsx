"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useCustomerMessages } from "@/src/hooks/use-customer-messages";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AddNewMessageForClientDialog({ isEdit, messageAlert }) {
  const [open, setOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { sections } = useCustomerMessages("client", open);

  useEffect(() => {
    if (!open) return;
    setSelectedSection(messageAlert?.message_alert_section_id?.toString() || "");
    setSelectedItem(messageAlert?.message_alert_section_item_id?.toString() || "");
    setMessage(messageAlert?.message || "");
  }, [open, messageAlert]);

  const items = useMemo(() => {
    const section = sections.find((entry) => entry.id?.toString() === selectedSection);
    return section?.items ?? [];
  }, [sections, selectedSection]);

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEdit && messageAlert?.id) {
        return axiosInstance.post(`/admin/customer-messages/${messageAlert.id}`, payload);
      }
      return axiosInstance.post("/admin/customer-messages", payload);
    },
    onSuccess: (res) => {
      toast.success(
        res?.data?.message || (isEdit ? "تم تعديل الرسالة بنجاح" : "تم إضافة الرسالة بنجاح")
      );
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["customer-messages"] });
      queryClient.invalidateQueries({ queryKey: ["message-alerts-client"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ ما");
    },
  });

  const handleSubmit = () => {
    if (!selectedSection || !selectedItem || !message.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    mutation.mutate({
      message_alert_section_id: Number(selectedSection),
      message_alert_section_item_id: Number(selectedItem),
      message: message.trim(),
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
        <SettingsFieldLabel required>إختر القسم</SettingsFieldLabel>
        <Select
          dir="rtl"
          value={selectedSection || undefined}
          onValueChange={(value) => {
            setSelectedSection(value);
            setSelectedItem("");
          }}
        >
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue placeholder="إختر هنا..." />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {sections.map((section) => (
              <SelectItem key={section.id} value={section.id?.toString()}>
                {section.name_ar || section.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>إختر بند القسم</SettingsFieldLabel>
        <Select
          dir="rtl"
          value={selectedItem || undefined}
          onValueChange={setSelectedItem}
          disabled={!selectedSection}
        >
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue placeholder="إختر هنا..." />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id?.toString()}>
                {item.name_ar || item.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الرسالة التوضيحية</SettingsFieldLabel>
        <Input
          placeholder="أكتب هنا..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={settingsFieldClass}
        />
      </label>
    </SettingsFormDialog>
  );
}
