"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { filterOrdersPageStatusItems } from "@/src/lib/orders-page-statuses";
import { useOrderStatusCounts } from "./use-order-status-counts";
import OrdersStatusCards from "./orders-status-cards";

/**
 * Shared contract-status filter tabs (جديد / استرجاع / ملغي / معلق / مستلم / تم التوثيق)
 * used across order list pages.
 */
export function useOrdersContractStatusFilter({
  countsBaseUrl = "/admin/orders",
  statusParam = "contract_status_id",
  countsExtraParams = "",
  enabled = true,
} = {}) {
  const [activeFilter, setActiveFilter] = useState("");

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["status"],
    queryFn: () => axiosInstance("/admin/contract-statuses"),
    enabled,
  });

  const statusItems = useMemo(
    () => filterOrdersPageStatusItems(statusData?.data?.data?.items),
    [statusData]
  );

  const {
    allTotal,
    byId: countsById,
    isLoading: countsLoading,
  } = useOrderStatusCounts(enabled ? statusItems : [], {
    baseUrl: countsBaseUrl,
    statusParam,
    extraParams: countsExtraParams,
  });

  const appendStatusParam = (url) => {
    if (!activeFilter) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${statusParam}=${activeFilter}`;
  };

  const resetStatusFilter = () => setActiveFilter("");

  return {
    activeFilter,
    setActiveFilter,
    statusItems,
    allTotal,
    countsById,
    statusLoading: enabled ? statusLoading : false,
    countsLoading: enabled ? countsLoading : false,
    appendStatusParam,
    resetStatusFilter,
  };
}

export function OrdersContractStatusFilterBar({
  activeFilter,
  onFilterChange,
  statusItems,
  countsById,
  allTotal,
  showAllCard = false,
  className = "flex flex-wrap gap-3",
}) {
  if (!statusItems?.length) return null;

  return (
    <OrdersStatusCards
      statusItems={statusItems}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      showAllCard={showAllCard}
      allTotal={allTotal}
      countsById={countsById}
      gridClassName={className}
    />
  );
}
