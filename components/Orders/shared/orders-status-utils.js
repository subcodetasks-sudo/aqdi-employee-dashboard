const BADGE_BASE = "px-3 py-1 rounded-full text-11 font-bold whitespace-nowrap";

/** Contract/document badge colors matching the orders table design. */
export function getContractTypeBadgeClass(row = {}) {
  const isHousing =
    row?.contract_type_key === "housing" ||
    row?.contract_type === "سكنـi" ||
    row?.contract_type === "سكني";

  if (isHousing) {
    return `${BADGE_BASE} bg-[#F0E6FF] text-[#4338CA]`;
  }

  return `${BADGE_BASE} bg-[#FFE6F0] text-[#BE185D]`;
}

export function getDocumentTypeBadgeClass() {
  return `${BADGE_BASE} bg-[#F0E6FF] text-[#4338CA]`;
}

/** Status badge colors matching the orders table design. */
export function getOrderStatusBadgeStyle(name = "", apiColor) {
  const text = String(name).trim();

  if (text.includes("معالجة")) {
    return { backgroundColor: "#E6FFE6", color: "#007C13" };
  }
  if (text.includes("مستلم")) {
    return { backgroundColor: "#F0E6FF", color: "#4338CA" };
  }
  if (text.includes("تأكيد") && text.includes("عقار")) {
    return { backgroundColor: "#F0E6FF", color: "#4338CA" };
  }
  if (text.includes("إجراء") && text.includes("عميل")) {
    return { backgroundColor: "#E8E8FF", color: "#4338CA" };
  }
  if (text.includes("تم تأكيد")) {
    return { backgroundColor: "#FFF4E6", color: "#EA580C" };
  }
  if (text.includes("اعتماد")) {
    return { backgroundColor: "#FFE6F0", color: "#BE185D" };
  }
  if (text.includes("أخرى")) {
    return { backgroundColor: "#E6FFFA", color: "#0D9488" };
  }
  if (text.includes("واتساب") && (text.includes("غير") || text.includes("غير مكتمل"))) {
    return { backgroundColor: "#FEE2E2", color: "#DC2626" };
  }

  if (apiColor) {
    return {
      backgroundColor: `${apiColor}26`,
      color: apiColor,
    };
  }

  return { backgroundColor: "#F5F5F5", color: "#4338CA" };
}
