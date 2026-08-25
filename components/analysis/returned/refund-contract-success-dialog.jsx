"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import waIcon from "@/public/images/waIcon.svg";
import { buildRefundApprovedCustomerMessage } from "./refund-contract-utils";

export function RefundApprovedSuccessDialog({ open, onOpenChange, refund }) {
  const message = buildRefundApprovedCustomerMessage(refund);
  const amount = refund?.refundAmount ?? "—";
  const reference = refund?.referenceNumber ?? "—";
  const orderNumber = refund?.orderUuid ?? "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] p-8 sm:p-10 rounded-[36px] border-0"
        dir="rtl"
        closeButton={false}
      >
        <div className="flex flex-col items-center text-center w-full">
          <div className="w-[72px] h-[72px] rounded-full bg-brand-accent flex items-center justify-center mb-5 shadow-[0_4px_14px_rgba(16,185,129,0.35)]">
            <i className="fa-solid fa-check text-white text-[32px]" aria-hidden />
          </div>

          <h2 className="text-[20px] font-bold text-black leading-snug mb-2">
            تمت موافقة الإدارة بنجاح
          </h2>
          <p className="text-sm text-ink-placeholder font-normal mb-4">
            برجاء نسخ الطلب وإرسالها للعميل
          </p>

          <div className="w-full h-px bg-[#EBEBEB] mb-5" />

          <div className="w-full rounded-20 border border-dashed border-brand-hover/40 bg-[#F8FBFF] p-5 text-sm text-ink-subtle leading-relaxed mb-5 text-right">
            <p className="font-bold text-black text-center mb-3">عميلنا العزيز،</p>
            <p className="text-center mb-2">نود إبلاغكم بأنه تم استرجاع المبلغ بنجاح</p>
            <p className="text-center">المبلغ: {amount}</p>
            <p className="text-center">الرقم المرجعي: {reference}</p>
            <p className="text-center">رقم الطلب: {orderNumber}</p>
            <p className="text-center mt-3">شكراً لتفهمكم.</p>
          </div>

          {refund?.userMobile ? (
            <div className="flex items-center justify-center gap-3 mb-5">
              <Link
                href={`https://wa.me/${refund.userMobile}`}
                target="_blank"
                className="hover:scale-110 transition-transform"
                aria-label="فتح واتساب"
              >
                <Image src={waIcon} alt="WhatsApp" width={26} height={26} />
              </Link>
              <button
                type="button"
                className="text-ink-placeholder hover:text-brand-hover transition-colors p-1"
                onClick={() => {
                  navigator.clipboard.writeText(message);
                  toast.success("تم نسخ الرسالة");
                }}
                aria-label="نسخ الرسالة"
              >
                <i className="fa-regular fa-copy text-base" />
              </button>
              <span className="text-base font-bold text-black" dir="ltr">
                {refund.userMobile}
              </span>
            </div>
          ) : null}

          <div className="w-full h-px bg-[#EBEBEB] mb-5" />

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full max-w-[280px] h-13 bg-brand-hover text-white rounded-full font-bold text-base hover:bg-brand-hover/90 transition-all shadow-lg shadow-brand-hover/20"
          >
            تم
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RefundRetractSuccessDialog({ open, onOpenChange, refund }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[420px] p-8 rounded-32 border-0"
        dir="rtl"
        closeButton={false}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="text-[72px] leading-none">🧐</div>
          <h2 className="text-[20px] font-bold text-black leading-relaxed">
            تم الغاء استرجاع الطلب رقم{" "}
            <span className="text-brand-hover">{refund?.orderUuid}</span>
          </h2>
          <p className="text-lg font-bold text-black leading-relaxed">
            وتصنيفه أخرى في قسم{" "}
            <span className="text-brand-hover">طلب مكتمل</span> بنجاح!
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full h-[50px] bg-brand-hover text-white rounded-full font-bold text-15 hover:bg-brand-hover/90 transition-all mt-4"
          >
            تم
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
