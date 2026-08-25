"use client";

import React, { useState } from "react";
import NotifictionCard from "./notifiction-card";
import { Bell, Loader2 } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import OrdersPagination from "../Orders/shared/orders-pagination";
import { cn } from "@/lib/utils";

export default function NotificationList() {
  const [currentPage, setCurrentPage] = useState(1);

  function getUnreceivedOrders() {
    return axiosInstance
      .get(`/admin/orders?status_id=1&per_page=100&page=${currentPage}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["unReceivedOrders", currentPage],
    queryFn: getUnreceivedOrders,
    placeholderData: keepPreviousData,
  });

  const responseData = data?.data;
  const unreceivedOrders =
    responseData?.items ?? (Array.isArray(responseData) ? responseData : []);
  const pagination = responseData?.pagination;
  const totalCount = pagination?.total ?? unreceivedOrders.length;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "rounded-2xl border p-4 flex items-center justify-between gap-3",
          "bg-white border-[#ECECEA]",
          "dark:bg-[#13251E] dark:border-[#26473A]"
        )}
      >
        <div>
          <p className="text-13 font-bold text-gray-900 dark:text-[#D6E5DE]">
            طلبات جديدة
          </p>
          <p className="mt-1 text-11 text-[#98A39E] dark:text-[#9FC0B4]">
            بانتظار الاستلام من أي موظف
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="font-black text-[#0E5F4E] dark:text-emerald-300 text-[22px] tabular-nums leading-none">
            {totalCount}
          </span>
          <div className="relative flex items-center justify-center h-10 w-10 rounded-full bg-[#F0F8F4] text-[#0E5F4E] dark:bg-[#1B3A2E] dark:text-emerald-300">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent/20" />
            <Bell size={18} strokeWidth={2.25} className="relative" />
          </div>
        </div>
      </div>

      {unreceivedOrders.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-2xl py-10 px-4 border text-center",
            "bg-white border-[#ECECEA]",
            "dark:bg-[#13251E] dark:border-[#26473A]"
          )}
        >
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#F0F8F4] text-[#0E5F4E] dark:bg-[#1B3A2E] dark:text-emerald-300">
            <Bell size={18} strokeWidth={2} />
          </div>
          <p className="text-13 font-bold text-gray-700 dark:text-[#D6E5DE]">
            لا توجد طلبات جديدة الآن
          </p>
          <p className="text-11 text-[#98A39E] dark:text-[#9FC0B4]">
            سيظهر أي طلب جديد هنا فور وصوله
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-2.5",
            isFetching && "opacity-60 pointer-events-none transition-opacity"
          )}
        >
          {unreceivedOrders.map((order) => (
            <NotifictionCard key={order?.id} order={order} />
          ))}
        </div>
      )}

      <OrdersPagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
