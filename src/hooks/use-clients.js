"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosInstance } from "@/src/utils/axios";

export const CLIENTS_API = "/admin/users";
export const CLIENTS_QUERY_KEY = "clients";
export const CLIENT_QUERY_KEY = "client";

function unwrapData(response) {
  const body = response?.data ?? response;
  return body?.data ?? body;
}

const SUMMARY_LABELS = {
  total_customers: "إجمالي العملاء",
  website_customers: "عملاء الموقع",
  google_play_customers: "جوجل بلاي",
  apple_store_customers: "آبل",
  banned: "الموقوفون",
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function countValue(value, arrayFallback) {
  if (Array.isArray(value)) return value.length;
  if (value == null || value === "") {
    return Array.isArray(arrayFallback) ? arrayFallback.length : 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function flagValue(value) {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return null;
}

/**
 * Query string for `GET /admin/users` and `GET /admin/users/export`.
 * `platform=website` includes website signups and rows with an empty platform.
 */
export function buildClientsQueryParams({
  page,
  perPage,
  search = "",
  platform = "",
  createdAt = "",
  isActive,
  banned,
} = {}) {
  const params = {};
  if (page != null) params.page = page;
  if (perPage != null) params.per_page = Math.min(100, Number(perPage) || 25);
  if (search) params.search = search;
  if (platform && platform !== "all") params.platform = platform;
  if (createdAt && createdAt !== "all") params.created_at = createdAt;
  if (isActive === 0 || isActive === 1 || isActive === "0" || isActive === "1") {
    params.is_active = isActive;
  }
  if (banned === true || banned === 1 || banned === "1") params.banned = 1;
  return params;
}

/**
 * `{ data: { summary, items, pagination } }` from `GET /admin/users`.
 * Items are newest first.
 */
export function normalizeClientsListResponse(response) {
  const payload = unwrapData(response);
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const pagination = payload?.pagination ?? {};
  const summary = payload?.summary ?? null;

  return {
    items,
    summary: summary
      ? {
          ...summary,
          labels: Object.fromEntries(
            Object.keys(SUMMARY_LABELS).map((key) => [
              key,
              summary[`${key}_label`] || SUMMARY_LABELS[key],
            ])
          ),
        }
      : null,
    meta: {
      currentPage: pagination.current_page ?? 1,
      lastPage: pagination.last_page ?? 1,
      total: pagination.total ?? items.length,
      perPage: pagination.per_page ?? items.length,
    },
  };
}

/** Maps a raw users row to the client table shape. */
export function mapUserToClientRow(user = {}) {
  const paid = Number(user.paid ?? user.total_paid_amount) || 0;
  const refunded = Number(user.refunded ?? user.refunded_amount) || 0;
  const verified = flagValue(user.verified);
  const active = flagValue(user.is_active ?? user.status);

  return {
    id: user.id,
    clientCode: user.customer_number || (user.id != null ? `C-${user.id}` : "—"),
    name: user.full_name || user.name || "—",
    mobile: user.mobile || user.phone || "—",
    email: user.email || null,
    photo: user.photo_path || null,
    joinedAt: user.joined_at || user.created_at || null,
    platform: user.platform || null,
    platformLabel: user.platform_label || null,
    verified,
    isActive: active !== false,
    completed: user.completed_orders_count ?? user.completed ?? 0,
    draft: user.draft_orders_count ?? user.draft ?? 0,
    incomplete: user.incomplete_orders_count ?? user.uncompleted_orders_count ?? 0,
    properties: countValue(
      user.properties_count ?? user.real_estate_count,
      user.real_estates ?? user.real_estates_list
    ),
    units: countValue(user.units_count, user.units ?? user.units_list),
    refundedAmount: refunded,
    paid,
    net: Number(user.net ?? user.net_amount ?? paid - refunded) || 0,
    blocked: Boolean(user.is_banned),
    contracts: asArray(user.contracts),
    raw: user,
  };
}

export function useClientsList({
  page = 1,
  perPage = 25,
  search = "",
  platform = "",
  createdAt = "",
  isActive,
  banned,
} = {}) {
  const params = buildClientsQueryParams({
    page,
    perPage,
    search,
    platform,
    createdAt,
    isActive,
    banned,
  });

  const query = useQuery({
    queryKey: [CLIENTS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await axiosInstance.get(CLIENTS_API, { params });
      return normalizeClientsListResponse(res);
    },
    placeholderData: keepPreviousData,
  });

  const items = query.data?.items ?? [];

  return {
    rows: items.map(mapUserToClientRow),
    meta: query.data?.meta ?? { currentPage: page, lastPage: 1, total: 0, perPage },
    summary: query.data?.summary ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** `GET /admin/users/{id}` — confirmed shape: `{ data: { user: { ...fields, contracts: [...] } } }`. */
export function useClientDetail(clientId) {
  const query = useQuery({
    queryKey: [CLIENT_QUERY_KEY, String(clientId)],
    queryFn: async () => {
      const res = await axiosInstance.get(`${CLIENTS_API}/${clientId}`);
      const payload = unwrapData(res);
      return payload?.user ?? payload;
    },
    enabled: clientId != null && clientId !== "",
  });

  const client = query.data ? mapUserToClientRow(query.data) : null;

  return {
    client,
    contracts: client?.contracts ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

function mapRealEstateUnit(unit = {}) {
  return {
    id: unit.id,
    type: unit.unit_type_name || "—",
    number: unit.unit_number || "—",
    area: unit.unit_area || "—",
    floor: unit.floor_number || "—",
    rooms: unit.tootal_rooms || "—",
    usage: unit.unit_usage_name || "—",
  };
}

function unitBelongsToEstate(unit, realEstate) {
  return (
    unit?.real_estates_units_id === realEstate.id ||
    unit?.real_estate_id === realEstate.id ||
    unit?.estate_id === realEstate.id
  );
}

function mapRealEstateToProperty(realEstate = {}, units = []) {
  const nested = asArray(realEstate.units);
  const linked = nested.length
    ? nested
    : units.filter((unit) => unitBelongsToEstate(unit, realEstate));

  return {
    id: realEstate.id,
    title: realEstate.name_real_estate || `عقار #${realEstate.id}`,
    street: realEstate.street || null,
    buildingNumber: realEstate.building_number || null,
    addedAt: realEstate.date_first_registration || null,
    orderId: null,
    propertyName: realEstate.name_real_estate || null,
    documentType: realEstate.instrument_type || null,
    deedNumber: realEstate.instrument_number || null,
    region: null,
    city: realEstate.property_city_name || null,
    district: realEstate.property_place_name || null,
    ownerId: realEstate.national_num || null,
    ownerMobile: realEstate.mobile || null,
    units: linked.map(mapRealEstateUnit),
  };
}

/** Same `/admin/users/{id}` endpoint as `useClientDetail`, shares its cache.
 *  Reads `real_estates`/`units` (and the older `*_list` keys) into property cards. */
export function useClientProperties(clientId) {
  const query = useQuery({
    queryKey: [CLIENT_QUERY_KEY, String(clientId)],
    queryFn: async () => {
      const res = await axiosInstance.get(`${CLIENTS_API}/${clientId}`);
      const payload = unwrapData(res);
      return payload?.user ?? payload;
    },
    enabled: clientId != null && clientId !== "",
  });

  const user = query.data;
  const client = user ? mapUserToClientRow(user) : null;
  const realEstates = asArray(user?.real_estates).length
    ? asArray(user?.real_estates)
    : asArray(user?.real_estates_list);
  const units = asArray(user?.units).length
    ? asArray(user?.units)
    : asArray(user?.units_list);

  const properties = realEstates.map((re) => mapRealEstateToProperty(re, units));

  const unassignedUnits = units.filter(
    (unit) => !realEstates.some((estate) => unitBelongsToEstate(unit, estate) || asArray(estate.units).includes(unit))
  );
  if (unassignedUnits.length > 0) {
    properties.push({
      id: "unassigned",
      title: "وحدات غير مرتبطة بعقار",
      street: null,
      buildingNumber: null,
      addedAt: null,
      orderId: null,
      propertyName: null,
      documentType: null,
      deedNumber: null,
      region: null,
      city: null,
      district: null,
      ownerId: null,
      ownerMobile: null,
      units: unassignedUnits.map(mapRealEstateUnit),
    });
  }

  return {
    client,
    properties,
    totals: {
      properties: realEstates.length,
      units: units.length,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

function filenameFromDisposition(header) {
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(header || "");
  const raw = match?.[1] || match?.[2];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** `GET /admin/users/export` — same filters as the list, without pagination. */
export function useExportClients() {
  return useMutation({
    mutationFn: async (filters = {}) => {
      const params = buildClientsQueryParams(filters);
      delete params.page;
      delete params.per_page;

      const res = await axiosInstance.get(`${CLIENTS_API}/export`, {
        params,
        responseType: "blob",
      });

      const type = res?.data?.type || "";
      if (type.includes("application/json")) {
        const text = await res.data.text();
        const url = JSON.parse(text)?.data?.url;
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
          return { downloaded: true };
        }
        throw new Error("no file url");
      }

      const filename =
        filenameFromDisposition(res?.headers?.["content-disposition"]) ||
        `clients-${new Date().toISOString().slice(0, 10)}.csv`;
      const blobUrl = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      return { downloaded: true };
    },
    onSuccess: () => {
      toast.success("تم تصدير العملاء");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "تعذر تصدير العملاء");
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId) => axiosInstance.post(`${CLIENTS_API}/${clientId}/delete`),
    onSuccess: (res, clientId) => {
      toast.success(res?.data?.message || "تم حذف العميل بنجاح");
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [CLIENT_QUERY_KEY, String(clientId)] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف العميل");
    },
  });
}

export function useBlockClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId) => axiosInstance.post(`${CLIENTS_API}/${clientId}/block`),
    onSuccess: (res, clientId) => {
      toast.success(res?.data?.message || "تم تحديث حالة العميل");
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY, String(clientId)] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تحديث حالة العميل");
    },
  });
}
