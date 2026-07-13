"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/home/Header";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/home/loader";
import { useRouter } from "next/navigation";
import OrdersToolbar from "@/components/Orders/shared/orders-toolbar";
import OrdersTable from "@/components/Orders/shared/orders-table";
import OrdersPagination from "@/components/Orders/shared/orders-pagination";
import {
  applyAdvancedFilters,
  emptyAdvancedFilters,
} from "@/components/Orders/shared/orders-filter-utils";
import { exportOrdersToExcel } from "@/components/Orders/shared/orders-export";
import { useOrdersSelection } from "@/components/Orders/shared/use-orders-selection";

export default function InCompletedOrdersAnalysisWrapper({ id }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(emptyAdvancedFilters);
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
  }, [id, debouncedSearchQuery, advancedFilters]);

  useEffect(() => {
    clear();
  }, [id, debouncedSearchQuery, advancedFilters, clear]);

  useEffect(() => {
    switch (id) {
      case "day":
        setTitle("طلبات اليــوم الغيــر المكتمله");
        break;
      case "week":
        setTitle("طلبات الأسبوع الغيــر المكتمله");
        break;
      case "month":
        setTitle("طلبات الشهر الغيــر المكتمله");
        break;
      case "year":
        setTitle("طلبات السنة الغيــر المكتمله");
        break;
      case "total":
        setTitle("إجمالي الطلبات الغيــر المكتمله");
        break;
      default:
        setTitle("الطلبات الغيــر المكتملة");
        break;
    }
  }, [id]);

  const { data, isLoading } = useQuery({
    queryKey: ["inCompletedOrders", id, debouncedSearchQuery, currentPage],
    queryFn: () => {
      const createAt = id === "total" ? "all" : id;
      let url = `/admin/orders/incomplete/list?created_at=${createAt}&page=${currentPage}`;
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
        exportOrdersToExcel(rows, {
          filename: "الطلبات-غير-المكتملة",
          showStatusColumn: true,
        }),
    }),
    [selectedOrders]
  );

  const pageSelectionState = getPageSelectionState(filteredOrders);

  const handleResetAll = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setAdvancedFilters(emptyAdvancedFilters);
    setShowMoreFilters(false);
    setCurrentPage(1);
    clear();
    queryClient.invalidateQueries({ queryKey: ["inCompletedOrders"] });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
      <Header
        page="welcome"
        title={title}
        isMain={false}
        first="الرئيــسية"
        firstURL="/"
        second="التحليــلات"
        secondURL="/home/analysis"
        third={title}
        thirdURL={`/home/incolpleted-orders-analysis/${id}`}
      />

      <div className="flex flex-col gap-6 mt-4 relative z-10">
        <OrdersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          queryKeys={["inCompletedOrders"]}
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
        showChangeStatus={false}
        queryKey={["inCompletedOrders", id]}
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
