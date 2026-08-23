"use client";

import { Loader2, Paperclip, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../../ui/button";
import { RETURN_ACCENT, RETURN_INPUT_CLASS, ReturnTile, formatReturnDateTime } from "./primitives";

export default function ReturnRequestFormStep({
    open,
    order,
    refundAmount,
    onRefundAmountChange,
    notes,
    onNotesChange,
    contractFile,
    onContractFileChange,
    isPending,
    onSubmit,
    onClose,
}) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                className="sm:max-w-[560px] p-8 rounded-[18px] border-0 gap-0 max-h-[90vh] overflow-y-auto no-scrollbar"
                dir="rtl"
                closeButton={false}
            >
                <button
                    type="button"
                    onClick={onClose}
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
                            <ReturnTile label="نوع العقد" value={order.contract_type} />
                            <ReturnTile label="رقم الطلب" value={order.uuid ? `#${order.uuid}` : null} />
                            <ReturnTile label="تاريخ إنشاء الطلب" value={formatReturnDateTime(order.created_at)} />
                            <ReturnTile label="المبلغ المدفوع" value={order.amount_payment} />
                            <ReturnTile label="الموظف المستلم" value={order.employee_name} className="col-span-2" />
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
                                className={RETURN_INPUT_CLASS}
                                placeholder="المبلغ بالريال"
                                value={refundAmount}
                                onChange={(e) => onRefundAmountChange(e.target.value)}
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
                                    onChange={(e) => onContractFileChange(e.target.files?.[0] ?? null)}
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
                                onChange={(e) => onNotesChange(e.target.value)}
                                disabled={isPending}
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                disabled={isPending}
                                onClick={onSubmit}
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
                                onClick={onClose}
                                className="h-[52px] px-6 rounded-[11px] border border-[#E3E8E6] bg-[#F2F5F3] text-[#33403B] font-bold text-[15px] hover:bg-[#E7EDE9] transition-all"
                            >
                                تراجع
                            </button>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
