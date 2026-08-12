"use client";

import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "../home/loader";
import { useRouter } from "next/navigation";
import OrdersToolbar from "./shared/orders-toolbar";
import OrdersStatusCards from "./shared/orders-status-cards";
import OrdersTable from "./shared/orders-table";
import OrdersPagination from "./shared/orders-pagination";
import {
  applyAdvancedFilters,
  emptyAdvancedFilters,
} from "./shared/orders-filter-utils";
import { exportOrdersToExcel } from "./shared/orders-export";
import { useOrdersSelection } from "./shared/use-orders-selection";
import { useDraftOrderStatusCounts } from "./shared/use-draft-order-status-counts";
import {
  buildDraftOrdersUrl,
  extractDraftOrdersPayload,
} from "@/src/lib/draft-contract-statuses";
import {
  getDefaultOrdersPageStatusId,
} from "@/src/lib/orders-page-statuses";

const DRAFT_CONTRACTS_QUERY_KEY = "draftContracts";

export default function DraftContractsWrapper() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(emptyAdvancedFilters);
  const router = useRouter();
  const {
    selectedOrders,
    selectedCount,
    isSelected,
    toggle,
    togglePage,
    clear,
    getPageSelectionState,
  } = useOrdersSelection();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["status"],
    queryFn: () => axiosInstance("/admin/contract-statuses"),
  });

  const statusItems = useMemo(
    () => statusData?.data?.data?.items ?? [],
    [statusData]
  );

  const defaultFilterId = useMemo(() => {
    const id = getDefaultOrdersPageStatusId(statusItems);
    return id != null && id !== "" ? String(id) : "";
  }, [statusItems]);

  const resolvedActiveFilter =
    activeFilter === null ? defaultFilterId : activeFilter;

  const statusFilterReady = !statusLoading;

  const { byId: countsById, isLoading: countsLoading } =
    useDraftOrderStatusCounts(statusItems);

  useEffect(() => {
    setCurrentPage(1);
  }, [resolvedActiveFilter, debouncedSearchQuery]);

  useEffect(() => {
    clear();
  }, [resolvedActiveFilter, debouncedSearchQuery, advancedFilters, clear]);

  const handleResetAll = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setActiveFilter(null);
    setAdvancedFilters(emptyAdvancedFilters);
    setShowMoreFilters(false);
    setCurrentPage(1);
    clear();
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      DRAFT_CONTRACTS_QUERY_KEY,
      resolvedActiveFilter,
      debouncedSearchQuery,
      currentPage,
    ],
    enabled: statusFilterReady && Boolean(resolvedActiveFilter),
    queryFn: () =>
      axiosInstance(
        buildDraftOrdersUrl({
          statusId: resolvedActiveFilter,
          page: currentPage,
          search: debouncedSearchQuery || undefined,
        })
      ),
  });

  const { items: orders, pagination } = useMemo(
    () => extractDraftOrdersPayload(data),
    [data]
  );

  const filteredOrders = useMemo(
    () =>
      applyAdvancedFilters(orders, advancedFilters, { showStatusColumn: true }),
    [orders, advancedFilters]
  );

  const exportConfig = useMemo(
    () => ({
      getSelectedOrders: () => selectedOrders,
      onExport: (rows) =>
        exportOrdersToExcel(rows, {
          filename: "مسودة-العقود",
          showStatusColumn: true,
        }),
    }),
    [selectedOrders]
  );

  const pageSelectionState = getPageSelectionState(filteredOrders);

  if (!statusFilterReady || isLoading || countsLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-6 relative z-10">
        {statusItems.length > 0 ? (
          <OrdersStatusCards
            statusItems={statusItems}
            activeFilter={resolvedActiveFilter}
            onFilterChange={setActiveFilter}
            countsById={countsById}
            gridClassName="flex flex-wrap gap-3"
          />
        ) : null}

        <OrdersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showAddButtons
          queryKeys={[DRAFT_CONTRACTS_QUERY_KEY]}
          showMoreFilters={showMoreFilters}
          onToggleMoreFilters={() => setShowMoreFilters((prev) => !prev)}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={setAdvancedFilters}
          onResetAll={handleResetAll}
          showStatusField={false}
          exportConfig={exportConfig}
          selectedCount={selectedCount}
          onClearSelection={clear}
        />
      </div>

      <OrdersTable
        orders={filteredOrders}
        showStatusColumn
        showChangeStatus
        queryKey={[DRAFT_CONTRACTS_QUERY_KEY]}
        onRowClick={(row) => router.push(`/home/orders/${row.id}`)}
        selectable
        isSelected={isSelected}
        onToggleRow={toggle}
        onTogglePage={togglePage}
        pageSelectionState={pageSelectionState}
      />

      <OrdersPagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
