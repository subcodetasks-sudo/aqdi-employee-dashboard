"use client";

import { toast } from "sonner";
import { AlertTriangle, Copy, RefreshCw } from "lucide-react";
import LeaseRenewalDraftTransfer from "@/components/orders/single-order/lease-renewal/lease-renewal-draft-transfer";
import { ContractStepEditor } from "@/components/orders/single-order/contract-edit/contract-step-editor";
import {
  LEASE_RENEWAL_NOTES_FIELDS,
  LEASE_RENEWAL_TERMS_FIELDS,
} from "@/components/orders/single-order/contract-edit/contract-field-schemas";
import { RT } from "../../theme";
import { AccentCard, GroupTitle } from "./primitives";
import { getOrderFinancialStep } from "@/src/lib/order-detail-steps";

const EMPTY_ADDITIONAL_TERMS = "لا توجد شروط أو متغيرات إضافية من العميل";
const EMPTY_NOTES = "لا توجد ملاحظات";

export default function LeaseRenewalFeatures({ orderData }) {
  const financial = getOrderFinancialStep(orderData);
  const additionalTerms = financial.text_additional_terms?.trim() || null;
  const notesEdits = financial.notes_edits?.trim() || null;
  const termsLines = additionalTerms
    ? additionalTerms
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  return (
    <section className="rounded-2xl border border-dashed border-[#D7E3DE] dark:border-white/10 bg-[#F7FAF8] dark:bg-white/[0.02] p-3 sm:p-3.5 space-y-3">
      <GroupTitle>
        <span className="inline-flex items-center gap-2">
          <RefreshCw className="size-3.5" />
          ميزات تجديد عقد الإيجار
        </span>
      </GroupTitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <AccentCard accent={RT.brand} title="تحويل الطلب / المسودة">
          <LeaseRenewalDraftTransfer
            orderId={orderData?.id}
            orderData={orderData}
            layout="stacked"
          />
        </AccentCard>

        <div className="rounded-2xl border border-surface-border-soft dark:border-white/10 bg-white dark:bg-[#0F1C16] overflow-hidden shadow-[0_1px_2px_rgba(11,83,69,0.04)]">
          <div className="h-[4px] w-full" style={{ backgroundColor: "#7C3AED" }} />
          <div className="p-4">
            <ContractStepEditor
              title="الشروط والمتغيرات التي طلبها العميل :"
              step="step6"
              fields={LEASE_RENEWAL_TERMS_FIELDS}
            >
              <div className="relative min-h-[120px] rounded-xl bg-[#F7FAF8] dark:bg-white/[0.03] p-3">
                <button
                  type="button"
                  className="absolute left-3 bottom-3 size-8 rounded-full border border-surface-border-soft dark:border-white/10 flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40"
                  disabled={!additionalTerms}
                  onClick={() => {
                    if (!additionalTerms) {
                      toast.error("لا يوجد نص للنسخ");
                      return;
                    }
                    navigator.clipboard.writeText(additionalTerms);
                    toast.success("تم النسخ");
                  }}
                  aria-label="نسخ الشروط"
                >
                  <Copy className="size-3.5" />
                </button>
                {additionalTerms ? (
                  termsLines.length > 1 ? (
                    <ol className="list-decimal list-inside space-y-2 text-xs text-[#4B5563] dark:text-white/70 leading-relaxed pe-8">
                      {termsLines.map((term, i) => (
                        <li key={i} className="text-right">
                          {term}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-xs text-[#4B5563] dark:text-white/70 leading-relaxed whitespace-pre-wrap pe-8">
                      {additionalTerms}
                    </p>
                  )
                ) : (
                  <p className="text-xs text-ink-placeholder opacity-70">
                    {EMPTY_ADDITIONAL_TERMS}
                  </p>
                )}
              </div>
            </ContractStepEditor>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border-soft dark:border-white/10 bg-white dark:bg-[#0F1C16] overflow-hidden shadow-[0_1px_2px_rgba(11,83,69,0.04)]">
          <div className="h-[4px] w-full" style={{ backgroundColor: "#EF4444" }} />
          <div className="p-4">
            <ContractStepEditor
              title="يرجى الانتباه :"
              step="step6"
              fields={LEASE_RENEWAL_NOTES_FIELDS}
            >
              <div className="rounded-xl bg-[#FEF2F2] dark:bg-[#3F1D1D]/40 p-3 flex gap-2 items-start">
                <AlertTriangle className="size-4 text-[#EF4444] shrink-0 mt-0.5" />
                <p className="text-xs text-[#555] dark:text-white/65 leading-relaxed whitespace-pre-wrap flex-1">
                  {notesEdits ?? (
                    <span className="text-ink-placeholder opacity-70">{EMPTY_NOTES}</span>
                  )}
                </p>
              </div>
            </ContractStepEditor>
          </div>
        </div>
      </div>
    </section>
  );
}
