"use client";

import PaperworkIconField from "@/components/analysis/settings/paperworks/paperwork-icon-field";
import {
  buildPaperworkFormData,
  extractPaperwork,
} from "@/components/analysis/settings/paperworks/paperwork-form-data";
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
import { SETTINGS_EDIT_TRIGGER_CLASS } from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditPaperworkDialog({ paperwork }) {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState(paperwork?.name_ar || "");
  const [nameEn, setNameEn] = useState(paperwork?.name_en || "");
  const [contractType, setContractType] = useState(paperwork?.contract_type || "housing");
  const [iconFile, setIconFile] = useState(null);
  const [iconUrl, setIconUrl] = useState(paperwork?.icon_url || null);
  const queryClient = useQueryClient();

  const { data: paperworkDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["paperwork", paperwork?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/paperworks/${paperwork.id}`);
      return extractPaperwork(res.data);
    },
    enabled: open && !!paperwork?.id,
    staleTime: 0,
  });

  useEffect(() => {
    if (!open) return;

    const source = paperworkDetails ?? paperwork;
    setNameAr(source?.name_ar || "");
    setNameEn(source?.name_en || "");
    setContractType(source?.contract_type || "housing");
    setIconUrl(source?.icon_url || null);
    setIconFile(null);
  }, [open, paperwork, paperworkDetails]);

  const invalidatePaperworks = () => {
    queryClient.invalidateQueries({ queryKey: ["paperworks"] });
    queryClient.invalidateQueries({ queryKey: ["paperwork", paperwork?.id] });
  };

  const { mutate: deleteIcon, isPending: isDeletingIcon } = useMutation({
    mutationFn: () =>
      axiosInstance.post(
        `/admin/paperworks/${paperwork?.id}`,
        buildPaperworkFormData({
          nameAr,
          nameEn,
          contractType,
          deleteIcon: true,
        }),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      ),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف الأيقونة بنجاح");
      setIconUrl(null);
      setIconFile(null);
      invalidatePaperworks();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف الأيقونة");
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(
        `/admin/paperworks/${paperwork?.id}`,
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
      toast.success(res?.data?.message || "تم تعديل ورقة العمل بنجاح");
      setOpen(false);
      invalidatePaperworks();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل ورقة العمل");
    },
  });

  const handleRemoveIcon = () => {
    if (iconFile) {
      setIconFile(null);
      setIconUrl(paperworkDetails?.icon_url || paperwork?.icon_url || null);
      return;
    }

    if (iconUrl) {
      deleteIcon();
    }
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
      onOpenChange={setOpen}
      trigger={
        <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
          تعديل
        </button>
      }
      title="تعديل العنصر"
      onSubmit={handleSubmit}
      submitLabel="حفظ"
      isPending={isPending || isLoadingDetails}
    >
      {isLoadingDetails ? (
        <p className="text-[12px] font-medium text-[#6B7280]">جاري تحميل البيانات...</p>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم بالعربية</SettingsFieldLabel>
        <Input
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم بالإنجليزية</SettingsFieldLabel>
        <Input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className={settingsFieldClass}
          dir="ltr"
        />
      </label>

      <PaperworkIconField
        iconUrl={iconUrl}
        file={iconFile}
        onFileChange={setIconFile}
        onRemove={handleRemoveIcon}
        isRemoving={isDeletingIcon}
      />

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel>نوع العقد</SettingsFieldLabel>
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
