"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mapRealtimeTableOrder } from "@/components/realtime-orders/map-realtime-order";
import {
  ALL_ORDERS_QUERY_KEY,
  buildAdminOrdersUrl,
} from "@/src/hooks/use-realtime-new-orders";
import {
  extractStandardOrderPage,
  exportRefundContractsToExcel,
} from "@/components/orders/shared/orders-export";
import { usePaginatedExport } from "@/components/orders/shared/use-paginated-export";
import {
  buildRefundsLookup,
  countReturnOrdersByApproval,
  ensureReturnOrderRefund,
  fetchAllRefundContracts,
  fetchRefundContractsSummary,
  getOrderAdminApprovalStatus,
  mapAnalyticsRefundContractToOrderRow,
  parseManagementApprovalCounts,
} from "@/components/analysis/returned/refund-contract-utils";
import { invalidateRefundCaches } from "@/src/lib/invalidate-orders-caches";
import { useAllOrdersWrapper } from "@/src/hooks/use-all-orders-wrapper";

const REFUNDS_LOOKUP_QUERY_KEY = "refundContractsLookup";
const REFUNDS_SUMMARY_QUERY_KEY = "refundContractsSummary";

/** Map admin / refund flags onto the backend status trio used by KPIs + badges. */
function resolveReturnRequestStatus({ adminConfirmed, customerRefunded, existing }) {
  if (customerRefunded === true || customerRefunded === 1) return "approved";
  if (adminConfirmed === true || adminConfirmed === 1) return "approved";
  if (adminConfirmed === false || adminConfirmed === 0) return "rejected";
  if (existing === "refunded") return "approved";
  if (existing === "pending" || existing === "approved" || existing === "rejected") {
    return existing;
  }
  return "pending";
}

/** Merge refund-lookup approval fields onto an order row so table + KPIs agree. */
function enrichOrderWithRefundApproval(row, refundsLookup) {
  if (!row) return row;

  const refund = ensureReturnOrderRefund(row, refundsLookup);
  if (!refund) return row;

  const adminConfirmed =
    refund.adminConfirmed !== undefined
      ? refund.adminConfirmed
      : getOrderAdminApprovalStatus(row);
  const customerRefunded =
    refund.customerRefunded ??
    row.customer_refunded ??
    row.is_refunded ??
    row.refunded;

  const existing =
    row.return_request_status ?? row.contract_summary?.return_request_status ?? null;
  const returnRequestStatus = resolveReturnRequestStatus({
    adminConfirmed,
    customerRefunded,
    existing,
  });

  return {
    ...row,
    admin_confirmed: adminConfirmed,
    management_approval:
      refund.raw?.management_approval ??
      row.management_approval ??
      (adminConfirmed !== undefined
        ? { approved: adminConfirmed }
        : row.management_approval),
    is_refunded: customerRefunded,
    customer_refunded: customerRefunded,
    refunded: customerRefunded,
    return_request_status: returnRequestStatus,
  };
}

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

  // KPI row is driven by the global summary, not the current table page.
  const { data: refundsSummary } = useQuery({
    queryKey: [REFUNDS_SUMMARY_QUERY_KEY],
    queryFn: fetchRefundContractsSummary,
    staleTime: 60_000,
  });

  const refundsLookup = useMemo(
    () => buildRefundsLookup(refundContracts),
    [refundContracts]
  );

  const tableOrders = useMemo(
    () =>
      (base.tableOrders ?? []).map((row) =>
        enrichOrderWithRefundApproval(row, refundsLookup)
      ),
    [base.tableOrders, refundsLookup]
  );

  const kpiCounts = useMemo(() => {
    if (refundsSummary) {
      const parsed = parseManagementApprovalCounts(
        refundsSummary.summary ?? {
          management_approval: refundsSummary.managementApproval,
        }
      );
      const total = parsed.pending + parsed.approved + parsed.rejected;
      if (total > 0) return parsed;
    }

    // Fall back: count all refund contracts (global), then the current page.
    if (refundContracts.length > 0) {
      const rows = refundContracts
        .map(mapAnalyticsRefundContractToOrderRow)
        .filter(Boolean);
      return countReturnOrdersByApproval(rows);
    }
    if (tableOrders.length > 0) {
      return countReturnOrdersByApproval(tableOrders);
    }
    return null;
  }, [refundsSummary, refundContracts, tableOrders]);

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
    tableOrders,
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
