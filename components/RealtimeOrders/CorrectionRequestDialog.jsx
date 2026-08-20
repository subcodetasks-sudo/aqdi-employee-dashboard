"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertTriangle, CreditCard, FileText, MapPin, UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import waIcon from "@/public/images/waIcon.svg";
import Image from "next/image";

const ERROR_TYPES = [
  { id: "national_address", label: "العنوان الوطني غير صحيح", icon: MapPin },
  { id: "deed_data", label: "بيانات الصك غير صحيحة", icon: FileText },
  { id: "tenant", label: "المستأجر خطأ", icon: UserRound },
  { id: "owner_id", label: "هوية المالك خطأ", icon: CreditCard },
];

function buildCorrectionMessage(order, selectedLabels) {
  return `عميلنا العزيز،

نأسف لإبلاغكم بوجود خطأ في البيانات التالية ضمن طلبكم رقم #${order?.uuid ?? "—"}:
${selectedLabels.map((label) => `- ${label}`).join("\n")}

يرجى التواصل معنا لتصحيح البيانات في أقرب وقت لإتمام إجراءات طلبكم.

شكراً لتفهمكم.`;
}

export default function CorrectionRequestDialog({ open, onOpenChange, order }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) setSelected([]);
  }, [open]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedLabels = ERROR_TYPES.filter((type) => selected.includes(type.id)).map(
    (type) => type.label
  );
  const message = selectedLabels.length > 0 ? buildCorrectionMessage(order, selectedLabels) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[540px] p-8 rounded-[32px] border-0 gap-0 max-h-[90vh] overflow-y-auto no-scrollbar"
        dir="rtl"
        closeButton={false}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute left-6 top-6 w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#A3A3A3] hover:bg-[#FFEBEB] hover:text-[#E24444] transition-all z-10"
          aria-label="إغلاق"
        >
          <i className="fa-solid fa-xmark text-[14px]" />
        </button>

        <DialogHeader className="mb-6 space-y-0">
          <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F0] pb-4">
            <span className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="size-[18px]" />
            </span>
            <DialogTitle className="text-[18px] font-bold text-black text-right">
              طلب تصحيح بيانات من العميل
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-[13px] font-bold text-black text-right">
            اختر نوع الخطأ (أو أكثر) في بيانات العميل:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {ERROR_TYPES.map((type) => {
              const Icon = type.icon;
              const active = selected.includes(type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggle(type.id)}
                  className={`h-[80px] rounded-[16px] border flex flex-col items-center justify-center gap-1.5 text-[12.5px] font-bold text-center px-2 transition-all ${
                    active
                      ? "border-[#EA580C] bg-[#FFF7ED] text-[#C2410C]"
                      : "border-[#EEEEEE] bg-[#F9F9F9] text-[#4D4D4D] hover:border-[#D0D5DD]"
                  }`}
                >
                  <Icon className="size-[18px]" />
                  {type.label}
                </button>
              );
            })}
          </div>

          <p className="text-[11.5px] text-[#A3A3A3] leading-relaxed px-1">
            اختر خطأً واحداً أو أكثر لتظهر رسالة التصحيح متضمنة البيانات المدخلة.
          </p>

          {message ? (
            <div className="rounded-[20px] bg-[#F9F9F9] border border-[#F0F0F0] p-4 flex flex-col gap-3">
              <p className="whitespace-pre-line text-[13px] text-[#4D4D4D] leading-relaxed">
                {message}
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#EBEBEB]">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(message);
                    toast.success("تم نسخ الرسالة");
                  }}
                  className="text-[12.5px] font-bold text-[#4D4D4D] hover:text-brand-hover transition-colors inline-flex items-center gap-1.5"
                >
                  <i className="fa-regular fa-copy text-[13px]" />
                  نسخ الرسالة
                </button>
                {order?.user_mobile ? (
                  <Link
                    href={`https://wa.me/${String(order.user_mobile).replace(/\D/g, "")}`}
                    target="_blank"
                    className="text-[12.5px] font-bold text-[#15803D] hover:opacity-80 transition-opacity inline-flex items-center gap-1.5"
                  >
                    <Image src={waIcon} alt="" width={16} height={16} />
                    إرسال عبر واتساب
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full h-[52px] rounded-[16px] border border-[#EEEEEE] text-[#4D4D4D] font-bold text-[15px] hover:bg-[#F5F5F5] transition-all mt-1"
          >
            إغلاق
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
