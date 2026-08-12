"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
  Download,
  PanelLeft,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/src/stores/sidebar-store";
import { MOCK_CLIENTS, MOCK_CLIENT_STATS, PLATFORM } from "./mock-data";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STAT_CARDS = [
  {
    key: "app_store",
    label: "عملاء آبل ستور",
    value: MOCK_CLIENT_STATS.app_store,
    bar: "#6B7280",
    barDark: "#9CA3AF",
  },
  {
    key: "google_play",
    label: "عملاء جوجل بلاي",
    value: MOCK_CLIENT_STATS.google_play,
    bar: "#3B82F6",
    barDark: "#60A5FA",
  },
  {
    key: "website",
    label: "عملاء الموقع",
    value: MOCK_CLIENT_STATS.website,
    bar: "#0B5345",
    barDark: "#34D399",
  },
  {
    key: "blocked",
    label: "المحظورون",
    value: MOCK_CLIENT_STATS.blocked,
    bar: "#F97316",
    barDark: "#FB923C",
  },
  {
    key: "total",
    label: "إجمالي العملاء",
    value: MOCK_CLIENT_STATS.total,
    bar: "#10B981",
    barDark: "#34D399",
  },
];

const TH =
  "px-3 py-3.5 text-[12px] font-semibold text-[#9CA3AF] dark:text-white/45 border-b border-[#EEF1F0] dark:border-white/[0.08] whitespace-nowrap";

function formatMoney(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function splitDateTime(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = d.toLocaleDateString("en-CA");
  return { time, date };
}

function CountBadge({ value, tone = "muted" }) {
  const n = Number(value) || 0;
  if (n === 0) {
    return (
      <span className="inline-flex items-center justify-center min-w-[28px] text-[13px] font-medium text-[#9CA3AF] dark:text-white/35">
        0
      </span>
    );
  }

  const tones = {
    completed:
      "bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-300",
    draft:
      "bg-[#FEF3C7] text-[#B45309] dark:bg-amber-500/20 dark:text-amber-300",
    property:
      "bg-[#F5E6D3] text-[#92400E] dark:bg-amber-700/25 dark:text-amber-200",
    unit: "bg-[#D1FAE5] text-[#047857] dark:bg-emerald-500/20 dark:text-emerald-300",
    returned:
      "bg-[#FEE2E2] text-[#BE123C] dark:bg-rose-500/20 dark:text-rose-300",
    muted:
      "bg-[#F3F4F6] text-[#4B5563] dark:bg-white/10 dark:text-white/70",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center size-7 rounded-full text-[12px] font-bold tabular-nums",
        tones[tone] || tones.muted
      )}
    >
      {n}
    </span>
  );
}

