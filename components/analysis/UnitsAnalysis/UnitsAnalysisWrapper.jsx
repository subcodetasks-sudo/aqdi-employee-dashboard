'use client'
import React, { useState } from 'react'
import { axiosInstance } from '@/src/utils/axios'
import { useQuery } from '@tanstack/react-query'
import Loader from '../../home/loader'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { usePeriodFilter } from '@/components/analysis/shared/usePeriodFilter'
import PeriodFilterBar from '@/components/analysis/shared/PeriodFilterBar'

export default function UnitsAnalysisWrapper() {
    const { period: id, setPeriod } = usePeriodFilter()
    const [currentPage, setCurrentPage] = useState(1)

    const tableHeaders = [
        "نـوع الوحــدة",
        "استخدام الوحدة",
        "اسم المستخدم",
        "التـاريخ/الســاعة",
        "مســاحة الوحدة",
    ];

    function getUnits(page = 1) {
        let createdAtParam = id;
        if (id === 'day') createdAtParam = 'today';
        else if (id === 'total') createdAtParam = 'all';
        return axiosInstance.get(`/admin/unit-real-estates?created_at=${createdAtParam}&page=${page}`)
            .then(res => res.data);
    }

    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['unitsAnalysis', id, currentPage],
        queryFn: () => getUnits(currentPage),
    });

    const rawData = responseData?.data;
    const isPaginated = rawData && !Array.isArray(rawData) && Array.isArray(rawData.items);
    const unitsList = isPaginated ? rawData.items : (Array.isArray(rawData) ? rawData : []);

    // Pagination math
    const ITEMS_PER_PAGE = 10;
    const displayedUnits = isPaginated
        ? unitsList
        : unitsList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const pagination = isPaginated
        ? rawData.pagination
        : {
            current_page: currentPage,
            last_page: Math.ceil(unitsList.length / ITEMS_PER_PAGE),
            total: unitsList.length
          };

    // Date formatting helper
    const formatDate = (row) => {
        if (row.created_at_label) return row.created_at_label;
        const dateStr = row.created_at || row.date_time;
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).replace('،', ' -');
        } catch (e) {
            return dateStr;
        }
    }

    if (isLoading) return <Loader />
    if (isError) return <div className="text-center p-8 text-[#FA5252] text-[15px]">حدث خطأ أثناء تحميل البيانات</div>

    return (
        <div className="flex flex-col gap-6" dir="rtl">
            <PeriodFilterBar period={id} onChange={setPeriod} />

            <div className="w-full overflow-x-auto bg-white rounded-[24px] border border-[#E4E4E4]">
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
                        {displayedUnits && displayedUnits.length > 0 ? (
                            displayedUnits.map((row) => {
                                return (
                                    <tr key={row.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all">
                                        <td className="p-[15px_20px] text-black text-[13px] font-medium whitespace-nowrap">
                                            {row.unit_type?.name_trans || row.unit_type?.name_ar || row.unit_type?.name_en || row?.unit_type_name || "—"}
                                        </td>
                                        <td className="p-[15px_20px] text-[#616161] text-[13px]">{row.unit_usage_name || "—"}</td>
                                        <td className="p-[15px_20px] text-[#616161] text-[13px]">{row.user_name || "—"}</td>

                                        <td className="p-[15px_20px] text-[#616161] text-[12px] whitespace-nowrap">{formatDate(row)}</td>
                                        <td className="p-[15px_20px]">
                                            <div className="px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded-lg border border-[#E0E7FF] text-[12px] font-bold w-fit mx-auto shadow-sm">
                                                <span>{row.unit_area ? (isNaN(row.unit_area) ? row.unit_area : `${row.unit_area} م²`) : "—"}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="text-center p-8 text-[#A3A3A3] text-sm">
                                    لا توجد وحدات متوفرة حالياً.
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
