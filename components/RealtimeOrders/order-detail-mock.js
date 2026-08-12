export const MOCK_ORDER_STATUSES = [
  { id: "new", label: "طلب جديد", color: "#6B7280" },
  { id: "received", label: "مستلم", color: "#7C3AED" },
  { id: "property_update", label: "مرفوع تحديث العقار", color: "#CA8A04" },
  { id: "awaiting_draft", label: "ينتظر مسودة العقد", color: "#92400E" },
  { id: "ejar", label: "موثق في إيجار", color: "#15803D" },
  { id: "returned", label: "مسترجع", color: "#64748B" },
  { id: "canceled", label: "ملغي", color: "#EA580C" },
];

export function statusIdFromLabel(label = "") {
  const found = MOCK_ORDER_STATUSES.find((s) => s.label === label);
  return found?.id ?? "received";
}

export function getMockOrderDetail(id) {
  const uuid = String(id ?? "48347");
  return {
    id: Number(uuid) || 48347,
    uuid,
    contract_type: "سكني",
    contract_type_key: "housing",
    instrument_type: "صك إلكتروني - وزارة العدل",
    status_id: "awaiting_draft",
    status_name: "ينتظر مسودة العقد",
    is_paid: true,
    amount_payment: 249,
    user_mobile: "0554567814",
    employee_name: "ريان",
    received_at: new Date().toISOString(),
    banner:
      "أرسلت المسودة واتساب اليوم 16:10 - بانتظار قرار العميل",
    deed: {
      type_label: "صك ملكية إلكتروني من وزارة العدل",
      type: "ملكية",
      number: "3104434799",
      owner_id: "1088776655",
      owner_phone: "0551234567",
      file_name: `deed_${uuid}.pdf`,
    },
    national_address: {
      source: "إدخال يدوي",
      city: "الرياض",
      district: "النخيل",
      building: "3007",
      additional: "6108",
      zip: "12345",
    },
    tenant: {
      type_label: "فرد",
      is_agent: false,
      cr_number: null,
      phone: "0559876543",
      agency_ok: false,
    },
    financial: {
      paid: true,
      payment_method: "دفع مباشر",
      missing_count: 1,
      start_date: "",
      duration: "12 شهر",
      frequency: "شهري - 12 قسط",
      rent: 24000,
      fees: 249,
      fees_paid: true,
    },
    guarantees: {
      amount: 5000,
      note: "تُحفظ لدى إيجار",
    },
    units: [
      {
        id: 1,
        title: "الوحدة 1",
        badge: "شقة",
        number: "12",
        type: "شقة",
        use: "سكني",
        floor: "1",
        area: "90 م²",
        rooms: "2",
        bathrooms: "1",
        kitchens: "1",
        ac: "مركبة",
        furnished: "لا",
      },
    ],
    notes: [],
  };
}
