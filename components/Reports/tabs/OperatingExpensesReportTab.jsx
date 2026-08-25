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
import { usePermissions } from "@/src/hooks/usePermissions";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import { ReportKpiGrid } from "../shared/ReportKpiCard";
import ReportSectionCard from "../shared/ReportSectionCard";
import OperatingExpenseDialog from "../OperatingExpenseDialog";

const TH =
  "px-3 py-3 text-xs font-semibold text-gray-400 border-b border-[#EEF1F0] whitespace-nowrap text-right dark:text-white/50 dark:border-white/10";
const TD =
  "px-3 py-3 text-13 text-gray-700 border-b border-status-neutral-bg whitespace-nowrap dark:text-white/70 dark:border-white/10";

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
  const { can } = usePermissions();
  const canCreate = can(PERMISSION_SECTIONS.analytics, "create");
  const canEdit = can(PERMISSION_SECTIONS.analytics, "edit");
  const canDelete = can(PERMISSION_SECTIONS.analytics, "delete");

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
        <p className="text-13 text-red-600 dark:text-red-300">
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
          canCreate ? (
            <button
              type="button"
              onClick={openCreateDialog}
              className="h-9 px-4 rounded-lg bg-brand-dark text-white text-13 font-bold flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <Plus className="size-4" />
              إضافة مصروف
            </button>
          ) : null
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="بحث باسم المصروف..."
              className="w-full h-10 pr-9 pl-3 rounded-lg border border-surface-border-soft text-13 focus:outline-none focus:border-brand-dark dark:bg-[#0F1C16] dark:border-white/10 dark:text-white"
            />
          </div>
          <Select
            value={createdAt}
            onValueChange={(value) => {
              setCreatedAt(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-[160px] rounded-lg border-surface-border-soft text-13 font-semibold bg-white dark:bg-[#0F1C16] dark:border-white/10 dark:text-white/80">
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
                    <td className={cn(TD, "font-semibold text-gray-900 dark:text-white")}>
                      {item.expense}
                    </td>
                    <td className={cn(TD, "tabular-nums")}>{formatAmount(item.amount)}</td>
                    <td className={TD}>{formatDate(item.created_at)}</td>
                    <td className={TD}>
                      <div className="flex items-center gap-2">
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => openEditDialog(item)}
                            className="size-8 rounded-lg border border-surface-border-soft flex items-center justify-center text-gray-700 hover:bg-[#F9FAFB] transition-colors dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
                            aria-label="تعديل"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => setDeletingExpense(item)}
                            className="size-8 rounded-lg border border-[#FEE2E2] flex items-center justify-center text-red-600 hover:bg-[#FEF2F2] transition-colors dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
                            aria-label="حذف"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        ) : null}
                        {!canEdit && !canDelete ? (
                          <span className="text-xs text-gray-400 dark:text-white/40">—</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-400 text-sm dark:text-white/50">
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
              className="h-8 px-3 rounded-lg border border-surface-border-soft text-xs font-semibold disabled:opacity-40 dark:border-white/10 dark:text-white/70"
            >
              السابق
            </button>
            <span className="text-xs text-status-neutral dark:text-white/60">
              صفحة {pagination.current_page ?? page} من {pagination.last_page}
            </span>
            <button
              type="button"
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-3 rounded-lg border border-surface-border-soft text-xs font-semibold disabled:opacity-40 dark:border-white/10 dark:text-white/70"
            >
              التالي
            </button>
          </div>
        )}
      </ReportSectionCard>

      <OperatingExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} expense={editingExpense} />

      <AlertDialog open={Boolean(deletingExpense)} onOpenChange={(open) => !open && setDeletingExpense(null)}>
        <AlertDialogContent dir="rtl" className="rounded-20 max-w-[400px] dark:bg-card dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-black text-right dark:text-white">
              حذف المصروف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-neutral-500 text-right dark:text-white/60">
              هل أنت متأكد من حذف المصروف{" "}
              <span className="font-bold text-black dark:text-white">{deletingExpense?.expense}</span>؟ لا
              يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:gap-2">
            <AlertDialogCancel disabled={isDeleting} className="rounded-full border-neutral-200 mt-0">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="rounded-full bg-red-600 hover:bg-[#B91C1C]"
            >
              {isDeleting ? <Loader2 className="animate-spin size-4" /> : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
