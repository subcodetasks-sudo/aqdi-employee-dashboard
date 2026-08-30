"use client";

import { Loader2, Paperclip, Undo2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import OrderActionDialogHeader from "@/components/shared/OrderActionDialogHeader";
import { Button } from "../../ui/button";
import { RETURN_ACCENT, RETURN_INPUT_CLASS, ReturnTile, formatReturnDateTime } from "./primitives";

export default function ReturnRequestFormStep({
    open,
    formSession = 0,
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
    const handleClose = () => {
        if (isPending) return;
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
            <DialogContent
                key={formSession}
                className="sm:max-w-[560px] p-8 rounded-[18px] border-0 gap-0 max-h-[90vh] overflow-y-auto no-scrollbar"
                dir="rtl"
                closeButton={false}
            >
                <OrderActionDialogHeader
                    icon={Undo2}
                    iconClassName="w-[31px] h-[31px] rounded-[9px]"
                    iconStyle={{ backgroundColor: RETURN_ACCENT }}
                    title="رفع طلب استرجاع"
                    onClose={handleClose}
                    className="mb-6"
                />

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
                            <label className="text-13 font-bold text-black text-right">
                                قيمة المبلغ المسترجع
                                <span className="text-status-danger mr-1">*</span>
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
                            <label className="text-13 font-bold text-black text-right">
                                إرفاق عقد العميل (PDF) (اختياري)
                            </label>
                            <label
                                className={`w-full h-13 rounded-[11px] border border-dashed border-[#C9D6E0] bg-white px-4 flex items-center justify-between gap-2 cursor-pointer ${
                                    isPending ? "pointer-events-none opacity-60" : ""
                                }`}
                            >
                                <span className="text-13 text-[#5A645F] truncate">
                                    {contractFile ? contractFile.name : "اختر ملف PDF لإرفاقه..."}
                                </span>
                                <span
                                    className="inline-flex items-center gap-1.5 shrink-0 text-xs font-bold"
                                    style={{ color: RETURN_ACCENT }}
                                >
                                    <Paperclip className="size-3.5" />
                                    استعراض
                                </span>
                                <input
                                    key={`contract-file-${formSession}`}
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    disabled={isPending}
                                    onChange={(e) => onContractFileChange(e.target.files?.[0] ?? null)}
                                />
                            </label>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-13 font-bold text-black text-right">
                                ملاحظات تود ذكرها
                            </label>
                            <textarea
                                className="w-full min-h-[100px] bg-white border border-[#E3E8E6] rounded-2xl p-4 text-sm focus:outline-none focus:border-[#557086] focus:ring-1 focus:ring-[#557086]/20 transition-all resize-none"
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
                                className="flex-1 h-13 text-white rounded-[11px] font-bold text-15 hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
                                className="h-13 px-6 rounded-[11px] border border-[#E3E8E6] bg-[#F2F5F3] text-[#33403B] font-bold text-15 hover:bg-[#E7EDE9] transition-all"
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
