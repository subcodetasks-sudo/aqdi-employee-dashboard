"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import {
    ensureReturnContractStatusForOrder,
    resolveRefundableContractId,
    RETURN_CONTRACT_STATUS_ID,
} from "@/components/analysis/returned/refund-contract-utils";
import { invalidateRefundCaches } from "@/src/lib/invalidate-orders-caches";

export function useReturnRequest({ open, order, orderId, orderUuid, queryKey, onReturnSuccess }) {
    const [step, setStep] = useState(0);
    const [refundAmount, setRefundAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [contractFile, setContractFile] = useState(null);
    const queryClient = useQueryClient();

    const resetForm = useCallback(() => {
        setStep(0);
        setRefundAmount("");
        setNotes("");
        setContractFile(null);
    }, []);

    const contractId = resolveRefundableContractId(order, orderId ?? orderUuid);
    const resolvedOrderId = orderId ?? order?.id ?? orderUuid;

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
            await ensureReturnContractStatusForOrder(order, resolvedOrderId, RETURN_CONTRACT_STATUS_ID);

            return response;
        },
        onSuccess: (res) => {
            toast.success(res?.data?.message || "تم رفع طلب الاسترجاع بنجاح");
            invalidateRefundCaches(queryClient, { queryKey, orderId: resolvedOrderId });
            onReturnSuccess?.();
            setStep(2);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message || "حدث خطأ أثناء إرسال طلب الاسترجاع");
        },
    });

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

    const invalidateAfterClose = () => {
        invalidateRefundCaches(queryClient, { queryKey, orderId: resolvedOrderId });
    };

    return {
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
        resetForm,
    };
}
