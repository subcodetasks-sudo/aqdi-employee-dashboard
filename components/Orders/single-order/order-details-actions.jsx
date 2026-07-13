"use client";

import Link from "next/link";
import { BiSolidCopy } from "react-icons/bi";
import { IoLogoWhatsapp } from "react-icons/io";
import { toast } from "sonner";
import ChangeStatusDialog from "@/components/Orders/change-status-dialog";
import {
  getOrderClientPhone,
  getOrderContractUuid,
} from "@/components/Orders/messages/order-section-message-utils";
import ContractPaymentLinkButton from "./contract-payment-link-button";
import PrintContractButton from "./print-contract-button";

const pillClass =
  "text-black p-3 flex items-center gap-2 bg-gray-200 border border-gray-300 rounded-2xl text-xs cursor-pointer shrink-0";

function normalizeWhatsAppPhone(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  if (digits.length === 9) return `966${digits}`;
  return digits;
}

export default function OrderDetailsActions({ orderData }) {
  const ownerMobile = getOrderClientPhone(orderData);
  const contractUuid = getOrderContractUuid(orderData);

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
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => copyText(ownerMobile, "تم نسخ رقم الجوال")}
          className={pillClass}
        >
          <BiSolidCopy size={20} />
          <span className="flex flex-col font-semibold text-right">
            رقــم الجــوال
            <span className="font-normal" dir="ltr">
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
              <IoLogoWhatsapp className="text-2xl text-green-500 shrink-0" />
            </Link>
          ) : (
            <IoLogoWhatsapp className="text-2xl text-green-300 shrink-0" />
          )}
        </button>

        <button
          type="button"
          onClick={() => copyText(contractUuid, "تم نسخ رقم الطلب")}
          className={pillClass}
        >
          <BiSolidCopy size={20} />
          <span className="flex flex-col font-semibold text-right">
            رقم الطلب
            <span className="font-normal" dir="ltr">
              {contractUuid || "---"}
            </span>
          </span>
        </button>

        <div
          className="p-3 flex items-center gap-3 rounded-2xl text-xs shrink-0"
          style={{ backgroundColor: orderData?.contract_summary?.contract_status_color }}
        >
          <p className="text-black flex flex-col font-semibold whitespace-nowrap">
            حــالة الطلب
            <span className="font-normal">
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
