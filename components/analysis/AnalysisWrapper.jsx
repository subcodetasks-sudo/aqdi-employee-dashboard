"use client";
import React from "react";
import DayCard from "./finAnalysis/DayCard";
import UserCard from "./finAnalysis/UserCard";
import OrderCard from "./finAnalysis/OrderCard";
import EmployeeCard from "./finAnalysis/EmployeeCard";
import UnitsCard from "./finAnalysis/UnitsCard";
import LocationsCard from "./finAnalysis/LocationsCard";
import LayeringCard from "./finAnalysis/LayeringCard";
import AnalsCard from "./finAnalysis/AnalsCard";
import Loader from "../home/loader";
import AnalysisSection, { CardGrid, GRID_2, GRID_3, GRID_4, GRID_5 } from "./AnalysisSection";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import {
    formatMap,
    formatMetricValue,
    formatPercentage,
    normalizeDashboardAnalytics,
    sortOrderAnalytics,
} from "@/src/lib/dashboard-analytics";
import { parseNamesList } from "./finAnalysis/static-analysis-avatars";

function mapPersonNames(rawValue, formattedValue) {
    if (Array.isArray(rawValue)) return rawValue.filter(Boolean).map(String);
    return parseNamesList(formattedValue);
}

const getControlPanelLink = (label) => {
    if (!label) return null;
    if (label.includes("الموظفين")) return "/home/roles-and-employees?tab=employees";
    if (label.includes("المستخدمين")) return null;
    if (label.includes("المدن")) return "/home/settings/cities";
    if (label.includes("الوحدات")) return "/home/settings/unit-types";
    if (label.includes("العقود الغير المكتملة") || label.includes("عقود غير مكتملة")) {
        return "/home/orders?tab=incomplete";
    }
    if (label.includes("العقود المكتملة") || label.includes("عقود مكتملة")) {
        return "/home/orders?tab=completed";
    }
    return null;
};

const getOrderAnalyticsLink = (label) => {
    if (!label) return "/home/orders?tab=whatsapp-completed";
    if (label.includes("الطلبات المكتملة")) return "/home/orders?tab=completed&created_at=total";
    if (label.includes("الطلبات غير المكتملة")) return "/home/orders?tab=incomplete&period=total";
    if (label.includes("واتساب مكتملة") || label.includes("واتساب المكتملة")) {
        return "/home/orders?tab=whatsapp-completed";
    }
    if (label.includes("واتساب غير مكتملة") || label.includes("واتساب الغير مكتملة")) {
        return "/home/orders?tab=whatsapp-incomplete";
    }
    if (label.includes("مسترجعه") || label.includes("مسترجعة")) {
        return "/home/return-orders?created_at=total";
    }
    return null;
};

