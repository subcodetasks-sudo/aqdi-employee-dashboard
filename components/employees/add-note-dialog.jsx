"use client"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog";
import { FilePenLine, Plus, X } from 'lucide-react';
import { useState } from 'react';
import AddNoteForm from './add-note-form';
import { OutlineActionButton } from '@/components/roles-and-employees/shared';

export default function AddNoteDialog({ employee, variant = "primary" }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog dir='rtl' open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "outline" ? (
          <OutlineActionButton className="h-9 gap-1.5 px-4 text-13">
            <FilePenLine className="size-4" />
            إضافة ملاحظة
          </OutlineActionButton>
        ) : (
          <Button className="bg-black text-white">
            <FilePenLine />
            إضافة ملاحظة
          </Button>
        )}
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-3xl">
        <DialogHeader>
          <div dir='rtl' className='flex items-center justify-between  border-b pb-4'>
            {/* header and close button */}
            <h2 className='text-xl font-bold'>إضافة ملاحظة جديدة</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className='w-4 h-4' />
            </Button>
          </div>
          <AddNoteForm employee={employee} onSuccess={() => setOpen(false)} />

        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
