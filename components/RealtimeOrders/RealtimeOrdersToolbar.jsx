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

  const roundBtn = cn(
    "size-[42px] rounded-full flex items-center justify-center transition-all shrink-0 border",
    dark
      ? "border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.1]"
      : "border-[#E4EBE8] bg-[#F3F6F5] text-[#4B5563] hover:bg-[#E8F0EC] hover:text-[#0B5345]"
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

          <div className="min-w-0">
            <h1
              className={cn(
                "text-[22px] sm:text-[24px] font-black leading-none tracking-tight",
                dark ? "text-white" : "text-[#0B5345]"
              )}
            >
              {title}
            </h1>
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-[12px] font-medium",
                dark ? "text-white/45" : "text-[#9CA3AF]"
              )}
            >
              <CalendarDays className="size-3.5 shrink-0 opacity-80" />
              <span className="tabular-nums">
                {day} {stamp}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 h-[32px] px-3 rounded-full text-[11.5px] font-bold",
              dark
                ? "bg-[#10B981]/15 text-[#6EE7B7]"
                : "bg-[#DCFCE7] text-[#15803D]"
            )}
          >
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-60" />
              <span className="relative inline-flex rounded-full size-2 bg-[#10B981]" />
            </span>
            قيد المزامنة
            <span className="opacity-70 font-medium tabular-nums">{timeOnly}</span>
          </span>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={dark ? "الوضع الفاتح" : "الوضع الداكن"}
            className={roundBtn}
          >
            {dark ? (
              <Sun className="size-[17px] text-amber-300" />
            ) : (
              <Moon className="size-[17px]" />
            )}
          </button>
        </div>
      </div>

      {/* Controls row */}
      <div
        className={cn(
          "rounded-[22px] border px-3 py-3 sm:px-3.5 flex items-center gap-2.5 flex-wrap",
          dark
            ? "bg-[#0F1C16] border-white/[0.08]"
            : "bg-white border-[#E6EBE9] shadow-[0_1px_2px_rgba(11,83,69,0.04)]"
        )}
      >
        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterPills.map((pill) => {
            const active = activeFilters.includes(pill.id);
            const Icon = pill.Icon;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onToggleFilter?.(pill.id)}
                className={cn(
                  "h-[40px] px-3.5 rounded-full text-[12.5px] font-bold border transition-all flex items-center gap-1.5",
                  active
                    ? "text-white border-transparent shadow-sm"
                    : dark
                      ? "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"
                      : "border-[#E6EBE9] bg-[#F5F8F7] text-[#374151] hover:border-[#0B5345]/30"
                )}
                style={active ? { backgroundColor: RT.brand } : undefined}
              >
                <Icon className="size-3.5" strokeWidth={2.25} />
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-none sm:max-w-[320px] md:max-w-[380px]">
          <Search
            className={cn(
              "absolute right-3.5 top-1/2 -translate-y-1/2 size-[17px]",
              dark ? "text-white/35" : "text-[#9CA3AF]"
            )}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "w-full h-[40px] rounded-full pr-10 pl-9 text-[12.5px] transition-colors focus:outline-none",
              dark
                ? "bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 focus:border-[#34D399]/40"
                : "bg-[#F5F8F7] border border-[#E6EBE9] text-[#111827] focus:border-[#0B5345] focus:bg-white"
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

          {canExport ? (
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className={cn(
              "h-[40px] px-3.5 rounded-full border font-bold text-[12.5px] flex items-center gap-1.5 transition-all disabled:opacity-60",
              dark
                ? "border-[#34D399]/35 text-[#6EE7B7] hover:bg-[#10B981]/10"
                : "border-[#D7E5E0] text-[#0B5345] bg-[#F5F8F7] hover:bg-[#E8F5F1]"
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
                "!bg-[#0B5345] !text-white !border-[#0B5345]"
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
                "!bg-[#0B5345] !text-white !border-[#0B5345]"
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
  );
}
