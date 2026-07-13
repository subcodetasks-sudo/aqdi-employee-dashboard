"use client"
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import Header from "@/components/home/Header";
import Link from "next/link";
import PermissionGate from "@/components/auth/PermissionGate";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";

export default function SettingsWrapper() {
    const [websiteSettings, setWebsiteSettings] = useState({
        website: true,
        appleStore: false,
        android: true,
        websiteStatus: true,
        thankYouCard: true,
    });

    const websiteAppSettings = [
        { id: "website", label: "الموقــع", status: websiteSettings.website },
        { id: "appleStore", label: "apple store - التطبيــق", status: websiteSettings.appleStore },
        { id: "android", label: "android - التطبيــق", status: websiteSettings.android },
        { id: "websiteStatus", label: "حـالــة الموقــع", status: websiteSettings.websiteStatus },
        { id: "thankYouCard", label: "بطاقة الشكـر", status: websiteSettings.thankYouCard },
    ];

    const systemSettings = [
        { label: "انواع الوحدات", link: "/home/settings/unit-types" },
        { label: "استخدام الوحدة", link: "/home/settings/unit-usage" },
        { label: "المناطق", link: "/home/settings/regions" },
        { label: "المدن", link: "/home/settings/cities" },
        { label: "أنواع العقار", link: "/home/settings/property-types" },
        { label: "استخدام العقار", link: "/home/settings/property-usage" },
        { label: "مدة الطلب", link: "/home/settings/order-duration" },
        { label: "اقسام الرسائل", link: "/home/settings/message-sections" },
        { label: "بنود أقسام الرسائل", link: "/home/settings/message-section-items" },
        { label: "رســائل توضيحية للعمــلاء", link: "/home/settings/customer-app-messages" },
        { label: "رســائل توضيحية للموظفيــن", link: "/home/settings/message-for-employee" },
        { label: "رسائل توضيحية للعقار", link: "/home/settings/message-for-property" },
        { label: "الخصومات", link: "/home/settings/coupons" },
        { label: "المدونة", link: "/home/settings/blogs" },
        { label: "الأسئلة الشائعة", link: "/home/settings/faqs" },
        { label: "قسم التعليمات", link: "/home/settings/instructions" },
        { label: "الشروط والاحكام", link: "/home/settings/terms" },
        { label: "سياسة الخصوصية", link: "/home/settings/privacy" },
        { label: "الإشعارات", link: "/home/settings/notifications" },
        { label: "المدفوعات", link: "/home/settings/payments" },
        { label: "رسائل التطبيقية للعميل", link: "/home/settings/customer-app-messages" },
        { label: "طرق الدفع", link: "/home/settings/payment-types" },
        { label: "أوراق العمل", link: "/home/settings/paperworks" },
    ];

    const handleToggle = (id) => {
        setWebsiteSettings(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="flex flex-col gap-8 p-6 min-h-screen overflow-x-auto max-w-[calc(100vw-305px)] max-[1200px]:max-w-[calc(100vw-60px)]" dir="rtl">
            <Header page='welcome' title={"الإعـدادات"} isMain={false} first="الرئيــسية" firstURL="/" second='الإعـدادات' secondURL="/home/settings" />
            
            {/* Website and App Settings Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[18px] font-bold text-black border-r-4 border-brand-main pr-3">إعدادات الموقـع والتطبيـق</h2>
                    <button className="w-6 h-6 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#A3A3A3] hover:bg-[#eee] transition-all">
                        <i className="fa-solid fa-minus text-[10px]"></i>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {websiteAppSettings.map((setting) => (
                        <div 
                            key={setting.id}
                            className="bg-white rounded-[20px] border border-[#E4E4E4] p-5 flex flex-col items-center gap-4 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${setting.status ? 'bg-[#0c6055] animate-pulse' : 'bg-[#E24444]'}`}></div>
                            </div>
                            <span className="text-[13px] text-[#212121] font-medium text-center">{setting.label}</span>
                            <div className="flex flex-col items-center gap-3 w-full pt-2 border-t border-[#F5F5F5]">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${setting.status ? 'bg-[#E7F5FF] text-[#228BE6]' : 'bg-[#FFF5F5] text-[#E03131]'}`}>
                                    {setting.status ? 'مُفعّــل' : 'مُعطل'}
                                </span>
                                <Switch 
                                    dir="ltr"
                                    checked={setting.status}
                                    onCheckedChange={() => handleToggle(setting.id)}
                                    className="data-[state=checked]:bg-brand-main"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Settings Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[18px] font-bold text-black border-r-4 border-brand-main pr-3">إعدادات النظام</h2>
                    <button className="w-6 h-6 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#A3A3A3] hover:bg-[#eee] transition-all">
                        <i className="fa-solid fa-minus text-[10px]"></i>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
                    {systemSettings.map((setting, index) => (
                        <PermissionGate
                            key={setting.label}
                            section={PERMISSION_SECTIONS.settings}
                            action="view"
                        >
                            <Link
                                href={setting?.link}
                                className="bg-white rounded-[16px] border border-[#E4E4E4] p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-brand-main hover:bg-[#fafafa] transition-all group"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#A3A3A3] group-hover:bg-brand-main group-hover:text-white transition-all">
                                    <Info size={16} />
                                </div>
                                <span className="text-[13px] text-[#212121] font-medium flex-1 text-center">{setting.label}</span>
                                <div className="w-8 flex justify-end opacity-0 group-hover:opacity-100 transition-all">
                                    <i className="fa-solid fa-chevron-left text-[10px] text-brand-main"></i>
                                </div>
                            </Link>
                        </PermissionGate>
                    ))}
                </div>
            </div>
        </div>
    );
}