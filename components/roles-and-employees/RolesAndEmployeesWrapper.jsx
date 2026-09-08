"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/src/stores/sidebar-store";
import { usePermissions } from "@/src/hooks/usePermissions";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import EmployeesListPage from "@/components/employees/EmployeesListPage";
import Roles from "@/components/Roles/Roles";
import Salaries from "@/components/salaries/Salaries";
import EmployeeKpisBoard from "./EmployeeKpisBoard";

const TABS = [
  { value: "roles", label: "الأدوار", section: PERMISSION_SECTIONS.roles, Component: Roles },
  { value: "employees", label: "الموظفون", section: PERMISSION_SECTIONS.employees, Component: EmployeesListPage },
  { value: "salaries", label: "رواتب الموظفين", section: PERMISSION_SECTIONS.employee_salaries, Component: Salaries },
  { value: "performance", label: "مؤشرات الموظفين", section: PERMISSION_SECTIONS.employee_kpis, Component: EmployeeKpisBoard },
];

export default function RolesAndEmployeesWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { can, isReady } = usePermissions();
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  const visibleTabs = useMemo(
    () =>
      isReady
        ? TABS.filter((tab) => !tab.section || can(tab.section, "view"))
        : [],
    [can, isReady]
  );

  const requestedTab = searchParams.get("tab");
  const activeTab = visibleTabs.some((tab) => tab.value === requestedTab)
    ? requestedTab
    : visibleTabs[0]?.value;

  const setActiveTab = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const ActiveComponent = visibleTabs.find((t) => t.value === activeTab)?.Component;

  return (
    <div
      className="flex flex-col gap-5 min-h-full transition-colors dark:bg-transparent"
      dir="rtl"
    >
      <div className="flex items-start gap-3">
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

        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-status-neutral hover:text-brand-dark transition-colors dark:text-white/55 dark:hover:text-emerald-300"
          >
            <ChevronLeft className="size-4 shrink-0" />
            رجوع
          </button>

          <div>
            <h1 className="text-22 font-bold text-gray-900 leading-tight mb-1 dark:text-white">
              الموظفون والأدوار
            </h1>
            <p className="text-13 text-gray-400 font-medium dark:text-white/45">
              الأدوار والصلاحيات · الموظفون · الرواتب
            </p>
          </div>
        </div>
      </div>

      {visibleTabs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "h-10 px-5 rounded-full text-13 font-bold transition-all shrink-0",
                activeTab === tab.value
                  ? "bg-brand-dark text-white shadow-sm dark:bg-emerald-500 dark:text-[#0B1411]"
                  : "bg-white text-[#616161] border border-[#E5E7EB] hover:border-brand-dark/30 dark:bg-[#0F1C16] dark:text-white/65 dark:border-white/10 dark:hover:border-emerald-500/40"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {ActiveComponent ? <ActiveComponent /> : null}
    </div>
  );
}
