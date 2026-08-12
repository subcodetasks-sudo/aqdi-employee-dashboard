"use client";

import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "../home/loader";
import { useRouter } from "next/navigation";
import OrdersToolbar from "./shared/orders-toolbar";
import OrdersTable from "./shared/orders-table";
import OrdersPagination from "./shared/orders-pagination";
import {
  applyAdvancedFilters,
  emptyAdvancedFilters,
} from "./shared/orders-filter-utils";
import { exportOrdersToExcel } from "./shared/orders-export";
import { useOrdersSelection } from "./shared/use-orders-selection";

export const CANCELED_ORDERS_QUERY_KEY = "canceledOrders";
export const CANCELED_ORDERS_API = "/admin/orders/status/4";

export default function CanceledOrdersWrapper() {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    clear();
  }, [debouncedSearchQuery, advancedFilters, clear]);

  const handleResetAll = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setAdvancedFilters(emptyAdvancedFilters);
    setShowMoreFilters(false);
    setCurrentPage(1);
    clear();
  };

  const { data, isLoading } = useQuery({
    queryKey: [CANCELED_ORDERS_QUERY_KEY, debouncedSearchQuery, currentPage],
    queryFn: () => {
      let url = `${CANCELED_ORDERS_API}?page=${currentPage}`;
      if (debouncedSearchQuery) {
        url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
      }
      return axiosInstance(url);
    },
  });

  const orders = data?.data?.data?.items ?? [];
  const pagination = data?.data?.data?.pagination;

  const filteredOrders = useMemo(
    () => applyAdvancedFilters(orders, advancedFilters, { showStatusColumn: true }),
    [orders, advancedFilters]
  );

  const exportConfig = useMemo(
    () => ({
      getSelectedOrders: () => selectedOrders,
      onExport: (rows) =>
        exportOrdersToExcel(rows, { filename: "طلبات-ملغية", showStatusColumn: true }),
    }),
    [selectedOrders]
  );

  const pageSelectionState = getPageSelectionState(filteredOrders);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-6 relative z-10">
        <OrdersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showAddButtons
          queryKeys={[CANCELED_ORDERS_QUERY_KEY]}
          showMoreFilters={showMoreFilters}
          onToggleMoreFilters={() => setShowMoreFilters((prev) => !prev)}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={setAdvancedFilters}
          onResetAll={handleResetAll}
          showStatusField
          exportConfig={exportConfig}
          selectedCount={selectedCount}
          onClearSelection={clear}
        />
      </div>

      <OrdersTable
        orders={filteredOrders}
        showStatusColumn
        showChangeStatus
        queryKey={[CANCELED_ORDERS_QUERY_KEY]}
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
