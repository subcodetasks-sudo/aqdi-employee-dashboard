"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

/** Maps this app's generic report period ids to the ones the KPI API accepts. */
const REPORT_PERIOD_TO_KPI_PERIOD = {
  all: "all",
  month: "last_30_days",
  week: "last_7_days",
  today: "today",
  custom: "custom",
};

export function toKpiPeriod(reportPeriod) {
  return REPORT_PERIOD_TO_KPI_PERIOD[reportPeriod] ?? "all";
}

function getKpiParams(reportPeriod, dateFrom, dateTo) {
  const params = { period: toKpiPeriod(reportPeriod) };

  if (dateFrom && dateTo) {
    params.date_from = dateFrom;
    params.date_to = dateTo;
  }

  return params;
}

async function fetchAllEmployeesKpis(reportPeriod, dateFrom, dateTo) {
  const res = await axiosInstance.get("/admin/employees/kpis", {
    params: getKpiParams(reportPeriod, dateFrom, dateTo),
  });
  return res.data?.data;
}

/** GET /admin/employees/kpis — KPI cards and workload/outcome metrics for every employee. */
export function useAllEmployeesKpis(reportPeriod, dateFrom, dateTo) {
  const period = toKpiPeriod(reportPeriod);
  const isCustomRange = reportPeriod === "custom";
  const hasValidRange = Boolean(dateFrom && dateTo && dateFrom <= dateTo);

  return useQuery({
    queryKey: ["employees-kpis", period, dateFrom, dateTo],
    queryFn: () => fetchAllEmployeesKpis(reportPeriod, dateFrom, dateTo),
    enabled: !isCustomRange || hasValidRange,
  });
}

async function fetchEmployeeKpisDetails(employeeId, reportPeriod, dateFrom, dateTo) {
  const res = await axiosInstance.get(`/admin/employees/${employeeId}/kpis`, {
    params: getKpiParams(reportPeriod, dateFrom, dateTo),
  });
  return res.data?.data;
}

/** GET /admin/employees/{id}/kpis — same as .../kpis/details with date-range support. */
export function useEmployeeKpisDetails(employeeId, reportPeriod, dateFrom, dateTo) {
  const period = toKpiPeriod(reportPeriod);
  const isCustomRange = reportPeriod === "custom";
  const hasValidRange = Boolean(dateFrom && dateTo && dateFrom <= dateTo);

  return useQuery({
    queryKey: ["employee-kpis-details", employeeId, period, dateFrom, dateTo],
    queryFn: () => fetchEmployeeKpisDetails(employeeId, reportPeriod, dateFrom, dateTo),
    enabled: Boolean(employeeId) && (!isCustomRange || hasValidRange),
  });
}
