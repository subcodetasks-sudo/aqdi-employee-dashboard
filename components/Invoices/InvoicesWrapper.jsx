"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, PanelLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/src/stores/sidebar-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InvoicePreviewDialog from "./InvoicePreviewDialog";
import {
  CONTRACT_TYPE,
  INVOICE_STATUS,
  INVOICE_STATUSES,
  INVOICE_TYPES,
  MOCK_INVOICES,
  getInvoiceStats,
} from "./mock-data";

const TH =
  "px-3 py-3.5 text-[12px] font-semibold text-[#6B7280] dark:text-white/45 border-b border-[#EEF1F0] dark:border-white/[0.08] whitespace-nowrap text-right";

const STAT_CARDS = [
  {
    key: "paid",
    label: "مدفوعة",
    className:
      "bg-[#E8F1FF] border-[#93C5FD] dark:bg-blue-500/15 dark:border-blue-400/35",
    valueClass: "text-[#1D4ED8] dark:text-blue-300",
    labelClass: "text-[#3B82F6] dark:text-blue-300/80",
    format: (stats) => stats.paid,
  },
  {
    key: "refunded",
    label: "مسترجعة",
    className:
      "bg-[#FDECEA] border-[#FCA5A5] dark:bg-rose-500/15 dark:border-rose-400/35",
    valueClass: "text-[#C62828] dark:text-rose-300",
    labelClass: "text-[#E11D48] dark:text-rose-300/80",
    format: (stats) => stats.refunded,
  },
  {
    key: "total",
    label: "إجمالي الفواتير",
    className:
      "bg-[#FFF8E1] border-[#FCD34D] dark:bg-amber-500/15 dark:border-amber-400/35",
    valueClass: "text-[#B45309] dark:text-amber-300",
    labelClass: "text-[#D97706] dark:text-amber-300/80",
    format: (stats) => stats.total,
  },
  {
    key: "collected",
    label: "المحصل (ريال)",
    className:
      "bg-[#E8F5F1] border-[#6EE7B7] dark:bg-emerald-500/15 dark:border-emerald-400/35",
    valueClass: "text-[#0B5345] dark:text-emerald-300",
    labelClass: "text-[#047857] dark:text-emerald-300/80",
    format: (stats) => stats.collected.toLocaleString("en-US"),
  },
];

function StatCard({ label, value, className, valueClass, labelClass }) {
  return (
    <div
      className={cn(
        "min-w-[148px] rounded-2xl border px-6 py-4 text-center",
        className
      )}
    >
      <p
        className={cn(
          "text-[28px] font-black tabular-nums leading-none tracking-tight",
          valueClass
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-2 text-[12px] font-semibold whitespace-nowrap",
          labelClass
        )}
      >
        {label}
      </p>
    </div>
  );
}

function TypeBadge({ type }) {
  const meta = CONTRACT_TYPE[type] || CONTRACT_TYPE.residential;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center h-7 px-3 rounded-full text-[12px] font-bold whitespace-nowrap",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const meta = INVOICE_STATUS[status] || INVOICE_STATUS.paid;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center h-7 px-3 rounded-full text-[12px] font-bold whitespace-nowrap",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}

