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
import { getInstrumentTypeOptions } from "@/src/lib/instrument-types";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SETTINGS_EDIT_TRIGGER_CLASS } from "@/components/SystemSettings/shared";

export default function EditDurationDialog({ duration }) {
  const [open, setOpen] = useState(false);
  const [durationName, setDurationName] = useState(duration?.period || "");
  const [price, setPrice] = useState(duration?.price != null ? String(duration.price) : "");
  const [durationType, setDurationType] = useState(duration?.contract_type || "housing");
  const [instrumentType, setInstrumentType] = useState(duration?.instrument_type || "");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setDurationName(duration?.period || "");
    setPrice(duration?.price != null ? String(duration.price) : "");
    setDurationType(duration?.contract_type || "housing");
    setInstrumentType(duration?.instrument_type || "");
  }, [open, duration]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(`/admin/contract-periods/${duration?.id}`, {
        period: durationName,
        price: Number(price),
        contract_type: durationType,
        instrument_type: instrumentType,
        note_ar: durationName,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تعديل المدة بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["contract-periods"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل المدة");
    },
  });

  const canSubmit =
    durationName.trim() && price.trim() && instrumentType && Number.isFinite(Number(price));

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
            <h2 className="text-xl font-bold">تعديل المدة</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div dir="rtl" className="flex gap-4 items-center text-right">
              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  مدة العقد <span className="text-red-500">*</span>
                </label>
                <Input
                  value={durationName}
                  onChange={(e) => setDurationName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  السعر <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div dir="rtl" className="flex gap-4 items-center text-right">
              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  نوع العقد <span className="text-red-500">*</span>
                </label>
                <Select dir="rtl" value={durationType} onValueChange={setDurationType}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="housing">سكني</SelectItem>
                    <SelectItem value="commercial">تجاري</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 grow">
                <label className="text-sm font-medium">
                  تصنيف وثيقة الملكية <span className="text-red-500">*</span>
                </label>
                <Select dir="rtl" value={instrumentType} onValueChange={setInstrumentType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="إختر تصنيف وثيقة الملكية ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getInstrumentTypeOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              disabled={isPending || !canSubmit}
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
