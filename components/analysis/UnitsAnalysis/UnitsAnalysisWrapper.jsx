'use client'
import Header from '../../home/Header'
import React, { useEffect, useState } from 'react'
import greenRial from '@/public/images/greenRial.svg'
import Image from 'next/image'
import whatsappIcon from '@/public/images/waIcon.svg'
import Link from 'next/link'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { axiosInstance } from '@/src/utils/axios'
import { useQuery } from '@tanstack/react-query'
import Loader from '../../home/loader'
import { ChevronRight, ChevronLeft } from 'lucide-react'

export default function UnitsAnalysisWrapper({ id }) {
    const [title, setTitle] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [suspendModalOpen, setSuspendModalOpen] = useState(false)
    const [selectedUnitId, setSelectedUnitId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        switch (id) {
            case 'day':
                setTitle('وحدات مضافة  / اليــوم')
                break;
            case 'week':
                setTitle('وحدات مضافة  / الأسبوع')
                break;
            case 'month':
                setTitle('وحدات مضافة  / الشهر')
                break;
            case 'year':
                setTitle('وحدات مضافة  / السنة')
                break;
            case 'total':
                setTitle('إجمالي الوحدات')
                break;
            default:
                setTitle('وحدات مضافة  / اليــوم')
                break;
        }
    }, [id])

    const tableHeaders = [
        "نـوع الوحــدة",
        "استخدام الوحدة",
        "اسم المستخدم",
        "التـاريخ/الســاعة",
        "مســاحة الوحدة",
        // "إســم العقــار",
        // "الاجــراءات"
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
        console.log({unitsAnalysis: responseData?.data});

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

    // Handler for opening delete modal
    const handleDeleteClick = (unitId) => {
        setSelectedUnitId(unitId)
        setDeleteModalOpen(true)
    }

    // Handler for opening suspend modal
    const handleSuspendClick = (unitId) => {
        setSelectedUnitId(unitId)
        setSuspendModalOpen(true)
    }

    // Handler for confirming delete
    const confirmDelete = () => {
        console.log(`Deleting unit ${selectedUnitId}`)
        toast.success('تم حذف الوحدة بنجاح')
        setDeleteModalOpen(false)
        setSelectedUnitId(null)
    }

    // Handler for confirming suspend
    const confirmSuspend = () => {
        console.log(`Suspending unit ${selectedUnitId}`)
        toast.success('تم إيقاف الوحدة بنجاح')
        setSuspendModalOpen(false)
        setSelectedUnitId(null)
    }

    if (isLoading) return <Loader />
    if (isError) return <div className="text-center p-8 text-[#FA5252] text-[15px]">حدث خطأ أثناء تحميل البيانات</div>

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
            <Header page='welcome' title={title} isMain={false} first="الرئيــسية" firstURL="/" second='التحليــلات' secondURL="/home/analysis" third={title} thirdURL={`/home/Units-analysis/${id}`} />
            
            <div className="w-full overflow-x-auto bg-white rounded-[24px] border border-[#E4E4E4] mt-4">
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
                                const phoneNum = row.user?.mobile || row.user?.phone;
                                return (
                                    <tr key={row.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all">
                                        <td className="p-[15px_20px] text-black text-[13px] font-medium whitespace-nowrap">
                                            {row.unit_type?.name_trans || row.unit_type?.name_ar || row.unit_type?.name_en ||row?.unit_type_name
 || "—"}
                                        </td>
                                        <td className="p-[15px_20px] text-[#616161] text-[13px]">{row.unit_usage_name || "—"}</td>
                                        <td className="p-[15px_20px] text-[#616161] text-[13px]">{row.user_name || "—"}</td>

                                        <td className="p-[15px_20px] text-[#616161] text-[12px] whitespace-nowrap">{formatDate(row)}</td>
                                        <td className="p-[15px_20px]">
                                            <div className="px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded-lg border border-[#E0E7FF] text-[12px] font-bold w-fit mx-auto shadow-sm">
                                                <span>{row.unit_area ? (isNaN(row.unit_area) ? row.unit_area : `${row.unit_area} م²`) : "—"}</span>
                                            </div>
                                        </td>
                                        {/* <td className="p-[15px_20px] text-black text-[13px] font-medium">
                                            {row.real_estate?.name || row.real_estate?.name_ar || row.real_estate?.name_trans || row.real_estate?.title || "—"}
                                        </td> */}
                                        {/* <td className="p-[15px_20px]">
                                            <DropdownMenu dir="rtl">
                                                <DropdownMenuTrigger asChild>
                                                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#4D4D4D] hover:bg-[#f5f5f5] transition-all">
                                                        <i className="fa-solid fa-ellipsis-vertical text-[14px]"></i>
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56">
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <i className="fa-regular fa-eye ml-2 text-[#A3A3A3]"></i>
                                                        <span>عرض الوحدة</span>
                                                        <i className="fa-solid fa-chevron-left mr-auto text-[10px] text-[#A3A3A3]"></i>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleSuspendClick(row.id)}>
                                                        <i className="fa-solid fa-ban ml-2 text-[#A3A3A3]"></i>
                                                        <span>إيقاف الوحدة</span>
                                                        <i className="fa-solid fa-chevron-left mr-auto text-[10px] text-[#A3A3A3]"></i>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="cursor-pointer text-green-600">
                                                        <i className="fa-solid fa-circle-check ml-2"></i>
                                                        <span>قبول الوحدة</span>
                                                        <i className="fa-solid fa-chevron-left mr-auto text-[10px] text-green-300"></i>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => handleDeleteClick(row.id)}>
                                                        <i className="fa-regular fa-trash-can ml-2"></i>
                                                        <span>حذف الوحدة</span>
                                                        <i className="fa-solid fa-chevron-left mr-auto text-[10px] text-red-300"></i>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td> */}
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

            {/* Suspend Unit Modal */}
            <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
                <DialogContent className="max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
                    <div className="p-10 flex flex-col items-center">
                        <button
                            className="absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center bg-[#F5F5F5] text-[#4D4D4D] hover:bg-[#eee] transition-all"
                            onClick={() => setSuspendModalOpen(false)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <div className="w-24 h-24 rounded-full bg-brand-main flex items-center justify-center text-white text-[40px] mb-8 shadow-lg shadow-brand-main/20">
                            <i className="fa-solid fa-ban"></i>
                        </div>
                        <h3 className="text-[22px] font-bold text-black text-center mb-3">
                            هل أنت متأكد من <span className="text-brand-main">إيقـاف</span> هذه الوحدة !
                        </h3>
                        <p className="text-[14px] text-[#A3A3A3] text-center mb-10">
                            هذا الإجراء يمكن التراجع عنه بعد التأكيد !
                        </p>
                        <div className="flex gap-4 w-full">
                            <button
                                className="flex-1 h-[56px] rounded-full bg-[#F5F5F5] text-[#4D4D4D] font-bold text-[16px] hover:bg-[#eee] transition-all"
                                onClick={() => setSuspendModalOpen(false)}
                            >
                                إلغاء
                            </button>
                            <button
                                className="flex-1 h-[56px] rounded-full bg-brand-main text-white font-bold text-[16px] hover:opacity-90 transition-all shadow-lg shadow-brand-main/20"
                                onClick={confirmSuspend}
                            >
                                تأكيد الإيقاف
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Unit Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
                    <div className="p-10 flex flex-col items-center">
                        <button
                            className="absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center bg-[#F5F5F5] text-[#4D4D4D] hover:bg-[#eee] transition-all"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <div className="w-24 h-24 rounded-full bg-[#EF4444] flex items-center justify-center text-white text-[40px] mb-8 shadow-lg shadow-[#EF4444]/20">
                            <i className="fa-regular fa-trash-can"></i>
                        </div>
                        <h3 className="text-[22px] font-bold text-black text-center mb-3">
                            هل أنت متأكد من <span className="text-[#EF4444]">حذف</span> هذه الوحدة !
                        </h3>
                        <p className="text-[14px] text-[#A3A3A3] text-center mb-10">
                            هذا الإجراء لا يمكن التراجع عنه بعد التأكيد !
                        </p>
                        <div className="flex gap-4 w-full">
                            <button
                                className="flex-1 h-[56px] rounded-full bg-[#F5F5F5] text-[#4D4D4D] font-bold text-[16px] hover:bg-[#eee] transition-all"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                إلغاء
                            </button>
                            <button
                                className="flex-1 h-[56px] rounded-full bg-[#EF4444] text-white font-bold text-[16px] hover:bg-[#dc2626] transition-all shadow-lg shadow-[#EF4444]/20"
                                onClick={confirmDelete}
                            >
                                تأكيد الحذف
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}