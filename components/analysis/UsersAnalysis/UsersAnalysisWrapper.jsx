'use client'
import React, { useEffect, useState } from 'react'
import SubPageHeader from '../../home/SubPageHeader'
import greenRial from '@/public/images/greenRial.svg'
import Image from 'next/image'
import whatsappIcon from '@/public/images/waIcon.svg'
import Link from 'next/link'
import { Switch } from "@/components/ui/switch"
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { axiosInstance } from '@/src/utils/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Loader from '../../home/loader'
import { ChevronRight, ChevronLeft, FolderX, FolderCheck, Loader2, X } from 'lucide-react'
import SendOrderSmsButton from '@/components/Orders/shared/send-order-sms-button'

export default function UsersAnalysisWrapper({ id }) {
    const [title, setTitle] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [suspendModalOpen, setSuspendModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [suspendAction, setSuspendAction] = useState('block')
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [togglingUserId, setTogglingUserId] = useState(null)
    const queryClient = useQueryClient()

    useEffect(() => {
        switch (id) {
            case 'day':
                setTitle('المستخدمين الجدد  / اليــوم')
                break;
            case 'week':
                setTitle('المستخدمين الجدد / الأسبوع')
                break;
            case 'month':
                setTitle('المستخدمين الجدد / الشهر')
                break;
            case 'year':
                setTitle('المستخدمين الجدد / السنة')
                break;
            case 'total':
                setTitle('إجمالي المستخدمين الجدد')
                break;
            case 'top_completed_orders':
                setTitle('أكثر العملاء طلب مكتمل')
                break;
            case 'top_incompleted_orders':
                setTitle('أكثر العملاء طلب غير مكتمل')
                break;
            case 'top_orders':
                setTitle('أكثر العملاء طلبات')
                break;
            case 'top_refunds':
                setTitle('أكثر العملاء استرجاع')
                break;
            case 'top_properties':
                setTitle('أكثر العملاء عقارات')
                break;
            case 'top_units':
                setTitle('أكثر العملاء وحدات')
                break;
            default:
                setTitle('المستخدمين')
                break;
        }
    }, [id])

    const tableHeaders = [
        "الاسم",
        "البريد الإلكتروني",
        "الهاتف",
        "الحالة: تفعيل/إلغاء",
        "التـاريخ/الســاعة",
        "العقــارات",
        "الوحدات",
        "الشكاوى",
        "الطلبات المكتملة",
        "الطلبات الغير المكتملة",
        "إجمالي المبلغ المدفوع",
        "الاجــراءات"
    ];

    function getUsers(page = 1) {
        if (id === 'top_completed_orders') {
            return axiosInstance.get(`/admin/analytics/top-customers/completed-orders?page=${page}`)
                .then(res => res.data);
        }
        if (id === 'top_incompleted_orders') {
            return axiosInstance.get(`/admin/analytics/top-customers/incomplete-orders?page=${page}`)
                .then(res => res.data);
        }
        if (id === 'top_orders') {
            return axiosInstance.get(`/admin/analytics/top-customers/orders?page=${page}`)
                .then(res => res.data);
        }
        if (id === 'top_refunds') {
            return axiosInstance.get(`/admin/analytics/top-customers/returns?page=${page}`)
                .then(res => res.data);
        }
        if (id === 'top_properties') {
            return axiosInstance.get(`/admin/analytics/top-customers/real-estates?page=${page}`)
                .then(res => res.data);
        }
        if (id === 'top_units') {
            return axiosInstance.get(`/admin/analytics/top-customers/units?page=${page}`)
                .then(res => res.data);
        }

        let createAt = id;
        if (id === 'day') createAt = 'today';
        return axiosInstance.get(`/admin/users?created_at=${createAt}&page=${page}`)
            .then(res => res.data);
    }

    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['usersAnalysis', id, currentPage],
        queryFn: () => getUsers(currentPage),
    });

    const rawData = responseData?.data;
    const isPaginated = rawData && !Array.isArray(rawData) && Array.isArray(rawData.items) && !!rawData.pagination;
    const usersList = isPaginated ? rawData.items : (rawData?.items ? rawData.items : (Array.isArray(rawData) ? rawData : []));

    const filteredUsersList = searchQuery.trim()
        ? usersList.filter((row) => {
            const q = searchQuery.toLowerCase().trim();
            return [row.name, row.full_name, row.email, row.phone, row.mobile]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q));
        })
        : usersList;
    
    // Pagination math (Supports both flat arrays and paginated responses)
    const ITEMS_PER_PAGE = 10;
    const displayedUsers = isPaginated 
        ? (searchQuery.trim() ? filteredUsersList : usersList)
        : filteredUsersList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const pagination = isPaginated 
        ? (searchQuery.trim()
            ? { current_page: 1, last_page: 1, total: filteredUsersList.length }
            : rawData.pagination)
        : {
            current_page: currentPage,
            last_page: Math.max(1, Math.ceil(filteredUsersList.length / ITEMS_PER_PAGE)),
            total: filteredUsersList.length
          };

    const handleRefresh = () => {
        setSearchQuery('');
        setCurrentPage(1);
        queryClient.invalidateQueries({ queryKey: ['usersAnalysis'] });
    };

    const { mutate: toggleUserBlock, isPending: isTogglingBlock } = useMutation({
        mutationFn: ({ userId }) => axiosInstance.post(`/admin/users/${userId}/block`),
        onSuccess: (res) => {
            toast.success(res?.data?.message || 'تم تحديث حالة المستخدم بنجاح');
            queryClient.invalidateQueries({ queryKey: ['usersAnalysis'] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'حدث خطأ أثناء تحديث حالة المستخدم');
        },
        onSettled: () => setTogglingUserId(null),
    });

    const { mutate: deleteUser, isPending: isDeletingUser } = useMutation({
        mutationFn: ({ userId }) => axiosInstance.post(`/admin/users/${userId}/delete`),
        onSuccess: (res) => {
            toast.success(res?.data?.message || 'تم حذف المستخدم بنجاح');
            queryClient.invalidateQueries({ queryKey: ['usersAnalysis'] });
            setDeleteModalOpen(false);
            setSelectedUserId(null);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'حدث خطأ أثناء حذف المستخدم');
        },
    });

    const getUserIsActive = (row) =>
        row.is_blocked != null ? !row.is_blocked : Boolean(row.status);

    const handleStatusChange = (userId) => {
        setTogglingUserId(userId);
        toggleUserBlock({ userId });
    };

    // Handler for opening delete modal
    const handleDeleteClick = (userId) => {
        setSelectedUserId(userId)
        setDeleteModalOpen(true)
    }

    const handleSuspendClick = (row) => {
        const isActive = getUserIsActive(row)
        setSelectedUserId(row.id)
        setSuspendAction(isActive ? 'block' : 'unblock')
        setSuspendModalOpen(true)
    }

    const confirmDelete = () => {
        if (!selectedUserId) return;
        deleteUser({ userId: selectedUserId });
    };

    const confirmSuspend = () => {
        if (!selectedUserId) return
        toggleUserBlock(
            { userId: selectedUserId },
            {
                onSuccess: () => {
                    setSuspendModalOpen(false)
                    setSelectedUserId(null)
                },
            }
        )
    }

    if (isLoading) return <Loader />
    if (isError) return <div className="text-center p-8 text-[#FA5252] text-[15px]">حدث خطأ أثناء تحميل البيانات</div>

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
            <SubPageHeader
                title={title}
                isMain={false}
                first="الرئيــسية"
                firstURL="/"
                second="التحليــلات"
                secondURL="/home/analysis"
                third={title}
                thirdURL={`/home/user-analysis/${id}`}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={handleRefresh}
            />
            
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
                        {displayedUsers && displayedUsers.length > 0 ? (
                            displayedUsers.map((row) => {
                                const isChecked = getUserIsActive(row);
                                return (
                                    <tr key={row.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all">
                                        <td className="p-[15px_20px] text-black text-[13px] font-medium whitespace-nowrap">{row.name || row.full_name}</td>
                                        <td className="p-[15px_20px] text-[#616161] text-[13px]">{row.email || "—"}</td>
                                        <td className="p-[15px_20px]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-black text-[13px]">{row.phone || row.mobile || "—"}</span>
                                                {(row.phone || row.mobile) && (
                                                    <>
                                                        <button onClick={() => {
                                                            navigator.clipboard.writeText(row.phone || row.mobile)
                                                            toast.success('تم نسخ رقم الهاتف')
                                                        }} className="text-[#A3A3A3] hover:text-brand-main">
                                                            <i className="fa-solid fa-copy text-[11px]"></i>
                                                        </button>
                                                        <Link href={`https://wa.me/${row.phone || row.mobile}`} target="_blank" className="hover:scale-110 transition-all">
                                                            <Image src={whatsappIcon} alt="wa" width={16} height={16} />
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-[15px_20px]">
                                            <div className="flex items-center justify-center pointer-events-auto" style={{ direction: "ltr" }}>
                                                <Switch
                                                    checked={isChecked}
                                                    disabled={togglingUserId === row.id}
                                                    onCheckedChange={() => handleStatusChange(row.id)}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-[15px_20px] text-[#616161] text-[12px] whitespace-nowrap">{row.date_time || row.created_at || "—"}</td>
                                        <td className="p-[15px_20px]">
                                            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#f9f9f9] rounded-lg border border-[#eee] w-fit mx-auto group hover:border-brand-main transition-all cursor-pointer">
                                                <span className="text-black text-[12px] font-bold">{row.real_estate_count ?? row.properties_count ?? 0}</span>
                                                <i className="fa-regular fa-eye text-[#A3A3A3] text-[11px] group-hover:text-brand-main"></i>
                                            </div>
                                        </td>
                                        <td className="p-[15px_20px]">
                                            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#f9f9f9] rounded-lg border border-[#eee] w-fit mx-auto group hover:border-brand-main transition-all cursor-pointer">
                                                <span className="text-black text-[12px] font-bold">{row.units_count ?? 0}</span>
                                                <i className="fa-regular fa-eye text-[#A3A3A3] text-[11px] group-hover:text-brand-main"></i>
                                            </div>
                                        </td>
                                        <td className="p-[15px_20px]">
                                            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#f9f9f9] rounded-lg border border-[#eee] w-fit mx-auto group hover:border-brand-main transition-all cursor-pointer">
                                                <span className="text-black text-[12px] font-bold">{0}</span>
                                                <i className="fa-regular fa-eye text-[#A3A3A3] text-[11px] group-hover:text-brand-main"></i>
                                            </div>
                                        </td>
                                        <td className="p-[15px_20px]">
                                            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#f9f9f9] rounded-lg border border-[#eee] w-fit mx-auto cursor-pointer group hover:border-brand-main transition-all">
                                                <span className="text-black text-[12px] font-bold">{row.completed_orders_count ?? 0}</span>
                                                <i className="fa-regular fa-eye text-[#A3A3A3] text-[11px] group-hover:text-brand-main"></i>
                                            </div>
                                        </td>
                                        <td className="p-[15px_20px]">
                                            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#f9f9f9] rounded-lg border border-[#eee] w-fit mx-auto cursor-pointer group hover:border-brand-main transition-all">
                                                <span className="text-black text-[12px] font-bold">{row.incomplete_orders_count ?? row.uncompleted_orders_count ?? 0}</span>
                                                <i className="fa-regular fa-eye text-[#A3A3A3] text-[11px] group-hover:text-brand-main"></i>
                                            </div>
                                        </td>
                                        <td className="p-[15px_20px]">
                                            <div className="flex items-center gap-1.5 text-[#007C13] font-bold text-[13px] justify-center">
                                                <i className="fa-regular fa-eye text-[#A3A3A3] text-[11px] cursor-pointer hover:text-brand-main transition-all"></i>
                                                <span>{parseFloat(row.total_paid_amount || 0).toLocaleString('ar-EG')}</span>
                                                <Image src={greenRial} alt="rial" width={14} height={14} />
                                            </div>
                                        </td>
                                        <td className="p-[15px_20px]">
                                            <div className="flex items-center gap-2 justify-center">
                                                <SendOrderSmsButton
                                                    userId={row.id}
                                                    order={{
                                                        ...row,
                                                        user_id: row.id,
                                                        user_mobile: row.phone || row.mobile,
                                                    }}
                                                />
                                                <DropdownMenu dir="rtl">
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#4D4D4D] hover:bg-[#f5f5f5] transition-all">
                                                            <i className="fa-solid fa-ellipsis-vertical text-[14px]"></i>
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56">
                                                        <DropdownMenuItem className="cursor-pointer p-0" asChild>
                                                            <Link
                                                                href={`/home/users/${row.id}?from=${encodeURIComponent(`/home/user-analysis/${id}`)}`}
                                                                className="flex items-center w-full px-2 py-1.5 cursor-pointer"
                                                            >
                                                                <i className="fa-regular fa-eye ml-2 text-[#A3A3A3]"></i>
                                                                <span>عرض المستخدم</span>
                                                                <i className="fa-solid fa-chevron-left mr-auto text-[10px] text-[#A3A3A3]"></i>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => handleSuspendClick(row)}
                                                        >
                                                            <i className={`fa-solid ${isChecked ? 'fa-ban' : 'fa-circle-check'} ml-2 text-[#A3A3A3]`}></i>
                                                            <span>{isChecked ? 'إيقاف المستخدم' : 'تفعيل المستخدم'}</span>
                                                            <i className="fa-solid fa-chevron-left mr-auto text-[10px] text-[#A3A3A3]"></i>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => handleDeleteClick(row.id)}>
                                                            <i className="fa-regular fa-trash-can ml-2"></i>
                                                            <span>حذف المستخدم</span>
                                                            <i className="fa-solid fa-chevron-left mr-auto text-[10px] text-red-300"></i>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="text-center p-8 text-[#A3A3A3] text-sm">
                                    لا يوجد مستخدمون متوفرون حالياً.
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

            {/* Block / Unblock User Modal */}
            <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
                <DialogContent
                    closeButton={false}
                    className="max-w-[520px] rounded-[24px] p-0 overflow-hidden border border-[#F0F0F0] shadow-2xl bg-white gap-0"
                    dir="rtl"
                >
                    <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
                        <DialogTitle className="text-[18px] font-bold text-black m-0">
                            {suspendAction === 'block' ? 'إيقاف حساب' : 'تفعيل حساب'}
                        </DialogTitle>
                        <button
                            type="button"
                            className="text-[#4D4D4D] hover:opacity-70 transition-opacity"
                            onClick={() => setSuspendModalOpen(false)}
                            disabled={isTogglingBlock}
                            aria-label="إغلاق"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="px-6 py-10 flex flex-col items-center text-center">
                        <div
                            className={`w-[88px] h-[88px] rounded-full flex items-center justify-center mb-8 ${
                                suspendAction === 'block' ? 'bg-brand-hover' : 'bg-green-600'
                            }`}
                        >
                            {suspendAction === 'block' ? (
                                <FolderX className="size-8 text-white stroke-[1.5]" />
                            ) : (
                                <FolderCheck className="size-8 text-white stroke-[1.5]" />
                            )}
                        </div>
                        <h3 className="text-[20px] font-bold text-black mb-3 leading-relaxed">
                            {suspendAction === 'block' ? (
                                <>هل أنت متأكد من <span className="text-brand-hover">إيقاف</span> حساب الضيف !</>
                            ) : (
                                <>هل أنت متأكد من <span className="text-green-600">تفعيل</span> حساب الضيف !</>
                            )}
                        </h3>
                        <p className="text-[14px] text-[#A3A3A3] font-medium">
                            هذا الإجراء يمكن التراجع عنه بعد التأكيد !
                        </p>
                    </div>

                    <div className="flex gap-3 px-6 pb-6">
                        <button
                            type="button"
                            className={`flex-1 h-[52px] rounded-full text-white font-bold text-[16px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center ${
                                suspendAction === 'block' ? 'bg-brand-hover' : 'bg-green-600'
                            }`}
                            onClick={confirmSuspend}
                            disabled={isTogglingBlock}
                        >
                            {isTogglingBlock ? (
                                <Loader2 className="size-6 animate-spin" />
                            ) : suspendAction === 'block' ? (
                                'تأكيد الإيقاف'
                            ) : (
                                'تأكيد التفعيل'
                            )}
                        </button>
                        <button
                            type="button"
                            className="flex-1 h-[52px] rounded-full bg-[#F5F5F5] text-[#4D4D4D] font-bold text-[16px] hover:bg-[#EEEEEE] transition-all disabled:opacity-50"
                            onClick={() => setSuspendModalOpen(false)}
                            disabled={isTogglingBlock}
                        >
                            إلغاء
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete User Modal */}
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
                            هل أنت متأكد من <span className="text-[#EF4444]">حذف</span> حساب الضيف !
                        </h3>
                        <p className="text-[14px] text-[#A3A3A3] text-center mb-10">
                            هذا الإجراء لا يمكن التراجع عنه بعد التأكيد !
                        </p>
                        <div className="flex gap-4 w-full">
                            <button
                                type="button"
                                className="flex-1 h-[56px] rounded-full bg-[#F5F5F5] text-[#4D4D4D] font-bold text-[16px] hover:bg-[#eee] transition-all disabled:opacity-50"
                                onClick={() => setDeleteModalOpen(false)}
                                disabled={isDeletingUser}
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                className="flex-1 h-[56px] rounded-full bg-[#EF4444] text-white font-bold text-[16px] hover:bg-[#dc2626] transition-all shadow-lg shadow-[#EF4444]/20 disabled:opacity-50 flex items-center justify-center"
                                onClick={confirmDelete}
                                disabled={isDeletingUser}
                            >
                                {isDeletingUser ? (
                                    <Loader2 className="size-6 animate-spin" />
                                ) : (
                                    'تأكيد الحذف'
                                )}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}