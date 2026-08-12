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
import { Loader2, X } from "lucide-react";
import { SettingsAddTrigger } from "@/components/SystemSettings/shared";
import { useState } from "react";
import { toast } from "sonner";

export default function AddPaymentTypeDialog() {
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [contractType, setContractType] = useState("housing");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post("/admin/payment-types/create", {
        name_ar: nameAr,
        name_en: nameEn,
        contract_type: contractType,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة طريقة الدفع بنجاح");
      setOpen(false);
      setNameAr("");
      setNameEn("");
      setContractType("housing");
      queryClient.invalidateQueries({ queryKey: ["payment-types"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة طريقة الدفع");
    },
  });

  return (
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SettingsAddTrigger>إضافة</SettingsAddTrigger>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-6">
            <h2 className="text-xl font-bold">إضافة طريقة دفع</h2>
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
