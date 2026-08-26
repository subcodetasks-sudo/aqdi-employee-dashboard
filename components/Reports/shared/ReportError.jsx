"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportSectionCard from "./ReportSectionCard";

export function reportErrorMessage(error, fallback) {
    const message = error?.response?.data?.message || error?.message || "";
    if (message.includes("Unknown column 'order'") || message.includes("contract_statuses")) {
        return "تعذر تحميل بيانات الحالات من الخادم. يرجى تحديث ترتيب حالات العقود في النظام.";
    }
    return message || fallback;
}

export default function ReportError({ title, error, fallback, onRetry }) {
    return (
        <ReportSectionCard
            title={title}
            action={
                onRetry ? (
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRetry}>
                        <RotateCw className="size-3.5" />
                        إعادة المحاولة
                    </Button>
                ) : null
            }
        >
            <p className="text-13 text-red-600 dark:text-red-300">
                {reportErrorMessage(error, fallback)}
            </p>
        </ReportSectionCard>
    );
}
