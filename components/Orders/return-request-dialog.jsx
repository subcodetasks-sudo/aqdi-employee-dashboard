"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import greenRial from "@/public/images/greenRial.svg";
import waIcon from "@/public/images/waIcon.svg";
import { Button } from "../ui/button";
import {
    ensureReturnContractStatusForOrder,
    getOrderContractStatusDisplay,
    resolveRefundableContractId,
    RETURN_CONTRACT_STATUS_ID,
} from "@/components/analysis/returned/refund-contract-utils";

function formatRelativeTimeAr(dateString) {
    if (!dateString) return "—";
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes}د`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} س`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days >= 1 && remainingHours > 0) return `منذ ${days} يوم و ${remainingHours} س`;
    if (days >= 1) return `منذ ${days} يوم`;
    return `منذ ${hours} س`;
}

function SummaryRow({ label, children, className = "" }) {
    return (
        <div
            className={`flex items-center justify-between gap-4 py-3 border-b border-[#EBEBEB] last:border-0 ${className}`}
        >
            <span className="text-[13px] text-[#A3A3A3] shrink-0">{label}</span>
            <div className="flex items-center gap-2 min-w-0">{children}</div>
        </div>
    );
}

const inputClass =
    "w-full h-[52px] bg-white border border-[#EEEEEE] rounded-[16px] px-4 text-[14px] focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all";

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
    const [draftNumber, setDraftNumber] = useState("");
    const [refundAmount, setRefundAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [statusDisplay, setStatusDisplay] = useState(() => getOrderContractStatusDisplay(order));
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!open) {
            setStep(0);
            setDraftNumber("");
            setRefundAmount("");
            setNotes("");
        }
    }, [open]);

    useEffect(() => {
        setStatusDisplay(getOrderContractStatusDisplay(order));
    }, [order]);

    const contractId = resolveRefundableContractId(order, orderId ?? orderUuid);

    const { mutate: submitReturn, isPending } = useMutation({
        mutationFn: async () => {
            // 1) أرسل طلب الاسترجاع أولاً
            const response = await axiosInstance.post("/admin/refundable-contracts", {
                contract_id: contractId,
                draft_contract_number: draftNumber.trim(),
                refund_amount: Number(refundAmount),
                notes: notes.trim() || null,
            });

            // 2) بعد نجاح الطلب: غيّر الحالة إلى استرجاع (2)
            await ensureReturnContractStatusForOrder(
                order,
                orderId ?? order?.id ?? orderUuid,
                RETURN_CONTRACT_STATUS_ID
            );

            return response;
        },
        onSuccess: (res) => {
            setStatusDisplay({
                id: RETURN_CONTRACT_STATUS_ID,
                name: "استرجاع",
                color: "#ffcccc",
            });
            toast.success(res?.data?.message || "تم رفع طلب الاسترجاع بنجاح");
            queryClient.invalidateQueries({ queryKey });
            queryClient.invalidateQueries({ queryKey: ["refundContractsLookup"] });
            queryClient.invalidateQueries({ queryKey: ["refundContracts"] });
            queryClient.invalidateQueries({ queryKey: ["returnOrders"] });
            queryClient.invalidateQueries({ queryKey: ["orders-all-total"] });
            queryClient.invalidateQueries({ queryKey: ["status"] });
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
        if (!draftNumber.trim() || !refundAmount.trim()) {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }
        const amount = Number(refundAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error("يرجى إدخال قيمة مبلغ مسترجع صحيحة");
            return;
        }
        submitReturn();
    };

    const isHousing =
        order?.contract_type_key === "housing" ||
        order?.contract_type === "سكنـي" ||
        order?.contract_type === "سكني";

    const receivedSince = formatRelativeTimeAr(order?.updated_at || order?.created_at);

    return (
        <>
            {/* Step 1: Form */}
            <Dialog open={open && step === 0} onOpenChange={(v) => !v && handleClose()}>
                <DialogContent
                    className="sm:max-w-[560px] p-8 rounded-[32px] border-0 gap-0 max-h-[90vh] overflow-y-auto no-scrollbar"
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

                    <DialogHeader className="mb-5 space-y-0">
                        <DialogTitle className="text-[20px] font-bold text-black text-right border-b border-[#F0F0F0] pb-4">
                            طلب إسترجاع
                        </DialogTitle>
                    </DialogHeader>

                    {order ? (
                        <div className="flex flex-col gap-5  ">
                            <div className="bg-[#F9F9F9] rounded-[20px] p-5 border border-[#F0F0F0]">
                                <div className="flex items-start justify-between gap-3 pb-4 mb-1 border-b border-[#EBEBEB]">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="text-[13px] text-[#A3A3A3]">رقم الطلب</span>
                                        <span className="text-[15px] font-bold text-black">{order.uuid}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[12px] text-[#737373] shrink-0">
                                        <Clock className="size-3.5" strokeWidth={2} />
                                        <span>{receivedSince}</span>
                                    </div>
                                </div>

                                <SummaryRow label="رقم جوال العميل">
                                    <span className="text-[14px] font-bold text-black" dir="ltr">
                                        {order.user_mobile}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(order.user_mobile);
                                            toast.success("تم نسخ رقم الجوال");
                                        }}
                                        className="text-[#A3A3A3] hover:text-brand-hover transition-colors"
                                    >
                                        <i className="fa-regular fa-copy text-[13px]" />
                                    </button>
                                    <Link
                                        href={`https://wa.me/${order.user_mobile}`}
                                        target="_blank"
                                        className="hover:scale-110 transition-transform"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Image src={waIcon} alt="WhatsApp" width={20} height={20} />
                                    </Link>
                                </SummaryRow>

                                <SummaryRow label="نوع العقد">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[12px] font-bold whitespace-nowrap ${
                                            isHousing
                                                ? "bg-[#E6F0FF] text-[#3B82F6]"
                                                : "bg-[#F0E6FF] text-[#7C3AED]"
                                        }`}
                                    >
                                        {order.contract_type || "—"}
                                    </span>
                                </SummaryRow>

                                <SummaryRow label="الدفع">
                                    {order.is_paid ? (
                                        <div className="flex items-center gap-1.5 text-[#007C13] font-bold text-[14px]">
                                            <span>{order.amount_payment}</span>
                                            <Image src={greenRial} alt="" width={14} height={14} />
                                            <span className="w-5 h-5 rounded bg-[#E6FFE6] flex items-center justify-center text-[10px]">
                                                ✓
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[14px] font-bold text-[#EF4444]">
                                            {order.payment_label_ar || "لم يتم الدفع"}
                                        </span>
                                    )}
                                </SummaryRow>

                                <SummaryRow label="مستلم منذ">
                                    <span className="text-[14px] font-bold text-[#D97706]">
                                        {receivedSince}
                                    </span>
                                </SummaryRow>

                                <SummaryRow label="حالة الطلب">
                                    <span
                                        className="px-3 py-1 rounded-full text-[12px] font-bold whitespace-nowrap text-[#212121]"
                                        style={{
                                            backgroundColor: statusDisplay.color,
                                        }}
                                    >
                                        {statusDisplay.name}
                                    </span>
                                </SummaryRow>

                                <SummaryRow label="الاستلام">
                                    <span className="text-[14px] font-bold text-black">
                                        {order.employee_name || "—"}
                                    </span>
                                </SummaryRow>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[13px] font-bold text-black text-right">
                                        رقم مسودة العقد
                                        <span className="text-[#FF4D4F] mr-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="أدخل رقم مسودة العقد هنا ..."
                                        value={draftNumber}
                                        onChange={(e) => setDraftNumber(e.target.value)}
                                        disabled={isPending}
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
                                        placeholder="أدخل قيمة المبلغ المسترجع ..."
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-black text-right">
                                    ملاحظات تود ذكرها
                                </label>
                                <textarea
                                    className="w-full min-h-[100px] bg-white border border-[#EEEEEE] rounded-[16px] p-4 text-[14px] focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all resize-none"
                                    placeholder="أكتب هنا ..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    disabled={isPending}
                                    rows={3}
                                />
                            </div>

                            <Button
                                type="button"
                                disabled={isPending}
                                onClick={handleSubmit}
                                className="w-fit h-14! bg-brand-hover text-white rounded-lg mx-auto font-bold text-[16px] hover:bg-brand-hover/90 transition-all shadow-lg shadow-brand-hover/25 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    "طلب إسترجاع"
                                )}
                            </Button>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Step 2: WhatsApp message */}
            <Dialog open={open && step === 2} onOpenChange={(v) => !v && handleClose()}>
                <DialogContent
                    className="sm:max-w-[480px] p-8 sm:p-10 rounded-[36px] border-0"
                    dir="rtl"
                    closeButton={false}
                >
                    <div className="flex flex-col items-center text-center gap-0 w-full">
                        <div className="w-[72px] h-[72px] rounded-full bg-[#10B981] flex items-center justify-center mb-5 shadow-[0_4px_14px_rgba(16,185,129,0.35)]">
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
                                className="text-[#A3A3A3] hover:text-brand-hover transition-colors p-1"
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
                                className="text-[#A3A3A3] hover:text-brand-hover transition-colors p-1"
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
                            className="w-full max-w-[280px] h-[52px] bg-brand-hover text-white rounded-full font-bold text-[16px] hover:bg-brand-hover/90 transition-all shadow-lg shadow-brand-hover/20"
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
                        queryClient.invalidateQueries({ queryKey });
                    }
                }}
            >
                <DialogContent
                    className="sm:max-w-[420px] p-8 rounded-[32px] border-0"
                    dir="rtl"
                    closeButton={false}
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="text-[72px] leading-none">🧐</div>
                        <h2 className="text-[20px] font-bold text-black leading-relaxed">
                            تم تصنيف الطلب رقم{" "}
                            <span className="text-brand-hover">{order?.uuid}</span>
                        </h2>
                        <p className="text-[22px] font-black text-black">
                            الى <span className="text-brand-hover">مسترجع</span> بنجاح!
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                handleClose();
                                queryClient.invalidateQueries({ queryKey });
                                toast.success("تم تحديث حالة الطلب بنجاح");
                            }}
                            className="w-full h-[50px] bg-brand-hover text-white rounded-full font-bold text-[15px] hover:bg-brand-hover/90 transition-all mt-4"
                        >
                            تم
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
