export const PLATFORM = {
  website: {
    id: "website",
    label: "عملاء الموقع",
    badgeClass:
      "bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-300",
    bar: "#0B5345",
  },
  google_play: {
    id: "google_play",
    label: "عملاء جوجل بلاي",
    badgeClass:
      "bg-[#DBEAFE] text-[#1D4ED8] dark:bg-blue-500/20 dark:text-blue-300",
    bar: "#3B82F6",
  },
  app_store: {
    id: "app_store",
    label: "عملاء آبل ستور",
    badgeClass:
      "bg-[#F3F4F6] text-[#4B5563] dark:bg-white/10 dark:text-white/70",
    bar: "#6B7280",
  },
};

/** Seed rows from the design screenshot, then padded to 56 for pagination. */
const SEED_CLIENTS = [
  {
    id: "c-1041",
    clientCode: "C-1041",
    name: "سعد محمد الغنام",
    mobile: "0554567814",
    joinedAt: "2026-07-10T14:32:00",
    platform: "website",
    forProgrammer: true,
    completed: 6,
    draft: 2,
    incomplete: 1,
    properties: 15,
    units: 15,
    returned: 1,
    paid: 4057,
    net: 1584,
    blocked: false,
  },
  {
    id: "c-1038",
    clientCode: "C-1038",
    name: "نورة القحطاني",
    mobile: "966551112233",
    joinedAt: "2026-03-12T09:15:00",
    platform: "google_play",
    forProgrammer: true,
    completed: 1,
    draft: 2,
    properties: 0,
    units: 1,
    returned: 1,
    paid: 150,
    net: 90,
    blocked: false,
  },
  {
    id: "c-1022",
    clientCode: "C-1022",
    name: "خالد العتيبي",
    mobile: "966540001122",
    joinedAt: "2026-03-05T18:40:00",
    platform: "app_store",
    forProgrammer: false,
    completed: 0,
    draft: 1,
    properties: 0,
    units: 0,
    returned: 0,
    paid: 0,
    net: 0,
    blocked: false,
  },
  {
    id: "c-1055",
    clientCode: "C-1055",
    name: "سارة الدوسري",
    mobile: "966530998877",
    joinedAt: "2026-03-14T11:05:00",
    platform: "website",
    forProgrammer: false,
    completed: 5,
    draft: 0,
    properties: 2,
    units: 4,
    returned: 0,
    paid: 980.5,
    net: 980.5,
    blocked: false,
  },
  {
    id: "c-1010",
    clientCode: "C-1010",
    name: "فهد المطيري",
    mobile: "966555667788",
    joinedAt: "2026-03-01T16:22:00",
    platform: "google_play",
    forProgrammer: true,
    completed: 2,
    draft: 1,
    properties: 1,
    units: 1,
    returned: 0,
    paid: 300,
    net: 300,
    blocked: false,
  },
];

const EXTRA_NAMES = [
  "محمد الشهري",
  "لطيفة الحربي",
  "عبدالله الزهراني",
  "ريم العتيبي",
  "يوسف القحطاني",
  "هند الغامدي",
  "سلمان الدوسري",
  "منى الراشد",
  "تركي العنزي",
  "جواهر السبيعي",
  "ماجد البلوي",
  "أمل الشمري",
  "فيصل الحارثي",
  "نوف العسيري",
  "بندر الخليفي",
];

const PLATFORMS = ["website", "google_play", "app_store"];

function padClients(target = 56) {
  const list = [...SEED_CLIENTS];
  let n = 1060;
  while (list.length < target) {
    const i = list.length;
    const platform = PLATFORMS[i % 3];
    const completed = i % 7;
    const draft = i % 4;
    const returned = i % 11 === 0 ? 1 : 0;
    const paid = completed * 85 + (i % 3) * 12.5;
    list.push({
      id: `c-${n}`,
      clientCode: `C-${n}`,
      name: EXTRA_NAMES[i % EXTRA_NAMES.length],
      mobile: `9665${String(10000000 + i * 137).slice(0, 8)}`,
      joinedAt: `2026-02-${String((i % 28) + 1).padStart(2, "0")}T${String(8 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00`,
      platform,
      forProgrammer: i % 9 === 0,
      completed,
      draft,
      properties: i % 3,
      units: i % 5,
      returned,
      paid,
      net: Math.max(0, paid - returned * 60),
      blocked: false,
    });
    n += 1;
  }
  return list;
}

