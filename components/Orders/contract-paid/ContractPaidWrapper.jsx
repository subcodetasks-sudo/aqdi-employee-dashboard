"use client";

import CreateContractPaidDialog from "@/components/Orders/contract-paid/create-contract-paid-dialog";
import {
  CONTRACT_PAID_API,
  CONTRACT_PAID_QUERY_KEY,
  exportContractPaidToExcel,
  extractContractPaidRecord,
  extractPaymentFromResponse,
  getContractPaidPeriodLabel,
  getContractPaidTypeLabel,
  normalizeContractPaidList,
} from "@/components/Orders/contract-paid/contract-paid-utils";
import PaymentLinkDialog from "@/components/Orders/shared/payment-link-dialog";
import { fetchAllPaginatedOrders } from "@/components/Orders/shared/orders-export";
import Header from "@/components/home/Header";
import Loader from "@/components/home/loader";
import OrdersPagination from "@/components/Orders/shared/orders-pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import greenRial from "@/public/images/greenRial.svg";
import waIcon from "@/public/images/waIcon.svg";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet, Link2, Loader2, RefreshCw, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PAYMENT_FILTERS = [
  { value: "", label: "الكل" },
  { value: "1", label: "مدفوع" },
  { value: "0", label: "غير مدفوع" },
];

const ALL_PAYMENT_FILTER_VALUE = "all";

function PaymentStatusBadge({ isPaid }) {
  const paid = isPaid === true || isPaid === 1;

  if (paid) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-[#E6FFE6] text-[#10B981]">
        تم الدفع
      </span>
    );
  }

  return (
    <span className="px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-[#FFF4E6] text-[#F59E0B]">
      لم يتم الدفع
    </span>
  );
}

