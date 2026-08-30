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
  fetchRefundContractsSummary,
  parseManagementApprovalCounts,
} from "@/components/analysis/returned/refund-contract-utils";
import { invalidateRefundCaches } from "@/src/lib/invalidate-orders-caches";
import { useAllOrdersWrapper } from "@/src/hooks/use-all-orders-wrapper";

const REFUNDS_LOOKUP_QUERY_KEY = "refundContractsLookup";
const REFUNDS_SUMMARY_QUERY_KEY = "refundContractsSummary";

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

  // KPI row is driven by the global summary, not the current table page.
  const { data: refundsSummary } = useQuery({
    queryKey: [REFUNDS_SUMMARY_QUERY_KEY],
    queryFn: fetchRefundContractsSummary,
    staleTime: 60_000,
  });

  const kpiCounts = useMemo(() => {
    if (!refundsSummary) return null;
    const parsed = parseManagementApprovalCounts(
      refundsSummary.summary ?? { management_approval: refundsSummary.managementApproval }
    );
    const total = parsed.pending + parsed.processing + parsed.completed + parsed.rejected;
    // Empty/unrecognized summary → let the KPI row fall back to page counts.
    return total > 0 ? parsed : null;
  }, [refundsSummary]);

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
    kpiCounts,
    successDialog,
    setSuccessDialog,
    handleSuccessDialogClose,
  };
}
