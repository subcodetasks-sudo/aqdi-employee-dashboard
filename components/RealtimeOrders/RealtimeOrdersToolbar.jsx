"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  Link2,
  Moon,
  PanelLeft,
  Search,
  Settings2,
  Sun,
  Tags,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TableSettingsPopover } from "@/components/shared/controllable-table";
import { useSidebarStore } from "@/src/stores/sidebar-store";
import { STATUS_FILTER_PILLS } from "./mock-data";
import MoreFiltersPopover from "./MoreFiltersPopover";
import { RT } from "./theme";

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// Per-filter active colors mirroring design.html's #qb-done/#qb-cancelled/#qb-refunded
const PILL_ACTIVE_COLOR = {
  authenticated: RT.success,
  done: RT.success,
  canceled: RT.danger,
  cancelled: RT.danger,
  returned: RT.refunded,
  incomplete: RT.warning,
};

const WEEKDAYS_AR = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

function formatDateTime(date) {
  const day = WEEKDAYS_AR[date.getDay()];
  const d = date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const t = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return { day, stamp: `${d} - ${t}`, timeOnly: t };
}

export default function RealtimeOrdersToolbar({
  searchQuery,
  onSearchChange,
  activeFilters = [],
  onToggleFilter,
  filterPills = STATUS_FILTER_PILLS,
  extraStatuses = [],
  extraStatusId,
  onExtraStatusChange,
  contractType,
  onContractTypeChange,
  columns,
  density,
  onDensityChange,
  visibleColumns,
  onToggleColumn,
  onExport,
  isExporting = false,
  canExport = true,
  dark = false,
  onToggleTheme,
  onOpenPaymentLink,
  title = "الطلبات مباشرة",
  searchPlaceholder = "بحث برقم الطلب / الجوال / الاسم...",
  canManageStatuses = false,
  onManageStatuses,
}) {
  const now = useLiveClock();
  const { day, stamp, timeOnly } = formatDateTime(now);
  const {
    displayedPart,
    setDisplayedPart,
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
  } = useSidebarStore();

  const openNotifications = () => {
    if (displayedPart === "notification") {
      setDisplayedPart("default");
    } else {
      setSidebarOpen(true);
      setDisplayedPart("notification");
    }
  };

  const openPayments = () => {
    if (displayedPart === "payments") {
      setDisplayedPart("default");
    } else {
      setSidebarOpen(true);
      setDisplayedPart("payments");
    }
  };

  // Matches design.html .fbtn/.bell — 40px, rounded-xl (12px), white bg,
  // thin #E3E8E6 border, hover tints toward the brand green.
  const roundBtn = cn(
    "size-8 rounded-xl flex items-center justify-center transition-all shrink-0 border",
    dark
      ? "border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.1]"
      : "border-[#E3E8E6] bg-white text-[#33403B] hover:border-[#CDEBDF] hover:text-[#0B5F4C]"
  );

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {/* Page title row — matches Figma header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"}
            aria-expanded={isSidebarOpen}
            className={cn(roundBtn, "hidden max-[1200px]:flex")}
          >
            <PanelLeft className="size-[18px]" />
          </button>

          <div className="min-w-0 relative">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={dark ? "الوضع الفاتح" : "الوضع الداكن"}
              className={roundBtn + " absolute -top-1 -left-10 z-10"}
            >
              {dark ? (
                <Sun className="size-[17px] text-amber-300" />
              ) : (
                <Moon className="size-[17px]" />
              )}
            </button>
            <h1
              className={cn(
                "text-[22px] sm:text-[24px] font-black leading-none tracking-tight",
                dark ? "text-white" : "text-[#22302C]"
              )}
            >
              {title}
            </h1>
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-[12px] font-medium",
                dark ? "text-white/45" : "text-[#8A8A84]"
              )}
            >
              <CalendarDays className="size-3.5 shrink-0 opacity-90" />
              <span className="tabular-nums rounded-2xl ">
                {day}               <span
                  className={cn(
                    "inline-flex items-center gap-1.5 h-4 px-1 py-1 rounded-full text-[9px] font-bold border",
                    dark
                      ? "bg-[#10B981]/15 text-[#6EE7B7] border-transparent"
                      : "text-[#0E7A5C] bg-[#E7F5EF] border-[#CFE9DE]"
                  )}
                >
                  <span className="relative flex size-1 text-xs">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-60" />
                    <span className="relative inline-flex rounded-full size-1 bg-[#10B981]" />
                  </span>
                  قيد المزامنة
                  <span className="opacity-70 font-medium tabular-nums">{timeOnly}</span>
                </span>
              </span>
            </p>
          </div>
        </div>
        <div
          className={cn(
            "rounded-2xl px-3 py-3 sm:px-3.5 flex items-start gap-2.5 flex-wrap",
            dark
              ? "bg-[#0F1C16] border-white/[0.08]"
              : ""
          )}
        >
          {/* Filter pills — mirrors design.html .qsb quick-stat buttons: rounded-xl (12px), thin border, per-status active color */}
          <div className="flex items-center gap-2 flex-wrap">
            {filterPills.map((pill) => {
              const active = activeFilters.includes(pill.id);
              const Icon = pill.Icon;
              const activeColor = PILL_ACTIVE_COLOR[pill.id] || RT.brand;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => onToggleFilter?.(pill.id)}
                  className={cn(
                    "h-[40px] px-3.5 rounded-xl text-[12.5px] font-bold border transition-all flex items-center gap-1.5",
                    active
                      ? "text-white border-transparent shadow-sm"
                      : dark
                        ? "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"
                        : "border-[#E3E8E6] bg-white text-[#33403B] hover:border-[#CFD6D2] hover:bg-[#F7FAF9]"
                  )}
                  style={active ? { backgroundColor: activeColor } : undefined}
                >
                  <Icon className="size-3.5" strokeWidth={2.25} />
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Search — matches design.html .search (12px radius, white bg, #E3E8E6 border) */}
          <div className="relative flex-1 min-w-[180px] max-w-none sm:max-w-[320px] md:max-w-[380px]">
            <Search
              className={cn(
                "absolute right-3.5 top-1/2 -translate-y-1/2 size-[17px]",
                dark ? "text-white/35" : "text-[#8A8A84]"
              )}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "w-full h-[40px] rounded-xl pr-10 pl-9 text-[12.5px] transition-colors focus:outline-none",
                dark
                  ? "bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 focus:border-[#34D399]/40"
                  : "bg-white border border-[#E3E8E6] text-[#22302C] placeholder:text-[#8A8A84] focus:border-[#0E5F4E]"
              )}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                aria-label="مسح البحث"
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 size-5 rounded-full flex items-center justify-center",
                  dark
                    ? "text-white/40 hover:bg-white/10"
                    : "text-[#9CA3AF] hover:bg-[#E5E7EB]"
                )}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          {/* Utility actions — gear, filter, CSV, bell, card, link */}
          <div className="flex items-center gap-2 mr-auto flex-wrap">
            <TableSettingsPopover
              columns={columns}
              density={density}
              onDensityChange={onDensityChange}
              visibleColumns={visibleColumns}
              onToggleColumn={onToggleColumn}
              align="end"
              triggerClassName={roundBtn}
              TriggerIcon={Settings2}
            />

            <MoreFiltersPopover
              statuses={extraStatuses}
              extraStatusId={extraStatusId}
              onExtraStatusChange={onExtraStatusChange}
              contractType={contractType}
              onContractTypeChange={onContractTypeChange}
              triggerClassName={roundBtn}
              dark={dark}
            />

            {canManageStatuses ? (
              <button
                type="button"
                onClick={onManageStatuses}
                aria-label="إدارة الحالات"
                title="إدارة الحالات"
                className={roundBtn}
              >
                <Tags className="size-[17px]" />
              </button>
            ) : null}

            {canExport ? (
              <button
                type="button"
                onClick={onExport}
                disabled={isExporting}
                className={cn(
                  "h-[40px] px-3.5 rounded-xl border font-bold text-[12.5px] flex items-center gap-1.5 transition-all disabled:opacity-60",
                  dark
                    ? "border-[#34D399]/35 text-[#6EE7B7] hover:bg-[#10B981]/10"
                    : "border-[#E3E8E6] text-[#33403B] bg-white hover:border-[#CDEBDF] hover:text-[#0B5F4C]"
                )}
              >
                <FileSpreadsheet className="size-3.5" />
                {isExporting ? "جاري التصدير..." : "تصدير CSV"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={openNotifications}
              aria-label="الإشعارات"
              className={cn(
                roundBtn,
                displayedPart === "notification" &&
                "!bg-[#0E5F4E] !text-white !border-[#0E5F4E]"
              )}
            >
              <Bell className="size-[17px]" />
            </button>

            <button
              type="button"
              onClick={openPayments}
              aria-label="إشعارات الدفع"
              title="إشعارات الدفع"
              className={cn(
                roundBtn,
                displayedPart === "payments" &&
                "!bg-[#0E5F4E] !text-white !border-[#0E5F4E]"
              )}
            >
              <CreditCard className="size-[17px]" />
            </button>

            <button
              type="button"
              onClick={() => onOpenPaymentLink?.()}
              aria-label="توليد رابط دفع"
              title="توليد رابط دفع"
              className={roundBtn}
            >
              <Link2 className="size-[17px]" />
            </button>
          </div>
        </div>

      </div>


    </div>
  );
}
