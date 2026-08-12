import {
  AlertCircle,
  CheckCircle2,
  Undo2,
  UserRound,
} from "lucide-react";

/** Mock data for realtime-orders UI (replace with API later). */

function minutesAgo(mins) {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

function hoursAgo(hours) {
  return minutesAgo(hours * 60);
}

function daysAgo(days) {
  return hoursAgo(days * 24);
}

export const MOCK_NEW_REQUESTS = [
  {
    id: 990030,
    uuid: "990030",
    contract_type: "سكني",
    contract_type_key: "housing",
    status_label: "طلب جديد",
    status_kind: "new",
    waiting_minutes: 44,
  },
  {
    id: 990029,
    uuid: "990029",
    contract_type: "تجاري",
    contract_type_key: "commercial",
    status_label: "طلب جديد",
    status_kind: "new",
    waiting_minutes: 40,
  },
  {
    id: 990028,
    uuid: "990028",
    contract_type: "سكني",
    contract_type_key: "housing",
    status_label: "طلب مسودة",
    status_kind: "draft",
    waiting_minutes: 36,
  },
  {
    id: 990027,
    uuid: "990027",
    contract_type: "تجاري",
    contract_type_key: "commercial",
    status_label: "طلب مسودة",
    status_kind: "draft",
    waiting_minutes: 33,
  },
  {
    id: 990026,
    uuid: "990026",
    contract_type: "سكني",
    contract_type_key: "housing",
    status_label: "طلب جديد",
    status_kind: "new",
    waiting_minutes: 31,
  },
  {
    id: 990025,
    uuid: "990025",
    contract_type: "تجاري",
    contract_type_key: "commercial",
    status_label: "طلب جديد",
    status_kind: "new",
    waiting_minutes: 28,
  },
  {
    id: 990024,
    uuid: "990024",
    contract_type: "سكني",
    contract_type_key: "housing",
    status_label: "طلب مسودة",
    status_kind: "draft",
    waiting_minutes: 22,
  },
  {
    id: 990023,
    uuid: "990023",
    contract_type: "تجاري",
    contract_type_key: "commercial",
    status_label: "طلب جديد",
    status_kind: "new",
    waiting_minutes: 18,
  },
  {
    id: 990022,
    uuid: "990022",
    contract_type: "سكني",
    contract_type_key: "housing",
    status_label: "طلب جديد",
    status_kind: "new",
    waiting_minutes: 12,
  },
  {
    id: 990021,
    uuid: "990021",
    contract_type: "تجاري",
    contract_type_key: "commercial",
    status_label: "طلب مسودة",
    status_kind: "draft",
    waiting_minutes: 8,
  },
  {
    id: 990020,
    uuid: "990020",
    contract_type: "سكني",
    contract_type_key: "housing",
    status_label: "طلب جديد",
    status_kind: "new",
    waiting_minutes: 5,
  },
  {
    id: 990019,
    uuid: "990019",
    contract_type: "تجاري",
    contract_type_key: "commercial",
    status_label: "طلب جديد",
    status_kind: "new",
    waiting_minutes: 3,
  },
  ...Array.from({ length: 24 }, (_, i) => {
    const n = 990018 - i;
    const mins = 2 + (i % 50);
    const isDraft = i % 3 === 0;
    const isHousing = i % 2 === 0;
    return {
      id: n,
      uuid: String(n),
      contract_type: isHousing ? "سكني" : "تجاري",
      contract_type_key: isHousing ? "housing" : "commercial",
      status_label: isDraft ? "طلب مسودة" : "طلب جديد",
      status_kind: isDraft ? "draft" : "new",
      waiting_minutes: mins,
    };
  }),
];

export const MOCK_REALTIME_ORDERS = [
  {
    id: 48347,
    uuid: "48347",
    contract_type: "سكني",
    contract_type_key: "housing",
    is_draft: false,
    user_mobile: "0555123456",
    instrument_type: "صك إلكتروني - وزارة العدل",
    is_paid: true,
    amount_payment: 249,
    received_at: daysAgo(8),
    status_name: "مستلم",
    employee_name: "ريان (أنت)",
  },
  {
    id: 48346,
    uuid: "48346",
    contract_type: "تجاري",
    contract_type_key: "commercial",
    is_draft: true,
    user_mobile: "0509876543",
    instrument_type: "صك ورقي - كتابة العدل",
    is_paid: false,
    amount_payment: 0,
    received_at: hoursAgo(3),
    status_name: "ينتظر مسودة العقد",
    employee_name: "سارة",
  },
  {
    id: 48345,
    uuid: "48345",
    contract_type: "سكني",
    contract_type_key: "housing",
    is_draft: false,
    user_mobile: "0541122334",
    instrument_type: "صك إلكتروني - وزارة العدل",
    is_paid: true,
    amount_payment: 349,
    received_at: hoursAgo(5),
    status_name: "مرفوع تحديث العقار",
    employee_name: "أحمد",
  },
  {
    id: 48344,
    uuid: "48344",
    contract_type: "تجاري",
    contract_type_key: "commercial",
    is_draft: false,
    user_mobile: "0567788990",
    instrument_type: "عقد إيجار موحد",
    is_paid: true,
    amount_payment: 199,
    received_at: daysAgo(1),
    status_name: "مستلم",
    employee_name: "ريان (أنت)",
  },
  {
    id: 48343,
    uuid: "48343",
    contract_type: "سكني",
    contract_type_key: "housing",
    is_draft: true,
    user_mobile: "0533344556",
    instrument_type: "صك إلكتروني - وزارة العدل",
    is_paid: false,
    amount_payment: 0,
    received_at: hoursAgo(12),
    status_name: "ينتظر مسودة العقد",
    employee_name: "نورة",
  },
  {
    id: 48342,
    uuid: "48342",
    contract_type: "تجاري",
    contract_type_key: "commercial",
    is_draft: false,
    user_mobile: "0580011223",
    instrument_type: "صك ورقي - كتابة العدل",
    is_paid: true,
    amount_payment: 499,
    received_at: daysAgo(2),
    status_name: "مستلم",
    employee_name: "خالد",
  },
  {
    id: 48341,
    uuid: "48341",
    contract_type: "سكني",
    contract_type_key: "housing",
    is_draft: false,
    user_mobile: "0512233445",
    instrument_type: "صك إلكتروني - وزارة العدل",
    is_paid: true,
    amount_payment: 249,
    received_at: hoursAgo(1),
    status_name: "مرفوع تحديث العقار",
    employee_name: "ريان (أنت)",
  },
  {
    id: 48340,
    uuid: "48340",
    contract_type: "تجاري",
    contract_type_key: "commercial",
    is_draft: false,
    user_mobile: "0599988776",
    instrument_type: "عقد إيجار موحد",
    is_paid: false,
    amount_payment: 0,
    received_at: daysAgo(4),
    status_name: "مستلم",
    employee_name: "فهد",
  },
];

/** Filter pills with Lucide icons (no emojis). */
export const STATUS_FILTER_PILLS = [
  { id: "authenticated", label: "موثق", Icon: CheckCircle2 },
  { id: "myFiles", label: "ملفي", Icon: UserRound },
  { id: "returned", label: "مسترجع", Icon: Undo2 },
  { id: "incomplete", label: "طلب غير مكتمل", Icon: AlertCircle },
];
