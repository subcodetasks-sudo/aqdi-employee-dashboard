"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import waIcon from "@/public/images/waIcon.svg";
import { RETURN_ACCENT, RETURN_WHATSAPP_MESSAGE } from "./primitives";

function copyWhatsappMessage() {
    navigator.clipboard.writeText(RETURN_WHATSAPP_MESSAGE);
    toast.success("تم نسخ الرسالة");
}

export default function ReturnRequestWhatsappStep({ open, order, onClose, onContinue }) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[480px] p-8 sm:p-10 rounded-[18px] border-0" dir="rtl" closeButton={false}>
                <div className="flex flex-col items-center text-center gap-0 w-full">
                    <div className="w-[72px] h-[72px] rounded-full bg-[#0B7A4C] flex items-center justify-center mb-5 shadow-[0_4px_14px_rgba(11,122,76,0.35)]">
                        <div className="relative flex items-center justify-center">
                            <i className="fa-regular fa-clock text-white text-[30px]" aria-hidden />
                            <i
                                className="fa-solid fa-check text-white text-[13px] absolute -bottom-0.5 -start-1"
                                aria-hidden
                            />
                        </div>
                    </div>

                    <h2 className="text-[20px] font-bold text-black leading-snug mb-2">
                        تم رفع طلب الاسترجاع بنجاح <span aria-hidden>✅</span>
                    </h2>
                    <p className="text-[14px] text-[#A3A3A3] font-normal mb-4">الرجاء نسخ الكلام وإرسالها للعميل :</p>

                    <div className="w-full h-px bg-[#EBEBEB] mb-5" />

                    <div className="w-full flex flex-col gap-2.5 text-[14px] text-[#4D4D4D] leading-relaxed mb-5">
                        <p className="font-bold text-black text-center">عميلنا العزيز،</p>
                        <p className="text-center">الرجاء تعبئة البيانات لإتمام طلب الاسترجاع :</p>
                        <p className="text-center">اسم البنك :</p>
                        <p className="text-center">اسم صاحب الحساب :</p>
                        <p className="text-center">رقم الحساب او الآيبان :</p>

                        <div className="flex items-start justify-center gap-2 text-center mt-1 px-2">
                            <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0 mt-2" aria-hidden />
                            <p className="text-[13px] text-[#4D4D4D] max-w-[340px]">
                                يشترط ان يكون رقم الحساب هو نفس وفي حالة تغييره سيتم رفض الطلب
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-1">
                            <Clock className="size-4 text-[#A3A3A3] shrink-0" strokeWidth={2} />
                            <p className="text-[13px] text-[#737373]">سيتم استرجاع المبلغ خلال يوم إلى 3 أيام عمل</p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[#EBEBEB] mb-4" />

                    <div className="flex items-center justify-center gap-2 mb-4">
                        <button
                            type="button"
                            className="text-[#A3A3A3] hover:text-[#557086] transition-colors p-1"
                            onClick={copyWhatsappMessage}
                            aria-label="نسخ رسالة الشكر"
                        >
                            <i className="fa-regular fa-copy text-[16px]" />
                        </button>
                        <span className="text-[14px] text-[#4D4D4D]">شكراً لتفهمكم.</span>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-5">
                        <Link
                            href={`https://wa.me/${order?.user_mobile}`}
                            target="_blank"
                            className="hover:scale-110 transition-transform"
                            aria-label="فتح واتساب"
                        >
                            <Image src={waIcon} alt="WhatsApp" width={26} height={26} />
                        </Link>
                        <button
                            type="button"
                            className="text-[#A3A3A3] hover:text-[#557086] transition-colors p-1"
                            onClick={copyWhatsappMessage}
                            aria-label="نسخ الرسالة كاملة"
                        >
                            <i className="fa-regular fa-copy text-[16px]" />
                        </button>
                        <span className="text-[16px] font-bold text-black" dir="ltr">
                            {order?.user_mobile}
                        </span>
                    </div>

                    <div className="w-full h-px bg-[#EBEBEB] mb-5" />

                    <button
                        type="button"
                        onClick={onContinue}
                        style={{ backgroundColor: RETURN_ACCENT }}
                        className="w-full max-w-[280px] h-[52px] text-white rounded-[11px] font-bold text-[16px] hover:brightness-110 transition-all shadow-lg shadow-[#557086]/20"
                    >
                        تم
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
