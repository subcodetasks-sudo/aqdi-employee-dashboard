'use client'
import React, { useState } from 'react'
import Header from '@/components/home/Header'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { axiosInstance } from '@/src/utils/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Loader from '../home/loader'
import { Loader2 } from 'lucide-react'

export default function OrdersSorting() {

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [newCategory, setNewCategory] = useState({
        name: '',
        color_text: '#000000',
        color: '#000000'
    });

    const queryClient = useQueryClient();

    /*----------------------------------------------------------------------------------------- */
    // add new status
    function addStatus() {
        return axiosInstance.post("/admin/contract-statuses", newCategory)
    }
    const { mutate: addStatusMutate, isPending: addStatusPending } = useMutation({
        mutationFn: addStatus,
        onSuccess: (res) => {
            toast.success(res.data.message || "تم إضافة حالة العقد بنجاح");
            setIsAddModalOpen(false);
            setNewCategory({ name: '', color_text: '#000000', color: '#000000' });
            queryClient.invalidateQueries({ queryKey: ["status"] });
        },
        onError: (error) => {
            toast.error(error.response.data.message);
        }
    })


    /*----------------------------------------------------------------------------------------- */
    // delete status 
    function deleteStatus(id) {
        return axiosInstance.post(`/admin/contract-statuses/${id}/delete`)
    }
    const { mutate: deleteStatusMutate, isPending: deleteStatusPending } = useMutation({
        mutationFn: deleteStatus,
        onSuccess: (res) => {
            toast.success(res.data.message || "تم حذف حالة العقد بنجاح");
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
            queryClient.invalidateQueries({ queryKey: ["status"] });
        },
        onError: (error) => {
            toast.error(error.response.data.message);
        }
    })

    /*----------------------------------------------------------------------------------------- */
    // update status
    function updateStatus(id) {
        return axiosInstance.post(`/admin/contract-statuses/${id}`, editingCategory)
    }
    const { mutate: updateStatusMutate, isPending: updateStatusPending } = useMutation({
        mutationFn: updateStatus,
        onSuccess: (res) => {
            toast.success(res.data.message || "تم تحديث حالة العقد بنجاح");
            setIsEditModalOpen(false);
            setEditingCategory(null);
            queryClient.invalidateQueries({ queryKey: ["status"] });
        },
        onError: (error) => {
            toast.error(error.response.data.message);
        }
    })

    /*----------------------------------------------------------------------------------------- */
    // get all status
    function getStatus() {
        return axiosInstance("/admin/contract-statuses")
    }
    const { data: statusData, isLoading: statusLoading } = useQuery({
        queryKey: ["status"],
        queryFn: getStatus
    })
    const statusItems = statusData?.data?.data?.items;

    /*----------------------------------------------------------------------------------------- */
    // loading
    if (statusLoading) return <Loader />


    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
            <Header
                page='welcome'
                title={"تصنيــف الطلبـــــات"}
                isMain={false}
                first="الرئيــسية"
                firstURL="/"
                second="تصنيــف الطلبـــــات"
                secondURL="/home/orders-sorting"
            />

            <div className="flex flex-col gap-6 bg-white rounded-[32px] border border-[#F0F0F0] p-8 mt-4 shadow-sm relative z-10">
                <div className="flex items-center justify-between pb-6 border-b border-[#F5F5F5]">
                    <h2 className="text-[20px] font-black text-black">قائمة التصنيفات</h2>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-main text-white rounded-full font-bold text-[14px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/20"
                    >
                        <span>+ إضافة حالة جديدة</span>
                    </button>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-4">
                        <thead>
                            <tr className="bg-[#FAFAFA]">
                                <th className="text-right p-4 text-[#A3A3A3] text-[13px] font-bold rounded-r-[16px]">اسم التصنيــف</th>
                                <th className="text-center p-4 text-[#A3A3A3] text-[13px] font-bold">لون التصنيــف</th>
                                <th className="text-center p-4 text-[#A3A3A3] text-[13px] font-bold rounded-l-[16px]">الاجـــراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statusItems?.map((category) => (
                                <tr key={category.id} className="group hover:bg-[#FAFAFA] transition-all">
                                    <td className="p-4 bg-white group-hover:bg-[#FAFAFA] border-y border-r border-[#F0F0F0] first:rounded-r-[20px]">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[16px] font-bold text-black">{category?.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 bg-white group-hover:bg-[#FAFAFA] border-y border-[#F0F0F0]">
                                        <div className="flex items-center justify-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-full border-4 border-white shadow-md ring-1 ring-[#F0F0F0]"
                                                style={{ backgroundColor: category?.color }}
                                            ></div>
                                            <div className="relative group/color">
                                                <div
                                                    className="px-4 py-1.5 rounded-full border border-[#EEEEEE] bg-[#F9F9F9] text-[13px] font-black cursor-pointer group-hover/color:border-brand-main group-hover/color:text-brand-main transition-all"
                                                    style={{ color: category?.color_text, backgroundColor: category?.color }}
                                                >
                                                    {category?.color_text.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 bg-white group-hover:bg-[#FAFAFA] border-y border-l border-[#F0F0F0] last:rounded-l-[20px]">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setEditingCategory(category);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="w-10 h-10 rounded-full bg-[#E6FFE6] text-[#10B981] flex justify-center items-center hover:bg-[#10B981] hover:text-white transition-all shadow-sm"
                                            >
                                                <i className="fa-solid fa-pen-to-square text-[14px]"></i>
                                            </button>
                                            {/* <button
                                                onClick={() => {
                                                    setCategoryToDelete(category);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="w-10 h-10 rounded-full bg-[#FFEBEB] text-[#FF4D4F] flex justify-center items-center hover:bg-[#FF4D4F] hover:text-white transition-all shadow-sm"
                                            >
                                                <i className="fa-solid fa-trash text-[14px]"></i>
                                            </button> */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* pagination */}
                {/* 
                <div className="flex items-center justify-center gap-2.5 mt-6 pt-6 border-t border-[#F5F5F5]">
                    <button className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all">
                        <i className="fa-solid fa-chevron-right text-[12px]"></i>
                    </button>
                    <button className="w-9 h-9 rounded-full bg-brand-main text-white flex items-center justify-center text-[13px] font-black shadow-lg shadow-brand-main/20">1</button>
                    <button className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-[#f5f5f5] transition-all text-[13px] font-bold">2</button>
                    <span className="text-[#A3A3A3] px-1 font-bold">...</span>
                    <button className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-[#f5f5f5] transition-all text-[13px] font-bold">40</button>
                    <button className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all">
                        <i className="fa-solid fa-chevron-left text-[12px]"></i>
                    </button>
                </div> */}
            </div>

            {/* Add Category Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[600px] p-8 rounded-[32px] border-0" dir="rtl">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-[22px] font-black text-black border-b border-[#F5F5F5] pb-4">إضافة حالة العقد</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-bold text-black px-1">
                                اسم الحالة <span className="text-[#FF4D4F] mr-1">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="ادخل اسم الحالة هنــا ..."
                                value={newCategory.name}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-5 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium text-right"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-[13px] font-bold text-black px-1">
                                    لون النص <span className="text-[#FF4D4F] mr-1">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newCategory.color_text}
                                        onChange={(e) => setNewCategory(prev => ({ ...prev, color_text: e.target.value }))}
                                        className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-bold text-right"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
                                        <input
                                            type="color"
                                            value={newCategory.color_text}
                                            onChange={(e) => setNewCategory(prev => ({ ...prev, color_text: e.target.value }))}
                                            className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[13px] font-bold text-black px-1">
                                    لون الخلفية <span className="text-[#FF4D4F] mr-1">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newCategory.color}
                                        onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                                        className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-bold text-right"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
                                        <input
                                            type="color"
                                            value={newCategory.color}
                                            onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                                            className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => addStatusMutate()}
                            disabled={addStatusPending}
                            className="w-full h-[54px] bg-brand-main text-white rounded-[16px] font-bold text-[16px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-4"
                        >
                            {addStatusPending ? <Loader2 className="animate-spin mx-auto" /> : "إضـــافة الحالة"}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Category Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[600px] p-8 rounded-[32px] border-0" dir="rtl">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-[22px] font-black text-black border-b border-[#F5F5F5] pb-4">تعديل حالة العقد</DialogTitle>
                    </DialogHeader>

                    {editingCategory && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-[13px] font-bold text-black px-1">
                                    اسم الحالة <span className="text-[#FF4D4F] mr-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="قيد المعالجة"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-5 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium text-right"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[13px] font-bold text-black px-1">
                                        لون النص <span className="text-[#FF4D4F] mr-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editingCategory.color_text}
                                            onChange={(e) => setEditingCategory(prev => ({ ...prev, color_text: e.target.value }))}
                                            className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-bold text-right"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
                                            <input
                                                type="color"
                                                value={editingCategory.color_text}
                                                onChange={(e) => setEditingCategory(prev => ({ ...prev, color_text: e.target.value }))}
                                                className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-[13px] font-bold text-black px-1">
                                        لون الخلفية <span className="text-[#FF4D4F] mr-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editingCategory.color}
                                            onChange={(e) => setEditingCategory(prev => ({ ...prev, color: e.target.value }))}
                                            className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-bold text-right"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
                                            <input
                                                type="color"
                                                value={editingCategory.color}
                                                onChange={(e) => setEditingCategory(prev => ({ ...prev, color: e.target.value }))}
                                                className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => updateStatusMutate(editingCategory.id)}
                                disabled={updateStatusPending}
                                className="w-full h-[54px] bg-brand-main text-white rounded-[16px] font-bold text-[16px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-4"
                            >
                                {updateStatusPending ? <Loader2 className="animate-spin mx-auto" /> : "حفــظ التغييرات"}
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] border-0" dir="rtl">
                    {categoryToDelete && (
                        <div className="p-8 flex flex-col items-center text-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-[#FFEBEB] text-[#FF4D4F] flex items-center justify-center shadow-inner mt-4">
                                <i className="fa-solid fa-trash text-[40px]"></i>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h3 className="text-[22px] font-black text-black">
                                    هل أنت متأكد من حذف التصنيف؟
                                </h3>
                                <p className="text-[18px] font-bold text-[#FF4D4F] bg-[#FFEBEB] px-4 py-1.5 rounded-full inline-block mx-auto">
                                    {categoryToDelete?.name}
                                </p>
                            </div>

                            <p className="text-[15px] font-medium text-[#737373]">
                                هذا الإجراء لا يمكن التراجع عنه بعد الحذف! سيتم فقدان كافة البيانات المرتبطة بهذا التصنيف.
                            </p>

                            <div className="flex items-center gap-4 w-full mt-2">
                                <button
                                    onClick={() => deleteStatusMutate(categoryToDelete?.id)}
                                    className="flex-1 h-[54px] bg-[#FF4D4F] text-white rounded-[16px] font-bold text-[16px] hover:bg-[#E03E3E] transition-all shadow-lg shadow-[#FF4D4F]/25"
                                >
                                    {deleteStatusPending ? <Loader2 className="animate-spin mx-auto" /> : "تأكيـد الحـذف"}
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 h-[54px] bg-[#F5F5F5] text-[#737373] rounded-[16px] font-bold text-[16px] hover:bg-[#EEEEEE] transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}