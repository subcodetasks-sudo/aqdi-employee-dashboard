"use client"
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog"
import { Loader2, X } from 'lucide-react'
import { SettingsAddTrigger } from '@/components/SystemSettings/shared'
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from '@/src/utils/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
export default function AddNewUsageDialog() {
  const [open, setOpen] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [unitType, setUnitType] = useState("");

  const queryClient = useQueryClient();

  function addNewUsage() {
    return axiosInstance.post("/admin/unit-usages", {
      name_ar: unitName,
      contract_type: unitType,
    })
  }

  const {mutate: addNewUsageMutate, isPending: addNewUsagePending} = useMutation({
    mutationFn: addNewUsage,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة استخدام الوحدة بنجاح");
      setOpen(false);
      setUnitName("");
      setUnitType("");

      queryClient.invalidateQueries({ queryKey: ["unit-usages"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة نوع الوحدة");
    }
  })

  const handleSubmit = () => {
    addNewUsageMutate();

  };
  return (
    <Dialog dir='rtl' open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SettingsAddTrigger>إضافة</SettingsAddTrigger>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-3xl">
        <DialogHeader>
          <div className='flex items-center justify-between  border-b pb-6'>
            {/* header and close button */}
            <h2 className='text-xl font-bold'>إضافة استخدام جديد</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className='w-4 h-4' />
            </Button>
          </div>
          <div dir='rtl' className='space-y-4 text-right'>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                استخدام الوحدة <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="اكتب هنا ..."
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                className='h-12'
              />
            </div>

            {/* تصنيف الوحدة */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                تصنيف الوحدة <span className="text-red-500">*</span>
              </label>

              <Select dir='rtl' onValueChange={setUnitType}>
                <SelectTrigger className='h-12'>
                  <SelectValue placeholder="اختر نوع الوحدة سكني - تجاري ..." />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="housing">سكني</SelectItem>
                  <SelectItem value="commercial">تجاري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* زر الإضافة */}
            <Button
              disabled={addNewUsagePending}
              onClick={handleSubmit}
              className="mx-auto block  h-12 bg-brand-hover"
            >
              {addNewUsagePending ? <Loader2 className='animate-spin'/> : "إضافة"}
            </Button>
          </div>

        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
