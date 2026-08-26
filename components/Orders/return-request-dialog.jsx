"use client";

import { toast } from "sonner";
import { useReturnRequest } from "@/src/hooks/use-return-request";
import ReturnRequestFormStep from "./return-request/form-step";
import ReturnRequestWhatsappStep from "./return-request/whatsapp-step";
import ReturnRequestSuccessStep from "./return-request/success-step";

export default function ReturnRequestDialog({
    open,
    onOpenChange,
    order,
    orderId,
    orderUuid,
    queryKey = ["returnOrders"],
    onReturnSuccess,
}) {
    const {
        step,
        setStep,
        refundAmount,
        setRefundAmount,
        notes,
        setNotes,
        contractFile,
        setContractFile,
        isPending,
        handleSubmit,
        invalidateAfterClose,
    } = useReturnRequest({ open, order, orderId, orderUuid, queryKey, onReturnSuccess });

    const handleClose = () => onOpenChange(false);

    return (
        <>
            <ReturnRequestFormStep
                open={open && step === 0}
                order={order}
                refundAmount={refundAmount}
                onRefundAmountChange={setRefundAmount}
                notes={notes}
                onNotesChange={setNotes}
                contractFile={contractFile}
                onContractFileChange={setContractFile}
                isPending={isPending}
                onSubmit={handleSubmit}
                onClose={handleClose}
            />

            <ReturnRequestWhatsappStep
                open={open && step === 2}
                order={order}
                onClose={handleClose}
                onContinue={() => setStep(3)}
            />

            <ReturnRequestSuccessStep
                open={open && step === 3}
                order={order}
                onClose={() => {
                    handleClose();
                    invalidateAfterClose();
                }}
                onDone={() => {
                    handleClose();
                    invalidateAfterClose();
                    toast.success("تم تحديث حالة الطلب بنجاح");
                }}
            />
        </>
    );
}