export const MOCK_CLIENTS = padClients(56);

export const MOCK_CLIENT_STATS = {
  total: 56,
  blocked: 0,
  website: 21,
  google_play: 24,
  app_store: 11,
};

/** Order status keys used on the client file page. */
export const CLIENT_ORDER_STATUS = {
  completed: {
    id: "completed",
    label: "موثق في إيجار",
    filterLabel: "مكتمل",
    dot: "#10B981",
    text: "text-[#059669] dark:text-emerald-300",
  },
  draft: {
    id: "draft",
    label: "ينتظر مسودة العقد",
    filterLabel: "مسودة",
    dot: "#F59E0B",
    text: "text-[#D97706] dark:text-amber-300",
  },
  incomplete: {
    id: "incomplete",
    label: "غير مكتمل",
    filterLabel: "غير مكتمل",
    dot: "#F97316",
    text: "text-[#EA580C] dark:text-orange-300",
  },
  returned: {
    id: "returned",
    label: "مسترجع",
    filterLabel: "مسترجع",
    dot: "#EF4444",
    text: "text-[#DC2626] dark:text-rose-300",
  },
  canceled: {
    id: "canceled",
    label: "ملغي",
    filterLabel: "ملغي",
    dot: "#EF4444",
    text: "text-[#DC2626] dark:text-rose-300",
  },
  processing: {
    id: "processing",
    label: "مستلم",
    filterLabel: "قيد المعالجة",
    dot: "#8B5CF6",
    text: "text-[#7C3AED] dark:text-violet-300",
  },
};

const DETAIL_ORDERS_1041 = [
  { id: 48340, type: "سكني", status: "completed", fee: 249 },
  { id: 48339, type: "سكني", status: "completed", fee: 249 },
  { id: 48338, type: "تجاري", status: "processing", fee: 249 },
  { id: 48337, type: "تجاري", status: "canceled", fee: 249 },
  { id: 48336, type: "سكني", status: "draft", fee: 249 },
  { id: 48335, type: "سكني", status: "draft", fee: 249 },
  { id: 48334, type: "سكني", status: "completed", fee: 249 },
  { id: 48333, type: "تجاري", status: "completed", fee: 380 },
  { id: 48332, type: "سكني", status: "completed", fee: 249 },
  { id: 48331, type: "سكني", status: "completed", fee: 249 },
  { id: 48330, type: "تجاري", status: "processing", fee: 380 },
  { id: 48329, type: "سكني", status: "processing", fee: 249 },
  { id: 48328, type: "سكني", status: "processing", fee: 249 },
  { id: 48327, type: "تجاري", status: "incomplete", fee: 249 },
  { id: 48326, type: "سكني", status: "returned", fee: 249 },
  { id: 48325, type: "سكني", status: "processing", fee: 249 },
];

/**
 * Base client-file payload (orders + list stats). Property counts are enriched
 * separately so the properties page always has preview data.
 */
