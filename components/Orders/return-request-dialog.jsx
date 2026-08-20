"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Loader2, Paperclip, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import waIcon from "@/public/images/waIcon.svg";
import { Button } from "../ui/button";
import {
    ensureReturnContractStatusForOrder,
    resolveRefundableContractId,
    RETURN_CONTRACT_STATUS_ID,
} from "@/components/analysis/returned/refund-contract-utils";
import { invalidateRefundCaches } from "@/src/lib/invalidate-orders-caches";

function formatDateTime(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${time} · ${day}/${month}/${date.getFullYear()}`;
}

function Tile({ label, value, className = "" }) {
    // design.html .tmd — muted card, #F7FAF9 bg, #EEF2F0 border, 10px radius
    return (
        <div className={`rounded-[10px] bg-[#F7FAF9] border border-[#EEF2F0] px-4 py-3 ${className}`}>
            <p className="text-[11.5px] text-[#8A968F] mb-1">{label}</p>
            <p className="text-[14px] font-bold text-[#2B3A34] truncate">{value ?? "—"}</p>
        </div>
    );
}

// design.html's terminal-status confirm modals use the "refunded" tone (#557086)
// for the استرجاع flow — matches .tm-refunded / .tmconfirm.tm-refunded
const RETURN_ACCENT = "#557086";

const inputClass =
    "w-full h-[52px] bg-white border border-[#E3E8E6] rounded-[16px] px-4 text-[14px] focus:outline-none focus:border-[#557086] focus:ring-1 focus:ring-[#557086]/20 transition-all";

const WHATSAPP_MESSAGE = `عميلنا العزيز،

الرجاء تعبئة البيانات لإتمام طلب الاسترجاع :
أسم البنك :
أسم صاحب الحساب :
رقم الحساب او الآيبان :
🔴 يشترط ان يكون رقم الحساب هو نفس وفي حالة تغييره سيتم رفض الطلب
⏱️ سيتم استرجاع المبلغ خلال يوم إلى 3 أيام عمل

شكراً لتفهمكم.`;

