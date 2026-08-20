"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

const PERIODS = { all: "all", month: "last_30_days", week: "last_7_days", today: "today", yesterday: "yesterday", last_7_days: "last_7_days", last_30_days: "last_30_days", custom: "custom" };

function getParams(period, dateFrom, dateTo, contractType, employee) {
  const params = { period: PERIODS[period] ?? "all" };
  if (dateFrom && dateTo) { params.date_from = dateFrom; params.date_to = dateTo; }
  if (contractType && contractType !== "all") params.contract_type = contractType;
  if (employee && employee !== "all") params.employee_id = employee;
  return params;
}

function useReport(endpoint, period, dateFrom, dateTo, contractType, employee) {
  const validCustomRange = period !== "custom" || Boolean(dateFrom && dateTo && dateFrom <= dateTo);
  return useQuery({
    queryKey: ["report", endpoint, period, dateFrom, dateTo, contractType, employee],
    queryFn: async () => (await axiosInstance.get(`/admin/reports/${endpoint}`, { params: getParams(period, dateFrom, dateTo, contractType, employee) })).data?.data,
    enabled: validCustomRange,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
}

export function useOrdersReport(...args) { return useReport("orders", ...args); }
export function useSalesReport(...args) { return useReport("sales", ...args); }
export function useProfitsReport(...args) { return useReport("profits", ...args); }
export function useCustomersReport(...args) { return useReport("customers", ...args); }
export function usePerformanceReport(...args) { return useReport("performance", ...args); }

export function useProfitSettings() {
  return useQuery({ queryKey: ["profit-settings"], queryFn: async () => (await axiosInstance.get("/admin/reports/profit-settings")).data?.data });
}

export function useUpdateProfitSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => axiosInstance.put("/admin/reports/profit-settings", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profit-settings"] });
      queryClient.invalidateQueries({ queryKey: ["report", "profits"] });
    },
  });
}