"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { SETTINGS_EDIT_TRIGGER_CLASS } from "@/components/SystemSettings/shared";
import { toast } from "sonner";

export default function EditFaqDialog({ faq }) {
  const [open, setOpen] = useState(false);
  const [titleAr, setTitleAr] = useState(faq?.title_ar ?? "");
  const [answerAr, setAnswerAr] = useState(faq?.answer_ar ?? "");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setTitleAr(faq?.title_ar ?? "");
      setAnswerAr(faq?.answer_ar ?? "");
    }
  }, [open, faq]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(`/admin/faqs/${faq?.id}`, {
        title_ar: titleAr.trim(),
        answer_ar: answerAr.trim(),
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تعديل السؤال بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل السؤال");
    },
  });

  const handleSubmit = () => {
    if (!titleAr.trim() || !answerAr.trim()) {
      toast.error("يرجى إدخال السؤال والجواب");
      return;
    }
    mutate();
  };

  return (
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
          تعديل
        </button>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-6">
            <h2 className="text-xl font-bold">تعديل السؤال</h2>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <div dir="rtl" className="space-y-4 text-right pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                السؤال <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="اكتب السؤال هنا ..."
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                الجواب <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="اكتب الجواب هنا ..."
                value={answerAr}
                onChange={(e) => setAnswerAr(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
            <Button
              type="button"
              disabled={isPending}
              onClick={handleSubmit}
              className="mx-auto block h-12 bg-brand-hover min-w-[140px]"
            >
              {isPending ? <Loader2 className="animate-spin" /> : "حفظ التعديل"}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
