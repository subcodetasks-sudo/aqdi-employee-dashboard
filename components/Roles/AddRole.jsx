'use client'
import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/home/Header'
import { toast } from 'sonner'
import { Switch } from "@/components/ui/switch"
import { axiosInstance } from '@/src/utils/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Loader from '@/components/home/loader'
import { Loader2 } from 'lucide-react'

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

export default function AddRole() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        title_ar: '',
        title_en: '',
        description: '',
    });

    const [activateAllPermissions, setActivateAllPermissions] = useState(false);
    const [selectedPermissionNames, setSelectedPermissionNames] = useState(new Set());

    const { data, isLoading, isError } = useQuery({
        queryKey: ['roles-create'],
        queryFn: () =>
            axiosInstance.get('/admin/roles/create').then((res) => res?.data),
    });

    const modules = useMemo(() => data?.data?.permission_modules ?? [], [data?.data?.permission_modules]);

    const allPermissionNames = useMemo(
        () => modules.flatMap((module) => module.actions.map((action) => action.permission_name)),
        [modules]
    );

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

    const { mutate: saveRole, isPending } = useMutation({
        mutationFn: () => {
            const permission_matrix = activateAllPermissions
                ? buildPermissionMatrix(allPermissionNames)
                : buildPermissionMatrix(selectedPermissionNames);

            return axiosInstance.post('/admin/roles', {
                name: formData.name.trim(),
                title_ar: formData.title_ar.trim(),
                title_en: formData.title_en.trim() || null,
                description: formData.description.trim() || null,
                is_active: true,
                employee_id: null,
                activate_all_permissions: activateAllPermissions,
                permission_matrix,
            });
        },
        onSuccess: (res) => {
            toast.success(res?.data?.message || 'تم إضافة الدور بنجاح');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['roles-list'] });
            queryClient.invalidateQueries({ queryKey: ['roles-create'] });
            router.push('/home/roles-and-employees?tab=roles');
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                'حدث خطأ أثناء إضافة الدور'
            );
        },
    });

    const handleSubmit = () => {
        if (!formData.name.trim() || !formData.title_ar.trim()) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        if (!activateAllPermissions && selectedPermissionNames.size === 0) {
            toast.error('يرجى تحديد صلاحية واحدة على الأقل');
            return;
        }

        saveRole();
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

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
            <Header
                page='welcome'
                title={"إضافة دور"}
                isMain={false}
                first="الرئيــسية"
                firstURL="/"
                second="الأدوار"
                secondURL="/home/roles-and-employees?tab=roles"
                third="إضافة دور"
                thirdURL="/home/roles-and-employees/roles/add"
            />

            <div className="bg-white rounded-32 border border-[#F0F0F0] p-8 mt-4 shadow-sm relative z-10" dir="rtl">
                <div className="flex flex-col gap-8 pb-8 border-b border-neutral-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h2 className="text-[20px] font-black text-black relative pr-4 before:content-[''] before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-6 before:bg-brand-main before:rounded-full">بيـــانات الدور:</h2>
                        <div className="flex flex-wrap items-center gap-4 bg-neutral-50 p-3 rounded-[18px] border border-[#F0F0F0]">
                            <div className="flex items-center gap-3 px-3">
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
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isPending}
                                className="px-8 py-3 bg-brand-main text-white rounded-full font-bold text-sm hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/20 min-w-[120px] disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    'حفظ البيانات'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1000px]">
                        <div className="flex flex-col gap-3">
                            <label className="text-13 font-bold text-black px-1">
                                اللقب <span className="text-status-danger mr-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="موظفة خدمة العملاء"
                                    value={formData.title_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                                    disabled={isPending}
                                    className="w-full h-13.5 bg-surface-input border border-surface-border rounded-2xl px-5 text-15 focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium disabled:opacity-60"
                                />
                                <i className="fa-solid fa-id-badge absolute left-5 top-1/2 -translate-y-1/2 text-ink-placeholder"></i>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-13 font-bold text-black px-1">
                                اللقب (بالإنجليزية)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Customer Service"
                                    value={formData.title_en}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                                    disabled={isPending}
                                    className="w-full h-13.5 bg-surface-input border border-surface-border rounded-2xl px-5 text-15 focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium disabled:opacity-60"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-13 font-bold text-black px-1">
                                الاسم (مفتاح النظام) <span className="text-status-danger mr-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="customer_service"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    disabled={isPending}
                                    className="w-full h-13.5 bg-surface-input border border-surface-border rounded-2xl px-2 text-15 focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium disabled:opacity-60"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 md:col-span-2">
                            <label className="text-13 font-bold text-black px-1">
                                الوصف
                            </label>
                            <textarea
                                placeholder="وصف اختياري للدور..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                disabled={isPending}
                                rows={3}
                                className="w-full bg-surface-input border border-surface-border rounded-2xl px-5 py-3 text-15 focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium resize-none disabled:opacity-60"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-black text-black mb-8 relative pr-4 before:content-[''] before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-5 before:bg-brand-main before:rounded-full">صلاحيـــات النظـــام:</h2>
                    {isError ? (
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
