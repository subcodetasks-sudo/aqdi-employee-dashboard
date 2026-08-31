"use client"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import AddEmployeeForm from './add-employee-form';
import { OutlineActionButton } from '@/components/roles-and-employees/shared';

export default function AddNewEmployeeDialog({
  isEdit = false,
  employee,
  table = false,
  triggerVariant = "primary",
}) {
  const [open, setOpen] = useState(false);

  const renderTrigger = () => {
    if (isEdit) {
      if (triggerVariant === "outline-edit") {
        return <OutlineActionButton variant="edit">تعديل</OutlineActionButton>;
      }

      if (triggerVariant === "outline-plain") {
        return (
          <OutlineActionButton className="h-9 gap-1.5 px-4 text-13">
            <Pencil className="size-4" />
            تعديل
          </OutlineActionButton>
        );
      }

      return (
        <button
          type="button"
          className={
            table
              ? "flex size-9 items-center justify-center rounded-full bg-[#E6FFE6] text-brand-accent transition-colors hover:bg-brand-accent hover:text-white dark:bg-emerald-500/15 dark:text-emerald-300"
              : "inline-flex items-center gap-2 rounded-full bg-brand-hover px-5 py-2.5 text-13 font-bold text-white transition-colors hover:bg-brand-hover/90"
          }
        >
          <Pencil className="size-4" />
          {!table && "تعديل"}
        </button>
      );
    }

    if (triggerVariant === "outline-add") {
      return (
        <OutlineActionButton className="h-10 px-5 text-13">+ إضافة موظف</OutlineActionButton>
      );
    }

    return (
      <button
        type="button"
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-brand-hover px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover/90"
      >
        + إضافة موظف
        <UserPlus className="size-4" />
      </button>
    );
  };

  const title = isEdit ? "تعديل بيانات الموظف" : "إضافة موظف جديد";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
      <DialogContent
        dir="rtl"
        closeButton={false}
        className="max-w-[min(760px,calc(100vw-2rem))] max-h-[min(92vh,940px)] overflow-y-auto no-scrollbar rounded-[28px] border-0 p-0 bg-white text-foreground dark:bg-[#0F1C16] dark:text-white"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#F0F0F0] bg-white px-6 pb-4 pt-6 dark:border-white/10 dark:bg-[#0F1C16]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-hover/10 text-brand-hover dark:bg-emerald-500/15 dark:text-emerald-300">
              {isEdit ? <Pencil className="size-4" /> : <UserPlus className="size-4" />}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-black dark:text-white">{title}</h2>
              <p className="text-[11px] font-semibold text-[#8A8A84] dark:text-white/45">
                بيانات الموظف والصلاحيات الوظيفية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="إغلاق"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-ink-placeholder transition-all hover:bg-[#FFEBEB] hover:text-[#E24444] dark:bg-white/10 dark:text-white/60 dark:hover:bg-[#3F1D1D] dark:hover:text-[#FCA5A5]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <AddEmployeeForm isEdit={isEdit} employee={employee} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