export default function ReturnRequestDialog({
    open,
    onOpenChange,
    order,
    orderId,
    orderUuid,
    queryKey = ["returnOrders"],
    onReturnSuccess,
}) {
    const [step, setStep] = useState(0);
    const [refundAmount, setRefundAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [contractFile, setContractFile] = useState(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!open) {
            setStep(0);
            setRefundAmount("");
            setNotes("");
            setContractFile(null);
        }
    }, [open]);

    const contractId = resolveRefundableContractId(order, orderId ?? orderUuid);

    const { mutate: submitReturn, isPending } = useMutation({
        mutationFn: async () => {
            let payload;
            if (contractFile) {
                const formData = new FormData();
                formData.append("contract_id", contractId);
                formData.append("refund_amount", String(Number(refundAmount)));
                if (notes.trim()) formData.append("notes", notes.trim());
                formData.append("client_contract_file", contractFile);
                payload = formData;
            } else {
                payload = {
                    contract_id: contractId,
                    refund_amount: Number(refundAmount),
                    notes: notes.trim() || null,
                };
            }

            // 1) أرسل طلب الاسترجاع أولاً
            const response = await axiosInstance.post("/admin/refundable-contracts", payload);

            // 2) بعد نجاح الطلب: غيّر الحالة إلى استرجاع (2)
            await ensureReturnContractStatusForOrder(
                order,
                orderId ?? order?.id ?? orderUuid,
                RETURN_CONTRACT_STATUS_ID
            );

            return response;
        },
        onSuccess: (res) => {
            toast.success(res?.data?.message || "تم رفع طلب الاسترجاع بنجاح");
            invalidateRefundCaches(queryClient, {
                queryKey,
                orderId: orderId ?? order?.id ?? orderUuid,
            });
            onReturnSuccess?.();
            setStep(2);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message || "حدث خطأ أثناء إرسال طلب الاسترجاع");
        },
    });

    const handleClose = () => {
        onOpenChange(false);
    };

    const handleSubmit = () => {
        if (!contractId) {
            toast.error("تعذر تحديد العقد المرتبط بالطلب");
            return;
        }
        if (!refundAmount.trim()) {
            toast.error("يرجى إدخال قيمة المبلغ المسترجع");
            return;
        }
        const amount = Number(refundAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error("يرجى إدخال قيمة مبلغ مسترجع صحيحة");
            return;
        }
        submitReturn();
    };

    return (
        <>
            {/* Step 1: Form */}
            <Dialog open={open && step === 0} onOpenChange={(v) => !v && handleClose()}>
                <DialogContent
                    className="sm:max-w-[560px] p-8 rounded-[18px] border-0 gap-0 max-h-[90vh] overflow-y-auto no-scrollbar"
                    dir="rtl"
                    closeButton={false}
                >
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute left-6 top-6 w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#A3A3A3] hover:bg-[#FFEBEB] hover:text-[#E24444] transition-all z-10"
                        aria-label="إغلاق"
                    >
                        <i className="fa-solid fa-xmark text-[14px]" />
                    </button>

                    <DialogHeader className="mb-6 space-y-0">
                        <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F0] pb-4">
                            <span
                                className="w-[31px] h-[31px] rounded-[9px] text-white flex items-center justify-center shrink-0"
                                style={{ backgroundColor: RETURN_ACCENT }}
                            >
                                <Undo2 className="size-[17px]" />
                            </span>
                            <DialogTitle className="text-[18px] font-bold text-black text-right">
                                رفع طلب استرجاع
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    {order ? (
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-3">
                                <Tile label="نوع العقد" value={order.contract_type} />
                                <Tile label="رقم الطلب" value={order.uuid ? `#${order.uuid}` : null} />
                                <Tile label="تاريخ إنشاء الطلب" value={formatDateTime(order.created_at)} />
                                <Tile label="المبلغ المدفوع" value={order.amount_payment} />
                                <Tile
                                    label="الموظف المستلم"
                                    value={order.employee_name}
                                    className="col-span-2"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-black text-right">
                                    قيمة المبلغ المسترجع
                                    <span className="text-[#FF4D4F] mr-1">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    className={inputClass}
                                    placeholder="المبلغ بالريال"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-black text-right">
                                    إرفاق عقد العميل (PDF) (اختياري)
                                </label>
                                <label
                                    className={`w-full h-[52px] rounded-[11px] border border-dashed border-[#C9D6E0] bg-white px-4 flex items-center justify-between gap-2 cursor-pointer ${
                                        isPending ? "pointer-events-none opacity-60" : ""
                                    }`}
                                >
                                    <span className="text-[13px] text-[#5A645F] truncate">
                                        {contractFile ? contractFile.name : "اختر ملف PDF لإرفاقه..."}
                                    </span>
                                    <span
                                        className="inline-flex items-center gap-1.5 shrink-0 text-[12px] font-bold"
                                        style={{ color: RETURN_ACCENT }}
                                    >
                                        <Paperclip className="size-3.5" />
                                        استعراض
                                    </span>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        disabled={isPending}
                                        onChange={(e) => setContractFile(e.target.files?.[0] ?? null)}
                                    />
                                </label>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-black text-right">
                                    ملاحظات تود ذكرها
                                </label>
                                <textarea
                                    className="w-full min-h-[100px] bg-white border border-[#E3E8E6] rounded-[16px] p-4 text-[14px] focus:outline-none focus:border-[#557086] focus:ring-1 focus:ring-[#557086]/20 transition-all resize-none"
                                    placeholder="أكتب هنا ..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    disabled={isPending}
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    disabled={isPending}
                                    onClick={handleSubmit}
                                    style={{ backgroundColor: RETURN_ACCENT }}
                                    className="flex-1 h-[52px] text-white rounded-[11px] font-bold text-[15px] hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        "تأكيد الاسترجاع"
                                    )}
                                </Button>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={handleClose}
                                    className="h-[52px] px-6 rounded-[11px] border border-[#E3E8E6] bg-[#F2F5F3] text-[#33403B] font-bold text-[15px] hover:bg-[#E7EDE9] transition-all"
                                >
                                    تراجع
                                </button>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Step 2: WhatsApp message */}
            <Dialog open={open && step === 2} onOpenChange={(v) => !v && handleClose()}>
                <DialogContent
                    className="sm:max-w-[480px] p-8 sm:p-10 rounded-[18px] border-0"
                    dir="rtl"
                    closeButton={false}
                >
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
                            تم رفع طلب الاسترجاع بنجاح{" "}
                            <span aria-hidden>✅</span>
                        </h2>
                        <p className="text-[14px] text-[#A3A3A3] font-normal mb-4">
                            الرجاء نسخ الكلام وإرسالها للعميل :
                        </p>

                        <div className="w-full h-px bg-[#EBEBEB] mb-5" />

                        <div className="w-full flex flex-col gap-2.5 text-[14px] text-[#4D4D4D] leading-relaxed mb-5">
                            <p className="font-bold text-black text-center">عميلنا العزيز،</p>
                            <p className="text-center">
                                الرجاء تعبئة البيانات لإتمام طلب الاسترجاع :
                            </p>
                            <p className="text-center">اسم البنك :</p>
                            <p className="text-center">اسم صاحب الحساب :</p>
                            <p className="text-center">رقم الحساب او الآيبان :</p>

                            <div className="flex items-start justify-center gap-2 text-center mt-1 px-2">
                                <span
                                    className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0 mt-2"
                                    aria-hidden
                                />
                                <p className="text-[13px] text-[#4D4D4D] max-w-[340px]">
                                    يشترط ان يكون رقم الحساب هو نفس وفي حالة تغييره سيتم رفض الطلب
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 mt-1">
                                <Clock className="size-4 text-[#A3A3A3] shrink-0" strokeWidth={2} />
                                <p className="text-[13px] text-[#737373]">
                                    سيتم استرجاع المبلغ خلال يوم إلى 3 أيام عمل
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-[#EBEBEB] mb-4" />

                        <div className="flex items-center justify-center gap-2 mb-4">
                            <button
                                type="button"
                                className="text-[#A3A3A3] hover:text-[#557086] transition-colors p-1"
                                onClick={() => {
                                    navigator.clipboard.writeText(WHATSAPP_MESSAGE);
                                    toast.success("تم نسخ الرسالة");
                                }}
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
                                onClick={() => {
                                    navigator.clipboard.writeText(WHATSAPP_MESSAGE);
                                    toast.success("تم نسخ الرسالة");
                                }}
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
                            onClick={() => setStep(3)}
                            style={{ backgroundColor: RETURN_ACCENT }}
                            className="w-full max-w-[280px] h-[52px] text-white rounded-[11px] font-bold text-[16px] hover:brightness-110 transition-all shadow-lg shadow-[#557086]/20"
                        >
                            تم
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Step 3: Success */}
            <Dialog
                open={open && step === 3}
                onOpenChange={(v) => {
                    if (!v) {
                        handleClose();
                        invalidateRefundCaches(queryClient, {
                            queryKey,
                            orderId: orderId ?? order?.id,
                        });
                    }
                }}
            >
                <DialogContent
                    className="sm:max-w-[420px] p-8 rounded-[18px] border-0"
                    dir="rtl"
                    closeButton={false}
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="text-[72px] leading-none">🧐</div>
                        <h2 className="text-[20px] font-bold text-[#22302C] leading-relaxed">
                            تم تصنيف الطلب رقم{" "}
                            <span style={{ color: RETURN_ACCENT }}>{order?.uuid}</span>
                        </h2>
                        <p className="text-[22px] font-black text-[#22302C]">
                            الى <span style={{ color: RETURN_ACCENT }}>مسترجع</span> بنجاح!
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                handleClose();
                                invalidateRefundCaches(queryClient, {
                                    queryKey,
                                    orderId: orderId ?? order?.id,
                                });
                                toast.success("تم تحديث حالة الطلب بنجاح");
                            }}
                            style={{ backgroundColor: RETURN_ACCENT }}
                            className="w-full h-[50px] text-white rounded-[11px] font-bold text-[15px] hover:brightness-110 transition-all mt-4"
                        >
                            تم
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
