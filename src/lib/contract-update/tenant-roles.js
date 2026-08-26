export function parseTenantRoleIds(value) {
  if (Array.isArray(value)) {
    return value.map((v) => parseInt(String(v), 10)).filter((n) => !Number.isNaN(n));
  }
  if (value === null || value === undefined || value === "") return [];
  return String(value)
    .split(/[,،]/)
    .map((v) => parseInt(v.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

export function tenantRoleIdsEqual(a, b) {
  const left = [...parseTenantRoleIds(a)].sort((x, y) => x - y);
  const right = [...parseTenantRoleIds(b)].sort((x, y) => x - y);
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function normalizeTenantRoleValues(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [String(key), val === null || val === undefined ? "" : String(val)])
  );
}

export function tenantRoleValuesEqual(a, b) {
  const left = normalizeTenantRoleValues(a);
  const right = normalizeTenantRoleValues(b);
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key, index) => key === rightKeys[index] && String(left[key] ?? "") === String(right[key] ?? ""));
}

/** Keep only values for selected role ids (non-empty). */
export function filterTenantRoleValuesForIds(values, ids) {
  const idSet = new Set(parseTenantRoleIds(ids).map(String));
  const src = normalizeTenantRoleValues(values);
  const out = {};
  for (const [key, val] of Object.entries(src)) {
    if (!idSet.has(key)) continue;
    if (val.trim() === "") continue;
    out[key] = val.trim();
  }
  return out;
}

/**
 * Validate selected roles that require user input.
 * @returns {Record<string, string>} field errors
 */
export function validateTenantRoleSelection(ids, values, roles = []) {
  const errors = {};
  const byId = Object.fromEntries(
    (roles || []).filter((role) => role?.id != null).map((role) => [String(role.id), role])
  );
  const normalizedValues = normalizeTenantRoleValues(values);

  for (const id of parseTenantRoleIds(ids)) {
    const role = byId[String(id)];
    if (!role?.has_user_input) continue;
    const raw = normalizedValues[String(id)];
    const label = role.input_field_label || role.text_of_reason || role.name || String(id);
    if (raw == null || String(raw).trim() === "") {
      errors[`tenant_role_values.${id}`] = `${label}: مطلوب`;
      continue;
    }
    if (role.input_field_type === "number" && Number.isNaN(Number(String(raw).trim()))) {
      errors[`tenant_role_values.${id}`] = `${label}: يجب أن يكون رقماً`;
    }
  }

  return errors;
}
