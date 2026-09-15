"use client";

import { useRouter } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/src/stores/sidebar-store";

export default function SystemSettingsHeader({ activeTab }) {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  const crumb =
    activeTab === "contracts"
      ? "الموقع والتطبيق · الفئات · إعدادات العقود"
      : "الموقع والتطبيق · الفئات · إعدادات العقود";

  return (
    <div className="radm-head">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"}
        aria-expanded={isSidebarOpen}
        className={cn(
          "inline-flex items-center justify-center size-[42px] rounded-2xl border shrink-0 transition-colors",
          "border-[#E4EBE8] bg-white text-[#4B5563] hover:bg-[#E8F5F1] hover:text-brand-dark",
          "dark:border-white/10 dark:bg-[#0F1C16] dark:text-white/70 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
        )}
      >
        <PanelLeft className="size-[18px]" />
      </button>

      <button type="button" className="mkt-back" onClick={() => router.back()}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m15 6-6 6 6 6" />
        </svg>
        رجوع
      </button>

      <div className="radm-ttl">
        <b>إعدادات النظام</b>
        <small>{crumb}</small>
      </div>

      <div className="radm-kpis" />
    </div>
  );
}
