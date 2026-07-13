"use client";

import {
  PAYMENT_MESSAGE_TYPE_META,
} from "@/src/lib/payment-messages";
import EditPaymentMessageDialog from "./edit-payment-message-dialog";

export default function PaymentMessageCard({ item, type }) {
  const meta = PAYMENT_MESSAGE_TYPE_META[type];
  const hasItem = Boolean(item?.id);

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[28px] border bg-white shadow-sm"
      style={{ borderColor: meta.border }}
    >
      <div
        className="flex items-start justify-between gap-4 border-b px-6 py-5"
        style={{ backgroundColor: meta.accentSoft, borderColor: meta.border }}
      >
        <div className="text-right">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              {meta.emoji}
            </span>
            <h3 className="text-[18px] font-black text-black">{meta.label}</h3>
          </div>
          <p className="text-[13px] leading-6 text-[#616161]">{meta.description}</p>
        </div>

        {hasItem ? (
          <EditPaymentMessageDialog item={item} type={type} triggerVariant="edit" />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {hasItem ? (
          <>
            <div className="rounded-[20px] border border-[#F0F0F0] bg-[#FCFCFC] p-5">
              <p className="mb-2 text-[12px] font-bold text-[#A3A3A3]">نص الرسالة</p>
              <p className="text-[15px] font-bold leading-8 text-black">
                {item.message || "—"}
              </p>
            </div>

            <div className="mt-auto grid gap-3 rounded-[18px] bg-[#FAFAFA] p-4 text-[12px] text-[#737373]">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[#A3A3A3]">نص الزر الأول</span>
                <span className="text-[13px] font-medium text-black">{item.button_text || "—"}</span>
                <span className="break-all" dir="ltr">
                  {item.button_link || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[#A3A3A3]">نص الزر الثاني</span>
                <span className="text-[13px] font-medium text-black">{item.button_text_2 || "—"}</span>
                <span className="break-all" dir="ltr">
                  {item.button_link_2 || "—"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-[20px] border border-dashed border-[#E0E0E0] bg-[#FAFAFA] px-6 py-10 text-center">
            <span className="mb-3 text-4xl" aria-hidden>
              {meta.emoji}
            </span>
            <p className="mb-2 text-[16px] font-black text-black">لا توجد رسالة مضافة بعد</p>
            <p className="mb-6 max-w-sm text-[13px] leading-7 text-[#737373]">
              يمكنك إضافة رسالة واحدة فقط من نوع {meta.label.toLowerCase()}، ثم تعديلها لاحقاً
              بدون حذف.
            </p>
            <EditPaymentMessageDialog type={type} triggerVariant="add" />
          </div>
        )}
      </div>
    </div>
  );
}
