"use client";

import Link from "next/link";
import { FileSpreadsheet, Filter, Loader2, RefreshCw, Search, X } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosInstance } from "@/src/utils/axios";
import AddCompleteOrder from "../add-complete-order";
import AddInCompleteOrder from "../add-incompleted-order";
import OrdersMoreFilters from "./orders-more-filters";
import { hasActiveAdvancedFilters } from "./orders-filter-utils";

const defaultQuickLinks = [
  {
    emoji: "✅",
    label: "تم التوثيق",
    href: "/home/completed-orders",
    match: ["توثيق", "وثق", "مكتمل"],
  },
  {
    emoji: "😞",
    label: "مسترجع",
    href: "/home/return-orders",
    match: ["مسترج", "استرجاع"],
  },
];

function getQuickLinkCount(items, matchPatterns) {
  const item = items.find((entry) =>
    matchPatterns.some((pattern) => entry.label_ar?.includes(pattern))
  );
  return item?.value ?? 0;
}

const formatQuickCount = (count) => {
  const num = Number(count);
  if (Number.isNaN(num)) return "00";
  if (num > 99) return String(num);
  return String(num).padStart(2, "0");
};

function QuickStatCard({ emoji, label, href, count }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 pr-2.5 pl-3.5 py-2 bg-[#F5F5F5] rounded-[14px] border border-transparent hover:border-brand-main/25 hover:bg-white hover:shadow-sm transition-all shrink-0"
    >
      <span className="flex items-center justify-center size-8 rounded-full bg-white shadow-sm text-[15px] shrink-0 group-hover:scale-105 transition-transform">
        {emoji}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[11.5px] font-bold text-[#616161] whitespace-nowrap">{label}</span>
        <span className="text-[15px] font-black text-black tabular-nums">
          {formatQuickCount(count)}
        </span>
      </span>
    </Link>
  );
}

export default function OrdersToolbar({
  searchQuery,
  onSearchChange,
  showAddButtons = false,
  queryKeys = [],
  showMoreFilters = false,
  onToggleMoreFilters,
  advancedFilters,
  onAdvancedFiltersChange,
  onResetAll,
  showStatusField = true,
  quickLinksLimit,
  exportConfig,
  selectedCount = 0,
  onClearSelection,
}) {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  const { data: analyticsData } = useQuery({
    queryKey: ["dashboard-analytics-quick"],
    queryFn: () => axiosInstance.get("/admin/dashboard-analytics").then((res) => res?.data),
  });

  const analyticsItems = analyticsData?.data?.order_analytics ?? [];

  const handleRefresh = () => {
    onResetAll?.();
    queryKeys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
    queryClient.invalidateQueries({ queryKey: ["status"] });
    queryClient.invalidateQueries({ queryKey: ["orders-all-total"] });
    queryClient.invalidateQueries({ queryKey: ["draft-orders-all-total"] });
    queryClient.invalidateQueries({ queryKey: ["order-status-count"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-analytics-quick"] });
  };

  const filtersActive = hasActiveAdvancedFilters(advancedFilters);

  const handleExport = () => {
    if (!exportConfig?.onExport) return;

    const orders = exportConfig.getSelectedOrders?.() ?? [];
    if (!orders.length) {
      toast.error("يرجى تحديد طلب واحد على الأقل للتصدير");
      return;
    }

    setIsExporting(true);
    try {
      const exported = exportConfig.onExport(orders);

      if (exported === false) {
        toast.error("لا توجد بيانات للتصدير");
        return;
      }

      toast.success(`تم تصدير ${orders.length} طلب بنجاح`);
      onClearSelection?.();
    } catch {
      toast.error("حدث خطأ أثناء تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  const quickLinks = quickLinksLimit
    ? defaultQuickLinks.slice(0, quickLinksLimit)
    : defaultQuickLinks;

  const hasTopRow = showAddButtons || quickLinks.length > 0;

  return (
    <div className="space-y-4 w-full" dir="rtl">
      <div className="bg-white rounded-[20px] border border-[#E4E4E4] shadow-sm p-4 flex flex-col gap-4">
        {/* {hasTopRow && (
          <div className="flex items-center gap-3 flex-wrap">
            {showAddButtons && (
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <AddCompleteOrder />
                <AddInCompleteOrder />
              </div>
            )}

            {showAddButtons && quickLinks.length > 0 && (
              <div className="hidden sm:block w-px self-stretch bg-[#EEEEEE] shrink-0" />
            )}

            {quickLinks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {quickLinks.map((link) => (
                  <QuickStatCard
                    key={link.href}
                    emoji={link.emoji}
                    label={link.label}
                    href={link.href}
                    count={getQuickLinkCount(analyticsItems, link.match)}
                  />
                ))}
              </div>
            )}
          </div>
        )} */}

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative w-full sm:w-[260px] md:w-[300px] shrink sm:shrink-0">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] size-5" />
            <input
              type="text"
              placeholder="البحث الذكي...!"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-[46px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-full pr-12 pl-10 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="مسح البحث"
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center size-6 rounded-full text-[#A3A3A3] hover:bg-[#EEEEEE] hover:text-[#616161] transition-colors"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {exportConfig ? (
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting || selectedCount === 0}
                className="h-[46px] px-5 rounded-full border border-[#10B981] bg-white text-[#10B981] hover:bg-[#10B981] hover:text-white font-bold text-[14px] transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#10B981]"
                title={
                  selectedCount > 0
                    ? `تصدير ${selectedCount} طلب محدد إلى Excel`
                    : "حدد الطلبات من الجدول أولاً"
                }
              >
                {isExporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="size-4" />
                )}
                {isExporting
                  ? "جاري التصدير..."
                  : selectedCount > 0
                    ? `تصدير Excel (${selectedCount})`
                    : "تصدير Excel"}
              </button>
            ) : null}

            {selectedCount > 0 ? (
              <button
                type="button"
                onClick={onClearSelection}
                className="h-[46px] px-4 rounded-full border border-[#EEEEEE] bg-[#F9F9F9] text-[#4D4D4D] hover:border-brand-main hover:text-brand-main font-bold text-[13px] transition-all shrink-0 flex items-center gap-1.5"
              >
                <X className="size-3.5" />
                إلغاء التحديد ({selectedCount})
              </button>
            ) : null}

            <div className="flex items-center gap-1 p-1 rounded-full bg-[#F9F9F9] border border-[#EEEEEE] shrink-0">
              <button
                type="button"
                onClick={handleRefresh}
                aria-label="إعادة تعيين الفلاتر"
                className="size-[38px] flex items-center justify-center rounded-full text-[#616161] hover:bg-white hover:text-brand-main hover:shadow-sm transition-all"
                title="إعادة تعيين الفلاتر"
              >
                <RefreshCw className="size-[18px]" />
              </button>

              <button
                type="button"
                onClick={onToggleMoreFilters}
                className={`h-[38px] px-4 rounded-full font-bold text-[13.5px] transition-all flex items-center gap-2 shrink-0 ${
                  showMoreFilters || filtersActive
                    ? "bg-brand-main text-white shadow-sm"
                    : "text-[#212121] hover:bg-white hover:shadow-sm"
                }`}
              >
                <Filter className="size-4" />
                فلترة أكثر
                {filtersActive && !showMoreFilters ? (
                  <span className="size-1.5 rounded-full bg-white" />
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMoreFilters && (
        <OrdersMoreFilters
          filters={advancedFilters}
          onChange={onAdvancedFiltersChange}
          showStatusField={showStatusField}
        />
      )}
    </div>
  );
}
