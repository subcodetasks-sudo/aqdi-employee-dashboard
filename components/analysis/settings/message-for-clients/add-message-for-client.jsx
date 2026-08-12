"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerMessages } from "@/src/hooks/use-customer-messages";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { SETTINGS_EDIT_TRIGGER_CLASS, SettingsAddTrigger } from "@/components/SystemSettings/shared";
import { useEffect, useMemo, useState } from "react";
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
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
            تعديل
          </button>
        ) : (
          <SettingsAddTrigger>إضافة</SettingsAddTrigger>
        )}
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-6">
            <h2 className="text-xl font-bold">
              {isEdit ? "تعديل رسالة توضيحية" : "إضافة رسالة توضيحية جديدة"}
            </h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div dir="rtl" className="space-y-4 text-right">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  إختر القسم <span className="text-red-500">*</span>
                </label>
                <Select
                  dir="rtl"
                  value={selectedSection}
                  onValueChange={(value) => {
                    setSelectedSection(value);
                    setSelectedItem("");
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="إختر هنا..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id?.toString()}>
                        {section.name_ar || section.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  إختر بند القسم <span className="text-red-500">*</span>
                </label>
                <Select
                  dir="rtl"
                  value={selectedItem}
                  onValueChange={setSelectedItem}
                  disabled={!selectedSection}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="إختر هنا..." />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id?.toString()}>
                        {item.name_ar || item.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  الرسالة التوضيحية <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="أكتب هنا..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <Button
              disabled={mutation.isPending}
              onClick={handleSubmit}
              className="mx-auto block h-12 bg-brand-hover"
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : isEdit ? (
                "تعديل"
              ) : (
                "إضافة"
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