function buildMockClientDetailBase(clientId) {
  const listRow = MOCK_CLIENTS.find(
    (c) => String(c.id) === String(clientId) || String(c.clientCode) === String(clientId)
  );

  if (String(clientId) === "c-1041" || listRow?.id === "c-1041") {
    const client = listRow || SEED_CLIENTS[0];
    return {
      client: {
        ...client,
        initial: "س",
        displayPhone: "0554567814",
      },
      stats: {
        completed: 6,
        draft: 2,
        incomplete: 1,
        properties: 15,
        units: 15,
        returned: 249,
        paid: 4057,
        net: 1584,
      },
      orders: DETAIL_ORDERS_1041,
      notice:
        "للمبرمج: هذه الشاشة تستخدم بيانات تجريبية محلية حتى ربط واجهة ملف العميل بالـ API.",
    };
  }

  if (!listRow) return null;

  const completed = listRow.completed || 0;
  const draft = listRow.draft || 0;
  const incomplete = listRow.incomplete || 0;
  const returnedCount = listRow.returned > 0 && listRow.returned < 20 ? listRow.returned : listRow.returned ? 1 : 0;
  const orders = [];
  let oid = 40000 + (Number(String(listRow.id).replace(/\D/g, "")) || 1000);

  for (let i = 0; i < completed; i++) {
    orders.push({
      id: oid++,
      type: i % 2 === 0 ? "سكني" : "تجاري",
      status: "completed",
      fee: 249,
    });
  }
  for (let i = 0; i < draft; i++) {
    orders.push({
      id: oid++,
      type: "سكني",
      status: "draft",
      fee: 249,
    });
  }
  for (let i = 0; i < incomplete; i++) {
    orders.push({
      id: oid++,
      type: "سكني",
      status: "incomplete",
      fee: 249,
    });
  }
  for (let i = 0; i < returnedCount; i++) {
    orders.push({
      id: oid++,
      type: "سكني",
      status: "returned",
      fee: 249,
    });
  }
  if (orders.length === 0) {
    orders.push({
      id: oid,
      type: "سكني",
      status: "processing",
      fee: 0,
    });
  }

  return {
    client: {
      ...listRow,
      initial: (listRow.name || "؟").trim().charAt(0),
      displayPhone: listRow.mobile,
    },
    stats: {
      completed: listRow.completed || 0,
      draft: listRow.draft || 0,
      incomplete: listRow.incomplete || 0,
      properties: listRow.properties || 0,
      units: listRow.units || 0,
      returned: listRow.returned || 0,
      paid: listRow.paid || 0,
      net: listRow.net || 0,
    },
    orders,
    notice:
      "للمبرمج: هذه الشاشة تستخدم بيانات تجريبية محلية حتى ربط واجهة ملف العميل بالـ API.",
  };
}

export function getMockClientDetail(clientId) {
  const detail = buildMockClientDetailBase(clientId);
  if (!detail) return null;

  const propsData = getMockClientProperties(clientId);
  if (propsData?.totals) {
    detail.stats.properties = propsData.totals.properties;
    detail.stats.units = propsData.totals.units;
  }

  return detail;
}

const DISTRICTS = [
  "النخيل",
  "الملقا",
  "الياسمين",
  "العارض",
  "الصحافة",
  "الروضة",
  "السليمانية",
  "النرجس",
];
const UNIT_TYPES = ["شقة", "دور", "محل", "مكتب", "فيلا"];

function buildProperty({
  id,
  city = "الرياض",
  district,
  buildingNumber,
  orderId,
  addedAt,
  deedNumber,
  ownerId,
  ownerMobile,
  units,
  street = "–",
  propertyName = "–",
  documentType = "صك ملكية إلكتروني من وزارة العدل",
  region = "منطقة الرياض",
}) {
  return {
    id,
    title: `${city} – حي ${district}`,
    city,
    district,
    street,
    buildingNumber: String(buildingNumber),
    addedAt,
    orderId,
    propertyName,
    documentType,
    deedNumber: String(deedNumber),
    region,
    ownerId: String(ownerId),
    ownerMobile: String(ownerMobile),
    units,
  };
}

