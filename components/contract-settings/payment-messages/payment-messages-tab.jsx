"use client";

import Loader from "@/components/home/loader";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import {
  extractPaymentMessageItems,
  getPaymentMessageByType,
  PAYMENT_MESSAGES_API,
  PAYMENT_MESSAGES_QUERY_KEY,
  PAYMENT_MESSAGE_TYPES,
} from "@/src/lib/payment-messages";
import PaymentMessageCard from "./payment-message-card";

export default function PaymentMessagesTab() {
  const { data, isLoading } = useQuery({
    queryKey: [PAYMENT_MESSAGES_QUERY_KEY],
    queryFn: () => axiosInstance.get(PAYMENT_MESSAGES_API).then((res) => res?.data),
  });

  const items = extractPaymentMessageItems(data);
  const successMessage = getPaymentMessageByType(items, PAYMENT_MESSAGE_TYPES.success);
  const failedMessage = getPaymentMessageByType(items, PAYMENT_MESSAGE_TYPES.failed);

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#F5F5F5] pb-6 text-right">
        <h2 className="text-[22px] font-black text-black">إعدادات رسائل الدفع</h2>
        <p className="mt-2 text-[13px] leading-7 text-[#707070]">
          رسالتان ثابتتان: واحدة لنجاح الدفع وأخرى لفشله. يمكنك إضافتهما أو تعديلهما فقط،
          بدون إمكانية الحذف.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PaymentMessageCard item={successMessage} type={PAYMENT_MESSAGE_TYPES.success} />
        <PaymentMessageCard item={failedMessage} type={PAYMENT_MESSAGE_TYPES.failed} />
      </div>
    </div>
  );
}
