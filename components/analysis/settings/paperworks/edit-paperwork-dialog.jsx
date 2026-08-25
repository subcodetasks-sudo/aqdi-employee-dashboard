"use client";

import PaperworkIconField from "@/components/analysis/settings/paperworks/paperwork-icon-field";
import {
  buildPaperworkFormData,
  extractPaperwork,
} from "@/components/analysis/settings/paperworks/paperwork-form-data";
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
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { SETTINGS_EDIT_TRIGGER_CLASS } from "@/components/SystemSettings/shared";
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
        },
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
        },
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

  return (
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
          تعديل
        </button>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-6">
            <h2 className="text-xl font-bold">تعديل ورقة العمل</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4 text-right">
            {isLoadingDetails ? (
              <p className="text-sm text-ink-placeholder py-2">جاري تحميل البيانات...</p>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                الاسم بالعربية <span className="text-red-500">*</span>
              </label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                الاسم بالإنجليزية <span className="text-red-500">*</span>
              </label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="h-12"
                dir="ltr"
              />
            </div>

            <PaperworkIconField
              iconUrl={iconUrl}
              file={iconFile}
              onFileChange={setIconFile}
              onRemove={handleRemoveIcon}
              isRemoving={isDeletingIcon}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">نوع العقد</label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="housing">سكني</SelectItem>
                  <SelectItem value="commercial">تجاري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              disabled={isPending || isLoadingDetails || !nameAr.trim() || !nameEn.trim()}
              onClick={() => mutate()}
              className="mx-auto block h-12 bg-brand-hover"
            >
              {isPending ? <Loader2 className="animate-spin" /> : "تعديل"}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
