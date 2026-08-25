"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Loader from "@/components/home/loader";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import PermissionGate from "@/components/auth/PermissionGate";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import {
  OutlineActionButton,
  RoleBadge,
  TABLE_TH,
  TABLE_WRAPPER,
  TablePagination,
  formatDateShort,
} from "@/components/roles-and-employees/shared";

export default function Roles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const queryClient = useQueryClient();

  function getRoles(page = 1) {
    return axiosInstance
      .get(`/admin/roles?page=${page}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
  }

  const { data, isLoading } = useQuery({
    queryKey: ["roles", currentPage],
    queryFn: () => getRoles(currentPage),
  });

  const roles = data?.data?.items || data?.items || [];
  const pagination = data?.data?.pagination || data?.pagination;

  const { mutate: deleteRole, isPending: deleteRolePending } = useMutation({
    mutationFn: (id) => axiosInstance.post(`/admin/roles/${id}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف الدور بنجاح");
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles-list"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف الدور");
    },
  });

  const handleDelete = (role) => {
    setCategoryToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteRole(categoryToDelete.id);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">إدارة الأدوار</h2>
        <PermissionGate section={PERMISSION_SECTIONS.roles} action="create">
          <Link
            href="/home/roles-and-employees/roles/add"
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg border border-[#D1D5DB] bg-white text-gray-700 text-13 font-semibold hover:bg-[#F9FAFB] transition-colors dark:bg-[#0F1C16] dark:border-white/15 dark:text-white/75 dark:hover:bg-white/[0.06]"
          >
            + إضافة دور جديد
          </Link>
        </PermissionGate>
      </div>

      <div className={TABLE_WRAPPER}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={TABLE_TH}>اللقب</th>
              <th className={TABLE_TH}>الموظفون المشتركون</th>
              <th className={TABLE_TH}>عدد الصلاحيات</th>
              <th className={TABLE_TH}>تاريخ التحديث</th>
              <th className={cnActionTh()}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {roles.length > 0 ? (
              roles.map((role, index) => {
                const employeeNames =
                  role.employees && role.employees.length > 0
                    ? role.employees.map((emp) => emp.name).join("، ")
                    : "لا يوجد موظفون مسجلون";

                const permissionsCount = role.permissions_count || 0;

                return (
                  <tr
                    key={role.id}
                    className="border-b border-status-neutral-bg last:border-0 hover:bg-neutral-50 transition-colors dark:border-white/[0.06] dark:hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3.5">
                      <RoleBadge
                        role={role.title_trans || role.title_ar || role.name}
                        colorIndex={index}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-13 text-gray-700 dark:text-white/70">{employeeNames}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#047857] text-xs font-bold">
                        {permissionsCount} صلاحية
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-13 text-status-neutral tabular-nums">
                        {role.created_at_label || formatDateShort(role.updated_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <PermissionGate section={PERMISSION_SECTIONS.roles} action="edit">
                          <Link href={`/home/roles-and-employees/roles/edit?id=${role.id}`}>
                            <OutlineActionButton variant="edit">تعديل</OutlineActionButton>
                          </Link>
                        </PermissionGate>
                        <PermissionGate section={PERMISSION_SECTIONS.roles} action="delete">
                          <OutlineActionButton variant="delete" onClick={() => handleDelete(role)}>
                            حذف
                          </OutlineActionButton>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-10 text-gray-400 text-sm">
                  لا يوجد أدوار مسجلة حالياً.
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

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-32 border-0" dir="rtl">
          {categoryToDelete && (
            <div className="p-8 flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[#FFEBEB] text-status-danger flex items-center justify-center shadow-inner mt-4">
                <i className="fa-solid fa-trash text-[40px]" />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-22 font-black text-black">هل أنت متأكد من حذف الدور؟</h3>
                <p className="text-lg font-bold text-status-danger bg-[#FFEBEB] px-4 py-1.5 rounded-full inline-block mx-auto">
                  {categoryToDelete.title_trans || categoryToDelete.title_ar || categoryToDelete.name}
                </p>
              </div>

              <p className="text-15 font-medium text-neutral-500">
                هذا الإجراء لا يمكن التراجع عنه بعد الحذف! سيتم فقدان كافة الصلاحيات المرتبطة بهذا الدور.
              </p>

              <div className="flex items-center gap-4 w-full mt-2">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteRolePending}
                  className="flex-1 h-13.5 bg-status-danger text-white rounded-2xl font-bold text-base hover:bg-[#E03E3E] transition-all shadow-lg shadow-status-danger/25 flex items-center justify-center"
                >
                  {deleteRolePending ? <Loader2 className="animate-spin" /> : "تأكيـد الحـذف"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteRolePending}
                  className="flex-1 h-13.5 bg-neutral-100 text-neutral-500 rounded-2xl font-bold text-base hover:bg-surface-border transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cnActionTh() {
  return `${TABLE_TH} text-center`;
}
