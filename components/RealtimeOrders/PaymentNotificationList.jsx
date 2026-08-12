"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CreditCard, Loader2, X } from "lucide-react";
import { axiosInstance } from "@/src/utils/axios";
import { useSidebarStore } from "@/src/stores/sidebar-store";
import { Button } from "@/components/ui/button";
import OrdersPagination from "@/components/Orders/shared/orders-pagination";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const statusLabels = {
  success: "ناجحة",
  failed: "فشلت",
  pending: "قيد الانتظار",
};

function extractPayments(response) {
  const body = response?.data ?? response;
  const payload = body?.data ?? body;
  const items = payload?.items ?? [];
  const pagination = payload?.pagination ?? null;
  return { items: Array.isArray(items) ? items : [], pagination };
}

export default function PaymentNotificationList() {
  const { setDisplayedPart } = useSidebarStore();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["payment-notifications", currentPage],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/payments", {
        params: { page: currentPage, per_page: 20, filter: "today" },
      });
      return extractPayments(res.data);
    },
    placeholderData: keepPreviousData,
  });

  const payments = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? payments.length;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-brand-hover" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="font-bold text-lg text-black">إشعارات الدفع</p>
        <Button
          onClick={() => setDisplayedPart("default")}
          className="size-8 rounded-full flex items-center justify-center ms-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-white rounded-[18px] p-4 border border-[#F0F0F0] shadow flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-bold text-[15px] text-black">مدفوعات اليوم</p>
          <CreditCard className="size-5 text-[#0B5345]" />
        </div>
        <p className="font-black text-black text-3xl tabular-nums">{total}</p>
        <Link
          href="/home/invoices"
          className="text-[12px] font-bold text-[#0B5345] hover:underline w-fit"
        >
          عرض كل الفواتير
        </Link>
      </div>

      <div
        className={cn(
          "flex flex-col gap-3",
          isFetching && !isLoading && "opacity-60 pointer-events-none"
        )}
      >
        {payments.length === 0 ? (
          <p className="text-center text-[13px] text-[#9CA3AF] py-8">
            لا توجد مدفوعات اليوم
          </p>
        ) : (
          payments.map((payment) => {
            const success = payment.status === "success";
            return (
              <div
                key={payment.id}
                className="bg-white rounded-[18px] p-4 border border-[#F0F0F0] shadow space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-black text-[14px] text-black truncate">
                      {payment.name || payment.name_payment || "عملية دفع"}
                    </p>
                    <p className="text-[12px] text-[#9CA3AF] tabular-nums" dir="ltr">
                      {payment.user_mobile || payment.contract_uuid || "—"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                      success
                        ? "bg-[#E6F7EF] text-[#15803D]"
                        : payment.status === "failed"
                          ? "bg-[#FEF2F2] text-[#DC2626]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                    )}
                  >
                    {statusLabels[payment.status] || payment.status || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12.5px] font-bold">
                  <span className="tabular-nums text-[#0B5345]">
                    {payment.amount} {payment.tran_currency || "ريال"}
                  </span>
                  <span className="text-[#9CA3AF] font-medium">
                    {payment.payment_hour || payment.payment_date || ""}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <OrdersPagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
