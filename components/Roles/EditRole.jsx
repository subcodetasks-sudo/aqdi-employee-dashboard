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
import { Loader2, ShieldCheck, Ban, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateShort } from '@/components/roles-and-employees/shared'

function InfoRow({ label, required, value, children }) {
    return (
        <div className="flex flex-col gap-2 pb-4 border-b border-[#F0F0F0]">
            <span className="text-xs font-bold text-ink-placeholder">
                {label}
                {required && <span className="text-status-danger mr-1">*</span>}
            </span>
            {children ?? <span className="text-15 font-bold text-black">{value}</span>}
        </div>
    );
}

function buildPermissionMatrix(selectedPermissionNames) {
    const matrix = {};

    selectedPermissionNames.forEach((name) => {
        const dotIndex = name.lastIndexOf('.');
        if (dotIndex === -1) return;
        const section = name.slice(0, dotIndex);
        const action = name.slice(dotIndex + 1);
        if (!matrix[section]) matrix[section] = [];
        matrix[section].push(action);
    });

    return matrix;
}

function permissionNamesFromMatrix(matrix) {
    if (!matrix || typeof matrix !== 'object') return new Set();

    const names = new Set();
    Object.entries(matrix).forEach(([section, actions]) => {
        if (!Array.isArray(actions)) return;
        actions.forEach((action) => names.add(`${section}.${action}`));
    });
    return names;
}

