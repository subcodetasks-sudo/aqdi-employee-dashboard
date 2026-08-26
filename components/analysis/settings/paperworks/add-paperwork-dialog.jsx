"use client";

import { useState } from "react";
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
import { SettingsAddTrigger } from "@/components/SystemSettings/shared";
import PaperworkIconField from "@/components/analysis/settings/paperworks/paperwork-icon-field";
import { buildPaperworkFormData } from "@/components/analysis/settings/paperworks/paperwork-form-data";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AddPaperworkDialog() {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [contractType, setContractType] = useState("housing");
  const queryClient = useQueryClient();

  const resetForm = () => {
    setNameAr("");
    setNameEn("");
    setIconFile(null);
    setContractType("housing");
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(
        "/admin/paperworks",
        buildPaperworkFormData({
          nameAr,
          nameEn,
          contractType,
          iconFile,
        }),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      ),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة ورقة العمل بنجاح");
      setOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["paperworks"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة ورقة العمل");
    },
  });

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleSubmit = () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    mutate();
  };

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={<SettingsAddTrigger />}
      title="عنصر جديد"
      onSubmit={handleSubmit}
      submitLabel="حفظ"
      isPending={isPending}
    >
      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم بالعربية</SettingsFieldLabel>
        <Input
          placeholder="أدخل الاسم بالعربية ..."
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم بالإنجليزية</SettingsFieldLabel>
        <Input
          placeholder="Enter English name ..."
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className={settingsFieldClass}
          dir="ltr"
        />
      </label>

      <PaperworkIconField file={iconFile} onFileChange={setIconFile} />

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>نوع العقد</SettingsFieldLabel>
        <Select dir="rtl" value={contractType} onValueChange={setContractType}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="housing">سكني</SelectItem>
            <SelectItem value="commercial">تجاري</SelectItem>
          </SelectContent>
        </Select>
      </label>
    </SettingsFormDialog>
  );
}
