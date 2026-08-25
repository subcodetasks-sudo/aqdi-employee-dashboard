"use client";
import React from "react";
import Loader from "../home/loader";
import { useDashboardAnalytics } from "@/src/hooks/use-dashboard-analytics";
import FinancialAnalyticsSection from "./sections/FinancialAnalyticsSection";
import UserAnalyticsSection from "./sections/UserAnalyticsSection";
import OrderAnalyticsSection from "./sections/OrderAnalyticsSection";
import EmployeeAnalyticsSection from "./sections/EmployeeAnalyticsSection";
import RealEstateAnalyticsSection from "./sections/RealEstateAnalyticsSection";
import LocationAnalyticsSection from "./sections/LocationAnalyticsSection";
import LayeringAnalyticsSection from "./sections/LayeringAnalyticsSection";
import ControlPanelSection from "./sections/ControlPanelSection";

export default function Statistics() {
    const { data, isError, isLoading } = useDashboardAnalytics();

    if (isLoading) return <Loader />;

    if (isError) {
        return (
            <div className="flex items-center justify-center h-screen text-status-danger" dir="rtl">
                تعذر تحميل بيانات التحليلات
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-screen text-ink-placeholder" dir="rtl">
                لا توجد بيانات تحليلات متاحة
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 w-full min-w-0 max-w-full" dir="rtl">
            <FinancialAnalyticsSection financial={data.financial} />
            <UserAnalyticsSection users={data.users} />
            <OrderAnalyticsSection orders={data.orders} />
            <EmployeeAnalyticsSection employees={data.employees} />
            <RealEstateAnalyticsSection realEstate={data.realEstate} />
            <LocationAnalyticsSection locations={data.locations} />
            <LayeringAnalyticsSection layering={data.layering} />
            <ControlPanelSection controlPanel={data.controlPanel} />
        </div>
    );
}
