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
import { useRouter } from 'next/navigation'

export default function PropertiesAnalysisWrapper({ id }) {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [suspendModalOpen, setSuspendModalOpen] = useState(false)
    const [selectedPropertyId, setSelectedPropertyId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        switch (id) {
            case 'day':
                setTitle('عقارات المضافة  / اليــوم')
                break;
            case 'week':
                setTitle('عقارات المضافة  / الأسبوع')
                break;
            case 'month':
                setTitle('عقارات المضافة  / الشهر')
                break;
            case 'year':
                setTitle('عقارات المضافة  / السنة')
                break;
            case 'total':
                setTitle('إجمالي العقـارات')
                break;
            default:
                setTitle('عقارات المضافة  / اليــوم')
                break;
        }
    }, [id])

    const tableHeaders = [
        "اسم العقــار",
        "الهاتف",
        "الوحدات المضـافة في العقــار",
        "الطلبات المكتملة",
        "الطلبات الغير المكتملة",
    ];

    function getProperties(page = 1) {
        let createAt = id;
        if (id === 'day') createAt = 'today';
        else if (id === 'total') createAt = 'all';
        return axiosInstance.get(`/admin/real-estates?created_at=${createAt}&page=${page}`)
            .then(res => res.data);
    }

    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['propertiesAnalysis', id, currentPage],
        queryFn: () => getProperties(currentPage),
    });

    const rawData = responseData?.data;
    const isPaginated = rawData && !Array.isArray(rawData) && Array.isArray(rawData.items);
    const propertiesList = isPaginated ? rawData.items : (Array.isArray(rawData) ? rawData : []);

    // Pagination math
    const ITEMS_PER_PAGE = 10;
    const displayedProperties = isPaginated 
        ? propertiesList 
        : propertiesList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const pagination = isPaginated 
        ? rawData.pagination 
        : {
            current_page: currentPage,
            last_page: Math.ceil(propertiesList.length / ITEMS_PER_PAGE),
            total: propertiesList.length
          };

    // Handler for opening delete modal
    const handleDeleteClick = (propertyId) => {
        setSelectedPropertyId(propertyId)
        setDeleteModalOpen(true)
    }

    // Handler for opening suspend modal
    const handleSuspendClick = (propertyId) => {
        setSelectedPropertyId(propertyId)
        setSuspendModalOpen(true)
    }

    // Handler for confirming delete
    const confirmDelete = () => {
        console.log(`Deleting property ${selectedPropertyId}`)
        toast.success('تم حذف العقار بنجاح')
        setDeleteModalOpen(false)
        setSelectedPropertyId(null)
    }

    // Handler for confirming suspend
    const confirmSuspend = () => {
        console.log(`Suspending property ${selectedPropertyId}`)
        toast.success('تم إيقاف العقار بنجاح')
        setSuspendModalOpen(false)
        setSelectedPropertyId(null)
    }

    if (isLoading) return <Loader />
    if (isError) return <div className="text-center p-8 text-[#FA5252] text-[15px]">حدث خطأ أثناء تحميل البيانات</div>

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
            <Header page='welcome' title={title} isMain={false} first="الرئيــسية" firstURL="/" second='التحليــلات' secondURL="/home/analysis" third={title} thirdURL={`/home/Properties-analysis/${id}`} />
            
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
                        {displayedProperties && displayedProperties.length > 0 ? (
                            displayedProperties.map((row) => (
                                <tr
                                    key={row.id}
                                    // onClick={() => router.push(`/home/real-estates/${row.id}`)}
                                    className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all cursor-pointer"
                                >
                                    <td className="p-[15px_20px] text-black text-[13px] font-medium">
                                        {row.name_real_estate || row.name_owner || `عقار #${row.id}`}
                                    </td>

                                    <td className="p-[15px_20px]" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-black text-[13px]">{row.mobile || "—"}</span>
                                            {row.mobile && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                        navigator.clipboard.writeText(row.mobile)
                                                        toast.success('تم نسخ رقم الهاتف')
                                                    }} className="text-[#A3A3A3] hover:text-brand-main">
                                                        <i className="fa-solid fa-copy text-[11px]"></i>
                                                    </button>
                                                    <Link href={`https://wa.me/${row.mobile}`} target="_blank" className="hover:scale-110 transition-all">
                                                        <Image src={whatsappIcon} alt="wa" width={16} height={16} />
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-[15px_20px]">
                                        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#f9f9f9] rounded-lg border border-[#eee] w-fit mx-auto group hover:border-brand-main transition-all cursor-pointer">
                                            <span className="text-black text-[12px] font-bold">{row.Count_Units || parseInt(row.number_of_units_in_realestate || 0) || 0}</span>
                                            <i className="fa-regular fa-eye text-[#A3A3A3] text-[11px] group-hover:text-brand-main"></i>
                                        </div>
                                    </td>
                                    <td className="p-[15px_20px]">
                                        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#f9f9f9] rounded-lg border border-[#eee] w-fit mx-auto cursor-pointer group hover:border-brand-main transition-all">
                                            <span className="text-black text-[12px] font-bold">{0}</span>
                                            <i className="fa-regular fa-eye text-[#A3A3A3] text-[11px] group-hover:text-brand-main"></i>
                                        </div>
                                    </td>
                                    <td className="p-[15px_20px]">
                                        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#f9f9f9] rounded-lg border border-[#eee] w-fit mx-auto cursor-pointer group hover:border-brand-main transition-all">
                                            <span className="text-black text-[12px] font-bold">{0}</span>
                                            <i className="fa-regular fa-eye text-[#A3A3A3] text-[11px] group-hover:text-brand-main"></i>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="text-center p-8 text-[#A3A3A3] text-sm">
                                    لا توجد عقارات متوفرة حالياً.
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

            {/* Suspend Property Modal */}
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
                            هل أنت متأكد من <span className="text-brand-main">إيقـاف</span> هذا العقار !
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

            {/* Delete Property Modal */}
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
                            هل أنت متأكد من <span className="text-[#EF4444]">حذف</span> هذا العقار !
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