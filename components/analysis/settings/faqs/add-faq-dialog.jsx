"use client";

import { useState } from "react";
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
import { SettingsAddTrigger } from "@/components/SystemSettings/shared";
import { toast } from "sonner";

export default function AddFaqDialog() {
  const [open, setOpen] = useState(false);
  const [titleAr, setTitleAr] = useState("");
  const [answerAr, setAnswerAr] = useState("");
  const queryClient = useQueryClient();

  const resetForm = () => {
    setTitleAr("");
    setAnswerAr("");
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post("/admin/faqs", {
        title_ar: titleAr.trim(),
        answer_ar: answerAr.trim(),
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة السؤال بنجاح");
      setOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة السؤال");
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
        <SettingsAddTrigger>إضافة</SettingsAddTrigger>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-6">
            <h2 className="text-xl font-bold">إضافة سؤال جديد</h2>
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
              {isPending ? <Loader2 className="animate-spin" /> : "إضافة"}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
