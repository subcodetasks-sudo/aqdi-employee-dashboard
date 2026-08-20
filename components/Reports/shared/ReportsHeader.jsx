"use client";

import { FileDown, FileText, Mail, PanelLeft, Printer } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/src/stores/sidebar-store";

const ACTIONS = [
  { id: "print", label: "طباعة", icon: Printer },
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "csv", label: "تصدير CSV", icon: FileDown },
  { id: "email", label: "بريد", icon: Mail },
];

export default function ReportsHeader({ lastUpdated }) {
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  const handleAction = (id) => {
    toast.success(`${ACTIONS.find((a) => a.id === id)?.label} (واجهة تجريبية)`);
  };

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
            "border-[#E4EBE8] bg-white text-[#4B5563] hover:bg-[#E8F5F1] hover:text-[#0B5345]",
            "dark:border-white/10 dark:bg-[#0F1C16] dark:text-white/70 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
          )}
        >
          <PanelLeft className="size-[18px]" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] text-[#9CA3AF] mb-1">
            <span>الطلبات</span>
            <span>›</span>
            <span className="text-[#6B7280] dark:text-white/60">التقارير</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-white">التقارير</h1>
          {lastUpdated && (
            <p className="text-[12px] text-[#9CA3AF] mt-1">
              آخر تحديث للبيانات: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ACTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleAction(id)}
            className="h-9 px-4 rounded-lg border border-[#E6EBE9] bg-white text-[13px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors flex items-center gap-2 dark:bg-[#13241C] dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
          >
            <Icon className="size-4 text-[#6B7280] dark:text-white/50" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
