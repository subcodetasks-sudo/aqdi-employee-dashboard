"use client";

import { FileDown, FileText, Mail, PanelLeft, Printer } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/src/stores/sidebar-store";

export default function ReportsHeader({ lastUpdated, onPrint, onExportPdf, onExportCsv }) {
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  const actions = [
    { id: "print", label: "طباعة", icon: Printer, onClick: onPrint },
    { id: "pdf", label: "PDF", icon: FileText, onClick: onExportPdf },
    { id: "csv", label: "تصدير CSV", icon: FileDown, onClick: onExportCsv },
    {
      id: "email",
      label: "بريد",
      icon: Mail,
      onClick: () => toast.message("إرسال التقرير بالبريد يتطلب دعم من الخادم — قيد التطوير"),
      pending: true,
    },
  ];

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"}
          aria-expanded={isSidebarOpen}
          className={cn(
            "inline-flex items-center justify-center size-[42px] rounded-full border shrink-0 transition-colors",
            "border-[#E4EBE8] bg-white text-[#4B5563] hover:bg-[#E8F5F1] hover:text-brand-dark",
            "dark:border-white/10 dark:bg-[#0F1C16] dark:text-white/70 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
          )}
        >
          <PanelLeft className="size-[18px]" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-13 text-gray-400 mb-1">
            <span>الطلبات</span>
            <span>›</span>
            <span className="text-status-neutral dark:text-white/60">التقارير</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التقارير</h1>
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              آخر تحديث للبيانات: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map(({ id, label, icon: Icon, onClick, pending }) => (
          <button
            key={id}
            type="button"
            onClick={onClick}
            className="h-9 px-4 rounded-lg border border-surface-border-soft bg-white text-13 font-semibold text-gray-700 hover:bg-[#F9FAFB] transition-colors flex items-center gap-2 dark:bg-card dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
          >
            <Icon className="size-4 text-status-neutral dark:text-white/50" />
            <span>{label}</span>
            {pending ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300">
                قيد التطوير
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
