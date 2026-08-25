"use client";

import { Check, UserRound, Wallet } from "lucide-react";
import { RT } from "../../theme";
import { cn } from "@/lib/utils";
import { AccentCard, Field, GroupTitle, Money } from "./primitives";

export default function TenantFinancialGroup({ order, onEdit }) {
  const financial = order.financial ?? {};

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
        <Field label="جوال المستأجر" value={order.tenant?.phone} />
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

        <div className="pt-2 border-t border-[#EEF1F0] dark:border-white/10 flex items-center justify-between gap-2">
          <span className="text-xs text-status-neutral dark:text-white/50 font-medium">
            رسوم الإيجار
          </span>
          <span className="inline-flex items-center gap-1.5">
            {financial.fees_paid ? (
              <Check className="size-3.5 text-green-700 dark:text-[#6EE7B7]" strokeWidth={2.75} />
            ) : null}
            <Money value={financial.fees} />
          </span>
        </div>
      </AccentCard>
    </section>
  );
}
