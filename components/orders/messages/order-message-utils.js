export function normalizeMessageAlerts(response) {
  if (!response) return [];
  const data = response?.data ?? response;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

export function isMessageOnline(alert) {
  if (alert?.is_online === true || alert?.is_online === 1) return true;
  if (alert?.is_online === false || alert?.is_online === 0) return false;
  if (alert?.is_active === false || alert?.is_active === 0) return false;
  return true;
}

export function groupAlertsBySection(alerts) {
  const map = new Map();

  for (const alert of alerts) {
    const sectionId = alert?.section?.id ?? alert?.message_alert_section_id ?? "general";
    const sectionName =
      alert?.section?.name_ar || alert?.section?.name_en || "عام";

    if (!map.has(sectionId)) {
      map.set(sectionId, {
        id: sectionId,
        name: sectionName,
        items: [],
      });
    }
    map.get(sectionId).items.push(alert);
  }

  return Array.from(map.values());
}

export function getAlertDisplayName(alert) {
  return (
    alert?.section_item?.name_ar ||
    alert?.section_item?.name_en ||
    alert?.section?.name_ar ||
    alert?.section?.name_en ||
    "—"
  );
}

export function getAlertContractType(alert) {
  const sectionType = alert?.section?.contract_type ?? alert?.contract_type;
  if (sectionType === "housing" || sectionType === "commercial") return sectionType;

  const sectionName = alert?.section?.name_ar || alert?.section?.name_en || "";
  if (/تجار|commercial/i.test(sectionName)) return "commercial";
  if (/سكن|housing/i.test(sectionName)) return "housing";

  const itemName = getAlertDisplayName(alert);
  if (/^تجار|تجاري/i.test(itemName.trim())) return "commercial";
  if (/^سكن|سكني/i.test(itemName.trim())) return "housing";

  return "housing";
}

/** Sort contract variants: base → bank auth → waqf → paper → heirs → paper+heirs */
export function getContractVariantSortIndex(name = "") {
  const text = String(name).trim();
  if (/ورقي\s*\+\s*ورث|ورث.*ورقي|ورقي.*ورث/i.test(text)) return 5;
  if (/ورث/i.test(text)) return 4;
  if (/صك\s*ورقي|ورقي/i.test(text)) return 3;
  if (/وقف/i.test(text)) return 2;
  if (/تفويض|البنك/i.test(text)) return 1;
  if (/^(سكني|تجاري)$/i.test(text)) return 0;
  return 50;
}

export function groupAlertsByContractType(alerts = []) {
  const housing = [];
  const commercial = [];

  for (const alert of alerts) {
    const type = getAlertContractType(alert);
    if (type === "commercial") commercial.push(alert);
    else housing.push(alert);
  }

  const sortByVariant = (a, b) =>
    getContractVariantSortIndex(getAlertDisplayName(a)) -
    getContractVariantSortIndex(getAlertDisplayName(b));

  housing.sort(sortByVariant);
  commercial.sort(sortByVariant);

  return [
    { id: "housing", name: "سكني", items: housing },
    { id: "commercial", name: "تجاري", items: commercial },
  ];
}

