"use client";

import ReportSectionCard from "./ReportSectionCard";

export function reportErrorMessage(error, fallback) {
    const message = error?.response?.data?.message || error?.message || "";
    if (message.includes("Unknown column 'order'") || message.includes("contract_statuses")) {
        return "تعذر تحميل بيانات الحالات من الخادم. يرجى تحديث ترتيب حالات العقود في النظام.";
    }
    return message || fallback;
}

export default function ReportError({ title, error, fallback }) {
    return (
        <ReportSectionCard title={title}>
            <p className="text-13 text-red-600 dark:text-red-300">
                {reportErrorMessage(error, fallback)}
            </p>
        </ReportSectionCard>
    );
}
