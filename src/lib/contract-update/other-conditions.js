export function normalizeOtherConditionsList(value) {
  if (!Array.isArray(value)) {
    if (value == null || value === "") return [];
    return [String(value)];
  }
  return value.map((item) => (item == null ? "" : String(item)));
}

export function sanitizeOtherConditionsList(value) {
  return normalizeOtherConditionsList(value)
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .slice(0, 50);
}

export function otherConditionsListEqual(a, b) {
  const left = sanitizeOtherConditionsList(a);
  const right = sanitizeOtherConditionsList(b);
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

/**
 * When conditions=true: require at least one non-empty condition (max 50).
 * @returns {Record<string, string>}
 */
export function validateOtherConditionsList(conditions, list) {
  const enabled = conditions === true || conditions === 1 || conditions === "1";
  if (!enabled) return {};

  const items = normalizeOtherConditionsList(list);
  if (items.length === 0) {
    return {
      other_conditions_list: "أضف شرطاً واحداً على الأقل",
    };
  }
  if (items.length > 50) {
    return {
      other_conditions_list: "الحد الأقصى 50 شرطاً",
    };
  }
  const filled = sanitizeOtherConditionsList(items);
  if (filled.length === 0) {
    return {
      other_conditions_list: "أدخل نص الشرط قبل الحفظ",
    };
  }
  const emptyIndex = items.findIndex((item) => item.trim() === "");
  if (emptyIndex >= 0) {
    return {
      [`other_conditions_list.${emptyIndex}`]: "نص الشرط مطلوب",
      other_conditions_list: "املأ كل حقول الشروط أو احذف الفارغ منها",
    };
  }
  return {};
}
