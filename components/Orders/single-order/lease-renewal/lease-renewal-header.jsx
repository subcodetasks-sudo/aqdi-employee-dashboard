"use client";

import Link from "next/link";
import { BiSolidCopy } from "react-icons/bi";
import { IoLogoWhatsapp } from "react-icons/io";
import {
  Briefcase,
  CalendarClock,
  Clock,
  FileText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import ChangeStatusDialog from "@/components/Orders/change-status-dialog";
import ContractPaymentLinkButton from "@/components/Orders/single-order/contract-payment-link-button";
import SendOrderSmsButton from "@/components/Orders/shared/send-order-sms-button";

const display = (v) => (v == null || v === "" ? "---" : String(v));

const formatDate = (value) => {
  if (!value || value === "---") return "---";
  return String(value).replace(/\//g, " - ").replace(/-/g, " - ");
};

function InfoChip({ bg, labelColor, valueColor, icon, label, value, children }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shrink-0 ${bg}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="flex flex-col text-right min-w-0 leading-tight">
        <span className={`text-[11px] font-medium ${labelColor}`}>{label}</span>
        <span className={`text-[13px] font-bold ${valueColor}`}>{value}</span>
      </div>
      {children}
    </div>
  );
}

export default function LeaseRenewalHeader({
  activeTab,
  onTabChange,
  orderData,
  onCopy,
}) {
  const summary = orderData?.contract_summary ?? {};
  const step4 = orderData?.step4 ?? {};
  const user = orderData?.user ?? {};
  const orderUuid = display(orderData?.uuid);
  const mobile = display(user.mobile);
  const statusName = display(summary.contract_status_name || "قيد المعالجة...");
  const contractType = display(summary.contract_type || "تجاري");
  const contractPeriod = display(summary.contract_period || "سنة");
  const startDate = formatDate(step4.contract_starting_date || "01-10-2023");

  const tabBase =
    "flex items-center gap-2 py-3 px-5 rounded-2xl text-xs font-bold transition-all shrink-0";

  return (
    <div className="flex w-full flex-wrap items-center gap-2" dir="rtl">
      <button
        type="button"
        onClick={() => onTabChange("renew")}
        className={`${tabBase} ${
          activeTab === "renew"
            ? "bg-[#0019FF] text-white"
            : "bg-[#F0F0F0] text-[#424242]"
        }`}
      >
        <span className="flex items-center gap-1">
          <FileText className="size-4" />
          {activeTab === "renew" && <RefreshCw className="size-3 opacity-90" />}
        </span>
        تجديد عقد إيجار
      </button>

      <button
        type="button"
        onClick={() => onTabChange("financial")}
        className={`${tabBase} ${
          activeTab === "financial"
            ? "bg-[#0019FF] text-white"
            : "bg-[#F0F0F0] text-[#424242]"
        }`}
      >
        <ShieldCheck className="size-4" />
        البيانات المالية - الشروط
      </button>

      <InfoChip
        bg="bg-[#E8F8EF]"
        labelColor="text-[#2E7D32]"
        valueColor="text-[#1B5E20]"
        icon={<CalendarClock className="size-5 text-[#2E7D32]" />}
        label="تاريخ بدء العقد"
        value={startDate}
      />

      <InfoChip
        bg="bg-[#E0F5F0]"
        labelColor="text-[#00796B]"
        valueColor="text-[#004D40]"
        icon={<Clock className="size-5 text-[#00796B]" />}
        label="مدة العقد"
        value={contractPeriod}
      />

      <InfoChip
        bg="bg-[#F3E8FF]"
        labelColor="text-[#7C3AED]"
        valueColor="text-[#5B21B6]"
        icon={<Briefcase className="size-5 text-[#7C3AED]" />}
        label="نوع العقد"
        value={contractType}
      />

      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E8EEFF] shrink-0">
        <div className="flex flex-col text-right leading-tight">
          <span className="text-[11px] font-medium text-[#1565C0] flex items-center gap-1 justify-end">
            حالة الطلب
            <span className="text-base leading-none">🤔</span>
          </span>
          <span className="text-[13px] font-bold text-[#0D47A1]">{statusName}</span>
        </div>
        <ChangeStatusDialog
          orderId={summary.id}
          order={orderData}
          queryKey={["single-order", orderData?.id]}
        />
      </div>

      <ContractPaymentLinkButton orderData={orderData} />

      <SendOrderSmsButton order={orderData} label="إرسال رسالة" />

      <button
        type="button"
        onClick={() => onCopy(orderUuid, "تم نسخ رقم الطلب")}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F0F0F0] shrink-0 hover:bg-[#E8E8E8] transition-colors"
      >
        <div className="flex flex-col text-right leading-tight">
          <span className="text-[11px] font-medium text-[#757575]">رقم الطلب</span>
          <span className="text-[13px] font-bold text-[#212121] flex items-center gap-1.5 justify-end">
            <BiSolidCopy className="size-3.5 text-[#0019FF] shrink-0" />
            {orderUuid}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F0F0F0] shrink-0">
        {user.mobile && (
          <Link
            href={`https://wa.me/${user.mobile}`}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0"
          >
            <IoLogoWhatsapp className="text-2xl text-[#25D366]" />
          </Link>
        )}
        <button
          type="button"
          onClick={() => onCopy(user.mobile, "تم نسخ رقم الجوال")}
          className="flex flex-col text-right leading-tight hover:opacity-80"
        >
          <span className="text-[11px] font-medium text-[#757575]">رقم الجوال</span>
          <span
            className="text-[13px] font-bold text-[#212121] flex items-center gap-1.5 justify-end"
            dir="ltr"
          >
            <BiSolidCopy className="size-3.5 text-[#0019FF] shrink-0" />
            {mobile}
          </span>
        </button>
      </div>
    </div>
  );
}
