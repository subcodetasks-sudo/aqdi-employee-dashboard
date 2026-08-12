'use client'
import React, { useState } from 'react'
import greenRial from '@/public/images/greenRial.svg'
import Image from 'next/image'
import Link from 'next/link'
import { axiosInstance } from '@/src/utils/axios'
import { useQuery } from '@tanstack/react-query'
import Loader from '../home/loader'
import { Eye, User, ChevronLeft, ChevronRight } from 'lucide-react'
import AddNewEmployeeDialog from '@/components/employees/add-employee-dialog'
import DeleteEmployeeDialog from '@/components/employees/delete-employee-dialog'
import BlockEmployeeDialog from '@/components/employees/block-employee-dialog'

export default function TotalStaff() {
    const [currentPage, setCurrentPage] = useState(1);

    function getAllEmployees(page = 1) {
        return axiosInstance.get(`/admin/employees?page=${page}`)
            .then((res) => res?.data);
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ['allEmployees', currentPage],
        queryFn: () => getAllEmployees(currentPage)
    });

    const staffData = data?.items || data?.data?.items || [];
    const pagination = data?.pagination || data?.data?.pagination;

    const tableHeaders = [
        "الصورة الشخصية",
        "الاسم",
        "الراتب الأساسي",
        "رقم الهاتف",
        "البريد الإلكتروني",
        "الاجـــراءات"
    ];

    if (isLoading) return <Loader />
    if (isError) return <div className="text-center p-8 text-[#FA5252] text-[15px]">حدث خطأ أثناء تحميل البيانات</div>

    return (
        <div className="flex flex-col gap-6" dir="rtl">
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
                        {staffData.length > 0 ? (
                            staffData.map((staff) => (
                                <tr key={staff.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all">
                                    <td className="p-[15px_20px]">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-[#eee]">
                                            {staff.profile_image ? (
                                                <Image
                                                    src={staff.profile_image}
                                                    alt={staff.name}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className='w-full h-full bg-brand-main flex items-center justify-center'>
                                                    <User className='w-5 h-5 text-white' />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-[15px_20px] text-black text-[13px] font-medium">
                                        <div className="bg-[#F9F9F9] px-3 py-1 rounded-full border border-[#eee] inline-block">
                                            {staff.name}
                                        </div>
                                    </td>
                                    <td className="p-[15px_20px]">
                                        {staff.base_salary ? (
                                            <div className="flex items-center gap-1.5 text-[#007C13] font-bold text-[14px]">
                                                <span>{parseFloat(staff.base_salary).toLocaleString('ar-EG')}</span>
                                                <Image src={greenRial} alt="rial" width={16} height={16} />
                                            </div>
                                        ) : (
                                            <span className='text-gray-400 text-xs'>غير محدد</span>
                                        )}
                                    </td>
                                    <td className="p-[15px_20px] text-black text-[13px]" dir="ltr">{staff.phone || '---'}</td>
                                    <td className="p-[15px_20px] text-[#616161] text-[13px]">{staff.email || '---'}</td>
                                    <td className="p-[15px_20px]">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/home/roles-and-employees/employees/${staff.id}`} className="w-8 h-8 rounded-full flex items-center justify-center text-[#4D4D4D] hover:bg-brand-main hover:text-white transition-all text-[12px] border border-[#eee] hover:border-brand-main">
                                                <Eye className="size-4" />
                                            </Link>
                                            <BlockEmployeeDialog employee={staff} />
                                            <AddNewEmployeeDialog isEdit={true} employee={staff} table={true} />
                                            <DeleteEmployeeDialog employee={staff} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="text-center p-8 text-[#A3A3A3] text-sm">
                                    لا يوجد موظفين حالياً.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2.5 mt-6" dir="rtl">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-transparent"
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
                                return <span key={`dots-${idx}`} className="text-[#A3A3A3] px-1">...</span>;
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium transition-all ${
                                        currentPage === page
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
                        className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                </div>
            )}
        </div>
    );
}