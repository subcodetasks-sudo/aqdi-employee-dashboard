'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/home/Header'
import { toast } from 'sonner'
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { axiosInstance } from '@/src/utils/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Loader from '@/components/home/loader'
import { Loader2 } from 'lucide-react'

function getRolePermissionIdsFromSections(sections, roleId) {
    const ids = new Set();
    const numericRoleId = Number(roleId);

    sections.forEach((section) => {
        section.permissions.forEach((perm) => {
            const hasRole = perm.roles?.some((role) => role.id === numericRoleId);
            if (hasRole) {
                ids.add(perm.id);
            }
        });
    });

    return ids;
}

export default function EditRole() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const roleId = searchParams.get('id');

    const [formData, setFormData] = useState({
        title_ar: '',
        is_active: true,
        employee_id: '',
    });

    const [activateAllPermissions, setActivateAllPermissions] = useState(false);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());
    const [formInitialized, setFormInitialized] = useState(false);

    const { data: roleRes, isLoading: roleLoading, isError: roleError } = useQuery({
        queryKey: ['role', roleId],
        queryFn: () => axiosInstance.get(`/admin/roles/${roleId}`).then((res) => res?.data),
        enabled: !!roleId,
    });

    const { data: permissionsRes, isLoading: permissionsLoading, isError: permissionsError } = useQuery({
        queryKey: ['permissions-by-section'],
        queryFn: () =>
            axiosInstance.get('/admin/permissions/by-section').then((res) => res?.data),
        enabled: !!roleId,
    });

    const { data: employeesRes } = useQuery({
        queryKey: ['employees-list-role'],
        queryFn: () =>
            axiosInstance.get('/admin/employees?per_page=200').then((res) => res?.data),
        enabled: !!roleId,
    });

    const role = roleRes?.data ?? roleRes;
    const sections = useMemo(() => permissionsRes?.data ?? [], [permissionsRes?.data]);
    const employees = employeesRes?.data?.items ?? employeesRes?.items ?? [];

    const allPermissionIds = useMemo(
        () => sections.flatMap((section) => section.permissions.map((perm) => perm.id)),
        [sections]
    );

    useEffect(() => {
        if (!roleId || !role || !sections.length || formInitialized) return;

        const fromRole = role.permission_ids ?? role.permissions?.map((p) => p.id);
        const permissionIds = fromRole?.length
            ? new Set(fromRole)
            : getRolePermissionIdsFromSections(sections, roleId);

        setSelectedPermissionIds(permissionIds);
        setActivateAllPermissions(
            allPermissionIds.length > 0 &&
            allPermissionIds.every((id) => permissionIds.has(id))
        );
        setFormData({
            title_ar: role.title_ar || role.title_trans || '',
            is_active: role.is_active ?? true,
            employee_id: role.employee_id ? String(role.employee_id) : '',
        });
        setFormInitialized(true);
    }, [role, sections, roleId, allPermissionIds, formInitialized]);

    const handleActivateAll = (checked) => {
        setActivateAllPermissions(checked);
        if (checked) {
            setSelectedPermissionIds(new Set(allPermissionIds));
            return;
        }
        setSelectedPermissionIds(new Set());
    };

    const handlePermissionChange = (permissionId) => {
        setActivateAllPermissions(false);
        setSelectedPermissionIds((prev) => {
            const next = new Set(prev);
            if (next.has(permissionId)) {
                next.delete(permissionId);
            } else {
                next.add(permissionId);
            }
            return next;
        });
    };

    const { mutate: updateRole, isPending } = useMutation({
        mutationFn: () =>
            axiosInstance.post(`/admin/roles/${roleId}`, {
                title_ar: formData.title_ar.trim(),
                is_active: formData.is_active,
                employee_id: formData.employee_id ? Number(formData.employee_id) : null,
                permission_ids: Array.from(selectedPermissionIds),
            }),
        onSuccess: (res) => {
            toast.success(res?.data?.message || 'تم تعديل الدور بنجاح');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['roles-list'] });
            queryClient.invalidateQueries({ queryKey: ['role', roleId] });
            queryClient.invalidateQueries({ queryKey: ['permissions-by-section'] });
            router.push('/home/roles-and-employees?tab=roles');
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                'حدث خطأ أثناء تعديل الدور'
            );
        },
    });

    const handleSubmit = () => {
        if (!formData.title_ar.trim()) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        if (selectedPermissionIds.size === 0) {
            toast.error('يرجى تحديد صلاحية واحدة على الأقل');
            return;
        }

        updateRole();
    };

    const PermissionSection = ({ section }) => (
        <div className="bg-[#FAFAFA] border border-[#F0F0F0] rounded-[24px] p-6 hover:shadow-md transition-all">
            <h3 className="text-[16px] font-black text-black mb-5 pb-3 border-b border-[#EEEEEE]">
                {section.section_label?.ar ?? section.section_key}
            </h3>
            <div className="flex flex-col gap-4">
                {section.permissions.map((perm) => (
                    <label
                        key={perm.id}
                        className="flex items-center justify-between group cursor-pointer"
                    >
                        <span className="text-[14px] font-bold text-[#737373] group-hover:text-black transition-all">
                            {perm.action_label?.ar ?? perm.action}
                        </span>
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedPermissionIds.has(perm.id)}
                                onChange={() => handlePermissionChange(perm.id)}
                                disabled={isPending}
                                className="peer appearance-none w-6 h-6 border-2 border-[#E4E4E4] rounded-[6px] checked:bg-brand-main checked:border-brand-main transition-all cursor-pointer disabled:opacity-50"
                            />
                            <i className="fa-solid fa-check absolute left-1 text-white text-[10px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></i>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

    if (!roleId) {
        return (
            <div className="p-6 text-center text-[#FF4D4F]" dir="rtl">
                معرف الدور غير موجود.
                <button
                    type="button"
                    onClick={() => router.push('/home/roles-and-employees?tab=roles')}
                    className="block mx-auto mt-4 text-brand-main font-bold"
                >
                    العودة للأدوار
                </button>
            </div>
        );
    }

    if (roleLoading || permissionsLoading || !formInitialized) {
        return <Loader />;
    }

    if (roleError || permissionsError) {
        return (
            <div className="p-6 text-center text-[#FF4D4F]" dir="rtl">
                تعذر تحميل بيانات الدور.
                <button
                    type="button"
                    onClick={() => router.push('/home/roles-and-employees?tab=roles')}
                    className="block mx-auto mt-4 text-brand-main font-bold"
                >
                    العودة للأدوار
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
            <Header
                page='welcome'
                title={"تعديل دور"}
                isMain={false}
                first="الرئيــسية"
                firstURL="/"
                second="الأدوار"
                secondURL="/home/roles-and-employees?tab=roles"
                third="تعديل دور"
                thirdURL={`/home/roles-and-employees/roles/edit?id=${roleId}`}
            />

            <div className="bg-white rounded-[32px] border border-[#F0F0F0] p-8 mt-4 shadow-sm relative z-10" dir="rtl">
                <div className="flex flex-col gap-8 pb-8 border-b border-[#F5F5F5]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h2 className="text-[20px] font-black text-black relative pr-4 before:content-[''] before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-6 before:bg-brand-main before:rounded-full">بيـــانات الدور:</h2>
                        <div className="flex flex-wrap items-center gap-4 bg-[#FAFAFA] p-3 rounded-[18px] border border-[#F0F0F0]">
                            <div className="flex items-center gap-3 px-3">
                                <span className="text-[13px] font-bold text-[#737373]">تفعيل كافة الصلاحيات لهذا الدور</span>
                                <div className="flex items-center gap-2 pr-4 border-r border-[#EEEEEE]">
                                    <Switch
                                        checked={activateAllPermissions}
                                        onCheckedChange={handleActivateAll}
                                        disabled={sections.length === 0 || isPending}
                                        dir="ltr"
                                    />
                                    <span className="text-[13px] font-bold text-black whitespace-nowrap">تحديد الكل</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isPending}
                                className="px-8 py-3 bg-brand-main text-white rounded-full font-bold text-[14px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/20 min-w-[120px] disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    'حفظ التعديلات'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1000px]">
                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-bold text-black px-1">
                                اللقب <span className="text-[#FF4D4F] mr-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="موظف"
                                    value={formData.title_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                                    disabled={isPending}
                                    className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-5 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium disabled:opacity-60"
                                />
                                <i className="fa-solid fa-id-badge absolute left-5 top-1/2 -translate-y-1/2 text-[#A3A3A3]"></i>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-bold text-black px-1">
                                الاسم (مفتاح النظام)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={role?.name ?? ''}
                                    readOnly
                                    className="w-full h-[54px] bg-[#F0F0F0] border border-[#EEEEEE] rounded-[16px] px-5 text-[15px] text-[#737373] font-medium cursor-not-allowed"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[13px] font-bold text-black px-1">
                                الموظف المرتبط
                            </label>
                            <Select
                                value={formData.employee_id || "none"}
                                onValueChange={(value) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        employee_id: value === "none" ? "" : value,
                                    }))
                                }
                                disabled={isPending}
                                dir="rtl"
                            >
                                <SelectTrigger className="h-[54px] rounded-[16px] bg-[#F9F9F9] border-[#EEEEEE]">
                                    <SelectValue placeholder="بدون موظف" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">بدون موظف</SelectItem>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.id} value={String(employee.id)}>
                                            {employee.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-3 justify-end">
                            <label className="text-[13px] font-bold text-black px-1">
                                حالة الدور
                            </label>
                            <div className="flex items-center gap-3 h-[54px] px-2">
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, is_active: checked }))
                                    }
                                    disabled={isPending}
                                    dir="ltr"
                                />
                                <span className="text-[14px] font-bold text-[#737373]">
                                    {formData.is_active ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-[18px] font-black text-black mb-8 relative pr-4 before:content-[''] before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-5 before:bg-brand-main before:rounded-full">صلاحيـــات النظـــام:</h2>
                    {permissionsError ? (
                        <p className="text-center text-[#FF4D4F] text-sm py-8">
                            تعذر تحميل الصلاحيات. يرجى المحاولة مرة أخرى.
                        </p>
                    ) : sections.length === 0 ? (
                        <p className="text-center text-[#A3A3A3] text-sm py-8">
                            لا توجد صلاحيات متاحة حالياً.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                            {sections.map((section) => (
                                <PermissionSection key={section.section_key} section={section} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