export default function ContractPaidWrapper() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [paidFilter, setPaidFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState({ paymentUrl: "", cartAmount: null });
  const [loadingPaymentId, setLoadingPaymentId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, paidFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: [CONTRACT_PAID_QUERY_KEY, currentPage, debouncedSearchQuery, paidFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(currentPage) });

      if (debouncedSearchQuery) {
        params.set("search", debouncedSearchQuery);
      }

      if (paidFilter !== "") {
        params.set("is_paid", paidFilter);
      }

      const res = await axiosInstance.get(`${CONTRACT_PAID_API}?${params.toString()}`);
      return normalizeContractPaidList(res);
    },
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const {
    data: selectedRecord,
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching,
  } = useQuery({
    queryKey: [CONTRACT_PAID_QUERY_KEY, "details", selectedRecordId],
    enabled: Boolean(selectedRecordId && detailsOpen),
    queryFn: async () => {
      const res = await axiosInstance.get(`${CONTRACT_PAID_API}/${selectedRecordId}`);
      return extractContractPaidRecord(res);
    },
  });

  const handleRefresh = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setPaidFilter("");
    setCurrentPage(1);
    refetch();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const buildUrl = (page) => {
        const params = new URLSearchParams({ page: String(page) });

        if (debouncedSearchQuery) {
          params.set("search", debouncedSearchQuery);
        }

        if (paidFilter !== "") {
          params.set("is_paid", paidFilter);
        }

        return `${CONTRACT_PAID_API}?${params.toString()}`;
      };

      const rows = await fetchAllPaginatedOrders(buildUrl);
      const exported = exportContractPaidToExcel(rows, { filename: "العقود-المدفوعة" });

      if (!exported) {
        toast.error("لا توجد بيانات للتصدير");
        return;
      }

      toast.success("تم تصدير البيانات بنجاح");
    } catch (error) {
      toast.error(error?.response?.data?.message || "تعذر تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenPaymentLink = async (record) => {
    setLoadingPaymentId(record.id);
    try {
      const res = await axiosInstance.get(`${CONTRACT_PAID_API}/${record.id}`);
      const { paymentUrl, cartAmount } = extractPaymentFromResponse(res.data);

      if (!paymentUrl) {
        toast.error("رابط الدفع غير متوفر لهذا السجل");
        return;
      }

      setPaymentLink({ paymentUrl, cartAmount: cartAmount ?? record.amount });
      setPaymentDialogOpen(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "تعذر جلب رابط الدفع");
    } finally {
      setLoadingPaymentId(null);
    }
  };

  const handleOpenDetails = (record) => {
    setSelectedRecordId(record.id);
    setDetailsOpen(true);
  };

  const detailRecord = selectedRecord ?? items.find((item) => item.id === selectedRecordId) ?? null;
  const detailFields = detailRecord
    ? [
        { label: "رقم السجل", value: detailRecord.id },
        { label: "رقم العقد", value: detailRecord.contract_uuid },
        { label: "رقم جوال العميل", value: detailRecord.customer_mobile, dir: "ltr" },
        { label: "نوع العقد", value: getContractPaidTypeLabel(detailRecord) },
        { label: "مدة العقد", value: getContractPaidPeriodLabel(detailRecord) },
        { label: "رقم مسودة العقد", value: detailRecord.draft_contract_number, dir: "ltr" },
        { label: "المبلغ", value: detailRecord.amount },
        { label: "اسم الموظف", value: detailRecord.employee_name },
        {
          label: "حالة الدفع",
          value:
            detailRecord.is_paid === true || detailRecord.is_paid === 1
              ? "تم الدفع"
              : "لم يتم الدفع",
        },
        { label: "تاريخ الإنشاء", value: detailRecord.created_at },
        { label: "آخر تحديث", value: detailRecord.updated_at },
      ].filter((field) => field.value !== undefined && field.value !== null && field.value !== "" && field.value !== "—")
    : [];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
      <Header
        page="welcome"
        title="إنشاء عقد مدفوع"
        isMain={false}
        first="الرئيــسية"
        firstURL="/"
        second="إنشاء عقد مدفوع"
        secondURL="/home/contract-paid"
      />

      <div className="flex max-md:flex-wrap items-center gap-3 w-full">
        <CreateContractPaidDialog />

        <div className="relative w-full  ">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] size-5" />
          <input
            type="text"
            placeholder="البحث برقم الجوال..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[46px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-full pr-12 pl-4 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all shadow-inner"
          />
        </div>

        <Select
          dir="rtl"
          value={paidFilter || ALL_PAYMENT_FILTER_VALUE}
          onValueChange={(value) =>
            setPaidFilter(value === ALL_PAYMENT_FILTER_VALUE ? "" : value)
          }
        >
          <SelectTrigger className="h-[46px] w-full min-w-[140px] md:w-[140px] rounded-full border-[#EEEEEE] bg-white px-4 text-[14px] font-medium text-[#4D4D4D] shadow-none focus:ring-0 focus:ring-offset-0 focus:border-brand-main [&>span]:text-right">
            <SelectValue placeholder="الكل" />
          </SelectTrigger>
          <SelectContent dir="rtl" className="rounded-2xl border-[#EEEEEE]">
            {PAYMENT_FILTERS.map((option) => (
              <SelectItem
                key={option.value || ALL_PAYMENT_FILTER_VALUE}
                value={option.value || ALL_PAYMENT_FILTER_VALUE}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="h-[46px] px-5 rounded-full border border-[#10B981] bg-white text-[#10B981] hover:bg-[#10B981] hover:text-white font-bold text-[14px] transition-all shadow-sm flex items-center gap-2 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          title="تصدير Excel"
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="size-4" />
          )}
          {isExporting ? "جاري التصدير..." : "تصدير Excel"}
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetching}
          className="w-[46px] h-[46px] flex items-center justify-center rounded-full border border-[#EEEEEE] bg-[#10B981] text-white hover:bg-[#0E9F6E] transition-all shadow-sm shrink-0 disabled:opacity-60"
          title="تحديث"
        >
          <RefreshCw className={`size-5 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-[24px] border border-[#E4E4E4] shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-[#FAFAFA]">
            <tr>
              {[
                "رقــم العقد",
                "رقــم جوال العميل",
                "نوع العقد",
                "مدة العقد",
                "رقم مسودة العقد",
                "المبلغ",
                "الموظف",
                "حالة الدفع",
                "الملاحظات",
                "تاريخ الإنشاء",
                "الاجـــراءات",
              ].map((header) => (
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
            {items.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center p-8 text-[#A3A3A3] text-sm">
                  لا توجد سجلات حالياً
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const isPaid = row.is_paid === true || row.is_paid === 1;

                return (
                  <tr
                    key={row.id}
                    onClick={() => handleOpenDetails(row)}
                    className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all cursor-pointer"
                  >
                    <td className="p-[15px_20px]">
                      <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#f9f9f9] rounded-lg w-fit mx-auto border border-[#eee]">
                        <span className="text-black text-[12px] font-bold">
                          {row.contract_uuid || "---"}
                        </span>
                        {row.contract_uuid ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(row.contract_uuid);
                              toast.success("تم نسخ رقم العقد");
                            }}
                            className="text-[#A3A3A3] hover:text-brand-main"
                          >
                            <i className="fa-regular fa-copy text-[11px]" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-[15px_20px]">
                      <div className="flex items-center gap-2">
                        {row.customer_mobile ? (
                          <Link
                            href={`https://wa.me/${row.customer_mobile}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:scale-110 transition-all"
                          >
                            <Image src={waIcon} alt="wa" width={16} height={16} />
                          </Link>
                        ) : null}
                        <span className="text-black text-[13px]" dir="ltr">
                          {row.customer_mobile || "---"}
                        </span>
                        {row.customer_mobile ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(row.customer_mobile);
                              toast.success("تم نسخ رقم الجوال");
                            }}
                            className="text-[#A3A3A3] hover:text-brand-main"
                          >
                            <i className="fa-regular fa-copy text-[11px]" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-[15px_20px]">
                      <span className="text-[13px] text-[#4D4D4D] font-medium whitespace-nowrap">
                        {getContractPaidTypeLabel(row)}
                      </span>
                    </td>
                    <td className="p-[15px_20px]">
                      <span
                        className="text-[13px] text-[#4D4D4D] font-medium max-w-[180px] truncate block"
                        title={getContractPaidPeriodLabel(row)}
                      >
                        {getContractPaidPeriodLabel(row)}
                      </span>
                    </td>
                    <td className="p-[15px_20px]">
                      <span className="text-[13px] text-[#4D4D4D] font-medium" dir="ltr">
                        {row.draft_contract_number || "---"}
                      </span>
                    </td>
                    <td className="p-[15px_20px]">
                      <div className="flex items-center gap-1.5 text-[#007C13] font-bold text-[13px]">
                        <span>{row.amount ?? "---"}</span>
                        <Image src={greenRial} alt="rial" width={14} height={14} />
                      </div>
                    </td>
                    <td className="p-[15px_20px]">
                      <span className="text-[13px] text-[#4D4D4D] font-medium">
                        {row.employee_name || "---"}
                      </span>
                    </td>
                    <td className="p-[15px_20px]">
                      <PaymentStatusBadge isPaid={row.is_paid} />
                    </td>
                    <td className="p-[15px_20px]">
                      <span
                        className="text-[13px] text-[#4D4D4D] max-w-[160px] truncate block"
                        title={row.notes || ""}
                      >
                        {row.notes || "—"}
                      </span>
                    </td>
                    <td className="p-[15px_20px] text-[13px] text-black font-medium whitespace-nowrap">
                      {row.created_at || "---"}
                    </td>
                    <td className="p-[15px_20px]">
                      {!isPaid ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPaymentLink(row);
                          }}
                          disabled={loadingPaymentId === row.id}
                          className="h-9 shrink-0 gap-2 whitespace-nowrap rounded-full bg-[#0019FF] px-4 text-[12px] font-bold text-white hover:bg-[#0015CC]"
                        >
                          {loadingPaymentId === row.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <>
                              <Link2 className="size-4" />
                              رابط الدفع
                            </>
                          )}
                        </Button>
                      ) : (
                        <span className="text-[12px] text-[#A3A3A3]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <OrdersPagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <PaymentLinkDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        paymentUrl={paymentLink.paymentUrl}
        cartAmount={paymentLink.cartAmount}
      />

      <Dialog
        dir="rtl"
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedRecordId(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-[28px] border-[#E4E4E4] p-0 overflow-hidden" closeButton={false}>
          <DialogHeader className="border-b border-[#F2F2F2] px-6 py-5 text-right flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#1A1A1A] text-start">
              تفاصيل العقد المدفوع
            </DialogTitle>
            <Button className="bg-brand-hover hover:bg-brand-hover/90 text-white size-8 rounded-full flex items-center justify-center" onClick={() => setDetailsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <div className="px-6 py-5">
            {isDetailsLoading || isDetailsFetching ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-brand-main" />
              </div>
            ) : detailRecord ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {detailFields.map((field) => (
                    <div
                      key={field.label}
                      className="rounded-2xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3 text-right"
                    >
                      <p className="mb-1 text-xs font-medium text-[#A3A3A3]">{field.label}</p>
                      <p
                        className="text-sm font-bold text-[#1A1A1A] break-words"
                        dir={field.dir || "rtl"}
                      >
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>

                {"notes" in detailRecord ? (
                  <div className="rounded-3xl border border-[#EEEEEE] bg-white px-5 py-4">
                    <p className="mb-2 text-sm font-bold text-[#1A1A1A]">الملاحظات</p>
                    <p className="text-sm leading-7 text-[#4D4D4D] whitespace-pre-wrap">
                      {detailRecord.notes || "لا توجد ملاحظات"}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-[#A3A3A3]">
                تعذر تحميل تفاصيل السجل
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
