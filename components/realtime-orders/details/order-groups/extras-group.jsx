"use client";

import { BadgeCheck, FileText, Receipt, Undo2 } from "lucide-react";
import { AccentCard, Field, GroupTitle, Money } from "./primitives";

function hasValue(value) {
  return value != null && value !== "";
}

function hasAny(values) {
  return values.some(hasValue);
}

function FileLink({ label, url, name }) {
  if (!url) return null;
  return (
    <div className="rounded-xl bg-status-neutral-bg dark:bg-white/[0.04] px-3 py-2.5 space-y-1">
      <p className="text-[10.5px] font-bold text-gray-400">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-bold text-brand-dark dark:text-[#6EE7B7] hover:underline truncate block"
      >
        {name || "عرض المرفق"}
      </a>
    </div>
  );
}

export default function ExtrasGroup({ order }) {
  const extras = order?.extras ?? {};
  const statusCase = extras.status_case;
  const invoice = extras.invoice;
  const account = extras.account;
  const refund = extras.refund;

  const showEjar = hasAny([
    extras.ejar_contract_number,
    extras.ejar_contract_draft_number,
    extras.ejar_status_notes,
    extras.deed_type,
    extras.deed_addition_method,
    extras.deed_number,
  ]);

  const showDraft = hasAny([
    extras.draft_contract_status,
    extras.draft_contract_number,
    extras.draft_before_paid_url,
    extras.draft_after_paid_url,
  ]);

  const showMeta = hasAny([
    extras.expiry_date,
    extras.rating,
    extras.rating_note,
    extras.is_review,
    extras.notes_edits,
    extras.strong_argument_url,
  ]);

  const showAccount = account
    ? hasAny([
        account.holder_name,
        account.bank_name,
        account.account_number,
        account.iban,
      ])
    : false;

  const showInvoice = invoice
    ? hasAny([invoice.number, invoice.amount, invoice.status, invoice.date, invoice.reference])
    : false;

  const showRefund = Boolean(refund);
  const showStatusCase = Boolean(statusCase);

  if (
    !showEjar &&
    !showDraft &&
    !showMeta &&
    !showAccount &&
    !showInvoice &&
    !showRefund &&
    !showStatusCase
  ) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-dashed border-[#D7E3DE] dark:border-white/10 bg-[#F7FAF8] dark:bg-white/[0.02] p-3 sm:p-3.5 space-y-3">
      <GroupTitle>بيانات إضافية</GroupTitle>

      {showEjar || showStatusCase ? (
        <AccentCard accent="#16A34A" icon={BadgeCheck} title="التوثيق وحالة المستند">
          <div className="space-y-2">
            <Field label="رقم عقد إيجار" value={extras.ejar_contract_number} />
            <Field
              label="رقم مسودة إيجار"
              value={extras.ejar_contract_draft_number}
            />
            <Field label="ملاحظات إيجار" value={extras.ejar_status_notes} />
            <Field label="نوع الصك" value={extras.deed_type} />
            <Field label="طريقة إضافة الصك" value={extras.deed_addition_method} />
            <Field label="رقم الصك (حالة)" value={extras.deed_number} />
            {statusCase ? (
              <>
                <Field label="وضع رقم التواصل" value={statusCase.contact_number_mode} />
                <Field label="رقم التواصل" value={statusCase.contact_number} />
                <FileLink
                  label="مرفق الحالة"
                  url={statusCase.attachment}
                  name="عرض المرفق"
                />
              </>
            ) : null}
          </div>
        </AccentCard>
      ) : null}

      {showDraft || showMeta ? (
        <AccentCard accent="#D97706" icon={FileText} title="المسودة والملاحظات">
          <div className="space-y-2">
            <Field label="حالة المسودة" value={extras.draft_contract_status} />
            <Field label="رقم المسودة" value={extras.draft_contract_number} />
            <Field label="تاريخ الانتهاء" value={extras.expiry_date} />
            <Field label="التقييم" value={extras.rating} />
            <Field label="ملاحظة التقييم" value={extras.rating_note} />
            <Field label="قيد المراجعة" value={extras.is_review} />
            <Field label="ملاحظات التعديل" value={extras.notes_edits} />
            <FileLink
              label="مسودة قبل الدفع"
              url={extras.draft_before_paid_url}
              name={extras.draft_before_paid_name}
            />
            <FileLink
              label="مسودة بعد الدفع"
              url={extras.draft_after_paid_url}
              name={extras.draft_after_paid_name}
            />
            <FileLink
              label="صورة الحجة القوية"
              url={extras.strong_argument_url}
              name={extras.strong_argument_name}
            />
          </div>
        </AccentCard>
      ) : null}

      {showAccount || showInvoice ? (
        <AccentCard accent="#0EA5E9" icon={Receipt} title="الحساب والفاتورة">
          <div className="space-y-2">
            {showAccount ? (
              <>
                <Field label="اسم صاحب الحساب" value={account.holder_name} />
                <Field label="البنك" value={account.bank_name} />
                <Field label="رقم الحساب" value={account.account_number} />
                <Field label="آيبان" value={account.iban} />
              </>
            ) : null}
            {showInvoice ? (
              <>
                <Field label="رقم الفاتورة" value={invoice.number} />
                {hasValue(invoice.amount) ? (
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-gray-400 font-medium">مبلغ الفاتورة</span>
                    <Money value={invoice.amount} />
                  </div>
                ) : null}
                <Field label="حالة الفاتورة" value={invoice.status} />
                <Field label="تاريخ الفاتورة" value={invoice.date} />
                <Field label="المرجع" value={invoice.reference} />
              </>
            ) : null}
          </div>
        </AccentCard>
      ) : null}

      {showRefund ? (
        <AccentCard accent="#6B7280" icon={Undo2} title="الاسترجاع">
          <div className="space-y-2">
            <Field label="حالة الاسترجاع" value={refund.return_status} />
            {hasValue(refund.refund_amount) ? (
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-gray-400 font-medium">مبلغ الاسترجاع</span>
                <Money value={refund.refund_amount} />
              </div>
            ) : null}
            <Field label="رقم الاسترجاع" value={refund.refund_id} />
            <Field label="الرقم المرجعي" value={refund.reference_number} />
            <Field label="ملاحظات الاسترجاع" value={refund.refund_notes} />
            <Field label="قبول الاسترجاع" value={refund.accept_return} />
            <Field
              label="موظف قبول الاسترجاع"
              value={refund.accept_return_employee}
            />
          </div>
        </AccentCard>
      ) : null}
    </section>
  );
}
