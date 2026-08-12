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
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PaperworkIconField from "@/components/analysis/settings/paperworks/paperwork-icon-field";
import { buildPaperworkFormData } from "@/components/analysis/settings/paperworks/paperwork-form-data";
import { Loader2, X } from "lucide-react";
import { SettingsAddTrigger } from "@/components/SystemSettings/shared";
import { useState } from "react";
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
        },
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

  return (
    <Dialog
      dir="rtl"
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <SettingsAddTrigger>إضافة</SettingsAddTrigger>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-6">
            <h2 className="text-xl font-bold">إضافة ورقة عمل</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4 text-right">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                الاسم بالعربية <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="أدخل الاسم بالعربية ..."
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
                placeholder="Enter English name ..."
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="h-12"
                dir="ltr"
              />
            </div>

            <PaperworkIconField file={iconFile} onFileChange={setIconFile} />

            <div className="space-y-2">
              <label className="text-sm font-medium">
                نوع العقد <span className="text-red-500">*</span>
              </label>
              <Select dir="rtl" value={contractType} onValueChange={setContractType}>
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
              disabled={isPending || !nameAr.trim() || !nameEn.trim()}
              onClick={() => mutate()}
              className="mx-auto block h-12 bg-brand-hover"
            >
              {isPending ? <Loader2 className="animate-spin" /> : "إضافة"}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
