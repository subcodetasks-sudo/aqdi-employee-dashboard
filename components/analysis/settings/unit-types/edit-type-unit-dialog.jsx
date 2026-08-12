"use client"
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog"
import { Loader2, X } from 'lucide-react'
import { SETTINGS_EDIT_TRIGGER_CLASS } from '@/components/SystemSettings/shared'
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
export default function EditTypeUnitDialog({unit}) {
  const [open, setOpen] = useState(false);
  const [unitName, setUnitName] = useState(unit?.name_ar);
  const [unitType, setUnitType] = useState(unit?.contract_type);

  const queryClient = useQueryClient();

  function editUnit() {
    return axiosInstance.post(`/admin/unit-types/${unit.id}`, {
      name_ar: unitName,
      contract_type: unitType,
    })
  }

  const { mutate: editUnitMutate, isPending: editUnitPending } = useMutation({
    mutationFn: editUnit,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة نوع الوحدة بنجاح");
      setOpen(false);
      setUnitName("");
      setUnitType("");

      queryClient.invalidateQueries({ queryKey: ["unit-types"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة نوع الوحدة");
    }
  })

  const handleSubmit = () => {
    editUnitMutate();

  };
  return (
    <Dialog dir='rtl' open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
          تعديل
        </button>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-3xl">
        <DialogHeader>
          <div className='flex items-center justify-between  border-b pb-6'>
            {/* header and close button */}
            <h2 className='text-xl font-bold'>تعديل نوع الوحدة</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className='w-4 h-4' />
            </Button>
          </div>
          <div dir='rtl' className='space-y-4 text-right'>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                نوع الوحدة <span className="text-red-500">*</span>
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

              <Select dir='rtl' defaultValue={unitType} onValueChange={setUnitType}>
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
              disabled={editUnitPending}
              onClick={handleSubmit}
              className="mx-auto block  h-12 bg-brand-hover"
            >
              {editUnitPending ? <Loader2 className='animate-spin' /> : "تعديل"}
            </Button>
          </div>

        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
