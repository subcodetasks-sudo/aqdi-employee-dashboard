"use client";
import React, { useEffect, useState } from 'react';
import AddNewEmployeeDialog from '@/components/employees/add-employee-dialog';
import DeleteEmployeeDialog from '@/components/employees/delete-employee-dialog';
import BlockEmployeeDialog from '@/components/employees/block-employee-dialog';
import SubPageHeader from '@/components/home/SubPageHeader';
import Loader from '@/components/home/loader';
import greenRial from '@/public/images/greenRial.svg';
import { axiosInstance } from '@/src/utils/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import PermissionGate from '@/components/auth/PermissionGate';
import { PERMISSION_SECTIONS } from '@/src/lib/permissions';
import SendOrderSmsButton from '@/components/Orders/shared/send-order-sms-button';

export default function EmployeesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  function getAllEmployees(page = 1, search = '') {
    let url = `/admin/employees?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return axiosInstance.get(url)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
  }

  const { data, isLoading } = useQuery({
    queryKey: ['allEmployees', currentPage, debouncedSearchQuery],
    queryFn: () => getAllEmployees(currentPage, debouncedSearchQuery)
  });

  const employees = data?.items || data?.data?.items;
  const pagination = data?.pagination || data?.data?.pagination;

  const { mutateAsync: changeStatus, isPending: isPendingChangeStatus } = useMutation({
    mutationFn: (id) => axiosInstance.post(`/admin/employees/${id}/toggle-status`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      }),
    onSuccess: (res) => {
      toast.success(res?.message || 'تم تغيير حالة الموظف');
      queryClient.invalidateQueries({ queryKey: ['allEmployees'] });
    },
    onError: (err) => {
      toast.error(err?.message);
    }
  });



  /*-------------------------------------------------------------------------------------*/
  // table headers
  const tableHeaders = [
    "الاسـم",
    "المسمي الوظيفي",
    "الراتب الاساسي",
    "رقــم الجـوال",
    "البريد الالكتروني",
    "الحالة",
    "الاجـــراءات",
  ];

  const handleRefresh = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setCurrentPage(1);
    queryClient.invalidateQueries({ queryKey: ['allEmployees'] });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
      <SubPageHeader
        title="الموظفين"
        isMain={false}
        first="الموظفين والأدوار"
        firstURL="/home/employees"
        second="جميع الموظفين"
        secondURL="/home/employees"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
      />

      <div className="flex flex-wrap items-center gap-3 w-full">
        <PermissionGate section={PERMISSION_SECTIONS.employees} action="create">
          <AddNewEmployeeDialog />
        </PermissionGate>
      </div>

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
            {employees && employees.length > 0 ? (
              employees.map((employee) => (
                <tr key={employee.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all">
                  <td className="p-[15px_20px]">
                    <div className='flex items-center gap-2'>
                      {employee.profile_image ? (
                        <div className="relative size-8 rounded-full overflow-hidden border border-[#eee]">
                          <Image
                            src={employee.profile_image}
                            alt={employee.name}
                            width={32}
                            height={32}
                            className="size-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className='size-8 rounded-full bg-brand-main flex items-center justify-center'>
                          <User className='w-4 h-4 text-white' />
                        </div>
                      )}
                      <span className='text-black text-xs font-medium'>{employee.name || '---'}</span>
                    </div>
                  </td>
                  <td className='p-[15px_20px]'>
                    <span className='bg-black text-white px-3 py-1 rounded-full text-xs font-medium'>
                      {employee.role || 'غير محدد'}
                    </span>
                  </td>
                  <td className="p-[15px_20px]">
                    {employee.base_salary ? (
                      <div className="flex items-center gap-1.5 text-[#007C13] font-bold text-[13px]">
                        <span>{parseFloat(employee.base_salary).toLocaleString('ar-EG')}</span>
                        <Image src={greenRial} alt="rial" width={14} height={14} />
                      </div>
                    ) : (
                      <span className='text-gray-400 text-xs'>غير محدد</span>
                    )}
                  </td>
                  <td className='p-[15px_20px]'>
                    <span className='text-black text-xs' dir="ltr">{employee.phone || '---'}</span>
                  </td>
                  <td className='p-[15px_20px]'>
                    <span className='text-black text-xs'>{employee.email || '---'}</span>
                  </td>
                  <td className='p-[15px_20px]'>
                    <Switch  dir='ltr' checked={employee.is_active } disabled={isPendingChangeStatus} onCheckedChange={() => changeStatus(employee.id)}   />
                  </td>
                  <td className='p-[15px_20px]'>
                    <div className='flex items-center gap-2'>
                      <SendOrderSmsButton employee={employee} employeeId={employee.id} />
                      <PermissionGate section={PERMISSION_SECTIONS.employees} action="delete">
                        <DeleteEmployeeDialog employee={employee} />
                      </PermissionGate>
                      <PermissionGate section={PERMISSION_SECTIONS.employees} action="edit">
                        <AddNewEmployeeDialog isEdit={true} employee={employee} table={true} />
                        <BlockEmployeeDialog employee={employee} />
                      </PermissionGate>
                      <PermissionGate section={PERMISSION_SECTIONS.employees} action="view">
                        <Link
                          href={`/home/employees/${employee.id}`}
                          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#E8E8FF] text-[18px] leading-none hover:scale-105 transition-all"
                          aria-label="عرض التفاصيل"
                        >
                          👁️
                        </Link>
                      </PermissionGate>
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

      {/* pagination controls */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2.5 mt-6" dir="rtl">
          {/* Previous Page Button (points Right in RTL layout) */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#A3A3A3]"
          >
            <ChevronRight className="size-4" />
          </button>

          {/* Numeric Page Buttons */}
          {(() => {
            const pages = [];
            const { last_page } = pagination;
            const range = 1; // display 1 page around current page
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

          {/* Next Page Button (points Left in RTL layout) */}
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