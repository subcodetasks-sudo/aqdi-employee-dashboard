"use client";

import { Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getOrderContractUuid } from "@/components/Orders/messages/order-section-message-utils";
import { fetchContractPaymentLink } from "@/components/Orders/shared/payment-gateway";
import PaymentLinkDialog from "@/components/Orders/shared/payment-link-dialog";

function isContractPaid(orderData) {
  const summary = orderData?.contract_summary ?? {};
  const isPaid =
    orderData?.is_paid ??
    summary?.is_paid ??
    orderData?.payment_status ??
    summary?.payment_status;
  const amountPayment =
    orderData?.amount_payment ?? summary?.amount_payment;

  if (isPaid === true || isPaid === 1 || isPaid === "paid") return true;
  if (isPaid === false || isPaid === 0 || isPaid === "unpaid") return false;
  return Boolean(amountPayment);
}

export default function ContractPaymentLinkButton({ orderData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState({ paymentUrl: "", cartAmount: null });
  const contractUuid = getOrderContractUuid(orderData);

  if (isContractPaid(orderData)) {
    return null;
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
