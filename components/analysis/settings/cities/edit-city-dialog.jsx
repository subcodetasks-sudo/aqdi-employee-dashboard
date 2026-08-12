"use client"
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog"
import { Loader2, X } from 'lucide-react'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SETTINGS_EDIT_TRIGGER_CLASS } from '@/components/SystemSettings/shared';
export default function EditCityDialog({city}) {
  const [open, setOpen] = useState(false);
  const [cityName, setCityName] = useState(city?.name_ar);
  const [regionType, setRegionType] = useState(String(city?.regions?.id));
  const queryClient = useQueryClient();

  // get regions
  function getRegions() {
    return axiosInstance.get("/admin/regions");
  }
  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  })
  const data = regions?.data?.data?.items

  // add new city
  function editCity() {
    return axiosInstance.post(`/admin/cities/${city?.id}`, {
      name_ar: cityName,
      region_id: regionType,
    })
  }
  const {mutate: editCityMutate, isPending: editCityPending} = useMutation({
    mutationFn: editCity,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تعديل مدينة بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل مدينة");
    }
  })

  const handleSubmit = () => {
    editCityMutate();

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
            <h2 className='text-xl font-bold'>تعديل مدينة</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className='w-4 h-4' />
            </Button>
          </div>
          <div dir='rtl' className='space-y-4 text-right'>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                اسم المدينة <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="اكتب هنا ..."
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className='h-12'
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                المنطقة <span className="text-red-500">*</span>
              </label>
              <Select
                value={regionType}
                onValueChange={setRegionType}
                dir='rtl'
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="اختر نوع الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  {data?.map((region) => (
                    <SelectItem key={region.id} value={String(region.id)}>
                      {region.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>



            {/* زر الإضافة */}
             <Button
              disabled={editCityPending}
              onClick={handleSubmit}
              className="mx-auto block  h-12 bg-brand-hover"
            >
              {editCityPending ? <Loader2 className='animate-spin'/> : "تعديل"}
            </Button> 
          </div>

        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
