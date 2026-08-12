"use client"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { SETTINGS_VIEW_TRIGGER_CLASS } from '@/components/SystemSettings/shared';
import { useState } from 'react';

export default function DisplayMessageForPropertyDialog({ messageAlert }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog dir='rtl' open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={SETTINGS_VIEW_TRIGGER_CLASS}>
          عرض
        </button>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-3xl">
        <DialogHeader>
          <div className='flex items-center justify-between border-b pb-6'>
            {/* header and close button */}
            <h2 className='text-xl font-bold'>عرض رســالة توضيحية جديدة</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className='w-4 h-4' />
            </Button>
          </div>

          <div className='space-y-4'>
            <div className='bg-gray-200 p-4 rounded space-y-4'>
              <div className='flex items-center justify-between'>
                <p>القسم</p>
                <p>{messageAlert?.section?.name_ar || messageAlert?.section?.name_en || '---'}</p>
              </div>
              <div className='flex items-center justify-between'>
                <p>بند القسم</p>
                <span className='block text-sm bg-blue-500/20 text-blue-500 p-2 rounded-md'>
                  {messageAlert?.section_item?.name_ar || messageAlert?.section_item?.name_en || '---'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <p>الرسالة التوضيحية</p>
                <p>{messageAlert?.message || '---'}</p>
              </div>
            </div>

            {/* زر الإغلاق */}
            <Button
              onClick={() => setOpen(false)}
              className="mx-auto block h-12 bg-brand-hover"
            >
              اغلاق
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
