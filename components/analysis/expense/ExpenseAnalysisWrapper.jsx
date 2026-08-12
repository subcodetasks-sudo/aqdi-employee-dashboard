'use client'
import React, { useState } from 'react'
import greenRial from '@/public/images/greenRial.svg'
import Image from 'next/image'
import { axiosInstance } from '@/src/utils/axios'
import { useQuery } from '@tanstack/react-query'
import Loader from '../../home/loader'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { usePeriodFilter } from '@/components/analysis/shared/usePeriodFilter'
import PeriodFilterBar from '@/components/analysis/shared/PeriodFilterBar'

export default function ExpenseAnalysisWrapper() {
    const { period: id, setPeriod } = usePeriodFilter()
    const [currentPage, setCurrentPage] = useState(1)

    const tableHeaders = [
        "تاريخ الإضافة",
        "المبــلغ",
        "الملاحظة",
    ];

    function getExpenses(page = 1) {
        const createAt = id === 'total' ? 'total' : id;
        return axiosInstance.get(`/admin/finance/expenses?created_at=${createAt}&page=${page}`)
            .then(res => res.data);
    }

    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['expensesAnalysis', id, currentPage],
        queryFn: () => getExpenses(currentPage),
    });

    const expenses = responseData?.data?.items || [];
    const pagination = responseData?.data?.pagination;

    if (isLoading) return <Loader />
    if (isError) return <div className="text-center p-8 text-[#FA5252] text-[15px]">حدث خطأ أثناء تحميل البيانات</div>

    return (
        <div className="flex flex-col gap-6" dir="rtl">
            <PeriodFilterBar period={id} onChange={setPeriod} />

            <div className="w-full overflow-x-auto bg-white rounded-[24px] border border-[#E4E4E4] shadow-sm">
                <table className="w-full border-collapse">
                    <thead className="bg-[#FAFAFA]">
                        <tr>
                            {tableHeaders.map((header, index) => (
                                <th key={index} className="text-right p-[15px_20px] text-[#A3A3A3] text-[13px] font-medium border-b border-[#E4E4E4] whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {expenses && expenses.length > 0 ? (
                            expenses.map((item) => (
                                <tr key={item.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all">
                                    <td className="p-[15px_20px]">
                                        <div className="text-black text-[13px] font-medium whitespace-nowrap">
                                            <span>{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </td>
                                    <td className="p-[15px_20px]">
                                        <div className="flex items-center gap-1.5 text-[#007C13] font-bold text-[14px]">
                                            <span>{parseFloat(item.amount).toLocaleString('ar-EG')}</span>
                                            <Image src={greenRial} alt="rial" width={16} height={16} />
                                        </div>
                                    </td>
                                    <td className="p-[15px_20px]">
                                        <div className="max-w-[600px] text-[13px] text-[#616161] leading-relaxed text-right line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                                            <span>{item.notes || "—"}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="text-center p-8 text-[#A3A3A3] text-sm">
                                    لا توجد مصروفات متوفرة حالياً.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* pagination controls */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2.5 mt-6" dir="rtl">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#A3A3A3]"
                    >
                        <ChevronRight className="size-4" />
                    </button>

                    {(() => {
                        const pages = [];
                        const { last_page } = pagination;
                        const range = 1;
                        const start = Math.max(1, currentPage - range);
                        const end = Math.min(last_page, currentPage + range);

                        if (start > 1) {
                            pages.push(1);
                            if (start > 2) pages.push('...');
                        }

                        for (let i = start; i <= end; i++) {
                            pages.push(i);
                        }

                        if (end < last_page) {
                            if (end < last_page - 1) pages.push('...');
                            pages.push(last_page);
                        }

                        return pages.map((page, idx) => {
                            if (page === '...') {
                                return (
                                    <span key={`dots-${idx}`} className="text-[#A3A3A3] px-1">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium transition-all ${currentPage === page
                                            ? "bg-brand-main text-white shadow-lg shadow-brand-main/20"
                                            : "border border-[#E4E4E4] text-[#A3A3A3] hover:bg-[#f5f5f5]"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        });
                    })()}

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))}
                        disabled={currentPage === pagination.last_page}
                        className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#A3A3A3]"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                </div>
            )}
        </div>
    );
}