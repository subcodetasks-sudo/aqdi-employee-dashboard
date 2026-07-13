"use client";

import { useState } from "react";
import { toast } from "sonner";
import { fetchAllPaginatedItems } from "./orders-export";

export function usePaginatedExport({ buildUrl, onExport, extractPage }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const rows = await fetchAllPaginatedItems(buildUrl, extractPage);
      const exported = onExport(rows);

      if (!exported) {
        toast.error("لا توجد بيانات للتصدير");
        return;
      }

      toast.success(`تم تصدير ${rows.length} سجل بنجاح`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "تعذر تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  return { handleExport, isExporting };
}
