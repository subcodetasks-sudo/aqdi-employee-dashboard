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
    queryFn: () => axiosInstance.get(`admin/message-alert-sections/${type}/options/list`).then(res => res.data),
    enabled: open && Boolean(type)
  });

  const sections = sectionsResponse?.data?.items || sectionsResponse?.data || [];

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEdit && item?.id) {
        return axiosInstance.post(`/admin/message-alert-section-items/${item.id}`, payload);
      } else {
        return axiosInstance.post("/admin/message-alert-section-items", payload);
      }
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || (isEdit ? "تم تعديل البند بنجاح" : "تم إضافة البند بنجاح"));
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["message-alert-section-items"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ ما");
    }
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
      sort_order: 0
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
            <h2 className='text-xl font-bold'>{isEdit ? "تعديل بند القسم" : "إضافة بند جديد"}</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className='w-4 h-4' />
            </Button>
          </div>

          <div className='space-y-4'>
            <div dir='rtl' className='space-y-4 text-right'>
              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  النوع <span className="text-red-500">*</span>
                </label>
                <Select
                  dir="rtl"
                  value={type}
                  onValueChange={(value) => {
                    setType(value);
                    setSectionId("");
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر النوع ..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">عميل</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="property">عقار</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  اختر القسم <span className="text-red-500">*</span>
                </label>
                <Select dir='rtl' value={sectionId} onValueChange={setSectionId}>
                  <SelectTrigger className='h-12'>
                    <SelectValue placeholder="اختر القسم المالي للمسج ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(sec => (
                      <SelectItem key={sec.id} value={sec.id?.toString()}>
                        {sec.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* الاسم */}
              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  الاسم <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="اكتب هنا ..."
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className='h-12'
                />
              </div>
            </div>

            {/* زر الإرسال */}
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
