"use client";

import Link from "next/link";
import { BiSolidCopy } from "react-icons/bi";
import { IoLogoWhatsapp } from "react-icons/io";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import ChangeStatusDialog from "@/components/Orders/change-status-dialog";
import {
  getOrderClientPhone,
  getOrderContractUuid,
} from "@/components/Orders/messages/order-section-message-utils";
import ContractPaymentLinkButton from "./contract-payment-link-button";
import PrintContractButton from "./print-contract-button";
import SendOrderSmsButton from "@/components/Orders/shared/send-order-sms-button";
import { getInstrumentTypeLabel } from "@/src/lib/instrument-types";
import { getContractTypeLabel } from "@/src/lib/contract-period-utils";

const pillClass =
  "h-[58px] text-black px-3 py-2 flex items-center gap-2 bg-gray-200 border border-gray-300 rounded-2xl text-xs shrink-0";

function normalizeWhatsAppPhone(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  if (digits.length === 9) return `966${digits}`;
  return digits;
}

function resolveInstrumentTypeLabel(orderData) {
  const summary = orderData?.contract_summary ?? {};
  const raw =
    orderData?.instrument_type_trans ||
    summary.instrument_type_trans ||
    orderData?.instrument_type ||
    summary.instrument_type ||
    summary.instrument_type_key ||
    orderData?.instrument_type_key;

  if (!raw) return null;
  return getInstrumentTypeLabel(raw);
}

function resolveContractTypeLabel(orderData) {
  const summary = orderData?.contract_summary ?? {};
  const raw =
    orderData?.contract_type_trans ||
    summary.contract_type_trans ||
    orderData?.contract_type ||
    summary.contract_type;

  if (!raw) return null;
  if (raw === "housing" || raw === "commercial") {
    return getContractTypeLabel(raw);
  }
  return String(raw);
}

export default function OrderDetailsActions({ orderData }) {
  const ownerMobile = getOrderClientPhone(orderData);
  const contractUuid = getOrderContractUuid(orderData);
  const instrumentTypeLabel = resolveInstrumentTypeLabel(orderData);
  const contractTypeLabel = resolveContractTypeLabel(orderData);
  const contractTitle = instrumentTypeLabel || contractTypeLabel;
  const contractSubtitle =
    instrumentTypeLabel && contractTypeLabel ? contractTypeLabel : null;

  const copyText = (value, message) => {
    if (!value) return;
    navigator.clipboard.writeText(String(value));
    toast.success(message);
  };

  const whatsAppHref = ownerMobile
    ? `https://wa.me/${normalizeWhatsAppPhone(ownerMobile)}`
    : null;

  return (
    <div className="shrink-0 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <PrintContractButton orderData={orderData} />
        <ContractPaymentLinkButton orderData={orderData} />
        <SendOrderSmsButton order={orderData} label="إرسال رسالة" />
      </div>

      <div className="flex items-stretch gap-2 flex-wrap">
        {contractTitle ? (
          <div
            className={`${pillClass} max-w-[220px]`}
            title={[contractTitle, contractSubtitle].filter(Boolean).join(" — ")}
          >
            <FileText size={18} className="shrink-0 text-[#616161]" />
            <span className="min-w-0 flex flex-col justify-center gap-0.5 font-semibold text-right leading-tight">
              <span className="text-[10px] font-medium text-[#737373]">
                نوع العقد
                {contractSubtitle ? ` · ${contractSubtitle}` : ""}
              </span>
              <span className="font-bold text-[12px] text-black line-clamp-1">
                {contractTitle}
              </span>
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => copyText(ownerMobile, "تم نسخ رقم الجوال")}
          className={`${pillClass} cursor-pointer`}
        >
          <BiSolidCopy size={18} className="shrink-0" />
          <span className="flex flex-col justify-center gap-0.5 font-semibold text-right leading-tight">
            <span className="text-[10px] font-medium text-[#737373]">
              رقم الجوال
            </span>
            <span className="font-bold text-[12px]" dir="ltr">
              {ownerMobile || "---"}
            </span>
          </span>
          {whatsAppHref ? (
            <Link
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <IoLogoWhatsapp className="text-xl text-green-500 shrink-0" />
            </Link>
          ) : (
            <IoLogoWhatsapp className="text-xl text-green-300 shrink-0" />
          )}
        </button>

        <button
          type="button"
          onClick={() => copyText(contractUuid, "تم نسخ رقم الطلب")}
          className={`${pillClass} cursor-pointer`}
        >
          <BiSolidCopy size={18} className="shrink-0" />
          <span className="flex flex-col justify-center gap-0.5 font-semibold text-right leading-tight">
            <span className="text-[10px] font-medium text-[#737373]">
              رقم الطلب
            </span>
            <span className="font-bold text-[12px]" dir="ltr">
              {contractUuid || "---"}
            </span>
          </span>
        </button>

        <div
          className={`${pillClass} gap-3 border-transparent`}
          style={{
            backgroundColor:
              orderData?.contract_summary?.contract_status_color || undefined,
          }}
        >
          <p className="text-black flex flex-col justify-center gap-0.5 font-semibold whitespace-nowrap leading-tight">
            <span className="text-[10px] font-medium text-[#737373]">
              حالة الطلب
            </span>
            <span className="font-bold text-[12px]">
              {orderData?.contract_summary?.contract_status_name || "قيد المعالجه"}
            </span>
          </p>
          <ChangeStatusDialog
            orderId={orderData?.contract_summary?.id}
            order={orderData}
            queryKey={["single-order", orderData?.id]}
          />
        </div>
      </div>
    </div>
  );
}
