"use client";

import { FileSpreadsheet, Loader2 } from "lucide-react";

export default function TableExportButton({
  onClick,
  isExporting = false,
  disabled = false,
  className = "",
  label = "تصدير Excel",
  loadingLabel = "جاري التصدير...",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isExporting}
      className={`h-[46px] px-5 rounded-full border border-[#10B981] bg-white text-[#10B981] hover:bg-[#10B981] hover:text-white font-bold text-[14px] transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#10B981] ${className}`}
    >
      {isExporting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="size-4" />
      )}
      {isExporting ? loadingLabel : label}
    </button>
  );
}
