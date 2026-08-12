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

function buildPermissionMatrix(sections, selectedPermissionIds) {
    const matrix = {};

    sections.forEach((section) => {
        const actions = section.permissions
            .filter((perm) => selectedPermissionIds.has(perm.id))
            .map((perm) => perm.action);

        if (actions.length > 0) {
            matrix[section.section_key] = actions;
        }
    });

    return matrix;
}

export default function AddRole() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        title_ar: '',
        description: '',
    });

    const [activateAllPermissions, setActivateAllPermissions] = useState(false);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());

    const { data, isLoading, isError } = useQuery({
        queryKey: ['permissions-by-section'],
        queryFn: () =>
            axiosInstance.get('/admin/permissions/by-section').then((res) => res?.data),
    });

    const sections = useMemo(() => data?.data ?? [], [data?.data]);

    const allPermissionIds = useMemo(
        () => sections.flatMap((section) => section.permissions.map((perm) => perm.id)),
        [sections]
    );

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

    const { mutate: saveRole, isPending } = useMutation({
        mutationFn: () => {
            const permission_matrix = activateAllPermissions
                ? buildPermissionMatrix(sections, new Set(allPermissionIds))
                : buildPermissionMatrix(sections, selectedPermissionIds);

            return axiosInstance.post('/admin/roles', {
                name: formData.name.trim(),
                title_ar: formData.title_ar.trim(),
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
            queryClient.invalidateQueries({ queryKey: ['permissions-by-section'] });
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

        if (!activateAllPermissions && selectedPermissionIds.size === 0) {
            toast.error('يرجى تحديد صلاحية واحدة على الأقل');
            return;
        }

        saveRole();
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
                                    'حفظ البيانات'
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
                                    placeholder="موظفة خدمة العملاء"
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
                                الاسم (مفتاح النظام) <span className="text-[#FF4D4F] mr-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="customer_service"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    disabled={isPending}
                                    className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-2 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium disabled:opacity-60"
                                    dir="ltr"
                                />
                                {/* <i className="fa-solid fa-user absolute left-5 top-1/2 -translate-y-1/2 text-[#A3A3A3]"></i> */}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 md:col-span-2">
                            <label className="text-[13px] font-bold text-black px-1">
                                الوصف
                            </label>
                            <textarea
                                placeholder="وصف اختياري للدور..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                disabled={isPending}
                                rows={3}
                                className="w-full bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-5 py-3 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium resize-none disabled:opacity-60"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-[18px] font-black text-black mb-8 relative pr-4 before:content-[''] before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-5 before:bg-brand-main before:rounded-full">صلاحيـــات النظـــام:</h2>
                    {isError ? (
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