export default function Statistics() {
    const { data: statisticsData, isError, isLoading } = useQuery({
        queryKey: ["getAnalysis"],
        queryFn: () => axiosInstance.get("/admin/dashboard-analytics").then((res) => res?.data),
    });

    if (isLoading) return <Loader />;

    if (isError) {
        return (
            <div className="flex items-center justify-center h-screen text-[#FF4D4F]" dir="rtl">
                تعذر تحميل بيانات التحليلات
            </div>
        );
    }

    const apiData = normalizeDashboardAnalytics(statisticsData?.data ?? statisticsData);

    if (!apiData) {
        return (
            <div className="flex items-center justify-center h-screen text-[#A3A3A3]" dir="rtl">
                لا توجد بيانات تحليلات متاحة
            </div>
        );
    }

    const controlPanel = apiData.control_panel.map((item) => ({
        name: item.label_ar ?? item.label ?? "",
        value: formatMetricValue(item),
        valueType: item.type === "currency" ? "price" : "count",
        link: getControlPanelLink(item.label_ar),
    }));

    const financial = apiData.financial_analytics;

    const financialIncomes = formatMap(financial.income, (key) => `/home/reports?tab=financial&period=${key}`).map((card) => ({
        ...card,
        variant: "income",
    }));

    const financialOrders = Object.entries(financial.completed_orders || {}).map(([key, item]) => ({
        name: item?.label_ar ?? key,
        value: formatMetricValue(item),
        valueType: "count",
        percentage: formatPercentage(item?.percentage_change),
        type: key === "total" ? "total-regular" : key,
        link: `/home/orders?tab=completed&created_at=${key}`,
    }));

    const financialIncomplete = formatMap(
        financial.incomplete_orders,
        (key) => `/home/orders?tab=incomplete&period=${key}`,
        "count"
    );

    const financialReturns = Object.entries(financial.refunds || {}).map(([key, item]) => ({
        name: item?.label_ar ?? key,
        value: formatMetricValue(item),
        valueType: "price",
        percentage: formatPercentage(item?.percentage_change),
        type: "totalLoss",
        link: `/home/return-orders?created_at=${key}`,
    }));

    const financialExpenses = formatMap(financial.expenses, (key) => `/home/reports?tab=expenses&period=${key}`);

    const userAnalytics = apiData.user_analytics ?? {};

    const usersAnalysis = formatMap(userAnalytics.new_users, (key) => `/home/reports?tab=users&segment=${key}`, "count");

    const userActivity = [
        userAnalytics.user_activity_rate && {
            name: userAnalytics.user_activity_rate.label_ar,
            value: `${userAnalytics.user_activity_rate.value ?? 0}%`,
            valueType: "count",
            type: "onlyNumber",
        },
        userAnalytics.most_clients_completed_requests && {
            name: userAnalytics.most_clients_completed_requests.label_ar,
            value: formatMetricValue(userAnalytics.most_clients_completed_requests),
            names: mapPersonNames(
                userAnalytics.most_clients_completed_requests.value,
                formatMetricValue(userAnalytics.most_clients_completed_requests)
            ),
            showAvatars: true,
            type: "onlyNumber",
            link: "/home/reports?tab=users&segment=top_completed_orders",
        },
        userAnalytics.most_clients_incomplete_requests && {
            name: userAnalytics.most_clients_incomplete_requests.label_ar,
            value: formatMetricValue(userAnalytics.most_clients_incomplete_requests),
            names: mapPersonNames(
                userAnalytics.most_clients_incomplete_requests.value,
                formatMetricValue(userAnalytics.most_clients_incomplete_requests)
            ),
            showAvatars: true,
            type: "onlyNumberTwoSpace",
            link: "/home/reports?tab=users&segment=top_incompleted_orders",
        },
    ].filter(Boolean);

    const userOrders = [
        userAnalytics.most_clients_requests && {
            name: userAnalytics.most_clients_requests.label_ar,
            value: formatMetricValue(userAnalytics.most_clients_requests),
            names: mapPersonNames(
                userAnalytics.most_clients_requests.value,
                formatMetricValue(userAnalytics.most_clients_requests)
            ),
            showAvatars: true,
            type: "onlyButton",
            link: "/home/reports?tab=users&segment=top_orders",
        },
        userAnalytics.most_clients_returns && {
            name: userAnalytics.most_clients_returns.label_ar,
            value: formatMetricValue(userAnalytics.most_clients_returns),
            names: mapPersonNames(
                userAnalytics.most_clients_returns.value,
                formatMetricValue(userAnalytics.most_clients_returns)
            ),
            showAvatars: true,
            type: "onlyButton",
            link: "/home/reports?tab=users&segment=top_refunds",
        },
        userAnalytics.most_clients_real_estate && {
            name: userAnalytics.most_clients_real_estate.label_ar,
            value: formatMetricValue(userAnalytics.most_clients_real_estate),
            names: mapPersonNames(
                userAnalytics.most_clients_real_estate.value,
                formatMetricValue(userAnalytics.most_clients_real_estate)
            ),
            showAvatars: true,
            type: "onlyButton",
            link: "/home/reports?tab=users&segment=top_properties",
        },
        userAnalytics.most_clients_units && {
            name: userAnalytics.most_clients_units.label_ar,
            value: formatMetricValue(userAnalytics.most_clients_units),
            names: mapPersonNames(
                userAnalytics.most_clients_units.value,
                formatMetricValue(userAnalytics.most_clients_units)
            ),
            showAvatars: true,
            type: "onlyNumberTwoSpace",
            link: "/home/reports?tab=users&segment=top_units",
        },
    ].filter(Boolean);

    const orders = sortOrderAnalytics(apiData.order_analytics).map((item) => ({
        name: item.label_ar ?? "",
        value:
            item.type === "percentage"
                ? item.value != null && item.value !== ""
                    ? `${item.value}%`
                    : "—"
                : formatMetricValue(item),
        valueType: "count",
        type: item.type === "percentage" ? "onlyNumber" : "regular",
        link: getOrderAnalyticsLink(item.label_ar),
    }));

    const ordersRow1 = orders.slice(0, 3);
    const ordersRow2 = orders.slice(3, 6);

    const employeesAnalysis = apiData.employee_analytics.map((item) => {
        let cardId = "total";
        const key = (item.key || "").toLowerCase();
        const label = item.label_ar || "";

        if (key.includes("received") || label.includes("استلم") || label.includes("المستلمة")) {
            cardId = "most_received_orders";
        } else if (key.includes("completed") || label.includes("وثق") || label.includes("المكتملة")) {
            cardId = "most_completed_orders";
        } else if (
            key.includes("incomplete") ||
            key.includes("incompleted") ||
            label.includes("غير مدفوع") ||
            label.includes("الغير مدفوع")
        ) {
            cardId = "most_incompleted_orders";
        } else if (
            key.includes("refund") ||
            key.includes("return") ||
            label.includes("استرجاع") ||
            label.includes("المرتجعة")
        ) {
            cardId = "most_refunded_orders";
        }

        const nameList = Array.isArray(item.value)
            ? item.value.filter(Boolean).map(String)
            : parseNamesList(formatMetricValue(item));

        const isEmployeeCountCard =
            label.includes("عدد الموظف") || label.includes("عدد موظف");

        return {
            name: item.label_ar,
            value: Array.isArray(item.value) ? nameList.join(" ، ") : formatMetricValue(item),
            names: nameList,
            valueType: item.type === "currency" ? "price" : "count",
            type: nameList.length > 0 ? "arrayOfNames" : "regular",
            showAvatars: !isEmployeeCountCard,
            link: `/home/reports?tab=staff&metric=${cardId}`,
        };
    });

    const propertiesAnalysis = formatMap(
        apiData.real_estate_and_units_analytics.real_estates,
        (key) => `/home/reports?tab=properties&period=${key}`,
        "count"
    );

    const unitsAnalysis = formatMap(
        apiData.real_estate_and_units_analytics.units,
        (key) => `/home/reports?tab=units&period=${key}`,
        "count"
    );

    const locationsAnalysis = apiData.location_analytics.map((item) => ({
        name: item.label_ar,
        value: formatMetricValue(item),
        valueType: item.type === "currency" ? "price" : "count",
        percentage: formatPercentage(item.percentage_change),
        type: "onlyNumber",
    }));

    const layeringAnalysis = apiData.order_transfer_analytics.map((item) => ({
        name: item.label_ar,
        value: formatMetricValue(item),
        valueType: "count",
        type: "regular",
    }));

    const employeesRow1 = employeesAnalysis.slice(0, 3);
    const employeesRow2 = employeesAnalysis.slice(3);

    return (
        <>
            <div
                className="flex flex-col gap-2 w-full min-w-0 max-w-full"
                dir="rtl"
            >
                <AnalysisSection title="التحليــلات المــاليــة :">
                    <CardGrid>
                        {financialIncomes.map((card, index) => (
                            <DayCard key={`fin-income-${index}`} item={card} />
                        ))}
                    </CardGrid>
                    <CardGrid>
                        {financialOrders.map((card, index) => (
                            <DayCard key={`fin-orders-${index}`} item={card} />
                        ))}
                    </CardGrid>
                    <CardGrid>
                        {financialIncomplete.map((card, index) => (
                            <DayCard key={`fin-incomplete-${index}`} item={card} />
                        ))}
                    </CardGrid>
                    <CardGrid>
                        {financialReturns.map((card, index) => (
                            <DayCard key={`fin-returns-${index}`} item={card} />
                        ))}
                    </CardGrid>
                    <CardGrid>
                        {financialExpenses.map((card, index) => (
                            <DayCard key={`fin-expenses-${index}`} item={card} />
                        ))}
                    </CardGrid>
                </AnalysisSection>

                <AnalysisSection title="تحلــيلات المستخدميــن :">
                    <CardGrid>
                        {usersAnalysis.map((card, index) => (
                            <UserCard key={`user-${index}`} item={card} />
                        ))}
                    </CardGrid>
                    <CardGrid columns={GRID_2}>
                        {userActivity.map((card, index) => (
                            <UserCard key={`user-activity-${index}`} item={card} />
                        ))}
                    </CardGrid>
                    <CardGrid columns={`${GRID_2} lg:grid-cols-4`}>
                        {userOrders.map((card, index) => (
                            <UserCard key={`user-orders-${index}`} item={card} />
                        ))}
                    </CardGrid>
                </AnalysisSection>

                <AnalysisSection title="تحلــيلات الطلبــات :">
                    {ordersRow1.length > 0 && (
                        <CardGrid columns={GRID_3}>
                            {ordersRow1.map((card, index) => (
                                <OrderCard key={`order-1-${index}`} item={card} />
                            ))}
                        </CardGrid>
                    )}
                    {ordersRow2.length > 0 && (
                        <CardGrid columns={GRID_3}>
                            {ordersRow2.map((card, index) => (
                                <OrderCard key={`order-2-${index}`} item={card} />
                            ))}
                        </CardGrid>
                    )}
                </AnalysisSection>

                <AnalysisSection title="تحلــيلات الموظفيــن :">
                    {employeesRow1.length > 0 && (
                        <CardGrid columns={GRID_3}>
                            {employeesRow1.map((card, index) => (
                                <EmployeeCard key={`employee-1-${index}`} item={card} />
                            ))}
                        </CardGrid>
                    )}
                    {employeesRow2.length > 0 && (
                        <CardGrid columns={GRID_2} className="max-w-full lg:max-w-[66%]">
                            {employeesRow2.map((card, index) => (
                                <EmployeeCard key={`employee-2-${index}`} item={card} />
                            ))}
                        </CardGrid>
                    )}
                </AnalysisSection>

                <AnalysisSection title="تحلــيلات العقــارات والوحــدات :">
                    {propertiesAnalysis.length > 0 && (
                        <CardGrid>
                            {propertiesAnalysis.map((card, index) => (
                                <UnitsCard key={`property-${index}`} item={card} />
                            ))}
                        </CardGrid>
                    )}
                    {unitsAnalysis.length > 0 && (
                        <CardGrid>
                            {unitsAnalysis.map((card, index) => (
                                <UnitsCard key={`unit-${index}`} item={card} />
                            ))}
                        </CardGrid>
                    )}
                </AnalysisSection>

                {locationsAnalysis.length > 0 && (
                    <AnalysisSection title="أكثر المدن توثيقاً للعقود :">
                        <CardGrid columns={GRID_4}>
                            {locationsAnalysis.map((card, index) => (
                                <LocationsCard key={`location-${index}`} item={card} />
                            ))}
                        </CardGrid>
                    </AnalysisSection>
                )}

                {layeringAnalysis.length > 0 && (
                    <AnalysisSection title="تحليــلات انتقال الطلب من تصنيف الى تصنيف أخر :" defaultOpen={false}>
                        <CardGrid columns={`${GRID_3} xl:grid-cols-6`}>
                            {layeringAnalysis.map((card, index) => (
                                <LayeringCard key={`layer-${index}`} item={card} />
                            ))}
                        </CardGrid>
                    </AnalysisSection>
                )}

                {controlPanel.length > 0 && (
                    <AnalysisSection title="لوحة التحكم :">
                        <CardGrid>
                            {controlPanel.map((item, index) => (
                                <AnalsCard key={`control-${index}`} item={item} />
                            ))}
                        </CardGrid>
                    </AnalysisSection>
                )}
            </div>
        </>
    );
}
