"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/home/loader";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import {
  EmployeeAvatar,
  RoleBadge,
  TABLE_TH,
  TABLE_WRAPPER,
  TablePagination,
  formatDateShort,
  formatSalary,
} from "@/components/roles-and-employees/shared";

export default function Salaries() {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  function getAllEmployees(page = 1) {
    return axiosInstance.get(`/admin/employees?page=${page}`).then((res) => res?.data);
  }

  const { data, isLoading } = useQuery({
    queryKey: ["allEmployees", currentPage],
    queryFn: () => getAllEmployees(currentPage),
  });

  const employees = data?.items || data?.data?.items;
  const pagination = data?.pagination || data?.data?.pagination;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <p className="text-13 font-medium text-brand-dark">
        رواتب الموظفين — انقر موظفًا لعرض سجل رواتبه
      </p>

      <div className={TABLE_WRAPPER}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={TABLE_TH}>الاسم</th>
              <th className={TABLE_TH}>المسمى الوظيفي</th>
              <th className={TABLE_TH}>الراتب الأساسي</th>
              <th className={TABLE_TH}>آخر دفعة</th>
              <th className={TABLE_TH}>إجمالي المدفوع</th>
              <th className={`${TABLE_TH} w-10`} />
            </tr>
          </thead>
          <tbody>
            {employees && employees.length > 0 ? (
              employees.map((employee, index) => {
                const lastPayment = employee.last_salary_date || employee.last_payment_date;
                const totalPaid = employee.total_paid ?? employee.total_salaries_paid ?? 0;

                return (
                  <tr
                    key={employee.id}
                    onClick={() =>
                      router.push(`/home/roles-and-employees/employees/${employee.id}`)
                    }
                    className="border-b border-status-neutral-bg last:border-0 hover:bg-[#F0F7F4] transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <EmployeeAvatar name={employee.name} image={employee.profile_image} />
                        <span className="text-13 font-medium text-gray-900">
                          {employee.name || "---"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <RoleBadge role={employee.role} colorIndex={index} />
                    </td>
                    <td className="px-4 py-3.5">
                      {formatSalary(employee.base_salary) ? (
                        <span className="text-13 font-semibold text-gray-900 tabular-nums">
                          {formatSalary(employee.base_salary)} ريال
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-13 text-status-neutral tabular-nums">
                        {lastPayment ? formatDateShort(lastPayment) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-13 font-semibold text-gray-900 tabular-nums">
                        {formatSalary(totalPaid) || "0"} ريال
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <ChevronLeft className="size-4 text-gray-400 group-hover:text-brand-dark transition-colors" />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-10 text-gray-400 text-sm">
                  لا يوجد موظفين حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        pagination={pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
