export const INVOICE_STATUSES = [
  { id: "all", label: "كل الحالات" },
  { id: "success", label: "ناجحة" },
  { id: "failed", label: "فشلت" },
];

export const INVOICE_TYPES = [
  { id: "all", label: "كل الأنواع" },
  { id: "housing", label: "سكني" },
  { id: "commercial", label: "تجاري" },
];

/** `contract_type` as returned by `/admin/payments` — enum: "housing" | "commercial". */
export const CONTRACT_TYPE = {
  housing: {
    id: "housing",
    label: "سكني",
    className:
      "bg-[#E6F4EA] text-[#1E7E34] dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  commercial: {
    id: "commercial",
    label: "تجاري",
    className:
      "bg-[#F3E5F5] text-[#6A1B9A] dark:bg-purple-500/20 dark:text-purple-300",
  },
};

/** Statuses as returned by `/admin/payments` (status field: success/failed/…). */
export const INVOICE_STATUS = {
  success: {
    id: "success",
    label: "ناجحة",
    className:
      "bg-[#E6F4EA] text-[#1E7E34] dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  failed: {
    id: "failed",
    label: "فشلت",
    className:
      "bg-[#FDECEA] text-[#C62828] dark:bg-rose-500/20 dark:text-rose-300",
  },
  refunded: {
    id: "refunded",
    label: "مسترجعة",
    className:
      "bg-[#FFF3DC] text-[#B45309] dark:bg-amber-500/20 dark:text-amber-300",
  },
  unknown: {
    id: "unknown",
    label: "غير معروفة",
    className:
      "bg-status-neutral-bg text-status-neutral dark:bg-white/10 dark:text-white/60",
  },
};

export function getInvoiceStats(rows = []) {
  const success = rows.filter((row) => row.status === "success");
  const failed = rows.filter((row) => row.status === "failed");
  const collected = success.reduce((sum, row) => sum + row.amount, 0);

  return {
    success: success.length,
    failed: failed.length,
    total: rows.length,
    collected,
  };
}
