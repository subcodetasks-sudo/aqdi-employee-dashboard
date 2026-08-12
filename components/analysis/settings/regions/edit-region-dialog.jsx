"use client"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { axiosInstance } from '@/src/utils/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { SETTINGS_EDIT_TRIGGER_CLASS } from '@/components/SystemSettings/shared';
import { useState } from 'react';
import { toast } from 'sonner';
export default function EditRegionDialog({region}) {
  const [open, setOpen] = useState(false);
  const [regionName, setRegionName] = useState(region?.name_ar);

  const queryClient = useQueryClient();

  function editRegion() {
    return axiosInstance.post(`/admin/regions/${region?.id}`, {
      name_ar: regionName,
    })
  }

  const {mutate: editRegionMutate, isPending: editRegionPending} = useMutation({
    mutationFn: editRegion,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تعديل المنطقة بنجاح");
      setOpen(false);
      setRegionName("");
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل المنطقة");
    }
  })

  const handleSubmit = () => {
    editRegionMutate();

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
            <h2 className='text-xl font-bold'>تعديل المنطقة</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className='w-4 h-4' />
            </Button>
          </div>
          <div dir='rtl' className='space-y-4 text-right'>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                اسم المنطقة <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="اكتب هنا ..."
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                className='h-12'
              />
            </div>



            {/* زر الإضافة */}
            <Button
              disabled={editRegionPending}
              onClick={handleSubmit}
              className="mx-auto block  h-12 bg-brand-hover"
            >
              {editRegionPending ? <Loader2 className='animate-spin'/> : "تعديل"}
            </Button>
          </div>

        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
