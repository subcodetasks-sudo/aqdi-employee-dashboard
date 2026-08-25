"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mapRealtimeTableOrder } from "@/components/RealtimeOrders/map-realtime-order";
import {
  ALL_ORDERS_QUERY_KEY,
  buildAdminOrdersUrl,
} from "@/src/hooks/use-realtime-new-orders";
import {
  extractStandardOrderPage,
  exportRefundContractsToExcel,
} from "@/components/Orders/shared/orders-export";
import { usePaginatedExport } from "@/components/Orders/shared/use-paginated-export";
import {
  buildRefundsLookup,
  ensureReturnOrderRefund,
  fetchAllRefundContracts,
} from "@/components/analysis/returned/refund-contract-utils";
import { invalidateRefundCaches } from "@/src/lib/invalidate-orders-caches";
import { useAllOrdersWrapper } from "@/src/hooks/use-all-orders-wrapper";

const REFUNDS_LOOKUP_QUERY_KEY = "refundContractsLookup";

export function useReturnOrdersWrapper() {
  const queryClient = useQueryClient();
  const [successDialog, setSuccessDialog] = useState(null);

  const base = useAllOrdersWrapper({
    lockedFilter: "returned",
    exportFilename: "الطلبات-المسترجعة",
  });

  const { data: refundContracts = [] } = useQuery({
    queryKey: [REFUNDS_LOOKUP_QUERY_KEY],
    queryFn: fetchAllRefundContracts,
    staleTime: 60_000,
  });

  const refundsLookup = useMemo(
    () => buildRefundsLookup(refundContracts),
    [refundContracts]
  );

  const { handleExport, isExporting } = usePaginatedExport({
    buildUrl: (page) => buildAdminOrdersUrl({ ...base.exportParams, page }),
    extractPage: extractStandardOrderPage,
    onExport: (rows) => {
      const enriched = rows
        .map(mapRealtimeTableOrder)
        .map((row) => ensureReturnOrderRefund(row, refundsLookup))
        .filter(Boolean);
      return exportRefundContractsToExcel(enriched, {
        filename: "الطلبات-المسترجعة",
      });
    },
  });

  const invalidateAfterSuccess = () => {
    invalidateRefundCaches(queryClient, { queryKey: [ALL_ORDERS_QUERY_KEY] });
  };

  const handleSuccessDialogClose = (open) => {
    if (open) return;
    setSuccessDialog(null);
    invalidateAfterSuccess();
  };

  return {
    ...base,
    handleExport,
    isExporting,
    refundsLookup,
    refundItems: refundContracts,
    successDialog,
    setSuccessDialog,
    handleSuccessDialogClose,
  };
}
