"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RT } from "../theme";

/**
 * Staff notes side panel matching the Figma drawer.
 */
export default function StaffNotesDrawer({
  open,
  onOpenChange,
  notes = [],
  draft,
  onDraftChange,
  onAdd,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[120]" dir="rtl">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => onOpenChange?.(false)}
      />

      <aside
        className={cn(
          "absolute inset-y-0 start-0 w-full max-w-[420px] bg-white dark:bg-[#0F1C16]",
          "shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        )}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EEF1F0] dark:border-white/10">
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            aria-label="إغلاق"
            className="size-9 rounded-full text-white flex items-center justify-center shrink-0 hover:brightness-110"
            style={{ backgroundColor: RT.brand }}
          >
            <X className="size-4" strokeWidth={2.5} />
          </button>
          <h2 className="text-[16px] font-black text-[#111827] dark:text-white">
            ملاحظات الموظفين
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[13px] font-bold text-[#9CA3AF] mb-3">
            ملاحظات الموظفين
          </p>
          {notes.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF]">لا ملاحظات بعد</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-xl border border-[#E6EBE9] dark:border-white/10 bg-[#F8FAF9] dark:bg-white/[0.04] p-3"
                >
                  <p className="text-[13px] font-medium text-[#111827] dark:text-white/90">
                    {note.text}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1.5">
                    {note.author} · {note.at}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[#EEF1F0] dark:border-white/10 p-4 flex items-stretch gap-2.5">
          <button
            type="button"
            onClick={onAdd}
            disabled={!draft?.trim()}
            className="h-auto min-h-[44px] px-5 rounded-xl text-white font-bold text-[13px] shrink-0 disabled:opacity-50 hover:brightness-110"
            style={{ backgroundColor: RT.brand }}
          >
            إضافة
          </button>
          <textarea
            value={draft}
            onChange={(e) => onDraftChange?.(e.target.value)}
            rows={2}
            placeholder="أضف ملاحظة ينتبه لها بقية الموظفين..."
            className={cn(
              "flex-1 resize-none rounded-xl border border-dashed px-3 py-2.5 text-[13px] focus:outline-none",
              "border-[#D1D5DB] bg-white text-[#111827] placeholder:text-[#9CA3AF]",
              "dark:border-white/15 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/35",
              "focus:border-[#0B5345]"
            )}
          />
        </div>
      </aside>
    </div>,
    document.body
  );
}
