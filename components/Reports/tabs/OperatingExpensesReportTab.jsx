"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Loader from "@/components/home/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDeleteOperatingExpense,
  useOperatingExpenses,
} from "@/src/hooks/use-operating-expenses";
import { ReportKpiGrid } from "../shared/ReportKpiCard";
import ReportSectionCard from "../shared/ReportSectionCard";
import OperatingExpenseDialog from "../OperatingExpenseDialog";

const TH =
  "px-3 py-3 text-[12px] font-semibold text-[#9CA3AF] border-b border-[#EEF1F0] whitespace-nowrap text-right dark:text-white/50 dark:border-white/10";
const TD =
  "px-3 py-3 text-[13px] text-[#374151] border-b border-[#F3F4F6] whitespace-nowrap dark:text-white/70 dark:border-white/10";

const CREATED_AT_FILTERS = [
  { id: "all", label: "كل الفترات" },
  { id: "today", label: "اليوم" },
  { id: "week", label: "هذا الأسبوع" },
  { id: "month", label: "هذا الشهر" },
  { id: "year", label: "هذه السنة" },
];

function formatAmount(value) {
  return value != null ? `${Number(value).toLocaleString("en-US")} ر.س` : "—";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
}

export default function OperatingExpensesReportTab() {
  const [search, setSearch] = useState("");
  const [createdAt, setCreatedAt] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);

  const { data, isLoading, isError } = useOperatingExpenses({ search, createdAt, page, perPage: 20 });
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteOperatingExpense();

  const items = data?.items ?? data?.data ?? [];
  const summary = data?.summary ?? {};
  const pagination = data?.pagination ?? {};

  const kpis = [
    { key: "count", label: "عدد المصروفات", value: summary.count ?? items.length, icon: "file" },
    {
      key: "total",
      label: "إجمالي المصروفات",
      value: formatAmount(summary.total_amount ?? items.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)),
      icon: "wallet",
      isText: true,
      tone: "danger",
    },
  ];

  const openCreateDialog = () => {
    setEditingExpense(null);
    setDialogOpen(true);
  };

  const openEditDialog = (expense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingExpense) return;
    deleteExpense(deletingExpense.id, {
      onSuccess: () => {
        toast.success("تم حذف المصروف");
        setDeletingExpense(null);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "تعذر حذف المصروف");
      },
    });
  };

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <ReportSectionCard title="المصروفات التشغيلية">
        <p className="text-[13px] text-[#DC2626] dark:text-red-300">
          تعذّر تحميل المصروفات التشغيلية من الخادم. حاول تحديث الصفحة.
        </p>
      </ReportSectionCard>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={kpis} columns="grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2" />

      <ReportSectionCard
        title="المصروفات التشغيلية"
        action={
          <button
            type="button"
            onClick={openCreateDialog}
            className="h-9 px-4 rounded-lg bg-[#0B5345] text-white text-[13px] font-bold flex items-center gap-2 hover:brightness-110 transition-all"
          >
            <Plus className="size-4" />
            إضافة مصروف
          </button>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="بحث باسم المصروف..."
              className="w-full h-10 pr-9 pl-3 rounded-lg border border-[#E6EBE9] text-[13px] focus:outline-none focus:border-[#0B5345] dark:bg-[#0F1C16] dark:border-white/10 dark:text-white"
            />
          </div>
          <Select
            value={createdAt}
            onValueChange={(value) => {
              setCreatedAt(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-[160px] rounded-lg border-[#E6EBE9] text-[13px] font-semibold bg-white dark:bg-[#0F1C16] dark:border-white/10 dark:text-white/80">
              <SelectValue placeholder="الفترة" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {CREATED_AT_FILTERS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>المصروف</th>
                <th className={TH}>المبلغ</th>
                <th className={TH}>تاريخ الإضافة</th>
                <th className={TH}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className={cn(TD, "font-semibold text-[#111827] dark:text-white")}>
                      {item.expense}
                    </td>
                    <td className={cn(TD, "tabular-nums")}>{formatAmount(item.amount)}</td>
                    <td className={TD}>{formatDate(item.created_at)}</td>
                    <td className={TD}>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(item)}
                          className="size-8 rounded-lg border border-[#E6EBE9] flex items-center justify-center text-[#374151] hover:bg-[#F9FAFB] transition-colors dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
                          aria-label="تعديل"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingExpense(item)}
                          className="size-8 rounded-lg border border-[#FEE2E2] flex items-center justify-center text-[#DC2626] hover:bg-[#FEF2F2] transition-colors dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
                          aria-label="حذف"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-[#9CA3AF] text-sm dark:text-white/50">
                    لا توجد مصروفات لعرضها.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 rounded-lg border border-[#E6EBE9] text-[12px] font-semibold disabled:opacity-40 dark:border-white/10 dark:text-white/70"
            >
              السابق
            </button>
            <span className="text-[12px] text-[#6B7280] dark:text-white/60">
              صفحة {pagination.current_page ?? page} من {pagination.last_page}
            </span>
            <button
              type="button"
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-3 rounded-lg border border-[#E6EBE9] text-[12px] font-semibold disabled:opacity-40 dark:border-white/10 dark:text-white/70"
            >
              التالي
            </button>
          </div>
        )}
      </ReportSectionCard>

      <OperatingExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} expense={editingExpense} />

      <AlertDialog open={Boolean(deletingExpense)} onOpenChange={(open) => !open && setDeletingExpense(null)}>
        <AlertDialogContent dir="rtl" className="rounded-[20px] max-w-[400px] dark:bg-[#13241C] dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[18px] font-bold text-black text-right dark:text-white">
              حذف المصروف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-[#737373] text-right dark:text-white/60">
              هل أنت متأكد من حذف المصروف{" "}
              <span className="font-bold text-black dark:text-white">{deletingExpense?.expense}</span>؟ لا
              يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:gap-2">
            <AlertDialogCancel disabled={isDeleting} className="rounded-full border-[#E4E4E4] mt-0">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="rounded-full bg-[#DC2626] hover:bg-[#B91C1C]"
            >
              {isDeleting ? <Loader2 className="animate-spin size-4" /> : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
