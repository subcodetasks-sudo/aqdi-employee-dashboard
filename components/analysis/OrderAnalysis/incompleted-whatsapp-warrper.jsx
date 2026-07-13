"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/home/Header";
import Loader from "@/components/home/loader";
import OrdersToolbar from "@/components/Orders/shared/orders-toolbar";
import OrdersPagination from "@/components/Orders/shared/orders-pagination";
import { exportWhatsappIncompletedToExcel } from "@/components/Orders/shared/orders-export";
import { useOrdersSelection } from "@/components/Orders/shared/use-orders-selection";
import {
  SelectableTableHeaderCheckbox,
  SelectableTableRowCheckbox,
} from "@/components/Orders/shared/selectable-table-checkbox";
import waIcon from "@/public/images/waIcon.svg";
import { axiosInstance } from "@/src/utils/axios";

function filterOrders(rows, query) {
  if (!query.trim()) return rows;
  const normalizedQuery = query.toLowerCase().trim();
  return rows.filter((row) =>
    Object.values(row).some(
      (value) =>
        value != null && String(value).toLowerCase().includes(normalizedQuery)
    )
  );
}

const tableHeaders = ["رقــم جوال العميل", "ملاحظات", "التاريخ", "الاجـــراءات"];

export default function InCompletedWhatsappWrapper() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
    setCurrentPage(1);
    clear();
  }, [searchQuery, clear]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders-whatsapp-incompleted", currentPage],
    queryFn: () =>
      axiosInstance(`/admin/contract-whatsapp?is_complete=0&page=${currentPage}`),
  });

  const paginatedData = data?.data?.data;
  const orders = paginatedData?.data ?? [];
  const filteredOrders = filterOrders(orders, searchQuery);
  const pagination = paginatedData;
  const pageSelectionState = getPageSelectionState(filteredOrders);

  const exportConfig = useMemo(
    () => ({
      getSelectedOrders: () => selectedOrders,
      onExport: (rows) =>
        exportWhatsappIncompletedToExcel(rows, { filename: "واتساب-غير-مكتملة" }),
    }),
    [selectedOrders]
  );

  const handleResetAll = () => {
    setSearchQuery("");
    setCurrentPage(1);
    clear();
    queryClient.invalidateQueries({ queryKey: ["orders-whatsapp-incompleted"] });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
      <Header
        page="welcome"
        title="طلبات واتساب غير مكتملة"
        isMain={false}
        first="الرئيــسية"
        firstURL="/"
        second="التحليــلات"
        secondURL="/home/analysis"
        third="طلبات واتساب غير مكتملة"
        thirdURL="/home/incompleted-whatsapp"
      />

      <div className="flex flex-col gap-6 mt-4 relative z-10">
        <OrdersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          queryKeys={["orders-whatsapp-incompleted"]}
          onResetAll={handleResetAll}
          exportConfig={exportConfig}
          selectedCount={selectedCount}
          onClearSelection={clear}
        />
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-[24px] border border-[#E4E4E4] shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-[#FAFAFA]">
            <tr>
              <SelectableTableHeaderCheckbox
                pageSelectionState={pageSelectionState}
                onTogglePage={togglePage}
                items={filteredOrders}
              />
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="text-right p-[15px_20px] text-[#A3A3A3] text-[13px] font-medium border-b border-[#E4E4E4] whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all"
                >
                  <SelectableTableRowCheckbox
                    row={row}
                    isSelected={isSelected}
                    onToggleRow={toggle}
                  />
                  <td className="p-[15px_20px]">
                    <div className="flex items-center gap-2">
                      <span className="text-black text-[13px]">{row.mobile_number}</span>
                      <Copy
                        size={10}
                        className="cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(row.mobile_number);
                          toast.success("تم نسخ الرقم");
                        }}
                      />
                      <Link
                        href={`https://wa.me/${row.mobile_number}`}
                        target="_blank"
                        className="hover:scale-110 transition-all"
                      >
                        <Image src={waIcon} alt="wa" width={16} height={16} />
                      </Link>
                    </div>
                  </td>
                  <td className="p-[15px_20px]">
                    <span>{row.notes || "--"}</span>
                  </td>
                  <td className="p-[15px_20px] text-[#616161] text-[13px]">
                    {row?.date ? new Date(row.date).toLocaleString("ar-EG") : "--"}
                  </td>
                  <td className="p-[15px_20px]">
                    <button
                      type="button"
                      onClick={() => router.push(`/home/orders/${row.id}`)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F5] text-[#4D4D4D] hover:bg-brand-main hover:text-white transition-all mx-auto"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableHeaders.length + 1}
                  className="text-center p-8 text-[#A3A3A3] text-sm"
                >
                  لا توجد نتائج مطابقة للبحث.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!searchQuery.trim() && (
        <OrdersPagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