function MoneyPill({ value }) {
  const n = Number(value) || 0;
  if (n === 0) {
    return (
      <span className="text-[13px] font-medium text-[#9CA3AF] dark:text-white/35 tabular-nums">
        0.00
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-300 text-[12px] font-bold tabular-nums whitespace-nowrap">
      {formatMoney(n)}
    </span>
  );
}

export default function ClientsWrapper() {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDir, setSortDir] = useState(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...MOCK_CLIENTS];

    if (q) {
      list = list.filter((row) =>
        [row.name, row.mobile, row.clientCode, row.id]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    if (sortDir) {
      list.sort((a, b) => {
        const ta = new Date(a.joinedAt).getTime();
        const tb = new Date(b.joinedAt).getTime();
        return sortDir === "desc" ? tb - ta : ta - tb;
      });
    }

    return list;
  }, [searchQuery, sortDir]);

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(currentPage, lastPage);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageSize = (value) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handleExport = () => {
    toast.success("تصدير CSV (واجهة تجريبية — لا ملف حقيقي بعد)");
  };

  return (
    <div className="flex flex-col gap-5 min-h-full transition-colors" dir="rtl">
      {/* Page header */}
      <div className="flex items-start gap-3">
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

        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium text-[#6B7280] dark:text-white/50 hover:text-[#0B5345] dark:hover:text-emerald-300 transition-colors"
          >
            <ChevronLeft className="size-4 shrink-0" />
            رجوع
          </button>

          <div>
            <h1 className="text-[22px] font-bold text-[#111827] dark:text-white leading-tight mb-1">
              العملاء
            </h1>
            <p className="text-[13px] text-[#9CA3AF] dark:text-white/45 font-medium leading-relaxed">
              كل عملاء عقدي حسب المنصة - اضغط «عرض» لملف العميل الكامل
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-3 max-[1200px]:grid-cols-3 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className={cn(
              "relative overflow-hidden rounded-2xl border transition-colors",
              "bg-white border-[#E8EEEC] shadow-[0_1px_3px_rgba(11,83,69,0.05)]",
              "dark:bg-[#13241C] dark:border-white/[0.08] dark:shadow-none"
            )}
          >
            <span
              aria-hidden
              className="absolute inset-y-2 right-0 w-[4px] rounded-full dark:hidden"
              style={{ backgroundColor: card.bar }}
            />
            <span
              aria-hidden
              className="absolute inset-y-2 right-0 w-[4px] rounded-full hidden dark:block"
              style={{ backgroundColor: card.barDark }}
            />
            <div className="px-4 py-4 text-center">
              <div className="text-[28px] font-black tabular-nums text-[#111827] dark:text-white leading-none mb-2">
                {card.value}
              </div>
              <div className="text-[12px] font-medium text-[#6B7280] dark:text-white/50 whitespace-nowrap">
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + export */}
      <div className="flex items-center gap-3 max-[640px]:flex-col max-[640px]:items-stretch">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-[18px] text-[#9CA3AF] dark:text-white/35 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="بحث بالاسم أو الجوال أو رقم العميل أو رقم الطلب..."
            className={cn(
              "w-full h-[44px] rounded-xl border pr-11 pl-4 text-[13px] transition-all",
              "bg-white border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF]",
              "focus:outline-none focus:border-[#0B5345] focus:ring-2 focus:ring-[#0B5345]/10",
              "dark:bg-[#0F1C16] dark:border-white/[0.1] dark:text-white dark:placeholder:text-white/35",
              "dark:focus:border-emerald-500/50 dark:focus:ring-emerald-500/15"
            )}
          />
        </div>

        <button
          type="button"
          onClick={handleExport}
          className={cn(
            "h-[44px] px-4 rounded-xl border text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-colors shrink-0",
            "bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]",
            "dark:bg-[#13241C] dark:border-white/[0.1] dark:text-white/80 dark:hover:bg-white/[0.06]"
          )}
        >
          <Download className="size-4" />
          تصدير
        </button>
      </div>

      {/* Pagination bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <div className="text-[#6B7280] dark:text-white/45 font-medium">
          يعرض {start}-{end} من {total} عميل
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={page >= lastPage}
            onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
            className="inline-flex items-center gap-1 text-[#374151] dark:text-white/70 font-medium hover:text-[#0B5345] dark:hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-[#374151] dark:disabled:hover:text-white/70 transition-colors"
          >
            التالي
            <ChevronLeft className="size-3.5" />
          </button>

          <span className="min-w-[48px] text-center tabular-nums text-[#111827] dark:text-white font-semibold">
            {page}/{lastPage}
          </span>

          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 text-[#374151] dark:text-white/70 font-medium hover:text-[#0B5345] dark:hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-[#374151] dark:disabled:hover:text-white/70 transition-colors"
          >
            <ChevronRight className="size-3.5" />
            السابق
          </button>

          <div className="flex items-center gap-1.5 mr-1">
            <select
              value={pageSize}
              onChange={(e) => handlePageSize(e.target.value)}
              className={cn(
                "h-8 rounded-lg border px-2 text-[12px] font-semibold focus:outline-none",
                "bg-white border-[#E5E7EB] text-[#111827] focus:border-[#0B5345]",
                "dark:bg-[#0F1C16] dark:border-white/[0.1] dark:text-white dark:focus:border-emerald-500/50"
              )}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-[#6B7280] dark:text-white/45 font-medium">
              يعرض
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className={cn(
          "w-full overflow-x-auto rounded-2xl border transition-colors",
          "bg-white border-[#E8EEEC] shadow-[0_1px_3px_rgba(11,83,69,0.04)]",
          "dark:bg-[#0F1C16] dark:border-white/[0.08] dark:shadow-none"
        )}
      >
        <table className="w-full border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-[#F8FAF9] dark:bg-[#13241C]">
              <th className={cn(TH, "text-right px-4")}>
                <button
                  type="button"
                  onClick={() =>
                    setSortDir((d) =>
                      d === null || d === "asc" ? "desc" : "asc"
                    )
                  }
                  className="inline-flex items-center gap-1.5 hover:text-[#0B5345] dark:hover:text-emerald-300 transition-colors"
                >
                  تاريخ الانضمام والساعة
                  <ArrowDownWideNarrow
                    className={cn(
                      "size-3.5 transition-transform",
                      sortDir === "asc" && "rotate-180"
                    )}
                  />
                </button>
              </th>
              <th className={cn(TH, "text-right")}>رقم العميل</th>
              <th className={cn(TH, "text-right")}>اسم العميل</th>
              <th className={cn(TH, "text-right")}>رقم الجوال</th>
              <th className={cn(TH, "text-center px-2.5")}>مكتمل</th>
              <th className={cn(TH, "text-center px-2.5")}>مسودة</th>
              <th className={cn(TH, "text-center px-2.5")}>عقارات</th>
              <th className={cn(TH, "text-center px-2.5")}>وحدات</th>
              <th className={cn(TH, "text-center px-2.5")}>مسترجع</th>
              <th className={cn(TH, "text-center px-2.5")}>مدفوع</th>
              <th className={cn(TH, "text-center px-2.5")}>صافي</th>
              <th className={cn(TH, "text-center")}>عرض</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="text-center py-16 text-[13px] text-[#9CA3AF] dark:text-white/35 font-medium"
                >
                  لا يوجد عملاء مطابقون لبحثك
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const { time, date } = splitDateTime(row.joinedAt);
                const platform = PLATFORM[row.platform] || PLATFORM.website;

                return (
                  <tr
                    key={row.id}
                    className="border-b border-[#F3F4F6] dark:border-white/[0.05] last:border-0 hover:bg-[#F8FAF9]/80 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[13px] font-semibold text-[#111827] dark:text-white tabular-nums leading-none">
                          {time}
                        </span>
                        <span className="text-[12px] text-[#6B7280] dark:text-white/45 tabular-nums leading-none">
                          {date}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap",
                            platform.badgeClass
                          )}
                        >
                          {platform.label}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-[13px] font-bold text-[#0B5345] dark:text-emerald-300 tabular-nums whitespace-nowrap">
                      {row.clientCode}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#111827] dark:text-white">
                          {row.name}
                        </span>
                        {row.forProgrammer ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] dark:bg-amber-500/20 dark:text-amber-300 text-[10px] font-bold">
                            للمبرمج
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td
                      className="px-3 py-3.5 text-[13px] font-medium text-[#374151] dark:text-white/70 tabular-nums whitespace-nowrap"
                      dir="ltr"
                    >
                      {row.mobile}
                    </td>

                    <td className="px-2.5 py-3.5 text-center">
                      <CountBadge value={row.completed} tone="completed" />
                    </td>
                    <td className="px-2.5 py-3.5 text-center">
                      <CountBadge value={row.draft} tone="draft" />
                    </td>
                    <td className="px-2.5 py-3.5 text-center">
                      <CountBadge value={row.properties} tone="property" />
                    </td>
                    <td className="px-2.5 py-3.5 text-center">
                      <CountBadge value={row.units} tone="completed" />
                    </td>
                    <td className="px-2.5 py-3.5 text-center">
                      <CountBadge value={row.returned} tone="returned" />
                    </td>
                    <td className="px-2.5 py-3.5 text-center">
                      <MoneyPill value={row.paid} />
                    </td>
                    <td className="px-2.5 py-3.5 text-center">
                      <MoneyPill value={row.net} />
                    </td>

                    <td className="px-3 py-3.5 text-center">
                      <Link
                        href={`/home/users/${row.id}?from=${encodeURIComponent("/home/clients")}`}
                        className={cn(
                          "inline-flex items-center justify-center h-8 px-3.5 rounded-full border text-[12px] font-bold transition-colors",
                          "border-[#0B5345]/25 bg-[#E8F5F1] text-[#0B5345] hover:bg-[#0B5345] hover:text-white",
                          "dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white"
                        )}
                      >
                        عرض
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
