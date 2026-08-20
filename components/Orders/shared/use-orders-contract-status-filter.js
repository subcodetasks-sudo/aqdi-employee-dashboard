"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { getDefaultOrdersPageStatusId } from "@/src/lib/orders-page-statuses";
import {
  CONTRACT_STATUSES_ACTIVE_API,
  CONTRACT_STATUSES_ACTIVE_QUERY_KEY,
  extractContractStatusItems,
} from "@/src/lib/contract-statuses";
import { useOrderStatusCounts } from "./use-order-status-counts";
import OrdersStatusCards from "./orders-status-cards";

/**
 * Shared contract-status filter tabs for order list pages.
 * Shows active statuses from /admin/contract-statuses/active. Default selection is جديد.
 */
export function useOrdersContractStatusFilter({
  countsBaseUrl = "/admin/orders",
  statusParam = "status_id",
  countsExtraParams = "",
  enabled = true,
} = {}) {
  // null = use default (جديد) once statuses are loaded
  const [activeFilter, setActiveFilter] = useState(null);

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: [CONTRACT_STATUSES_ACTIVE_QUERY_KEY],
    queryFn: () => axiosInstance(CONTRACT_STATUSES_ACTIVE_API),
    enabled,
  });

  const statusItems = useMemo(
    () => extractContractStatusItems(statusData),
    [statusData]
  );

  const defaultFilterId = useMemo(() => {
    const id = getDefaultOrdersPageStatusId(statusItems);
    return id != null && id !== "" ? String(id) : "";
  }, [statusItems]);

  const resolvedActiveFilter =
    activeFilter === null ? defaultFilterId : activeFilter;

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
    if (!resolvedActiveFilter) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${statusParam}=${resolvedActiveFilter}`;
  };

  const resetStatusFilter = () => setActiveFilter(null);

  return {
    activeFilter: resolvedActiveFilter,
    setActiveFilter,
    statusItems,
    allTotal,
    countsById,
    statusLoading: enabled ? statusLoading : false,
    countsLoading: enabled ? countsLoading : false,
    appendStatusParam,
    resetStatusFilter,
    defaultFilterId,
    /** False until contract statuses are loaded and the default (جديد) can be resolved. */
    statusFilterReady: enabled ? !statusLoading : true,
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
  if (!statusItems?.length && !showAllCard) return null;

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