function exportCsv(rows) {
  const headers = [
    "رقم الفاتورة",
    "رقم الطلب",
    "جوال العميل",
    "نوع العقد",
    "المبلغ",
    "المصدر",
    "الحالة",
    "التاريخ",
  ];

  const lines = rows.map((row) =>
    [
      row.invoiceNo,
      `#${row.orderNo}`,
      row.mobile,
      CONTRACT_TYPE[row.contractType]?.label ?? row.contractType,
      row.amount,
      row.source,
      INVOICE_STATUS[row.status]?.label ?? row.status,
      row.date,
    ].join(",")
  );

  const csv = `\uFEFF${headers.join(",")}\n${lines.join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function InvoicesWrapper() {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return MOCK_INVOICES.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (typeFilter !== "all" && row.contractType !== typeFilter) return false;
      if (!q) return true;

      return [row.invoiceNo, row.orderNo, row.mobile]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => getInvoiceStats(MOCK_INVOICES), []);

  const copyInvoiceNo = (value) => {
    navigator.clipboard.writeText(value);
    toast.success("تم نسخ رقم الفاتورة");
  };

  const handleExport = () => {
    if (!filtered.length) {
      toast.error("لا توجد فواتير لتصديرها");
      return;
    }
    exportCsv(filtered);
    toast.success("تم تصدير CSV");
  };

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
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
            <button
              type="button"
              onClick={() => router.push("/home/orders")}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9CA3AF] dark:text-white/45 hover:text-[#0B5345] dark:hover:text-emerald-300 transition-colors mb-1"
            >
              الطلبات
              <span className="text-[#C4C4C4]">›</span>
            </button>
            <h1 className="text-[24px] font-bold text-[#111827] dark:text-white leading-tight">
              الفواتير
            </h1>
            <p className="mt-1 text-[13px] font-medium text-[#9CA3AF] dark:text-white/45">
              فواتير رسوم توثيق العقود - المدفوعة والمسترجعة
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-stretch gap-2.5">
          {STAT_CARDS.map((card) => (
            <StatCard
              key={card.key}
              label={card.label}
              value={card.format(stats)}
              className={card.className}
              valueClass={card.valueClass}
              labelClass={card.labelClass}
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "rounded-2xl border overflow-hidden transition-colors",
          "bg-white border-[#E8EEEC] shadow-[0_1px_3px_rgba(11,83,69,0.04)]",
          "dark:bg-[#0F1C16] dark:border-white/[0.08] dark:shadow-none"
        )}
      >
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#EEF1F0] dark:border-white/[0.08]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-[18px] text-[#9CA3AF] dark:text-white/35 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الفاتورة أو الطلب أو الجوال.."
              className={cn(
                "w-full h-[42px] rounded-xl border pr-11 pl-4 text-[13px] transition-all",
                "bg-[#F8FAF9] border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF]",
                "focus:outline-none focus:border-[#0B5345] focus:ring-2 focus:ring-[#0B5345]/10 focus:bg-white",
                "dark:bg-[#13241C] dark:border-white/[0.1] dark:text-white dark:placeholder:text-white/35",
                "dark:focus:border-emerald-500/50 dark:focus:ring-emerald-500/15"
              )}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-[42px] w-[150px] rounded-xl border-[#E5E7EB] bg-white text-[13px] font-semibold dark:bg-[#13241C] dark:border-white/10 dark:text-white">
              <SelectValue placeholder="كل الحالات" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {INVOICE_STATUSES.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-[42px] w-[150px] rounded-xl border-[#E5E7EB] bg-white text-[13px] font-semibold dark:bg-[#13241C] dark:border-white/10 dark:text-white">
              <SelectValue placeholder="كل الأنواع" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {INVOICE_TYPES.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={handleExport}
            className={cn(
              "h-[42px] px-4 rounded-xl border text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-colors shrink-0",
              "bg-[#F3F4F6] border-[#E5E7EB] text-[#374151] hover:bg-[#E5E7EB]",
              "dark:bg-[#13241C] dark:border-white/[0.1] dark:text-white/80 dark:hover:bg-white/[0.06]"
            )}
          >
            <Download className="size-4" />
            تصدير CSV
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-[#F8FAF9] dark:bg-[#13241C]">
                <th className={cn(TH, "px-4")}>رقم الفاتورة</th>
                <th className={TH}>رقم الطلب</th>
                <th className={TH}>جوال العميل</th>
                <th className={TH}>نوع العقد</th>
                <th className={TH}>المبلغ</th>
                <th className={TH}>المصدر</th>
                <th className={TH}>الحالة</th>
                <th className={TH}>التاريخ</th>
                <th className={cn(TH, "text-center")}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-16 text-[13px] text-[#9CA3AF] dark:text-white/35 font-medium"
                  >
                    لا توجد فواتير مطابقة لبحثك
                  </td>
                </tr>
              ) : (
                filtered.map((row, index) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-[#F3F4F6] dark:border-white/[0.05] last:border-0 transition-colors",
                      "hover:bg-[#F8FAF9]/90 dark:hover:bg-white/[0.04]",
                      index % 2 === 1 && "bg-[#FAFBFA] dark:bg-white/[0.015]"
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-[#111827] dark:text-white tabular-nums">
                          {row.invoiceNo}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyInvoiceNo(row.invoiceNo)}
                          className="text-[#9CA3AF] hover:text-[#0B5345] dark:hover:text-emerald-300 transition-colors"
                          title="نسخ رقم الفاتورة"
                          aria-label="نسخ رقم الفاتورة"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-[13px] font-semibold text-[#374151] dark:text-white/70 tabular-nums">
                      #{row.orderNo}
                    </td>
                    <td
                      className="px-3 py-3.5 text-[13px] font-medium text-[#374151] dark:text-white/70 tabular-nums"
                      dir="ltr"
                    >
                      {row.mobile}
                    </td>
                    <td className="px-3 py-3.5">
                      <TypeBadge type={row.contractType} />
                    </td>
                    <td className="px-3 py-3.5 text-[13px] font-bold text-[#111827] dark:text-white tabular-nums whitespace-nowrap">
                      {row.amount.toLocaleString("en-US")} ريال
                    </td>
                    <td className="px-3 py-3.5 text-[13px] font-medium text-[#6B7280] dark:text-white/55 whitespace-nowrap">
                      {row.source}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-3.5 text-[13px] font-medium text-[#6B7280] dark:text-white/55 tabular-nums whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(row)}
                        className={cn(
                          "inline-flex items-center justify-center h-8 px-4 rounded-lg text-[12px] font-bold transition-colors",
                          "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]",
                          "dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
                        )}
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvoicePreviewDialog
        open={Boolean(selectedInvoice)}
        onOpenChange={(next) => {
          if (!next) setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
}
