"use client";

import { useState } from "react";
import { Check, CreditCard, Download, UserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { downloadMedia, fileNameFromMediaUrl } from "@/src/lib/media-url";
import { useTenantRoles } from "@/src/hooks/use-tenant-roles";
import {
  resolveOtherConditionsList,
  resolveTenantRoleDetails,
} from "@/components/orders/single-order/frontend-contract-fields";
import { getOrderFinancialStep } from "@/src/lib/order-detail-steps";
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

function displayText(value) {
  if (value == null) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (!/<[a-z][\s\S]*>/i.test(raw)) return raw;
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function paymentStatusLabel(status) {
  if (status === "success" || status === "paid") return "ناجح";
  if (status === "pending") return "قيد الانتظار";
  if (status === "failed") return "فشل";
  return status || null;
}

function isHiddenAmount(value) {
  if (value == null || value === "") return true;
  const amount = Number(typeof value === "string" ? value.replace(/,/g, "").trim() : value);
  return !Number.isFinite(amount) || amount === 0;
}

function serviceQuote(orderData) {
  if (!orderData) return null;
  const step = getOrderFinancialStep(orderData);
  const quote = step?.financial;
  if (!quote || typeof quote !== "object" || Array.isArray(quote)) return null;
  return quote;
}

function PriceRow({ label, value, strong = false }) {
  if (isHiddenAmount(value)) return null;
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span
        className={
          strong
            ? "font-black text-gray-700 dark:text-white/80"
            : "text-gray-400 dark:text-white/40 font-medium"
        }
      >
        {label}
      </span>
      <Money value={value} className={strong ? "text-sm" : undefined} />
    </div>
  );
}

function OwnerRecordDownload({ url, name }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const ok = await downloadMedia(url, name || fileNameFromMediaUrl(url));
      if (ok) toast.success("تم التحميل بنجاح");
      else toast.error("تعذر تحميل الملف");
    } catch {
      toast.error("تعذر تحميل الملف");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-xl bg-status-neutral-bg dark:bg-white/[0.04] px-3 py-2.5 space-y-1">
      <p className="text-[10.5px] font-bold text-gray-400">صورة سجل المالك</p>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex max-w-full items-center gap-1.5 text-xs font-bold text-brand-dark hover:underline disabled:opacity-60 dark:text-[#6EE7B7]"
      >
        <Download className="size-3.5 shrink-0" />
        <span className="truncate">
          {downloading ? "جاري التحميل..." : name || "تحميل المرفق"}
        </span>
      </button>
    </div>
  );
}

function ServicePriceBreakdown({ quote, details, detailKeys }) {
  const taxLabel =
    !isHiddenAmount(quote.tax_percent) && !detailKeys.has("tax")
      ? `الضريبة (${quote.tax_percent}%)`
      : "الضريبة";

  const hasRows =
    details.length > 0 ||
    !isHiddenAmount(quote.electricity_meter_fee) ||
    !isHiddenAmount(quote.water_meter_fee) ||
    !isHiddenAmount(quote.paper_deed_fee) ||
    !isHiddenAmount(quote.tax_amount) ||
    !isHiddenAmount(quote.total_price) ||
    !isHiddenAmount(quote.paid_amount);

  if (!hasRows) return null;

  return (
    <div className="pt-2 border-t border-[#EEF1F0] dark:border-white/10 space-y-2">
      <p className="text-[10.5px] font-bold text-gray-400">بنود السعر</p>
      {details.map((item) => (
        <PriceRow
          key={item.key || item.label}
          label={
            item.percent != null && !isHiddenAmount(item.percent)
              ? `${item.label} (${item.percent}%)`
              : item.label
          }
          value={item.amount}
        />
      ))}
      {detailKeys.has("electricity_meter_fee") ? null : (
        <PriceRow label="رسوم نقل الكهرباء" value={quote.electricity_meter_fee} />
      )}
      {detailKeys.has("water_meter_fee") ? null : (
        <PriceRow label="رسوم نقل الماء" value={quote.water_meter_fee} />
      )}
      {detailKeys.has("paper_deed_fee") ? null : (
        <PriceRow label="رسوم الصك الورقي" value={quote.paper_deed_fee} />
      )}
      {detailKeys.has("tax") ? null : <PriceRow label={taxLabel} value={quote.tax_amount} />}
      <PriceRow label="السعر الإجمالي" value={quote.total_price} strong />
      <PriceRow label="المدفوع" value={quote.paid_amount} />
    </div>
  );
}

function SavedTerms({ order, orderData }) {
  const { items: tenantRolesCatalog } = useTenantRoles(Boolean(orderData));
  const financial = order.financial ?? {};
  const step = orderData ? getOrderFinancialStep(orderData) : {};
  const roles = orderData
    ? resolveTenantRoleDetails(orderData, tenantRolesCatalog)
    : financial.tenant_roles ?? [];
  const otherConditions = orderData
    ? resolveOtherConditionsList(orderData)
    : financial.other_conditions ?? [];
  const additionalTerms = displayText(
    financial.additional_terms || step.text_additional_terms
  );
  const dailyFine = financial.daily_fine || step.daily_fine;
  const guarantee =
    financial.guarantee_amount || step.Guarantee_amount || step.guarantee_amount;

  const hasContent =
    roles.length > 0 ||
    otherConditions.length > 0 ||
    additionalTerms ||
    dailyFine ||
    guarantee;

  if (!hasContent) return null;

  return (
    <div className="pt-2 border-t border-[#EEF1F0] dark:border-white/10 space-y-2.5">
      <p className="text-[10.5px] font-bold text-gray-400">الصلاحيات والالتزامات</p>

      {roles.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[10.5px] font-bold text-gray-400">صلاحيات المستأجر</p>
          <ul className="space-y-1.5">
            {roles.map((role) => (
              <li
                key={role.id ?? role.label}
                className="rounded-xl bg-status-neutral-bg px-3 py-2 text-xs dark:bg-white/[0.04]"
              >
                <p className="font-bold text-gray-900 dark:text-white/90">{role.label}</p>
                {role.value ? (
                  <p className="mt-0.5 text-[11px] font-medium text-[#4B5563] dark:text-white/60">
                    {role.inputLabel ? `${role.inputLabel}: ` : ""}
                    {role.value}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Field label="الغرامة اليومية" value={dailyFine} />
      <Field label="مبلغ الضمان" value={guarantee} />

      {otherConditions.length > 0 ? (
        <div className="space-y-1">
          <p className="text-[10.5px] font-bold text-gray-400">شروط أخرى</p>
          <ol className="list-decimal list-inside space-y-1 text-xs font-bold text-gray-900 dark:text-white/90">
            {otherConditions.map((item, index) => (
              <li key={`${index}-${item}`} className="text-right leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {additionalTerms ? (
        <div className="space-y-1">
          <p className="text-[10.5px] font-bold text-gray-400">الشروط الإضافية</p>
          <p className="whitespace-pre-wrap text-xs font-bold leading-relaxed text-gray-900 dark:text-white/90">
            {additionalTerms}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function TenantFinancialGroup({ order, orderData, onEdit }) {
  const financial = order.financial ?? {};
  const totalPrice = financial.total_price;
  const payments = financial.payments ?? [];
  const quote = serviceQuote(orderData);
  const quoteDetails = Array.isArray(quote?.details)
    ? quote.details.filter((item) => item && !isHiddenAmount(item.amount))
    : [];
  const quoteDetailKeys = new Set(quoteDetails.map((item) => item.key));
  const paymentLabel = quote?.payment_label_ar || (financial.paid ? "مدفوع" : "غير مدفوع");
  const isPaid = quote
    ? quote.is_paid === true ||
      quote.is_paid === 1 ||
      quote.is_paid === "1" ||
      quote.payment_status === "paid"
    : Boolean(financial.paid);

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
          {/* <Field label="اسم المستأجر" value={order.tenant?.name} /> */}
          <Field label="هوية المستأجر" value={order.tenant?.id_num} />
          <Field label="تاريخ الميلاد" value={order.tenant?.dob_display} />
          <Field label="جوال المستأجر" value={order.tenant?.phone} />
          <Field label="البريد الإلكتروني" value={order.tenant?.email} />
          {/* <Field label="الجنسية" value={order.tenant?.nationality} /> */}
          {/* <Field label="العمل" value={order.tenant?.work} /> */}
          {/* <Field label="الجنس" value={order.tenant?.gender} /> */}
          <Field label="منطقة المنشأة" value={order.tenant?.entity_region} />
          <Field label="مدينة المنشأة" value={order.tenant?.entity_city} />
          <Field
            label="منطقة الممثل النظامي"
            value={order.tenant?.entity_legal_region}
          />
          <Field
            label="مدينة الممثل النظامي"
            value={order.tenant?.entity_legal_city}
          />
          <Field
            label="ممثل نظامي للمستأجر"
            value={order.tenant?.has_legal_representative}
          />
          {order.tenant?.owner_record_url ? (
            <OwnerRecordDownload
              url={order.tenant.owner_record_url}
              name={order.tenant.owner_record_name}
            />
          ) : null}
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
              isPaid
                ? "bg-[#DCFCE7] text-green-700 dark:bg-[#064E3B]/40 dark:text-[#6EE7B7]"
                : "bg-[#FEE2E2] text-red-600 dark:bg-[#3F1D1D] dark:text-[#FCA5A5]"
            )}
          >
            {isPaid ? (
              <Check className="size-3" strokeWidth={2.75} />
            ) : null}
            {paymentLabel}
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
          {isHiddenAmount(financial.rent) ? null : (
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-gray-400 dark:text-white/40 font-medium">إجمالي الإيجار</span>
              <Money value={financial.rent} className="text-sm" />
            </div>
          )}
          <Field label="تأخير فرعي" value={financial.sub_delay} />
          <Field label="التأمين" value={financial.deposit} />
          <Field
            label="عضوية مميزة مجاناً"
            value={financial.premium_membership_for_free}
          />
          <Field
            label="اسم صاحب الحساب"
            value={financial.client_account_holder_name}
          />
          <Field
            label="رقم الحساب البنكي"
            value={financial.bank_account_number}
          />
          <Field label="ملاحظات التعديل" value={financial.notes_edits} />
        </div>

        <SavedTerms order={order} orderData={orderData} />

        {quote ? (
          <ServicePriceBreakdown quote={quote} details={quoteDetails} detailKeys={quoteDetailKeys} />
        ) : totalPrice?.items?.length ? (
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

        {quote ? null : (
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
        )}
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
