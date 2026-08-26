import { axiosInstance } from "@/src/utils/axios";

export function contractTypeLabel(type) {
  if (type === "commercial") return "تجاري";
  if (type === "housing") return "سكني";
  return type || "—";
}

export function extractItems(res) {
  return res?.data?.data?.items ?? [];
}

export function extractAlertList(res) {
  const body = res?.data;
  if (Array.isArray(body?.data?.items)) return body.data.items;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  return [];
}

export const AUDIENCE_LABELS = {
  client: "عميل",
  employee: "موظف",
  property: "عقار",
};

export function audienceLabel(type) {
  return AUDIENCE_LABELS[type] || type || "—";
}

export async function fetchAudienceLists(buildUrl, extract) {
  const types = ["client", "employee", "property"];
  const results = await Promise.all(
    types.map(async (type) => {
      const res = await axiosInstance.get(buildUrl(type));
      return (extract(res) || []).map((item) => ({
        ...item,
        type: item.type || type,
      }));
    })
  );
  return results.flat();
}

export async function fetchBothContractTypes(path, extract = extractItems) {
  const [housingRes, commercialRes] = await Promise.all([
    axiosInstance.get(path, { params: { contract_type: "housing", per_page: 100 } }),
    axiosInstance.get(path, { params: { contract_type: "commercial", per_page: 100 } }),
  ]);

  const housing = (extract(housingRes) || []).map((item) => ({
    ...item,
    contract_type: item.contract_type || "housing",
  }));
  const commercial = (extract(commercialRes) || []).map((item) => ({
    ...item,
    contract_type: item.contract_type || "commercial",
  }));

  return [...housing, ...commercial];
}
