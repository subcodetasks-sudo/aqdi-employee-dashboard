"use client";

import { useEffect, useState } from "react";
import {
  SettingsEmptyRow,
  SettingsListHeader,
  SettingsPagination,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const HEADERS = [
  "الاسم",
  "رقم الجوال",
  "المبلغ",
  "تاريخ الدفع",
  "الساعة",
  "رقم العقد",
  "طريقة الدفع",
  "العملة",
  { label: "الحالة", className: "text-center" },
];

const periodFilters = [
  { value: "today", label: "اليوم" },
  { value: "month", label: "الشهر" },
  { value: "year", label: "السنة" },
];

const statusFilters = [
  { value: "", label: "الكل" },
  { value: "success", label: "ناجحة" },
  { value: "failed", label: "فشلت" },
];

const statusLabels = {
  success: "ناجحة",
  failed: "فشلت",
};

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-bold text-[#111827]">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value || "all"}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-[13px] font-bold transition-colors border",
              value === option.value
                ? "bg-[#054D44] text-white border-[#054D44]"
                : "bg-white text-[#6B7280] border-[#E6EBE9] hover:border-[#054D44]/40 hover:text-[#054D44]"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [periodFilter, setPeriodFilter] = useState("month");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [periodFilter]);

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["payments", currentPage, periodFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        per_page: "20",
        page: String(currentPage),
        filter: periodFilter,
      });
      return axiosInstance.get(`/admin/payments?${params.toString()}`).then((res) => res?.data);
    },
  });

  const allPayments = responseData?.data?.items ?? [];
  const payments = statusFilter
    ? allPayments.filter((payment) => payment.status === statusFilter)
    : allPayments;
  const pagination = responseData?.data?.pagination;

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader
        title="المدفوعات"
        subtitle={
          pagination?.total != null
            ? `إجمالي ${pagination.total} عملية`
            : "سجل العمليات"
        }
      />

      <div className="rounded-2xl border border-[#E6EBE9] bg-white p-5 flex flex-col md:flex-row md:items-end gap-6 shadow-[0_4px_12px_rgba(11,83,69,0.04)]">
        <FilterGroup
          label="الفترة الزمنية"
          options={periodFilters}
          value={periodFilter}
          onChange={setPeriodFilter}
        />
        <FilterGroup
          label="حالة الدفع"
          options={statusFilters}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <SettingsTable headers={HEADERS} minWidth="1080px">
        {isLoading ? (
          <SettingsEmptyRow colSpan={9} message="جاري التحميل..." />
        ) : isError ? (
          <SettingsEmptyRow colSpan={9} message="حدث خطأ أثناء تحميل المدفوعات." />
        ) : payments.length === 0 ? (
          <SettingsEmptyRow colSpan={9} message="لا توجد مدفوعات للفلاتر المحددة." />
        ) : (
          payments.map((payment) => (
            <SettingsTableRow key={payment.id}>
              <SettingsTd>{payment.name || payment.name_payment || "—"}</SettingsTd>
              <SettingsTd dir="ltr">{payment.user_mobile || "—"}</SettingsTd>
              <SettingsTd className="font-bold tabular-nums">
                {payment.amount} {payment.tran_currency || ""}
              </SettingsTd>
              <SettingsTd>{payment.payment_date || "—"}</SettingsTd>
              <SettingsTd>{payment.payment_hour || "—"}</SettingsTd>
              <SettingsTd dir="ltr">{payment.contract_uuid || "—"}</SettingsTd>
              <SettingsTd>{payment.payment_method || "—"}</SettingsTd>
              <SettingsTd>{payment.tran_currency || "—"}</SettingsTd>
              <SettingsTd className="text-center">
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-[11px] font-bold",
                    payment.status === "success"
                      ? "bg-[#E6F7EF] text-[#15803D]"
                      : payment.status === "failed"
                        ? "bg-[#FEF2F2] text-[#DC2626]"
                        : "bg-[#F3F4F6] text-[#6B7280]"
                  )}
                >
                  {statusLabels[payment.status] || payment.status || "—"}
                </span>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>

      <SettingsPagination
        page={currentPage}
        lastPage={pagination?.last_page}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
