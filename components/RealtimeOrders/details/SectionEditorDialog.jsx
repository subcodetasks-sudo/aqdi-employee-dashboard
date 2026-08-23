"use client";

import { Pencil, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const GOLD = "#B8860B";

const TITLES = {
  deed: "الصك والملاك",
  address: "تفاصيل العقار",
  tenant: "العقد - المستأجر",
  financial: "البيانات المالية - الشروط",
  units: "تفاصيل الوحدات",
};

export default function SectionEditorDialog({
  open,
  onOpenChange,
  section,
  children,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        closeButton={false}
        className="max-w-[min(720px,calc(100vw-2rem))] max-h-[min(92vh,920px)] overflow-y-auto rounded-[28px] border-0 p-0"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="إغلاق"
          className="absolute end-5 top-5 flex size-9 items-center justify-center rounded-full bg-[#F5F5F5] text-[#A3A3A3] transition-all hover:bg-[#FFEBEB] hover:text-[#E24444] dark:bg-white/10 dark:text-white/60"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-[#F0F0F0] px-6 pb-4 pt-6 ps-16 dark:border-white/10">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: GOLD }}
          >
            <Pencil className="size-4" />
          </span>
          <DialogTitle className="text-[18px] font-black text-black dark:text-white">
            {TITLES[section] || "تعديل البيانات"}
          </DialogTitle>
        </div>

        <div className="px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
