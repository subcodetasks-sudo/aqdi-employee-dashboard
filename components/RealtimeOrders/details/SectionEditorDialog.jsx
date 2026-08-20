"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        className="max-w-[min(1100px,calc(100vw-2rem))] max-h-[min(92vh,920px)] overflow-y-auto rounded-[28px] border-0 p-0"
      >
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-[#F0F0F0] dark:border-white/10">
          <DialogTitle className="text-[18px] font-black text-[#0B5345] dark:text-white">
            {TITLES[section] || "تعديل البيانات"}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
