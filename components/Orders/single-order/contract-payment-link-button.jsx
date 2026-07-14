"use client";

import { Link2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getOrderContractUuid } from "@/components/Orders/messages/order-section-message-utils";
import { fetchContractPaymentLink } from "@/components/Orders/shared/payment-gateway";
import PaymentLinkDialog from "@/components/Orders/shared/payment-link-dialog";
import greenRial from "@/public/images/greenRial.svg";

function getPaymentAmount(orderData) {
  const summary = orderData?.contract_summary ?? {};
  return (
    orderData?.amount_payment ??
    summary?.amount_payment ??
    orderData?.cart_amount ??
    summary?.cart_amount ??
    orderData?.amount ??
    summary?.amount ??
    null
  );
}

function isContractPaid(orderData) {
  const summary = orderData?.contract_summary ?? {};
  const isPaid =
    orderData?.is_paid ??
    summary?.is_paid ??
    orderData?.payment_status ??
    summary?.payment_status;
  const amountPayment = getPaymentAmount(orderData);

  if (isPaid === true || isPaid === 1 || isPaid === "paid") return true;
  if (isPaid === false || isPaid === 0 || isPaid === "unpaid") return false;
  return Boolean(amountPayment);
}

function PaidBadge({ orderData }) {
  const amount = getPaymentAmount(orderData);

  return (
    <div className="flex h-auto items-center gap-2 rounded-2xl bg-[#E6FFE6] px-4 py-3 shrink-0">
      <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold whitespace-nowrap text-[#10B981]">
        مدفوع
      </span>
      {amount != null && amount !== "" ? (
        <div className="flex items-center gap-1 text-[13px] font-bold text-[#007C13]">
          <span>{amount}</span>
          <Image src={greenRial} alt="rial" width={14} height={14} />
        </div>
      ) : null}
    </div>
  );
}

export default function ContractPaymentLinkButton({ orderData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState({ paymentUrl: "", cartAmount: null });
  const contractUuid = getOrderContractUuid(orderData);

  if (isContractPaid(orderData)) {
    return <PaidBadge orderData={orderData} />;
  }

  const handleClick = async () => {
    if (!contractUuid) {
      toast.error("رقم الطلب غير متوفر");
      return;
    }

    setIsLoading(true);
    try {
      const { paymentUrl, cartAmount } = await fetchContractPaymentLink(contractUuid);
      setPaymentLink({ paymentUrl, cartAmount });
      setDialogOpen(true);
    } catch (error) {
      const data = error?.response?.data;
      toast.error(
        data?.gateway_error ||
          data?.message ||
          error?.message ||
          "تعذر إنشاء رابط الدفع"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
        disabled={isLoading || !contractUuid}
        className="h-auto py-3 px-4 rounded-2xl bg-[#0019FF] hover:bg-[#0015CC] text-white text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-60"
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
        {isLoading ? "جاري الإنشاء..." : "رابط الدفع"}
      </Button>

      <PaymentLinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paymentUrl={paymentLink.paymentUrl}
        cartAmount={paymentLink.cartAmount}
      />
    </>
  );
}