const PROPERTIES_1041 = [
  buildProperty({
    id: "p-1041-1",
    district: "النخيل",
    buildingNumber: 3000,
    orderId: 48340,
    addedAt: "2026-07-10",
    deedNumber: "3104434099",
    ownerId: "1045567789",
    ownerMobile: "0554567814",
    units: [
      {
        id: "u-1041-1",
        type: "شقة",
        number: "5",
        area: 90,
        floor: "2",
        rooms: 3,
        usage: "سكني",
      },
    ],
  }),
  ...Array.from({ length: 14 }, (_, i) => {
    const n = i + 2;
    const district = DISTRICTS[i % DISTRICTS.length];
    const unitType = UNIT_TYPES[i % UNIT_TYPES.length];
    return buildProperty({
      id: `p-1041-${n}`,
      district,
      buildingNumber: 1000 + n * 37,
      orderId: 48340 - n,
      addedAt: `2026-0${(n % 9) + 1}-${String((n % 27) + 1).padStart(2, "0")}`,
      deedNumber: String(3104434100 + n),
      ownerId: "1045567789",
      ownerMobile: "0554567814",
      units: [
        {
          id: `u-1041-${n}`,
          type: unitType,
          number: String((n % 20) + 1),
          area: 60 + (n % 8) * 15,
          floor: String((n % 5) + 1),
          rooms: (n % 4) + 1,
          usage: unitType === "محل" || unitType === "مكتب" ? "تجاري" : "سكني",
        },
      ],
    });
  }),
];

function resolvePropertyCounts(stats) {
  let propertyCount = Math.max(0, Number(stats?.properties) || 0);
  let unitCount = Math.max(0, Number(stats?.units) || 0);

  if (propertyCount === 0) {
    propertyCount = 1;
    unitCount = Math.max(1, unitCount);
  } else if (unitCount === 0) {
    unitCount = propertyCount;
  }

  return { propertyCount, unitCount };
}

function generatePropertiesForClient(client, propertyCount, unitCount, orders = []) {
  const properties = [];
  const numericId = Number(String(client.id).replace(/\D/g, "")) || 1000;
  const firstOrderId = orders[0]?.id ?? 48000 + numericId;
  const addedAt = client.joinedAt?.slice(0, 10) || "2026-01-01";
  const ownerMobile = client.displayPhone || client.mobile || "0500000000";

  for (let i = 0; i < propertyCount; i++) {
    const district = DISTRICTS[i % DISTRICTS.length];
    const unitsForProp =
      i < propertyCount - 1
        ? Math.max(1, Math.floor(unitCount / propertyCount))
        : Math.max(
            1,
            unitCount -
              Math.max(1, Math.floor(unitCount / propertyCount)) *
                Math.max(propertyCount - 1, 0)
          );

    const units = Array.from({ length: unitsForProp }, (_, u) => {
      const unitType = UNIT_TYPES[(i + u) % UNIT_TYPES.length];
      return {
        id: `u-${client.id}-${i}-${u}`,
        type: unitType,
        number: String(u + 1),
        area: 70 + ((i + u) % 6) * 10,
        floor: String((u % 4) + 1),
        rooms: (u % 3) + 1,
        usage: unitType === "محل" || unitType === "مكتب" ? "تجاري" : "سكني",
      };
    });

    properties.push(
      buildProperty({
        id: `p-${client.id}-${i + 1}`,
        district,
        buildingNumber: 2000 + i * 11 + (numericId % 100),
        orderId: firstOrderId - i,
        addedAt,
        deedNumber: String(3100000000 + numericId + i * 17),
        ownerId: String(1000000000 + (numericId % 900000000)),
        ownerMobile,
        units,
      })
    );
  }

  return properties;
}

/**
 * Client properties & units page payload.
 */
export function getMockClientProperties(clientId) {
  const detail = buildMockClientDetailBase(clientId);
  if (!detail) return null;

  const { client, stats, orders } = detail;

  if (String(client.id) === "c-1041") {
    return {
      client,
      properties: PROPERTIES_1041,
      totals: {
        properties: PROPERTIES_1041.length,
        units: PROPERTIES_1041.reduce((sum, p) => sum + p.units.length, 0),
      },
    };
  }

  const { propertyCount, unitCount } = resolvePropertyCounts(stats);
  const properties = generatePropertiesForClient(
    client,
    propertyCount,
    unitCount,
    orders
  );

  return {
    client,
    properties,
    totals: {
      properties: properties.length,
      units: properties.reduce((sum, p) => sum + p.units.length, 0),
    },
  };
}
