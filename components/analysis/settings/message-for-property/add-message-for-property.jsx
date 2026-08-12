"use client"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2 } from 'lucide-react';
import { SETTINGS_EDIT_TRIGGER_CLASS, SettingsAddTrigger } from '@/components/SystemSettings/shared';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/src/utils/axios';
import { toast } from 'sonner';

export default function AddNewMessageForPropertyDialog({ isEdit, messageAlert }) {
  const [open, setOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  // Reset or pre-fill states when dialog opens or messageAlert changes
  useEffect(() => {
    if (open) {
      setSelectedSection(messageAlert?.message_alert_section_id?.toString() || "");
      setSelectedItem(messageAlert?.message_alert_section_item_id?.toString() || "");
      setMessage(messageAlert?.message || "");
    }
  }, [open, messageAlert]);

  // Fetch sections
  const { data: sectionsData } = useQuery({
    queryKey: ["message-alert-sections-property"],
    queryFn: () => axiosInstance.get("admin/message-alert-sections/property/options/list").then(res => res.data),
    enabled: open
  });
  const sections = sectionsData?.data?.items || sectionsData?.data || [];

  // Fetch section items
  const { data: itemsData } = useQuery({
    queryKey: ["message-alert-section-items-property", selectedSection],
    queryFn: () => axiosInstance.get(`/admin/message-alert-section-items?type=property&message_alert_section_id=${selectedSection}`).then(res => res.data),
    enabled: open && !!selectedSection
  });

  const currentSectionObj = sections.find(s => s.id?.toString() === selectedSection);
  const items = currentSectionObj?.items || itemsData?.data?.items || itemsData?.data || [];

  // Create or Update mutation
  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEdit && messageAlert?.id) {
        return axiosInstance.post(`/admin/message-alerts/property/${messageAlert.id}`, payload);
      } else {
        return axiosInstance.post("/admin/message-alerts/property", payload);
      }
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || (isEdit ? "تم تعديل الرسالة بنجاح" : "تم إضافة الرسالة بنجاح"));
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["message-alerts-property"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ ما");
    }
  });

  const handleSubmit = () => {
    if (!selectedSection || !selectedItem || !message) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    mutation.mutate({
      message_alert_section_id: Number(selectedSection),
      message_alert_section_item_id: Number(selectedItem),
      message
    });
  };

  return (
    <Dialog dir='rtl' open={open} onOpenChange={setOpen}>
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
          <div className='flex items-center justify-between border-b pb-6'>
            {/* header and close button */}
            <h2 className='text-xl font-bold'>إضــافة رساله جديدة</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className='w-4 h-4' />
            </Button>
          </div>

          <div className='space-y-4'>
            <div dir='rtl' className='space-y-4 text-right'>
              {/* اختر القسم */}
              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  اختر القسم <span className="text-red-500">*</span>
                </label>

                <Select dir='rtl' value={selectedSection} onValueChange={(val) => {
                  setSelectedSection(val);
                  setSelectedItem(""); // Reset item on section change
                }}>
                  <SelectTrigger className='h-12'>
                    <SelectValue placeholder="اختر القسم ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(sec => (
                      <SelectItem key={sec.id} value={sec.id?.toString()}>
                        {sec.name_ar || sec.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* اختر بند القسم */}
              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  اختر بند القسم <span className="text-red-500">*</span>
                </label>

                <Select dir='rtl' value={selectedItem} onValueChange={setSelectedItem} disabled={!selectedSection}>
                  <SelectTrigger className='h-12'>
                    <SelectValue placeholder="اختر بند القسم ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map(item => (
                      <SelectItem key={item.id} value={item.id?.toString()}>
                        {item.name_ar || item.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* الرسالة */}
              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  الرسالة <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="اكتب هنا ..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className='h-12'
                />
              </div>
            </div>

            {/* زر الإضافة */}
            <Button
              disabled={mutation.isPending}
              onClick={handleSubmit}
              className="mx-auto block h-12 bg-brand-hover"
            >
              {mutation.isPending ? <Loader2 className='animate-spin mx-auto' /> : (isEdit ? "تعديل" : "إضافة")}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
