"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import {
  getMessagesByType,
  parseCustomerMessagesAll,
} from "@/src/lib/customer-messages";

function numeric(value) {
  if (value == null || value === "") return null;
  const count = Number(value);
  return Number.isFinite(count) ? count : null;
}

export function readListMeta(res) {
  const body = res?.data ?? res;
  const layers = [body?.data, body, body?.data?.data].filter(
    (layer) => layer && typeof layer === "object"
  );

  let items = [];
  if (Array.isArray(body?.data?.items)) items = body.data.items;
  else if (Array.isArray(body?.items)) items = body.items;
  else if (Array.isArray(body?.data?.data)) items = body.data.data;
  else if (Array.isArray(body?.data)) items = body.data;
  else if (Array.isArray(body)) items = body;

  let total = null;
  let lastPage = null;

  for (const layer of layers) {
    if (Array.isArray(layer)) continue;
    const pagination = layer.pagination ?? layer.meta;
    if (pagination && typeof pagination === "object" && !Array.isArray(pagination)) {
      total =
        total ??
        numeric(pagination.total ?? pagination.total_items ?? pagination.total_count);
      lastPage = lastPage ?? numeric(pagination.last_page);
    }
    if (layer.current_page != null || layer.last_page != null) {
      total = total ?? numeric(layer.total);
      lastPage = lastPage ?? numeric(layer.last_page);
    }
  }

  return { items, total, lastPage: lastPage ?? 1 };
}

function uniqueCount(items) {
  const ids = new Set();
  let anonymous = 0;
  for (const item of items) {
    if (item?.id == null) anonymous += 1;
    else ids.add(String(item.id));
  }
  return ids.size + anonymous;
}

async function loadGroup(path, params = {}) {
  const perPage = 100;

  let first;
  try {
    first = readListMeta(
      await axiosInstance.get(path, {
        params: { ...params, page: 1, per_page: perPage },
      })
    );
  } catch {
    const plain = readListMeta(await axiosInstance.get(path, { params }));
    return { items: plain.items, total: plain.total };
  }

  const items = [...first.items];
  const lastPage = Math.min(Math.max(first.lastPage || 1, 1), 20);

  if (lastPage > 1 && (first.total == null || items.length < first.total)) {
    for (let page = 2; page <= lastPage; page += 1) {
      const next = readListMeta(
        await axiosInstance.get(path, {
          params: { ...params, page, per_page: perPage },
        })
      );
      if (next.items.length === 0) break;
      items.push(...next.items);
    }
  }

  return { items, total: first.total };
}

export function countGroups(groups) {
  const items = groups.flatMap((group) => group.items);
  const unique = uniqueCount(items);
  const reported = groups.reduce(
    (sum, group) => sum + (group.total ?? group.items.length),
    0
  );

  if (reported <= items.length) return unique;

  const signatures = groups.map((group) =>
    group.items
      .map((item) => item?.id)
      .filter((id) => id != null)
      .map(String)
      .sort()
      .join(",")
  );
  const sameList =
    signatures.length > 1 &&
    signatures.every((signature) => signature && signature === signatures[0]);

  if (sameList) {
    return Math.max(...groups.map((group) => group.total ?? group.items.length), unique);
  }

  const complete = groups.every(
    (group) => group.total == null || group.items.length >= group.total
  );
  return complete ? unique : reported;
}

async function countList(path, params) {
  return countGroups([await loadGroup(path, params)]);
}

async function countBothContractTypes(path) {
  const groups = await Promise.all(
    ["housing", "commercial"].map((contractType) =>
      loadGroup(path, { contract_type: contractType })
    )
  );
  return countGroups(groups);
}

async function countAudienceLists(buildPath) {
  const groups = await Promise.all(
    ["client", "employee", "property"].map((type) => loadGroup(buildPath(type)))
  );
  return countGroups(groups);
}

const COUNT_SOURCES = [
  { id: "unit-types", queryFn: () => countBothContractTypes("/admin/unit-types") },
  { id: "unit-usage", queryFn: () => countBothContractTypes("/admin/unit-usages") },
  { id: "regions", queryFn: () => countList("/admin/regions") },
  { id: "cities", queryFn: () => countList("/admin/cities") },
  { id: "property-types", queryFn: () => countBothContractTypes("/admin/real-estate-types") },
  { id: "property-usage", queryFn: () => countBothContractTypes("/admin/real-estate-usages") },
  {
    id: "message-sections",
    queryFn: () =>
      countAudienceLists((type) => `/admin/message-alert-sections/${type}/options/list`),
  },
  {
    id: "message-section-items",
    queryFn: () =>
      Promise.all(
        ["client", "employee", "property"].map((type) =>
          loadGroup("/admin/message-alert-section-items", { type })
        )
      ).then(countGroups),
  },
  {
    id: "customer-app-messages",
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/customer-messages/all");
      const parsed = parseCustomerMessagesAll(res.data);
      return getMessagesByType(parsed.messages, "client").length;
    },
  },
  { id: "message-for-employee", queryFn: () => countList("/admin/message-alerts/employee") },
  { id: "message-for-property", queryFn: () => countList("/admin/message-alerts/property") },
  { id: "coupons", queryFn: () => countList("/admin/coupons") },
  { id: "faqs", queryFn: () => countList("/admin/faqs") },
  { id: "payment-types", queryFn: () => countBothContractTypes("/admin/payment-types") },
  { id: "tenant-roles", queryFn: () => countList("/admin/tenant-roles") },
  { id: "paperworks", queryFn: () => countBothContractTypes("/admin/paperworks") },
];

export function categorySubtitle(category, count) {
  if (!category?.countLabel) return category?.subtitle ?? "";
  if (typeof count === "number") return `${category.countLabel} · ${count} عنصر`;
  if (count === null) return `${category.countLabel} · …`;
  return category.countLabel;
}

async function fetchCategoryCounts(ids) {
  const wanted = new Set(ids);
  const entries = await Promise.all(
    COUNT_SOURCES.filter((source) => wanted.has(source.id)).map(async (source) => {
      try {
        return [source.id, await source.queryFn()];
      } catch {
        return [source.id, undefined];
      }
    })
  );
  return Object.fromEntries(entries);
}

export function useSettingsCategoryCounts(categoryIds = []) {
  const enabledKey = categoryIds.join("|");

  const query = useQuery({
    queryKey: ["settings-category-counts", enabledKey],
    queryFn: () => fetchCategoryCounts(enabledKey ? enabledKey.split("|") : []),
    enabled: Boolean(enabledKey),
    staleTime: 30_000,
  });

  if (query.data) return query.data;

  const pending = {};
  for (const id of categoryIds) {
    pending[id] = query.isError ? undefined : null;
  }
  return pending;
}
