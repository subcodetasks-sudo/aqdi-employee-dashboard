"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { axiosInstance } from "@/src/utils/axios";
import { printOrderContracts } from "@/components/Orders/single-order/print-contract";

/**
 * Fetches the full order payload for each id and opens a single print
 * document containing every contract (one contract per page).
 */
export function useBatchPrintContracts() {
  const [isBatchPrinting, setIsBatchPrinting] = useState(false);

  const batchPrint = useCallback(async (ids = []) => {
    const list = Array.from(ids ?? []).filter((id) => id != null);
    if (!list.length) {
      toast.error("لم يتم تحديد أي طلب للطباعة");
      return;
    }

    setIsBatchPrinting(true);
    try {
      const results = await Promise.allSettled(
        list.map((id) => axiosInstance.get(`/admin/orders/${id}`))
      );

      const orders = results
        .filter((res) => res.status === "fulfilled")
        .map((res) => res.value?.data?.data ?? res.value?.data)
        .filter(Boolean);

      const failed = list.length - orders.length;

      if (!orders.length) {
        toast.error("تعذر تحميل بيانات الطباعة");
        return;
      }

      const opened = printOrderContracts(orders);
      if (!opened) {
        toast.error("تعذر فتح نافذة الطباعة");
        return;
      }

      if (failed > 0) {
        toast.error(`تمت طباعة ${orders.length} عقد، وتعذّر تحميل ${failed}`);
      } else {
        toast.success(`تم تجهيز ${orders.length} عقد للطباعة`);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "تعذر تحميل بيانات الطباعة"
      );
    } finally {
      setIsBatchPrinting(false);
    }
  }, []);

  return { isBatchPrinting, batchPrint };
}
