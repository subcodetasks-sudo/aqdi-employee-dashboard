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
export default function AddNewPropertyUsageDialog() {
  const [open, setOpen] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const queryClient = useQueryClient();

  function addNewProperty() {
    return axiosInstance.post("/admin/real-estate-usages", {
      name_ar: propertyName,
      contract_type: propertyType,
    })
  }

  const {mutate: addNewPropertyMutate, isPending: addNewPropertyPending} = useMutation({
    mutationFn: addNewProperty,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة استخدام العقار بنجاح");
      setOpen(false);
      setPropertyName("");
      setPropertyType("");
      queryClient.invalidateQueries({ queryKey: ["property-usage"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة استخدام العقار");
    }
  })

  const handleSubmit = () => {
    addNewPropertyMutate();

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
            <h2 className='text-xl font-bold'>إضاة استخدام جديد</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className='w-4 h-4' />
            </Button>
          </div>
          <div dir='rtl' className='space-y-4 text-right'>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                 استخدام العقار <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="اكتب هنا ..."
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className='h-12'
              />
            </div>

            {/* تصنيف الوحدة */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                تصنيف العقار <span className="text-red-500">*</span>
              </label>

              <Select dir='rtl' onValueChange={setPropertyType}>
                <SelectTrigger className='h-12'>
                  <SelectValue placeholder="اختر  العقار سكني - تجاري ..." />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="housing">سكني</SelectItem>
                  <SelectItem value="commercial">تجاري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* زر الإضافة */}
            <Button
              disabled={addNewPropertyPending}
              onClick={handleSubmit}
              className="mx-auto block  h-12 bg-brand-hover"
            >
              {addNewPropertyPending ? <Loader2 className='animate-spin'/> : "إضافة"}
            </Button>
          </div>

        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
