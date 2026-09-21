"use client";

import { Check, CreditCard, UserRound, Wallet } from "lucide-react";
import { RT } from "../../theme";
import { cn } from "@/lib/utils";
import { AccentCard, Field, GroupTitle, Money } from "./primitives";

const PAYMENT_METHOD_LABELS = {
  creditcard: "بطاقة ائتمان",
  mada: "مدى",
  applepay: "Apple Pay",
  stcpay: "STC Pay",
};

function paymentMethodLabel(value) {
  if (!value) return null;
  const key = String(value).toLowerCase();
  return PAYMENT_METHOD_LABELS[key] || value;
}

function paymentStatusLabel(status) {
  if (status === "success" || status === "paid") return "ناجح";
  if (status === "pending") return "قيد الانتظار";
  if (status === "failed") return "فشل";
  return status || null;
}

export default function TenantFinancialGroup({ order, onEdit }) {
  const financial = order.financial ?? {};
  const totalPrice = financial.total_price;
  const payments = financial.payments ?? [];

  return (
    <section className="rounded-2xl border border-dashed border-[#D7E3DE] dark:border-white/10 bg-[#F7FAF8] dark:bg-white/[0.02] p-3 sm:p-3.5 space-y-3">
      <GroupTitle>المجموعة 2 - المستأجر، المالية، الشروط</GroupTitle>

      <AccentCard
        accent={RT.brand}
        icon={UserRound}
        title="المستأجر"
        onEdit={() => onEdit?.("tenant")}
        badge={
          <>
            <UserRound className="size-3" />
            {order.tenant?.type_label}
          </>
        }
        badgeClassName="bg-[#DCFCE7] text-green-700 dark:bg-[#064E3B]/40 dark:text-[#6EE7B7]"
      >
        <div className="space-y-2">
          <Field label="هوية المستأجر" value={order.tenant?.id_num} />
          <Field label="تاريخ الميلاد" value={order.tenant?.dob_display} />
          <Field label="جوال المستأجر" value={order.tenant?.phone} />
        </div>
      </AccentCard>

      <AccentCard
        accent={financial.missing_count ? "#EF4444" : RT.brand}
        icon={Wallet}
        title="البيانات المالية"
        missingCount={financial.missing_count}
        onEdit={() => onEdit?.("financial")}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {financial.payment_method ? (
            <span className="px-2 py-0.5 rounded-full bg-status-neutral-bg dark:bg-white/10 text-[10.5px] font-bold text-[#4B5563] dark:text-white/70">
              {financial.payment_method}
            </span>
          ) : null}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold",
              financial.paid
                ? "bg-[#DCFCE7] text-green-700 dark:bg-[#064E3B]/40 dark:text-[#6EE7B7]"
                : "bg-[#FEE2E2] text-red-600 dark:bg-[#3F1D1D] dark:text-[#FCA5A5]"
            )}
          >
            {financial.paid ? (
              <Check className="size-3" strokeWidth={2.75} />
            ) : null}
            {financial.paid ? "مدفوع" : "غير مدفوع"}
          </span>
        </div>

        <div className="space-y-2">
          <Field
            label="بداية العقد"
            value={financial.start_date}
            empty={!financial.start_date}
          />
          <Field label="المدة" value={financial.duration} />
          <Field label="الدفعات" value={financial.frequency} />
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-gray-400 dark:text-white/40 font-medium">إجمالي الإيجار</span>
            <Money value={financial.rent} className="text-sm" />
          </div>
        </div>

        {totalPrice?.items?.length ? (
          <div className="pt-2 border-t border-[#EEF1F0] dark:border-white/10 space-y-2">
            <p className="text-[10.5px] font-bold text-gray-400">تفاصيل السعر</p>
            {totalPrice.items.map((item) => (
              <div
                key={item.key || item.label}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="text-gray-400 font-medium">
                  {item.label}
                  {item.percent != null ? ` (${item.percent}%)` : ""}
                </span>
                <Money value={item.amount} />
              </div>
            ))}
            {totalPrice.subtotal != null ? (
              <div className="flex items-center justify-between gap-3 text-xs pt-1">
                <span className="text-gray-400 font-medium">المجموع الفرعي</span>
                <Money value={totalPrice.subtotal} />
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3 text-xs font-black">
              <span className="text-gray-700 dark:text-white/80">الإجمالي</span>
              <Money value={totalPrice.total} className="text-sm" />
            </div>
          </div>
        ) : null}

        <div className="pt-2 border-t border-[#EEF1F0] dark:border-white/10 flex items-center justify-between gap-2">
          <span className="text-xs text-status-neutral dark:text-white/50 font-medium">
            المبلغ المدفوع
          </span>
          <span className="inline-flex items-center gap-1.5">
            {financial.fees_paid ? (
              <Check className="size-3.5 text-green-700 dark:text-[#6EE7B7]" strokeWidth={2.75} />
            ) : null}
            <Money value={financial.fees} />
          </span>
        </div>
      </AccentCard>

      {payments.length > 0 ? (
        <AccentCard accent="#0EA5E9" icon={CreditCard} title="سجل المدفوعات">
          <div className="space-y-2.5">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-xl bg-[#F0F9FF] dark:bg-white/[0.03] px-3 py-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-800 dark:text-white/85 truncate">
                    {payment.name || `دفعة #${payment.id}`}
                  </span>
                  <Money value={payment.amount} />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {payment.payment_method ? (
                    <span className="px-2 py-0.5 rounded-full bg-white dark:bg-white/10 text-[10px] font-bold text-[#0369A1]">
                      {paymentMethodLabel(payment.payment_method)}
                    </span>
                  ) : null}
                  {payment.status ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-bold text-green-700">
                      {paymentStatusLabel(payment.status)}
                    </span>
                  ) : null}
                  {payment.payment_date ? (
                    <span className="text-[10.5px] font-medium text-gray-400 tabular-nums">
                      {payment.payment_date}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </AccentCard>
      ) : null}
    </section>
  );
}
