"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/src/stores/sidebar-store";

export default function SystemSettingsHeader({ activeTab }) {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  const crumbs = ["الموقع والتطبيق", "الفئات"];
  if (activeTab === "contracts") {
    crumbs.push("إعدادات العقود");
  }

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"}
        aria-expanded={isSidebarOpen}
        className={cn(
          "inline-flex items-center justify-center size-[42px] rounded-full border shrink-0 transition-colors",
          "border-[#E4EBE8] bg-white text-[#4B5563] hover:bg-[#E8F5F1] hover:text-[#054D44]",
          "dark:border-white/10 dark:bg-[#0F1C16] dark:text-white/70 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
        )}
      >
        <PanelLeft className="size-[18px]" />
      </button>

      <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold leading-tight text-gray-900 dark:text-white">
            إعدادات النظام
          </h1>
          <p className="mt-1.5 text-13 font-medium text-gray-400 dark:text-white/45">
            {crumbs.join(" • ")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-surface-border-soft bg-white text-13 font-semibold text-status-neutral hover:bg-[#F9FAFB] hover:text-[#054D44] transition-colors dark:bg-card dark:border-white/10 dark:text-white/60 dark:hover:text-white"
        >
          رجوع
          <ChevronLeft className="size-4" />
        </button>
      </div>
    </div>
  );
}
