"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import {
  formatContractPeriodPrice,
  getContractPeriodLabel,
  groupContractPeriodsByContractType,
  normalizeContractPeriods,
} from "@/src/lib/contract-period-utils";

const CONTRACT_TYPES = ["housing", "commercial"];

async function fetchContractPeriods(contractType) {
  const res = await axiosInstance.get("/admin/contract-periods", {
    params: { contract_type: contractType },
  });

  return normalizeContractPeriods(res.data).map((period) => ({
    ...period,
    contract_type: period?.contract_type || contractType,
  }));
}

async function fetchAllContractPeriods() {
  const results = await Promise.all(CONTRACT_TYPES.map(fetchContractPeriods));
  return results.flat();
}

export function useContractPeriods(enabled = true) {
  const query = useQuery({
    queryKey: ["contract-periods", "all", "order-nav"],
    queryFn: fetchAllContractPeriods,
    enabled,
    staleTime: 60_000,
  });

  const groups = groupContractPeriodsByContractType(query.data ?? []);
  const hasPeriods = groups.some((group) =>
    group.sections.some((section) => section.items.length > 0)
  );

  return {
    items: query.data ?? [],
    groups,
    isLoading: query.isLoading,
    hasPeriods,
  };
}

/** Periods for a single contract type (optional instrument filter). */
export function useContractPeriodsForType(
  contractType,
  { instrumentType = null, enabled = true } = {}
) {
  const query = useQuery({
    queryKey: ["contract-periods", contractType || "all", instrumentType || "any"],
    queryFn: () =>
      contractType
        ? fetchContractPeriods(contractType)
        : fetchAllContractPeriods(),
    enabled,
    staleTime: 60_000,
  });

  const items = (query.data ?? []).filter((period) => {
    if (!instrumentType) return true;
    return (
      !period?.instrument_type ||
      String(period.instrument_type) === String(instrumentType)
    );
  });

  return {
    items,
    options: mapContractPeriodsToOptions(items),
    isLoading: query.isLoading,
  };
}

export function mapContractPeriodsToOptions(periods = []) {
  return periods
    .filter((period) => period?.id != null)
    .map((period) => {
      const label = getContractPeriodLabel(period);
      const price = formatContractPeriodPrice(period?.price);
      return {
        value: String(period.id),
        label: price ? `${label} (اجمالي الرسوم ${period.price})` : label,
      };
    });
}
