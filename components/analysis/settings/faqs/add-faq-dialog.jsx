"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SettingsFormDialog, {
  SettingsFieldLabel,
  settingsFieldClass,
} from "@/components/SystemSettings/SettingsFormDialog";
import { SettingsAddTrigger } from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    <SettingsFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={<SettingsAddTrigger />}
      title="عنصر جديد"
      onSubmit={handleSubmit}
      submitLabel="حفظ"
      isPending={isPending}
    >
      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>السؤال</SettingsFieldLabel>
        <Input
          placeholder="اكتب السؤال هنا ..."
          value={titleAr}
          onChange={(e) => setTitleAr(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الجواب</SettingsFieldLabel>
        <Textarea
          placeholder="اكتب الجواب هنا ..."
          value={answerAr}
          onChange={(e) => setAnswerAr(e.target.value)}
          rows={5}
          className={cn(settingsFieldClass, "h-auto min-h-[120px] resize-none py-2.5")}
        />
      </label>
    </SettingsFormDialog>
  );
}
