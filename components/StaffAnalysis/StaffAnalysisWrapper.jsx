'use client'
import React from 'react'
import StaffCard from './StaffCard'
import defaultUser from '@/public/images/defaultUser.jpg'
import { axiosInstance } from '@/src/utils/axios'
import { useQuery } from '@tanstack/react-query'
import Loader from '../home/loader'

export default function StaffAnalysisWrapper({ id }) {
    const getEmployeeAnalytics = () => {
        let endpoint = `/admin/analytics/employees/most-received-orders`;
        if (id === 'most_completed_orders') {
            endpoint = `/admin/analytics/employees/most-documented-orders`;
        } else if (id === 'most_incompleted_orders') {
            endpoint = `/admin/analytics/employees/most-unpaid-orders`;
        } else if (id === 'most_refunded_orders') {
            endpoint = `/admin/analytics/employees/most-returns`;
        }
        return axiosInstance.get(endpoint).then(res => res.data);
    }

    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['employeeAnalytics', id],
        queryFn: getEmployeeAnalytics,
    });

    const rawData = responseData?.data;
    const staffList = rawData?.employees || [];
    const staffData = staffList.map(emp => ({
        id: emp.id,
        rank: emp.rank,
        image: emp.profile_image || defaultUser,
        name: emp.name,
        role: emp.role_title || emp.role || "موظف",
        count: emp.metric_count ?? emp.count ?? 0,
        label: emp.metric_label_ar || rawData?.metric_label_ar || "عدد العمليات"
    }));

    if (isLoading) return <Loader />
    if (isError) return <div className="text-center p-8 text-[#FA5252] text-[15px]">حدث خطأ أثناء تحميل البيانات</div>

    return (
        <div className="flex flex-col gap-6" dir="rtl">
            <div>
                {staffData.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {staffData.map((staff) => (
                            <StaffCard key={staff.id} staff={staff} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-white rounded-[24px] border border-[#E4E4E4] text-[#A3A3A3] text-[14px]">
                        لا توجد بيانات موظفين متوفرة حالياً لهذه الفئة.
                    </div>
                )}
            </div>
        </div>
    );
}