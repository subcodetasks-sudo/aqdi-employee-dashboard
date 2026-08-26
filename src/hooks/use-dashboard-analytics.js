import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import {
    formatMap,
    formatMetricValue,
    formatPercentage,
    normalizeDashboardAnalytics,
    sortOrderAnalytics,
} from "@/src/lib/dashboard-analytics";
import { parseNamesList } from "@/components/analysis/finAnalysis/static-analysis-avatars";

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

function buildControlPanel(apiData) {
    return apiData.control_panel.map((item) => ({
        name: item.label_ar ?? item.label ?? "",
        value: formatMetricValue(item),
        valueType: item.type === "currency" ? "price" : "count",
        link: getControlPanelLink(item.label_ar),
    }));
}

function buildFinancialAnalytics(apiData) {
    const financial = apiData.financial_analytics;

    const incomes = formatMap(financial.income, (key) => `/home/reports?tab=financial&period=${key}`).map((card) => ({
        ...card,
        variant: "income",
    }));

    const orders = Object.entries(financial.completed_orders || {}).map(([key, item]) => ({
        name: item?.label_ar ?? key,
        value: formatMetricValue(item),
        valueType: "count",
        percentage: formatPercentage(item?.percentage_change),
        type: key === "total" ? "total-regular" : key,
        link: `/home/orders?tab=completed&created_at=${key}`,
    }));

    const incomplete = formatMap(
        financial.incomplete_orders,
        (key) => `/home/orders?tab=incomplete&period=${key}`,
        "count"
    );

    const returns = Object.entries(financial.refunds || {}).map(([key, item]) => ({
        name: item?.label_ar ?? key,
        value: formatMetricValue(item),
        valueType: "price",
        percentage: formatPercentage(item?.percentage_change),
        type: "totalLoss",
        link: `/home/return-orders?created_at=${key}`,
    }));

    const expenses = formatMap(financial.expenses, (key) => `/home/reports?tab=expenses&period=${key}`);

    return { incomes, orders, incomplete, returns, expenses };
}

function buildUserAnalytics(apiData) {
    const userAnalytics = apiData.user_analytics ?? {};

    const newUsers = formatMap(userAnalytics.new_users, (key) => `/home/reports?tab=users&segment=${key}`, "count");

    const activity = [
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

    const orders = [
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

    return { newUsers, activity, orders };
}

function buildOrderAnalytics(apiData) {
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

    return { row1: orders.slice(0, 3), row2: orders.slice(3, 6) };
}

function buildEmployeeAnalytics(apiData) {
    const employees = apiData.employee_analytics.map((item) => {
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

        const isEmployeeCountCard = label.includes("عدد الموظف") || label.includes("عدد موظف");

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

    return { row1: employees.slice(0, 3), row2: employees.slice(3) };
}

function buildRealEstateAnalytics(apiData) {
    const properties = formatMap(
        apiData.real_estate_and_units_analytics.real_estates,
        (key) => `/home/reports?tab=properties&period=${key}`,
        "count"
    );

    const units = formatMap(
        apiData.real_estate_and_units_analytics.units,
        (key) => `/home/reports?tab=units&period=${key}`,
        "count"
    );

    return { properties, units };
}

function buildLocationAnalytics(apiData) {
    return apiData.location_analytics.map((item) => ({
        name: item.label_ar,
        value: formatMetricValue(item),
        valueType: item.type === "currency" ? "price" : "count",
        percentage: formatPercentage(item.percentage_change),
        type: "onlyNumber",
    }));
}

function buildLayeringAnalytics(apiData) {
    return apiData.order_transfer_analytics.map((item) => ({
        name: item.label_ar,
        value: formatMetricValue(item),
        valueType: "count",
        type: "regular",
    }));
}

function shapeDashboardAnalytics(apiData) {
    if (!apiData) return null;

    return {
        controlPanel: buildControlPanel(apiData),
        financial: buildFinancialAnalytics(apiData),
        users: buildUserAnalytics(apiData),
        orders: buildOrderAnalytics(apiData),
        employees: buildEmployeeAnalytics(apiData),
        realEstate: buildRealEstateAnalytics(apiData),
        locations: buildLocationAnalytics(apiData),
        layering: buildLayeringAnalytics(apiData),
    };
}

/** Fetches and shapes `/admin/dashboard-analytics` into per-section view models for AnalysisWrapper. */
export function useDashboardAnalytics() {
    const { data, isError, isLoading } = useQuery({
        queryKey: ["getAnalysis"],
        queryFn: () => axiosInstance.get("/admin/dashboard-analytics").then((res) => res?.data),
    });

    const apiData = normalizeDashboardAnalytics(data?.data ?? data);

    return {
        isLoading,
        isError,
        data: shapeDashboardAnalytics(apiData),
    };
}
