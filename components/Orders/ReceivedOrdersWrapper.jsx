"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "../home/Header";
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
import {
  OrdersContractStatusFilterBar,
  useOrdersContractStatusFilter,
} from "./shared/use-orders-contract-status-filter";

export const RECEIVED_ORDERS_QUERY_KEY = "receivedOrders";
export const RECEIVED_ORDERS_API = "/admin/orders/received";

export default function ReceivedOrdersWrapper() {
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

  const {
    activeFilter,
    setActiveFilter,
    statusItems,
    allTotal,
    countsById,
    statusLoading,
    countsLoading,
    appendStatusParam,
    resetStatusFilter,
  } = useOrdersContractStatusFilter({
    countsBaseUrl: RECEIVED_ORDERS_API,
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, debouncedSearchQuery]);

  useEffect(() => {
    clear();
  }, [activeFilter, debouncedSearchQuery, advancedFilters, clear]);

  const handleResetAll = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    resetStatusFilter();
    setAdvancedFilters(emptyAdvancedFilters);
    setShowMoreFilters(false);
    setCurrentPage(1);
    clear();
  };

  const { data, isLoading } = useQuery({
    queryKey: [RECEIVED_ORDERS_QUERY_KEY, activeFilter, debouncedSearchQuery, currentPage],
    queryFn: () => {
      let url = `${RECEIVED_ORDERS_API}?page=${currentPage}`;
      if (debouncedSearchQuery) {
        url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
      }
      return axiosInstance(appendStatusParam(url));
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
        exportOrdersToExcel(rows, {
          filename: "العقود-المستلمة",
          showStatusColumn: true,
        }),
    }),
    [selectedOrders]
  );

  const pageSelectionState = getPageSelectionState(filteredOrders);

  if (isLoading || statusLoading || countsLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
      <Header
        page="welcome"
        title="طلب مستلم من العميل"
        isMain={false}
        first="الرئيــسية"
        firstURL="/"
        second="طلب مستلم من العميل"
        secondURL="/home/received-orders"
      />

      <div className="flex flex-col gap-6 mt-4 relative z-10">
        <OrdersContractStatusFilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          statusItems={statusItems}
          countsById={countsById}
          allTotal={allTotal}
        />
        <OrdersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showAddButtons
          queryKeys={[RECEIVED_ORDERS_QUERY_KEY]}
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
        queryKey={[RECEIVED_ORDERS_QUERY_KEY]}
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
