import { isDraftOrderRow } from "@/src/lib/draft-contract-statuses";

export const FILTER_TABS = [
  { id: "all", label: "الكل" },
  { id: "completed", label: "مكتمل" },
  { id: "draft", label: "مسودة" },
  { id: "returned", label: "مسترجع" },
  { id: "canceled", label: "ملغي" },
  { id: "processing", label: "قيد المعالجة" },
];

export const STAT_DEFS = [
  { key: "completed", label: "مكتمل", bar: "#10B981", barDark: "#34D399" },
  { key: "draft", label: "مسودة", bar: "#94A3B8", barDark: "#94A3B8" },
  { key: "incomplete", label: "غير مكتمل", bar: "#F97316", barDark: "#FB923C" },
  { key: "properties", label: "عقارات", bar: "#0B5345", barDark: "#34D399" },
  { key: "units", label: "وحدات", bar: "#0B5345", barDark: "#6EE7B7" },
  {
    key: "refundedAmount",
    label: "مسترجع (ر.س)",
    bar: "#EF4444",
    barDark: "#F87171",
    money: true,
  },
  {
    key: "paid",
    label: "مدفوع (ر.س)",
    bar: "#14B8A6",
    barDark: "#2DD4BF",
    money: true,
  },
  {
    key: "net",
    label: "الصافي (ر.س)",
    bar: "#0D9488",
    barDark: "#5EEAD4",
    money: true,
  },
];

export function formatMoney(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US");
}

/** API sends `joined_at` as `YYYY-MM-DD HH:mm` (no timezone). */
export function splitJoinedDateTime(value) {
  if (!value) return { time: "—", date: "—" };
  const match = String(value).trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  if (match) return { date: match[1], time: match[2] };

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { time: "—", date: String(value) };
  return {
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }),
    date: d.toLocaleDateString("en-CA"),
  };
}

export function formatJoinedLabel(iso) {
  const { date, time } = splitJoinedDateTime(iso);
  if (date === "—" && time === "—") return "—";
  if (time === "—") return date;
  return `${date} · ${time}`;
}

export function formatJoinedShort(iso) {
  return splitJoinedDateTime(iso).date;
}

export function whatsappHref(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0")
    ? `966${digits.slice(1)}`
    : digits.startsWith("966")
      ? digits
      : `966${digits}`;
  return `https://wa.me/${normalized}`;
}

/** Best-effort status bucket for the filter tabs — mirrors the substring conventions
 *  already used by src/lib/contract-statuses.js (no canonical status enum from the API). */
export function classifyOrderStatus(order = {}) {
  const statusName = order?.status?.name || order?.status_name || "";
  if (order?.return_contract === true || /مسترجع|استرجاع/.test(statusName)) {
    return "returned";
  }
  if (/ملغ/.test(statusName)) return "canceled";
  if (isDraftOrderRow(order)) return "draft";
  if (order?.is_completed) return "completed";
  return "processing";
}
