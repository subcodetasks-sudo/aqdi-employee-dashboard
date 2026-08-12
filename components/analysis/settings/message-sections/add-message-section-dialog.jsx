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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/src/utils/axios';
import { toast } from 'sonner';

export default function AddNewMessageSectionDialog({ isEdit, section, defaultType }) {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [type, setType] = useState(defaultType || "client");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setNameAr(section?.name_ar || "");
      setNameEn(section?.name_en || "");
      setType(section?.type || defaultType || "client");
    }
  }, [open, section, defaultType]);

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEdit && section?.id) {
        return axiosInstance.post(`/admin/message-alert-sections/${section.id}`, payload);
      } else {
        return axiosInstance.post("/admin/message-alert-sections", payload);
      }
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || (isEdit ? "تم تعديل القسم بنجاح" : "تم إضافة القسم بنجاح"));
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["message-alert-sections"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ ما");
    }
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
      type
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
            <h2 className='text-xl font-bold'>{isEdit ? "تعديل قسم الرسائل" : "إضافة قسم جديد"}</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className='w-4 h-4' />
            </Button>
          </div>

          <div className='space-y-4'>
            <div dir='rtl' className='space-y-4 text-right'>
              {/* الاسم بالعربية */}
              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  الاسم  <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="اكتب هنا ..."
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className='h-12'
                />
              </div>



              {/* النوع */}
              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  النوع <span className="text-red-500">*</span>
                </label>
                <Select dir='rtl' value={type} onValueChange={setType}>
                  <SelectTrigger className='h-12'>
                    <SelectValue placeholder="اختر النوع ..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">عميل</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="property">عقار</SelectItem>
                  </SelectContent>
                </Select>
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
