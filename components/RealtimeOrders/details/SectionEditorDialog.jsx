"use client";

import { Pencil, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDialogFormSession } from "@/src/hooks/use-dialog-form-session";
import { SectionEditorProvider } from "./section-editor-context";

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
  const resetKey = useDialogFormSession(open, null);
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        closeButton={false}
        className="max-w-[min(720px,calc(100vw-2rem))] max-h-[min(92vh,920px)] overflow-y-auto rounded-[28px] border-0 p-0 bg-white dark:bg-[#0F1C16] text-foreground dark:text-white"
      >
        <DialogTitle className="sr-only">{TITLES[section] || "تعديل البيانات"}</DialogTitle>

        <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F0] px-6 pb-4 pt-6 dark:border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: GOLD }}
            >
              <Pencil className="size-4" />
            </span>
            <h2 className="text-lg font-black text-black dark:text-white truncate">
              {TITLES[section] || "تعديل البيانات"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-ink-placeholder transition-all hover:bg-[#FFEBEB] hover:text-[#E24444] dark:bg-white/10 dark:text-white/60 dark:hover:bg-[#3F1D1D] dark:hover:text-[#FCA5A5]"
          >
            <X className="size-4" />
          </button>
        </div>

        <SectionEditorProvider onClose={handleClose} resetKey={resetKey}>
          <div key={`${section ?? "none"}-${resetKey}`} className="px-6 py-5 dark:text-white">
            {open ? children : null}
          </div>
        </SectionEditorProvider>
      </DialogContent>
    </Dialog>
  );
}
