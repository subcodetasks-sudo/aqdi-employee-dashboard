"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

export const ADMIN_CONTRACT_PERIODS_API = "/admin/contract-periods";
export const CONTRACT_PERIODS_QUERY_KEY = "contract-periods";

export const KNOWN_PERIODS = [
  { value: "شهري", months: 1 },
  { value: "ربع سنوي", months: 3 },
  { value: "نصف سنوي", months: 6 },
  { value: "سنوي", months: 12 },
];

export function getKnownPeriodMonths(period) {
  return KNOWN_PERIODS.find((item) => item.value === period)?.months ?? null;
}

export function extractAdminContractPeriods(response) {
  const body = response?.data ?? response;
  if (Array.isArray(body?.data?.items)) {
    return {
      items: body.data.items,
      pagination: body.data.pagination ?? null,
    };
  }
  if (Array.isArray(body?.items)) {
    return { items: body.items, pagination: body.pagination ?? null };
  }
  if (Array.isArray(body?.data)) {
    return { items: body.data, pagination: null };
  }
  if (Array.isArray(body)) {
    return { items: body, pagination: null };
  }
  return { items: [], pagination: null };
}

function parseOptionalNumber(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildContractPeriodPayload(form, { isEdit = false } = {}) {
  const payload = {
    period: String(form.period || "").trim(),
    note_ar: String(form.note_ar || "").trim(),
    contract_type: form.contract_type,
  };

  const noteEn = String(form.note_en || "").trim();
  if (noteEn) payload.note_en = noteEn;
  else if (isEdit) payload.note_en = "";

  const price = parseOptionalNumber(form.price);
  if (price != null) payload.price = price;
  else if (isEdit) payload.price = null;

  return payload;
}

export function useAdminContractPeriods({
  page = 1,
  perPage = 20,
  contractType = "",
} = {}) {
  const query = useQuery({
    queryKey: [CONTRACT_PERIODS_QUERY_KEY, "admin", page, perPage, contractType || "all"],
    queryFn: async () => {
      const res = await axiosInstance.get(ADMIN_CONTRACT_PERIODS_API, {
        params: {
          page,
          per_page: perPage,
          contract_type: contractType || undefined,
        },
      });
      return extractAdminContractPeriods(res.data);
    },
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
