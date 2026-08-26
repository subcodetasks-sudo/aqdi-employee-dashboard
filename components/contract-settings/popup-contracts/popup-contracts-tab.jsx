"use client";

import { useState } from "react";
import Loader from "@/components/home/loader";
import OrdersPagination from "@/components/Orders/shared/orders-pagination";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import {
  extractUsedPopupInstrumentTypes,
  formatPopupStatus,
  getPopupInstrumentTypeLabel,
  POPUP_CONTRACTS_API,
  POPUP_CONTRACTS_QUERY_KEY,
  stripHtmlContent,
} from "@/src/lib/popup-contracts";
import AddPopupContractDialog from "./add-popup-contract-dialog";
import EditPopupContractDialog from "./edit-popup-contract-dialog";
import DeletePopupContractDialog from "./delete-popup-contract-dialog";

const PER_PAGE = 10;

const tableHeaders = [
  "نوع الوثيقة",
  "حالة بوب أب العقد",
  "حالة بوب أب العقار",
  "محتوى البوب أب",
  "نص الزر الإضافي",
  "رابط الزر الإضافي",
  "الإجراءات",
];

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        active
          ? "bg-[#E6FFE6] text-brand-accent dark:bg-emerald-500/20 dark:text-emerald-300"
          : "bg-neutral-100 text-neutral-500 dark:bg-white/[0.06] dark:text-white/50"
      }`}
    >
      {formatPopupStatus(active)}
    </span>
  );
}

export default function PopupContractsTab() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: usedTypesResponse } = useQuery({
    queryKey: [POPUP_CONTRACTS_QUERY_KEY, "used-types"],
    queryFn: () =>
      axiosInstance
        .get(`${POPUP_CONTRACTS_API}?per_page=100&page=1`)
        .then((res) => res?.data),
  });

  const { data: responseData, isLoading } = useQuery({
    queryKey: [POPUP_CONTRACTS_QUERY_KEY, currentPage],
    queryFn: () =>
      axiosInstance
        .get(`${POPUP_CONTRACTS_API}?per_page=${PER_PAGE}&page=${currentPage}`)
        .then((res) => res?.data),
  });

  const items = responseData?.data?.items ?? [];
  const pagination = responseData?.data?.pagination;
  const usedInstrumentTypes = extractUsedPopupInstrumentTypes(
    usedTypesResponse?.data?.items ?? []
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/[0.08] pb-6">
        <div className="flex flex-col gap-1.5 text-right">
          <h2 className="text-22 font-black text-black dark:text-white">محتوى إرشادي للعقود</h2>
          <p className="text-13 font-medium text-gray-500 dark:text-white/50">
            إدارة محتوى البوب أب حسب نوع الوثيقة
            {pagination?.total != null && (
              <span className="mr-2 text-brand-main dark:text-emerald-300">({pagination.total} عنصر)</span>
            )}
          </p>
        </div>
        <AddPopupContractDialog usedInstrumentTypes={usedInstrumentTypes} />
      </div>

      <div className="w-full overflow-x-auto rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-white/10 dark:bg-panel-dark dark:shadow-none">
        <table className="w-full border-collapse">
          <thead className="bg-neutral-50 dark:bg-white/[0.04]">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap border-b border-neutral-200 p-[15px_20px] text-right text-13 font-medium text-ink-placeholder dark:border-white/[0.08] dark:text-white/45"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-neutral-100 transition-all last:border-0 hover:bg-neutral-50 dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
                >
                  <td className="whitespace-nowrap p-[15px_20px] align-top">
                    <span className="text-13 font-bold text-black dark:text-white">
                      {getPopupInstrumentTypeLabel(item.instrument_type)}
                    </span>
                  </td>
                  <td className="p-[15px_20px] align-top">
                    <StatusBadge active={item.popup_status_contract} />
                  </td>
                  <td className="p-[15px_20px] align-top">
                    <StatusBadge active={item.popup_status_realestate} />
                  </td>
                  <td className="max-w-[280px] p-[15px_20px] align-top">
                    <p className="line-clamp-3 text-13 leading-relaxed text-ink-subtle dark:text-white/60">
                      {stripHtmlContent(item.content_popup) || "---"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap p-[15px_20px] align-top">
                    <span className="text-13 font-medium text-black dark:text-white/80">
                      {item.button_text || "---"}
                    </span>
                  </td>
                  <td className="max-w-[220px] p-[15px_20px] align-top">
                    {item.button_link ? (
                      <a
                        href={item.button_link}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-2 break-all text-13 font-medium text-brand-main hover:underline dark:text-emerald-300"
                      >
                        {item.button_link}
                      </a>
                    ) : (
                      <span className="text-13 text-ink-placeholder dark:text-white/35">---</span>
                    )}
                  </td>
                  <td className="p-[15px_20px] align-top">
                    <div className="flex items-center gap-2">
                      <EditPopupContractDialog
                        item={item}
                        usedInstrumentTypes={usedInstrumentTypes}
                      />
                      {/* <DeletePopupContractDialog item={item} /> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="p-8 text-center text-sm text-ink-placeholder dark:text-white/40"
                >
                  لا يوجد محتوى إرشادي حالياً. اضغط على &quot;إضافة محتوى جديد&quot; للبدء.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrdersPagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
