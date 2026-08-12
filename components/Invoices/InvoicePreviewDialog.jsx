"use client";

import { useEffect, useState } from "react";
import { Pencil, Printer, ReceiptText, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONTRACT_TYPE, INVOICE_STATUS } from "./mock-data";
import { getInvoiceItemDescription, printInvoice } from "./print-invoice";

export default function InvoicePreviewDialog({ open, onOpenChange, invoice }) {
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    if (open && invoice) {
      setCustomerName(invoice.customerName || "");
    }
  }, [open, invoice]);

  if (!invoice) return null;

  const typeMeta = CONTRACT_TYPE[invoice.contractType] || CONTRACT_TYPE.residential;
  const statusMeta = INVOICE_STATUS[invoice.status] || INVOICE_STATUS.paid;
  const isPaid = invoice.status !== "refunded";
  const displayName = customerName.trim();
  const customerLine = displayName
    ? `${displayName} (${invoice.mobile})`
    : invoice.mobile;

  const handlePrint = () => {
    const opened = printInvoice(invoice, displayName);
    if (!opened) toast.error("تعذر فتح نافذة الطباعة");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeButton={false}
        dir="rtl"
        className="max-w-[640px] w-[calc(100%-1.5rem)] max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 bg-white shadow-2xl dark:bg-[#0F1C16]"
      >
        <div className="relative px-5 pt-5 pb-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="إغلاق"
            className="absolute left-5 top-5 inline-flex size-8 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] transition-colors dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#0B5345] text-white">
              <ReceiptText className="size-4" />
            </span>
            <DialogTitle className="text-[20px] font-bold text-[#111827] dark:text-white">
              الفاتورة
            </DialogTitle>
          </div>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-4">
          <div className="rounded-xl border border-dashed border-[#E8C36A] bg-[#FFF8E1] px-4 py-3 dark:border-amber-500/40 dark:bg-amber-500/10">
            <label
              htmlFor="invoice-customer-name"
              className="flex items-center gap-1.5 text-[12px] font-bold text-[#B45309] mb-2"
            >
              <Pencil className="size-3.5" />
              اسم العميل (يظهر بالفاتورة عند الطباعة – اختياري):
            </label>
            <input
              id="invoice-customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full h-10 rounded-md border border-[#111827] bg-white px-3 text-[13px] font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 dark:bg-[#13241C] dark:border-white/20 dark:text-white"
            />
          </div>

          <div className="rounded-xl border border-[#E5E7EB] p-5 dark:border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[28px] font-black leading-none text-[#0B5345] dark:text-emerald-400">
                  عقدي
                </h2>
                <p className="mt-1.5 text-[12px] font-semibold text-[#6B7280] dark:text-white/50">
                  منصة توثيق عقود الإيجار
                </p>
              </div>
              <div className="text-[12px] font-medium text-[#4B5563] dark:text-white/60 leading-7 text-left">
                <div>
                  رقم الفاتورة{" "}
                  <span className="font-bold text-[#111827] dark:text-white tabular-nums">
                    {invoice.invoiceNo}
                  </span>
                </div>
                <div>
                  التاريخ{" "}
                  <span className="font-bold text-[#111827] dark:text-white tabular-nums">
                    {invoice.date}
                  </span>
                </div>
                <div>
                  الرقم المرجعي{" "}
                  <span className="font-bold text-[#111827] dark:text-white tabular-nums">
                    {invoice.referenceNo}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[2px] bg-[#0B5345] my-4 rounded-full" />

            <div className="grid grid-cols-3 gap-2.5 max-[520px]:grid-cols-1">
              <div className="rounded-lg bg-[#F3F4F6] px-3 py-2.5 dark:bg-white/[0.06]">
                <p className="text-[11px] font-medium text-[#6B7280] dark:text-white/45 mb-1">
                  العميل
                </p>
                <p className="text-[13px] font-bold text-[#111827] dark:text-white leading-snug">
                  {customerLine}
                </p>
              </div>
              <div className="rounded-lg bg-[#F3F4F6] px-3 py-2.5 dark:bg-white/[0.06]">
                <p className="text-[11px] font-medium text-[#6B7280] dark:text-white/45 mb-1">
                  رقم الطلب
                </p>
                <p className="text-[13px] font-bold text-[#111827] dark:text-white tabular-nums">
                  #{invoice.orderNo}
                </p>
              </div>
              <div className="rounded-lg bg-[#F3F4F6] px-3 py-2.5 dark:bg-white/[0.06]">
                <p className="text-[11px] font-medium text-[#6B7280] dark:text-white/45 mb-1">
                  نوع العقد
                </p>
                <p className="text-[13px] font-bold text-[#111827] dark:text-white">
                  {typeMeta.label}
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-[#E5E7EB] dark:border-white/10">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#F3F4F6] dark:bg-white/[0.06]">
                    <th className="w-12 px-3 py-2.5 text-right text-[12px] font-bold text-[#6B7280] dark:text-white/50">
                      #
                    </th>
                    <th className="px-3 py-2.5 text-right text-[12px] font-bold text-[#6B7280] dark:text-white/50">
                      الوصف
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-3 text-[13px] font-bold text-[#111827] dark:text-white">
                      1
                    </td>
                    <td className="px-3 py-3 text-[13px] font-medium text-[#111827] dark:text-white leading-relaxed">
                      {getInvoiceItemDescription(invoice.contractType)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex items-center justify-between bg-[#E8F5F1] px-3.5 py-3 text-[13px] font-extrabold text-[#0B5345] dark:bg-emerald-500/15 dark:text-emerald-300">
                <span>الإجمالي المستحق</span>
                <span className="tabular-nums">
                  {Number(invoice.amount).toLocaleString("en-US")} ريال
                </span>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1 h-8 px-4 rounded-full border text-[12px] font-bold",
                  isPaid
                    ? "border-[#16A34A] text-[#15803D] bg-white dark:bg-transparent dark:border-emerald-400 dark:text-emerald-300"
                    : "border-[#DC2626] text-[#C62828] bg-white dark:bg-transparent dark:border-rose-400 dark:text-rose-300"
                )}
              >
                {statusMeta.label}
                {isPaid ? " ✓" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 rounded-xl bg-[#F3F4F6] text-[13px] font-bold text-[#4B5563] hover:bg-[#E5E7EB] transition-colors dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="h-11 flex-1 max-w-[280px] rounded-xl bg-[#0B5345] text-white text-[13px] font-bold inline-flex items-center justify-center gap-2 hover:bg-[#09463a] transition-colors"
            >
              <Printer className="size-4" />
              طباعة الفاتورة
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
