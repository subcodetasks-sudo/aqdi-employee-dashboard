"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { getContractTypeLabel } from "@/src/lib/contract-period-utils";
import { normalizeEmployeesListResponse } from "@/src/lib/employees";

const CONTRACT_TYPE_OPTIONS = [
  { id: "all", label: "كل الأنواع" },
  { id: "housing", label: getContractTypeLabel("housing") },
  { id: "commercial", label: getContractTypeLabel("commercial") },
];

/** Options for reports filter bar — employees from API, contract types from app domain. */
export function useReportFilterOptions() {
  const { data: employeesPayload, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["report-filter-employees"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/employees?per_page=200");
      return normalizeEmployeesListResponse(res?.data);
    },
    staleTime: 5 * 60 * 1000,
  });

  const contractTypeOptions = useMemo(() => CONTRACT_TYPE_OPTIONS, []);

  const employeeOptions = useMemo(() => {
    const options = [{ id: "all", label: "كل الموظفين" }];
    for (const employee of employeesPayload?.items ?? []) {
      if (employee?.id == null) continue;
      options.push({
        id: String(employee.id),
        label: employee.name?.trim() || `موظف #${employee.id}`,
      });
    }
    return options;
  }, [employeesPayload]);

  return {
    contractTypeOptions,
    employeeOptions,
    isLoadingEmployees,
  };
}

export function resolveReportFilterValue(value, options, fallback = "all") {
  if (!value) return fallback;
  return options.some((option) => option.id === value) ? value : fallback;
}