export default function EditRole() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const roleId = searchParams.get('id');

    const [formData, setFormData] = useState({
        title_ar: '',
        title_en: '',
        is_active: true,
        employee_id: '',
    });

    const [activateAllPermissions, setActivateAllPermissions] = useState(false);
    const [selectedPermissionNames, setSelectedPermissionNames] = useState(new Set());
    const [formInitialized, setFormInitialized] = useState(false);

    const { data: roleRes, isLoading: roleLoading, isError: roleError } = useQuery({
        queryKey: ['role', roleId],
        queryFn: () => axiosInstance.get(`/admin/roles/${roleId}`).then((res) => res?.data),
        enabled: !!roleId,
    });

    const { data: createRes, isLoading: modulesLoading, isError: modulesError } = useQuery({
        queryKey: ['roles-create'],
        queryFn: () => axiosInstance.get('/admin/roles/create').then((res) => res?.data),
        enabled: !!roleId,
    });

    const { data: employeesRes } = useQuery({
        queryKey: ['employees-list-role'],
        queryFn: () =>
            axiosInstance.get('/admin/employees?per_page=200').then((res) => res?.data),
        enabled: !!roleId,
    });

    const role = roleRes?.data ?? roleRes;
    const modules = useMemo(() => createRes?.data?.permission_modules ?? [], [createRes?.data?.permission_modules]);
    const employees = employeesRes?.data?.items ?? employeesRes?.items ?? [];

    const allPermissionNames = useMemo(
        () => modules.flatMap((module) => module.actions.map((action) => action.permission_name)),
        [modules]
    );

    useEffect(() => {
        if (!roleId || !role || !modules.length || formInitialized) return;

        const permissionNames = permissionNamesFromMatrix(role.permission_matrix);

        setSelectedPermissionNames(permissionNames);
        setActivateAllPermissions(
            role.is_full_access === true ||
            (allPermissionNames.length > 0 &&
                allPermissionNames.every((name) => permissionNames.has(name)))
        );
        setFormData({
            title_ar: role.title_ar || role.title_trans || '',
            title_en: role.title_en || '',
            is_active: role.is_active ?? true,
            employee_id: role.employee_id ? String(role.employee_id) : '',
        });
        setFormInitialized(true);
    }, [role, modules, roleId, allPermissionNames, formInitialized]);

    const handleActivateAll = (checked) => {
        setActivateAllPermissions(checked);
        if (checked) {
            setSelectedPermissionNames(new Set(allPermissionNames));
            return;
        }
        setSelectedPermissionNames(new Set());
    };

    const handlePermissionChange = (permissionName) => {
        setActivateAllPermissions(false);
        setSelectedPermissionNames((prev) => {
            const next = new Set(prev);
            if (next.has(permissionName)) {
                next.delete(permissionName);
            } else {
                next.add(permissionName);
            }
            return next;
        });
    };

    const { mutate: updateRole, isPending } = useMutation({
        mutationFn: () => {
            const permission_matrix = activateAllPermissions
                ? buildPermissionMatrix(allPermissionNames)
                : buildPermissionMatrix(selectedPermissionNames);

            return axiosInstance.post(`/admin/roles/${roleId}`, {
                title_ar: formData.title_ar.trim(),
                title_en: formData.title_en.trim() || null,
                is_active: formData.is_active,
                employee_id: formData.employee_id ? Number(formData.employee_id) : null,
                activate_all_permissions: activateAllPermissions,
                permission_matrix,
            });
        },
        onSuccess: (res) => {
            toast.success(res?.data?.message || 'تم تعديل الدور بنجاح');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['roles-list'] });
            queryClient.invalidateQueries({ queryKey: ['role', roleId] });
            queryClient.invalidateQueries({ queryKey: ['roles-create'] });
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

        if (!activateAllPermissions && selectedPermissionNames.size === 0) {
            toast.error('يرجى تحديد صلاحية واحدة على الأقل');
            return;
        }

        updateRole();
    };

    const PermissionModule = ({ module }) => (
        <div className="bg-neutral-50 border border-[#F0F0F0] rounded-3xl p-6 hover:shadow-md transition-all">
            <h3 className="text-base font-black text-black mb-5 pb-3 border-b border-surface-border">
                {module.section_label_ar ?? module.section_key}
            </h3>
            <div className="flex flex-col gap-4">
                {module.actions.map((action) => (
                    <label
                        key={action.permission_name}
                        className="flex items-center justify-between group cursor-pointer"
                    >
                        <span className="text-sm font-bold text-neutral-500 group-hover:text-black transition-all">
                            {action.action_label_ar ?? action.action}
                        </span>
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedPermissionNames.has(action.permission_name)}
                                onChange={() => handlePermissionChange(action.permission_name)}
                                disabled={isPending}
                                className="peer appearance-none w-6 h-6 border-2 border-neutral-200 rounded-[6px] checked:bg-brand-main checked:border-brand-main transition-all cursor-pointer disabled:opacity-50"
                            />
                            <i className="fa-solid fa-check absolute left-1 text-white text-10 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></i>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

    if (!roleId) {
        return (
            <div className="p-6 text-center text-status-danger" dir="rtl">
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

    if (roleLoading || modulesLoading || !formInitialized) {
        return <Loader />;
    }

    if (roleError || modulesError) {
        return (
            <div className="p-6 text-center text-status-danger" dir="rtl">
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

            <div className="bg-white rounded-32 border border-[#F0F0F0] p-8 mt-4 shadow-sm relative z-10" dir="rtl">
                <div className="flex flex-col gap-8 pb-8 border-b border-neutral-100">
                    {/* Identity header */}
                    <div className="relative flex flex-col items-center text-center gap-1 pt-2">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="absolute top-0 left-0 px-6 py-2.5 bg-brand-main text-white rounded-full font-bold text-13 hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/20 min-w-[110px] disabled:opacity-60 flex items-center justify-center gap-2"
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

                        <div className="size-24 rounded-full bg-brand-hover/10 border border-brand-hover/20 flex items-center justify-center text-brand-main">
                            <ShieldCheck className="size-10" />
                        </div>
                        <h2 className="text-[20px] font-black text-black mt-2">
                            {formData.title_ar || 'دور بدون اسم'}
                        </h2>
                        {role?.name && (
                            <p className="text-13 font-medium text-ink-placeholder" dir="ltr">
                                {role.name}
                            </p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                            <span
                                className={cn(
                                    "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold",
                                    formData.is_active ? "bg-[#DCFCE7] text-green-700" : "bg-status-neutral-bg text-status-neutral"
                                )}
                            >
                                {formData.is_active ? 'نشط' : 'غير نشط'}
                            </span>
                            {role?.is_full_access && (
                                <span className="inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold bg-[#DBEAFE] text-blue-700">
                                    صلاحية كاملة
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                disabled={isPending}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all disabled:opacity-60",
                                    formData.is_active
                                        ? "bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE7A8]"
                                        : "bg-[#DCFCE7] text-green-700 hover:bg-[#C6F6D9]"
                                )}
                            >
                                {formData.is_active ? (
                                    <>
                                        <Ban className="size-3.5" />
                                        تعطيل الدور
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="size-3.5" />
                                        تفعيل الدور
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Basic info */}
                    <div>
                        <h3 className="text-base font-black text-black mb-4">بيـــانات الدور:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1 max-w-[1000px]">
                            <InfoRow label="اللقب" required>
                                <input
                                    type="text"
                                    placeholder="موظف"
                                    value={formData.title_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                                    disabled={isPending}
                                    className="w-full bg-transparent text-15 font-bold text-black focus:outline-none disabled:opacity-60 placeholder:text-[#C7C7C7] placeholder:font-medium"
                                />
                            </InfoRow>

                            <InfoRow label="اللقب (بالإنجليزية)">
                                <input
                                    type="text"
                                    placeholder="—"
                                    value={formData.title_en}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                                    disabled={isPending}
                                    dir="ltr"
                                    className="w-full bg-transparent text-15 font-bold text-black focus:outline-none disabled:opacity-60 placeholder:text-[#C7C7C7] placeholder:font-medium"
                                />
                            </InfoRow>

                            <InfoRow label="الاسم (مفتاح النظام)" value={role?.name || '—'} />

                            <InfoRow label="الموظف المرتبط">
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
                                    <SelectTrigger className="h-auto border-0 shadow-none rounded-none bg-transparent px-0 py-0 text-15 font-bold text-black focus:ring-0">
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
                            </InfoRow>

                            <InfoRow label="تاريخ الإنشاء" value={formatDateShort(role?.created_at) || '—'} />
                        </div>
                    </div>

                    {/* Overview stats */}
                    <div>
                        <h3 className="text-base font-black text-black mb-4">نظرة عامة:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-1 max-w-[1000px]">
                            <InfoRow label="عدد الصلاحيات المفعّلة" value={selectedPermissionNames.size} />
                            <InfoRow label="عدد الأقسام" value={modules.length} />
                            <InfoRow label="آخر تحديث" value={formatDateShort(role?.updated_at) || '—'} />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-lg font-black text-black relative pr-4 before:content-[''] before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-5 before:bg-brand-main before:rounded-full">صلاحيـــات النظـــام:</h2>
                        <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2.5 rounded-[18px] border border-[#F0F0F0]">
                            <span className="text-13 font-bold text-neutral-500">تفعيل كافة الصلاحيات لهذا الدور</span>
                            <div className="flex items-center gap-2 pr-4 border-r border-surface-border">
                                <Switch
                                    checked={activateAllPermissions}
                                    onCheckedChange={handleActivateAll}
                                    disabled={modules.length === 0 || isPending}
                                    dir="ltr"
                                />
                                <span className="text-13 font-bold text-black whitespace-nowrap">تحديد الكل</span>
                            </div>
                        </div>
                    </div>
                    {modulesError ? (
                        <p className="text-center text-status-danger text-sm py-8">
                            تعذر تحميل الصلاحيات. يرجى المحاولة مرة أخرى.
                        </p>
                    ) : modules.length === 0 ? (
                        <p className="text-center text-ink-placeholder text-sm py-8">
                            لا توجد صلاحيات متاحة حالياً.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                            {modules.map((module) => (
                                <PermissionModule key={module.section_key} module={module} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
