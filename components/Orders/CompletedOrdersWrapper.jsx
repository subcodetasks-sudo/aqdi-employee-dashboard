'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import waIcon from '@/public/images/waIcon.svg'
import Link from 'next/link'
import Header from '../home/Header'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { axiosInstance } from '@/src/utils/axios'
import { useQuery } from '@tanstack/react-query'
import Loader from '../home/loader'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import OrdersToolbar from './shared/orders-toolbar'
import OrdersTable from './shared/orders-table'
import OrdersPagination from './shared/orders-pagination'
import {
    applyAdvancedFilters,
    emptyAdvancedFilters,
} from './shared/orders-filter-utils'
import { exportOrdersToExcel } from './shared/orders-export'
import { useOrdersSelection } from './shared/use-orders-selection'
import {
    OrdersContractStatusFilterBar,
    useOrdersContractStatusFilter,
} from './shared/use-orders-contract-status-filter'

export default function CompletedOrdersWrapper() {
    const router = useRouter()
    const pathname = usePathname()
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState(emptyAdvancedFilters);
    const {
        selectedOrders,
        selectedCount,
        isSelected,
        toggle,
        togglePage,
        clear,
        getPageSelectionState,
    } = useOrdersSelection();

    const {
        activeFilter,
        setActiveFilter,
        statusItems,
        allTotal,
        countsById,
        statusLoading,
        countsLoading,
        appendStatusParam,
        resetStatusFilter,
    } = useOrdersContractStatusFilter({
        countsBaseUrl: "/admin/orders/complete/list",
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const [refundModalStep, setRefundModalStep] = useState(0); // 0: closed, 1: form, 2: submitted, 3: success
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [refundDraftNumber, setRefundDraftNumber] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [refundNotes, setRefundNotes] = useState('');

    // Add Contract Modal State
    const [contractModalStep, setContractModalStep] = useState(0); // 0: closed, 1: form, 2: success
    const [contractPhone, setContractPhone] = useState('');
    const [contractDate, setContractDate] = useState('');
    const [contractType, setContractType] = useState(''); // 'سكني' or 'تجاري'
    const [contractClassification, setContractClassification] = useState([]);
    const [contractDocumented, setContractDocumented] = useState(''); // 'نعم' or 'لا'
    const [contractDuration, setContractDuration] = useState('');
    const [contractAmount, setContractAmount] = useState('');
    const [contractRentalFees, setContractRentalFees] = useState('');
    const [contractNotes, setContractNotes] = useState('');

    // Incomplete Contract Modal State
    const [incompleteModalStep, setIncompleteModalStep] = useState(0); // 0: closed, 1: form, 2: submitted, 3: success
    const [incompletePhone, setIncompletePhone] = useState('');
    const [incompleteNotes, setIncompleteNotes] = useState('');
    const [incompleteDate, setIncompleteDate] = useState('');
    const [incompleteTime, setIncompleteTime] = useState('');

    // Mapping filter keys to status values
    const filterStatusMap = {
        'processing': 'قيد المعـالجة',
        'awaiting_verification': 'بينتظار تأكيد بيانات العقار',
        'client_action': 'محتوى دفع من العميل',
        'confirmed': 'تم تأكيد العقار',
        'awaiting_approval': 'بانتظار اعتماد العقد',
        'incomplete': 'وثيقة عقارية غير القياسية',
        'other': 'حجز استلام'
    };

    const tableHeaders = [
        "رقــم الطلب",
        "رقــم جوال العميل",
        "نــوع العقــد",
        "نـوع الوثيقة",
        "الدفـــع",
        "مستلم منذ",
        // "حــالة الطلب",
        "الاسـتلام",
        "الاجـــراءات",

    ];




    const searchParams = useSearchParams();
    const createdAtParam = searchParams ? searchParams.get('created_at') : null;

    const handleResetAll = () => {
        setSearchQuery('');
        setDebouncedSearchQuery('');
        setAdvancedFilters(emptyAdvancedFilters);
        setShowMoreFilters(false);
        resetStatusFilter();
        setCurrentPage(1);
        clear();
        if (createdAtParam) {
            router.replace(pathname);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, createdAtParam, activeFilter]);

    useEffect(() => {
        clear();
    }, [debouncedSearchQuery, createdAtParam, advancedFilters, activeFilter, clear]);

    /*-------------------------------------------------------------------------------------*/
    // get completed orders
    function getCompletedOrders() {
        let url = `/admin/orders/complete/list?page=${currentPage}`;
        if (createdAtParam) {
            const createAt = createdAtParam === 'total' ? 'all' : createdAtParam;
            url += `&created_at=${createAt}`;
        }
        if (debouncedSearchQuery) {
            url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
        }
        return axiosInstance(appendStatusParam(url));
    }
    const { data, isLoading } = useQuery({
        queryKey: ["completedOrders", createdAtParam, debouncedSearchQuery, currentPage, activeFilter],
        queryFn: getCompletedOrders
    })
    const orders = data?.data?.data?.items ?? []
    const pagination = data?.data?.data?.pagination

    const filteredOrders = useMemo(
        () => applyAdvancedFilters(orders, advancedFilters, { showStatusColumn: true }),
        [orders, advancedFilters]
    )

    const exportConfig = useMemo(
        () => ({
            getSelectedOrders: () => selectedOrders,
            onExport: (rows) =>
                exportOrdersToExcel(rows, { filename: 'الطلبات-المكتملة', showStatusColumn: true }),
        }),
        [selectedOrders]
    );

    const pageSelectionState = getPageSelectionState(filteredOrders);

    /*-------------------------------------------------------------------------------------*/
    // loader
    if (isLoading || statusLoading || countsLoading) return <Loader />
    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
            <Header page='welcome' title={"طلب مكتمل"} isMain={false} first="الرئيــسية" firstURL="/" second="طلب مكتمل" secondURL="/home/completed-orders" />

            <div className="flex flex-col gap-4 mt-4 relative z-10">
                <OrdersContractStatusFilterBar
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    statusItems={statusItems}
                    countsById={countsById}
                    allTotal={allTotal}
                />
                <OrdersToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    showAddButtons
                    queryKeys={["completedOrders"]}
                    showMoreFilters={showMoreFilters}
                    onToggleMoreFilters={() => setShowMoreFilters((prev) => !prev)}
                    advancedFilters={advancedFilters}
                    onAdvancedFiltersChange={setAdvancedFilters}
                    onResetAll={handleResetAll}
                    showStatusField
                    quickLinksLimit={3}
                    exportConfig={exportConfig}
                    selectedCount={selectedCount}
                    onClearSelection={clear}
                />
            </div>

            <OrdersTable
                orders={filteredOrders}
                showStatusColumn
                showChangeStatus
                queryKey={["completedOrders"]}
                onRowClick={(row) => router.push(`/home/orders/${row.id}`)}
                selectable
                isSelected={isSelected}
                onToggleRow={toggle}
                onTogglePage={togglePage}
                pageSelectionState={pageSelectionState}
            />

            <OrdersPagination
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            {/* Refund Modal Step 1: Form */}
            <Dialog open={refundModalStep === 1} onOpenChange={(open) => !open && setRefundModalStep(0)}>
                <DialogContent className="sm:max-w-[500px] p-6 rounded-[24px] border-0" dir="rtl">
                    <button className="absolute left-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#A3A3A3] hover:bg-[#ff4444] hover:text-white transition-all" onClick={() => setRefundModalStep(0)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-[20px] font-bold text-black border-b border-[#F5F5F5] pb-4">طلب إسترجـاع</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        {selectedOrder && (
                            <>
                                <div className="flex items-center justify-between bg-[#F9F9F9] p-4 rounded-[16px]">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[13px] text-[#A3A3A3]">رقـم الطلب</span>
                                        <span className="text-[14px] font-bold text-black">{selectedOrder.orderNumber}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[12px] bg-[#FFEBEB] text-[#FF4D4F] px-3 py-1 rounded-full font-bold">منذ يوم و 3 س</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#F5F5F5] pb-3">
                                    <span className="text-[13px] text-[#A3A3A3]">رقـم جوال العميل</span>
                                    <div className="flex items-center gap-2">
                                        <Link href={`https://wa.me/${selectedOrder.phone}`} target="_blank" className="hover:scale-110 transition-all">
                                            <Image src={waIcon} alt="WhatsApp" width={20} height={20} />
                                        </Link>
                                        <button className="text-[#A3A3A3] hover:text-brand-main" onClick={() => {
                                            navigator.clipboard.writeText(selectedOrder.phone);
                                            toast.success('تم نسخ رقم الهاتف');
                                        }}>
                                            <i className="fa-regular fa-copy"></i>
                                        </button>
                                        <span className="text-[14px] font-bold text-black" dir="ltr">{selectedOrder.phone}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#F5F5F5] pb-3">
                                    <span className="text-[13px] text-[#A3A3A3]">نـوع العقــد</span>
                                    <span className="bg-[#E6F0FF] text-[#3B82F6] px-3 py-1 rounded-full text-[12px] font-bold">سكنـي</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#F5F5F5] pb-3">
                                    <span className="text-[13px] text-[#A3A3A3]">الدفـــع</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[14px]">✅</span>
                                        <span className="text-[14px] font-bold text-[#10B981]">99.99 ر</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#F5F5F5] pb-3">
                                    <span className="text-[13px] text-[#A3A3A3]">مستلم منذ</span>
                                    <span className="text-[14px] font-bold text-[#D97706]">منذ 10د</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#F5F5F5] pb-3">
                                    <span className="text-[13px] text-[#A3A3A3]">حـالة الطلب</span>
                                    <span className="bg-[#E6FFE6] text-[#10B981] px-3 py-1 rounded-full text-[12px] font-bold">طلب مكتمل</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#F5F5F5] pb-3">
                                    <span className="text-[13px] text-[#A3A3A3]">الاستلام</span>
                                    <span className="text-[14px] font-bold text-black">ريـــان</span>
                                </div>

                                <div className="flex flex-col gap-2 mt-2">
                                    <label className="text-[13px] font-bold text-black">
                                        رقم مسودة العقد
                                        <span className="text-[#FF4D4F] mr-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full h-[50px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[12px] px-4 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all"
                                        placeholder="أدخل رقم مسودة العقد هنـا ..."
                                        value={refundDraftNumber}
                                        onChange={(e) => setRefundDraftNumber(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[13px] font-bold text-black">
                                        قيمة المبلغ المسترجع
                                        <span className="text-[#FF4D4F] mr-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full h-[50px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[12px] px-4 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all"
                                        placeholder="أدخل قيمة قيمة المبلغ المسترجع هنـا ..."
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[13px] font-bold text-black">ملاحظات تود ذكرها</label>
                                    <textarea
                                        className="w-full bg-[#F9F9F9] border border-[#EEEEEE] rounded-[12px] p-4 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all resize-none"
                                        placeholder="أكتب هنـا ..."
                                        value={refundNotes}
                                        onChange={(e) => setRefundNotes(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <button
                                    className="w-full h-[50px] bg-brand-main text-white rounded-[12px] font-bold text-[15px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-4"
                                    onClick={() => {
                                        if (!refundDraftNumber || !refundAmount) {
                                            toast.error('يرجى ملء جميع الحقول المطلوبة');
                                            return;
                                        }
                                        setRefundModalStep(2);
                                    }}
                                >
                                    طلب إسترجـاع
                                </button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Refund Modal Step 2: Submitted Confirmation */}
            <Dialog open={refundModalStep === 2} onOpenChange={(open) => !open && setRefundModalStep(0)}>
                <DialogContent className="sm:max-w-[450px] p-8 rounded-[24px] border-0" dir="rtl">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-20 h-20 rounded-full border-[3px] border-[#10B981] flex items-center justify-center relative">
                            <div className="absolute inset-0 border-[3px] border-[#10B981] rounded-full border-t-transparent animate-spin"></div>
                            <i className="fa-solid fa-check text-[32px] text-[#10B981]"></i>
                        </div>
                        <h2 className="text-[20px] font-bold text-black mt-2">
                            <span className="ml-2">✅</span> تم رفع طلب الاسترجاع بنجاح
                        </h2>
                        <p className="text-[14px] text-[#A3A3A3]">
                            الرجاء نسخ الكلام وإرساله للعميل :
                        </p>
                        <div className="w-full h-[1px] bg-[#F5F5F5] my-2"></div>
                        <div className="flex flex-col text-right w-full gap-2 text-[14px] text-[#4D4D4D] bg-[#F9F9F9] p-4 rounded-[16px]">
                            <p className="font-bold text-black">عميلنا العزيز،</p>
                            <p>الرجاء تعبئة البيانات لإتمام طلب الاسترجاع :</p>
                            <p>أسم البنك :</p>
                            <p>أسم صاحب الحساب :</p>
                            <p>رقم الحساب او الآيبان :</p>
                            <p className="text-[#EF4444] text-[13px] mt-2"><span className="ml-1">🔴</span> يشترط ان يكون رقم الحساب هو نفس وفي حالة تغييره سيتم رفض الطلب</p>
                            <p className="text-[#D97706] text-[13px]"><span className="ml-1">⏱️</span> سيتم استرجاع المبلغ خلال يوم إلى 3 أيام عمل</p>
                        </div>
                        <div className="w-full h-[1px] bg-[#F5F5F5] my-2"></div>
                        <p className="text-[14px] text-black font-bold">شكراً لتفهمكم.</p>
                        <div className="flex items-center justify-center gap-3 w-full bg-[#FAFAFA] border border-[#EEEEEE] p-3 rounded-[12px]">
                            <Link href={`https://wa.me/${selectedOrder?.phone}`} target="_blank" className="hover:scale-110 transition-all">
                                <Image src={waIcon} alt="WhatsApp" width={24} height={24} />
                            </Link>
                            <button className="text-[#A3A3A3] hover:text-brand-main" onClick={() => {
                                const message = `عميلنا العزيز،\n\nالرجاء تعبئة البيانات لإتمام طلب الاسترجاع :\nأسم البنك :\nأسم صاحب الحساب :\nرقم الحساب او الآيبان :\n🔴 يشترط ان يكون رقم الحساب هو نفس وفي حالة تغييره سيتم رفض الطلب\n⏱️ سيتم استرجاع المبلغ خلال يوم إلى 3 أيام عمل\n\nشكراً لتفهمكم.`;
                                navigator.clipboard.writeText(message);
                                toast.success('تم نسخ الرسالة');
                            }}>
                                <i className="fa-regular fa-copy"></i>
                            </button>
                            <span className="text-[15px] font-bold text-black" dir="ltr">{selectedOrder?.phone}</span>
                        </div>
                        <button
                            className="w-full h-[50px] bg-brand-main text-white rounded-[12px] font-bold text-[15px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-2"
                            onClick={() => setRefundModalStep(3)}
                        >
                            تم
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Refund Modal Step 3: Success */}
            <Dialog open={refundModalStep === 3} onOpenChange={(open) => {
                if (!open) {
                    setRefundModalStep(0);
                    setRefundDraftNumber('');
                    setRefundAmount('');
                    setRefundNotes('');
                    setSelectedOrder(null);
                }
            }}>
                <DialogContent className="sm:max-w-[400px] p-8 rounded-[24px] border-0" dir="rtl">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="text-[80px] leading-none mb-2">🧐</div>
                        <h2 className="text-[20px] font-bold text-black">
                            تم تصنيف الطالب رقم <span className="text-[#3B82F6]">{selectedOrder?.orderNumber}</span>
                        </h2>
                        <p className="text-[24px] font-black text-black">
                            الى <span className="text-brand-main">مسترجع</span> بنجاح!
                        </p>
                        <button
                            className="w-full h-[50px] bg-brand-main text-white rounded-[12px] font-bold text-[15px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-6"
                            onClick={() => {
                                setRefundModalStep(0);
                                setRefundDraftNumber('');
                                setRefundAmount('');
                                setRefundNotes('');
                                setSelectedOrder(null);
                                toast.success('تم تحديث حالة الطلب بنجاح');
                            }}
                        >
                            تم
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Contract Modal Step 1: Form */}
            <Dialog open={contractModalStep === 1} onOpenChange={(open) => !open && setContractModalStep(0)}>
                <DialogContent className="sm:max-w-[650px] p-8 rounded-[24px] border-0" dir="rtl">
                    <button className="absolute left-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#A3A3A3] hover:bg-[#ff4444] hover:text-white transition-all shadow-sm" onClick={() => setContractModalStep(0)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-[22px] font-black text-black border-b border-[#F5F5F5] pb-4">إضـافة عقد وانتســاب مكتمل</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto px-1">
                        {/* Phone and Date Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-black px-1">
                                    رقم الجـوال
                                    <span className="text-[#FF4D4F] mr-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-[52px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[14px] px-4 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all"
                                    placeholder="أدخل رقم الجـوال هنـا ..."
                                    value={contractPhone}
                                    onChange={(e) => setContractPhone(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-black px-1">تـاريخ الإضـافة</label>
                                <input
                                    type="text"
                                    className="w-full h-[52px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-[14px] px-4 text-[14px] text-[#A3A3A3] cursor-not-allowed"
                                    value="01 - 10 - 2025 / 10:48 ص"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Contract Type */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-bold text-black px-1">
                                نـوع العقــد
                                <span className="text-[#FF4D4F] mr-1">*</span>
                            </label>
                            <div className="flex gap-4">
                                {['سكنـي', 'تجاري'].map((type) => (
                                    <label key={type} className={`flex-1 flex items-center justify-center h-[52px] rounded-[14px] border-2 cursor-pointer transition-all gap-3 ${contractType === type ? 'border-brand-main bg-brand-main/5 text-brand-main' : 'border-[#EEEEEE] bg-white text-[#A3A3A3] hover:border-[#DDD]'}`}>
                                        <input
                                            type="radio"
                                            name="contractType"
                                            value={type}
                                            checked={contractType === type}
                                            onChange={(e) => setContractType(e.target.value)}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${contractType === type ? 'border-brand-main' : 'border-[#DDD]'}`}>
                                            {contractType === type && <div className="w-2.5 h-2.5 rounded-full bg-brand-main"></div>}
                                        </div>
                                        <span className="font-bold text-[14px]">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Contract Classification */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-bold text-black px-1">
                                تصنيف العقــد
                                <span className="text-[#FF4D4F] mr-1">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['بدون', 'يشتقيض من البنك او غيره', 'وقف', 'صك ورقي', 'صك ورقة'].map((option) => (
                                    <label key={option} className={`flex items-center gap-2 px-4 py-2.5 rounded-full border cursor-pointer transition-all text-[13px] font-bold ${contractClassification.includes(option) ? 'bg-brand-main text-white border-brand-main shadow-md' : 'bg-white text-[#4D4D4D] border-[#EEEEEE] hover:bg-[#F9F9F9]'}`}>
                                        <input
                                            type="checkbox"
                                            checked={contractClassification.includes(option)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setContractClassification([...contractClassification, option]);
                                                } else {
                                                    setContractClassification(contractClassification.filter(item => item !== option));
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        {contractClassification.includes(option) && <i className="fa-solid fa-check text-[10px]"></i>}
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Contract Documented */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-bold text-black px-1">
                                هل تم تـوثيـق العقد
                                <span className="text-[#FF4D4F] mr-1">*</span>
                            </label>
                            <div className="flex gap-4">
                                {['نعم', 'لا'].map((choice) => (
                                    <label key={choice} className={`flex-1 flex items-center justify-center h-[52px] rounded-[14px] border-2 cursor-pointer transition-all gap-3 ${contractDocumented === choice ? 'border-[#10B981] bg-[#10B981]/5 text-[#10B981]' : 'border-[#EEEEEE] bg-white text-[#A3A3A3] hover:border-[#DDD]'}`}>
                                        <input
                                            type="radio"
                                            name="contractDocumented"
                                            value={choice}
                                            checked={contractDocumented === choice}
                                            onChange={(e) => setContractDocumented(e.target.value)}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${contractDocumented === choice ? 'border-[#10B981]' : 'border-[#DDD]'}`}>
                                            {contractDocumented === choice && <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>}
                                        </div>
                                        <span className="font-bold text-[14px]">{choice}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Three Inputs Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-black px-1">
                                    مدة العقــد
                                    <span className="text-[#FF4D4F] mr-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-[52px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[14px] px-4 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all"
                                    placeholder="مدة العقــد ..."
                                    value={contractDuration}
                                    onChange={(e) => setContractDuration(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-black px-1">
                                    المبلغ المدفوع
                                    <span className="text-[#FF4D4F] mr-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-[52px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[14px] px-4 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all"
                                    placeholder="99.99 ر"
                                    value={contractAmount}
                                    onChange={(e) => setContractAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-black px-1">
                                    رسوم ايجار
                                    <span className="text-[#FF4D4F] mr-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-[52px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[14px] px-4 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all"
                                    placeholder="الرسوم ..."
                                    value={contractRentalFees}
                                    onChange={(e) => setContractRentalFees(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-black px-1">هل ترغب بذكـر ملاحظة!</label>
                            <textarea
                                className="w-full bg-[#F9F9F9] border border-[#EEEEEE] rounded-[14px] p-4 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all resize-none"
                                placeholder="أكتب هنـا ..."
                                value={contractNotes}
                                onChange={(e) => setContractNotes(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <button
                            className="w-full h-[54px] bg-brand-main text-white rounded-[14px] font-bold text-[16px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-2"
                            onClick={() => {
                                if (!contractPhone || !contractType || contractClassification.length === 0 ||
                                    !contractDocumented || !contractDuration || !contractAmount || !contractRentalFees) {
                                    toast.error('يرجى ملء جميع الحقول المطلوبة');
                                    return;
                                }
                                setContractModalStep(2);
                            }}
                        >
                            إضافة
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Contract Modal Step 2: Success */}
            <Dialog open={contractModalStep === 2} onOpenChange={(open) => {
                if (!open) {
                    setContractModalStep(0);
                    setContractPhone('');
                    setContractDate('');
                    setContractType('');
                    setContractClassification([]);
                    setContractDocumented('');
                    setContractDuration('');
                    setContractAmount('');
                    setContractRentalFees('');
                    setContractNotes('');
                }
            }}>
                <DialogContent className="sm:max-w-[450px] p-10 rounded-[24px] border-0" dir="rtl">
                    <div className="flex flex-col items-center text-center gap-5">
                        <div className="w-24 h-24 rounded-full bg-[#E6FFE6] text-[#10B981] flex items-center justify-center shadow-inner">
                            <i className="fa-solid fa-check text-[40px]"></i>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[22px] font-black text-black leading-tight">
                                تم إضـافة عقد وانتســاب مكتمل
                            </h2>
                            <p className="text-[28px] font-black text-[#10B981]">بنجاح!</p>
                        </div>
                        <button
                            className="w-full h-[50px] bg-[#10B981] text-white rounded-[14px] font-bold transition-all hover:bg-[#0E9F6E] shadow-lg shadow-[#10B981]/20 mt-4"
                            onClick={() => setContractModalStep(0)}
                        >
                            تم
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Incomplete Contract Modal Step 1: Form */}
            <Dialog open={incompleteModalStep === 1} onOpenChange={(open) => !open && setIncompleteModalStep(0)}>
                <DialogContent className="sm:max-w-[500px] p-8 rounded-[24px] border-0" dir="rtl">
                    <button className="absolute left-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#A3A3A3] hover:bg-[#ff4444] hover:text-white transition-all shadow-sm" onClick={() => setIncompleteModalStep(0)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-[22px] font-black text-black border-b border-[#F5F5F5] pb-4">إضـافة عقـد والتسـاب غير مكتمل</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-6">
                        {/* Phone Number */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-black px-1">
                                رقم الجـوال
                                <span className="text-[#FF4D4F] mr-1">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-4 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all"
                                placeholder="أدخل رقم الجـوال هنـا ..."
                                value={incompletePhone}
                                onChange={(e) => setIncompletePhone(e.target.value)}
                            />
                        </div>

                        {/* Notes */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-black px-1">هل ترغب بذكـر ملاحظة!</label>
                            <textarea
                                className="w-full bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] p-4 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all resize-none"
                                placeholder="أكتب هنـا ..."
                                value={incompleteNotes}
                                onChange={(e) => setIncompleteNotes(e.target.value)}
                                rows={4}
                            />
                        </div>

                        {/* Date and Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-[#A3A3A3] px-1">الساعة</label>
                                <input
                                    type="text"
                                    className="w-full h-[50px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-[14px] px-4 text-[14px] text-[#A3A3A3] cursor-not-allowed"
                                    value="12:00 صباحا"
                                    readOnly
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-[#A3A3A3] px-1">التـاريخ</label>
                                <input
                                    type="text"
                                    className="w-full h-[50px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-[14px] px-4 text-[14px] text-[#A3A3A3] cursor-not-allowed"
                                    value="12 - 01 - 2025"
                                    readOnly
                                />
                            </div>
                        </div>

                        <button
                            className="w-full h-[54px] bg-brand-main text-white rounded-[16px] font-bold text-[16px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-2"
                            onClick={() => {
                                if (!incompletePhone) {
                                    toast.error('يرجى إدخال رقم الجوال');
                                    return;
                                }
                                setIncompleteModalStep(2);
                            }}
                        >
                            إضافة
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Incomplete Contract Modal Step 2: Submitted */}
            <Dialog open={incompleteModalStep === 2} onOpenChange={(open) => !open && setIncompleteModalStep(0)}>
                <DialogContent className="sm:max-w-[450px] p-10 rounded-[24px] border-0" dir="rtl">
                    <div className="flex flex-col items-center text-center gap-5">
                        <div className="w-24 h-24 rounded-full bg-[#E6F0FF] text-[#3B82F6] flex items-center justify-center shadow-inner">
                            <i className="fa-solid fa-check text-[40px]"></i>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[22px] font-black text-black leading-tight">
                                تم إضـافة عقـد والتسـاب غير مكتمل
                            </h2>
                            <p className="text-[28px] font-black text-[#3B82F6]">بنجاح!</p>
                        </div>
                        <button
                            className="w-full h-[50px] bg-[#3B82F6] text-white rounded-[14px] font-bold transition-all hover:bg-[#2563EB] shadow-lg shadow-[#3B82F6]/20 mt-4"
                            onClick={() => setIncompleteModalStep(3)}
                        >
                            استمرار
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Incomplete Contract Modal Step 3: Processing Status */}
            <Dialog open={incompleteModalStep === 3} onOpenChange={(open) => {
                if (!open) {
                    setIncompleteModalStep(0);
                    setIncompletePhone('');
                    setIncompleteNotes('');
                    setIncompleteDate('');
                    setIncompleteTime('');
                }
            }}>
                <DialogContent className="sm:max-w-[450px] p-10 rounded-[24px] border-0" dir="rtl">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="w-24 h-24 rounded-full border-4 border-dashed border-brand-main flex items-center justify-center animate-[spin_10s_linear_infinite]">
                            <i className="fa-solid fa-circle-notch fa-spin text-brand-main text-[40px]"></i>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[24px] font-black text-black">تم إستلام الطلب بنجاح !!</h2>
                            <p className="text-[16px] font-medium text-[#737373]">تم تصنيف الطلب <span className="text-brand-main font-bold">قيد المعالجة...</span></p>
                        </div>
                        <button
                            className="w-full h-[54px] bg-brand-main text-white rounded-[16px] font-bold text-[16px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-2"
                            onClick={() => {
                                setIncompleteModalStep(0);
                                setIncompletePhone('');
                                setIncompleteNotes('');
                                setIncompleteDate('');
                                setIncompleteTime('');
                                toast.success('تم إضافة طلب غير مكتمل بنجاح');
                            }}
                        >
                            تم
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}