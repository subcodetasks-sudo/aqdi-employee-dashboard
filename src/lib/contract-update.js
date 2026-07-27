/** Flat API field keys allowed per admin contract step */
export const CONTRACT_STEP_KEYS = {
  summary: [
    "contract_type",
    "instrument_type",
    "contract_period_id",
    "name_owner",
    "property_owner_id_num",
    "property_owner_mobile",
    "property_owner_iban",
    "property_owner_dob",
    "type_dob_property_owner",
    "add_legal_agent_of_owner",
    "id_num_of_property_owner_agent",
    "mobile_of_property_owner_agent",
    "dob_of_property_owner_agent",
    "type_dob_property_owner_agent",
    "notes_edits",
  ],
  step1: [
    "property_place_id",
    "property_city_id",
    "neighborhood",
    "street",
    "building_number",
    "postal_code",
    "extra_figure",
    "latitude",
    "longitude",
    "address_url",
  ],
  step2: [
    "unit_type_id",
    "unit_usage_id",
    "unit_number",
    "floor_number",
    "unit_area",
    "tootal_rooms",
    "number_of_rooms",
    "The_number_of_halls",
    "The_number_of_kitchens",
    "The_number_of_toilets",
    "The_number_of_the_toilet",
    "window_ac",
    "split_ac",
    "kitchen_tank",
    "furnished",
    "type_furnished",
    "electricity_meter",
    "electricity_meter_number",
    "electricity_meter_ownership",
    "water_meter",
    "water_meter_number",
    "water_meter_ownership",
  ],
  step3: [
    "tenant_entity",
    "tenant_id_num",
    "tenant_dob",
    "tenant_dob_day",
    "tenant_dob_month",
    "tenant_dob_year",
    "tenant_mobile",
    "type_tenant_dob",
    "tenant_entity_unified_registry_number",
    "authorization_type",
    "id_num_of_property_tenant_agent",
    "id_number_of_property_tenant_agent",
    "type_dob_tenant_agent",
    "dob_of_property_tenant_agent",
    "dob_of_property_tenant_agent_day",
    "dob_of_property_tenant_agent_month",
    "dob_of_property_tenant_agent_year",
    "mobile_of_property_tenant_agent",
    "notes",
  ],
  step4: [
    "contract_starting_date",
    "type_contract_starting_date",
    "contract_term_in_years",
    "duration_preset",
    "duration_years",
    "duration_months",
    "payment_type_id",
    "conditions",
    "other_conditions_list",
    "tenant_roles",
    "additional_terms",
    "text_additional_terms",
    "notes",
    "tenant_role_id",
    "tenant_role_ids",
    "tenant_role_values",
  ],
};

function readStep2(orderData, key) {
  const s2 = orderData?.step2 ?? {};
  const unit = s2.unit ?? orderData?.unit ?? {};
  if (key === "unit_number") {
    return s2.unit_number ?? unit.unit_number ?? orderData?.unit_number;
  }
  if (key === "floor_number") {
    return s2.floor_number ?? unit.floor_number ?? orderData?.floor_number;
  }
  if (key === "unit_area") {
    return s2.unit_area ?? unit.unit_area ?? orderData?.unit_area;
  }
  return s2[key] ?? unit[key] ?? orderData?.[key];
}

function readStep3(orderData, key) {
  const s3 = orderData?.step3 ?? {};
  if (key === "id_num_of_property_tenant_agent") {
    return (
      s3.id_num_of_property_tenant_agent ??
      s3.id_number_of_property_tenant_agent ??
      orderData?.id_num_of_property_tenant_agent ??
      orderData?.id_number_of_property_tenant_agent
    );
  }
  return s3[key] ?? orderData?.[key];
}

function readValue(orderData, step, key) {
  if (step === "summary") {
    return orderData?.contract_summary?.[key] ?? orderData?.[key];
  }
  if (step === "step1") return orderData?.step1?.[key] ?? orderData?.[key];
  if (step === "step2") return readStep2(orderData, key);
  if (step === "step3") return readStep3(orderData, key);
  if (step === "step4") {
    if (key === "tenant_role_ids") {
      return readTenantRoleIds(orderData);
    }
    if (key === "tenant_role_values") {
      return readTenantRoleValues(orderData);
    }
    if (key === "tenant_roles") {
      const flag = orderData?.step4?.[key] ?? orderData?.[key];
      if (flag !== undefined && flag !== null && flag !== "") return flag;
      return readTenantRoleIds(orderData).length > 0 ? 1 : 0;
    }
    if (key === "other_conditions_list") {
      return readOtherConditionsList(orderData);
    }
    if (key === "conditions") {
      const flag = orderData?.step4?.[key] ?? orderData?.[key];
      if (flag !== undefined && flag !== null && flag !== "") return flag;
      return readOtherConditionsList(orderData).length > 0 ? 1 : 0;
    }
    if (key === "contract_term_in_years") {
      return (
        orderData?.step4?.contract_term_in_years ??
        orderData?.contract_term_in_years ??
        orderData?.step4?.contract_period_id ??
        orderData?.contract_period_id
      );
    }
    if (key === "payment_type_id") {
      return (
        orderData?.step4?.payment_type_id ??
        orderData?.payment_type_id ??
        orderData?.payment_type?.id ??
        orderData?.step4?.payment_type?.id
      );
    }
    return orderData?.step4?.[key] ?? orderData?.[key];
  }
  return undefined;
}

export function readOtherConditionsList(orderData) {
  const step4 = orderData?.step4 ?? {};
  const list =
    orderData?.other_conditions_list ?? step4.other_conditions_list;
  if (Array.isArray(list) && list.length > 0) {
    return list
      .map((item) => (item == null ? "" : String(item)))
      .filter((item) => item.trim() !== "");
  }

  const legacy =
    orderData?.other_conditions ?? step4.other_conditions;
  if (legacy != null && String(legacy).trim() !== "") {
    return [String(legacy).trim()];
  }
  return [];
}

function readTenantRoleIds(orderData) {
  const step4 = orderData?.step4 ?? {};
  const ids = orderData?.tenant_role_ids ?? step4.tenant_role_ids;
  if (Array.isArray(ids) && ids.length > 0) return ids;

  const details =
    orderData?.tenant_roles_details ?? step4.tenant_roles_details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((item) => item?.id).filter((id) => id != null);
  }

  const legacy = orderData?.tenant_role_id ?? step4.tenant_role_id;
  if (legacy != null && legacy !== "") return [legacy];
  return [];
}

function readTenantRoleValues(orderData) {
  const step4 = orderData?.step4 ?? {};
  const raw = orderData?.tenant_role_values ?? step4.tenant_role_values;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }

  const details =
    orderData?.tenant_roles_details ?? step4.tenant_roles_details;
  if (!Array.isArray(details)) return {};

  return Object.fromEntries(
    details
      .filter(
        (item) =>
          item?.id != null &&
          item.value !== undefined &&
          item.value !== null &&
          item.value !== ""
      )
      .map((item) => [String(item.id), String(item.value)])
  );
}

export function parseTenantRoleIds(value) {
  if (Array.isArray(value)) {
    return value
      .map((v) => parseInt(String(v), 10))
      .filter((n) => !Number.isNaN(n));
  }
  if (value === null || value === undefined || value === "") return [];
  return String(value)
    .split(/[,،]/)
    .map((v) => parseInt(v.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

function tenantRoleIdsEqual(a, b) {
  const left = [...parseTenantRoleIds(a)].sort((x, y) => x - y);
  const right = [...parseTenantRoleIds(b)].sort((x, y) => x - y);
  return (
    left.length === right.length && left.every((id, index) => id === right[index])
  );
}

export function normalizeTenantRoleValues(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      String(key),
      val === null || val === undefined ? "" : String(val),
    ])
  );
}

function tenantRoleValuesEqual(a, b) {
  const left = normalizeTenantRoleValues(a);
  const right = normalizeTenantRoleValues(b);
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every(
    (key, index) =>
      key === rightKeys[index] && String(left[key] ?? "") === String(right[key] ?? "")
  );
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
    (roles || [])
      .filter((role) => role?.id != null)
      .map((role) => [String(role.id), role])
  );
  const normalizedValues = normalizeTenantRoleValues(values);

  for (const id of parseTenantRoleIds(ids)) {
    const role = byId[String(id)];
    if (!role?.has_user_input) continue;
    const raw = normalizedValues[String(id)];
    const label =
      role.input_field_label || role.text_of_reason || role.name || String(id);
    if (raw == null || String(raw).trim() === "") {
      errors[`tenant_role_values.${id}`] = `${label}: مطلوب`;
      continue;
    }
    if (
      role.input_field_type === "number" &&
      Number.isNaN(Number(String(raw).trim()))
    ) {
      errors[`tenant_role_values.${id}`] = `${label}: يجب أن يكون رقماً`;
    }
  }

  return errors;
}

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

function otherConditionsListEqual(a, b) {
  const left = sanitizeOtherConditionsList(a);
  const right = sanitizeOtherConditionsList(b);
  return (
    left.length === right.length &&
    left.every((item, index) => item === right[index])
  );
}

/**
 * When conditions=true: require at least one non-empty condition (max 50).
 * @returns {Record<string, string>}
 */
export function validateOtherConditionsList(conditions, list) {
  const enabled =
    conditions === true || conditions === 1 || conditions === "1";
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

const BOOLEAN_FIELD_KEYS = new Set([
  "add_legal_agent_of_owner",
  "is_there_a_legal_representative_of_the_tenant",
  "furnished",
  "kitchen_tank",
  "electricity_meter",
  "water_meter",
  "conditions",
  "tenant_roles",
  "additional_terms",
]);

const REQUIRED_BOOLEAN_DEFAULTS = {
  add_legal_agent_of_owner: 0,
};

export function normalizeFieldValue(value, key) {
  if (key === "tenant_role_ids") {
    return parseTenantRoleIds(value);
  }
  if (key === "tenant_role_values") {
    return normalizeTenantRoleValues(value);
  }
  if (key === "other_conditions_list") {
    return normalizeOtherConditionsList(value);
  }
  if (
    key === "contract_term_in_years" ||
    key === "contract_period_id" ||
    key === "payment_type_id"
  ) {
    if (value && typeof value === "object") {
      return value.id != null ? String(value.id) : "";
    }
    if (value === null || value === undefined || value === "") return "";
    return String(value);
  }
  if (BOOLEAN_FIELD_KEYS.has(key)) {
    return value === 1 || value === "1" || value === true ? 1 : 0;
  }
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "object") {
    if (value?.id != null) return String(value.id);
    if (value?.price != null) return String(value.price);
    return "";
  }
  return String(value);
}

export function getStepFormValues(orderData, step) {
  const keys = CONTRACT_STEP_KEYS[step] ?? [];
  return Object.fromEntries(
    keys.map((key) => [key, normalizeFieldValue(readValue(orderData, step, key), key)])
  );
}

export function buildContractUpdatePayload(step, form, initialForm) {
  const allowed = new Set(CONTRACT_STEP_KEYS[step] ?? []);
  const payload = {};

  for (const [key, value] of Object.entries(form)) {
    if (!allowed.has(key)) continue;
    const initial = initialForm?.[key];

    if (key === "tenant_role_ids") {
      const ids = parseTenantRoleIds(value);
      if (!tenantRoleIdsEqual(ids, initial)) {
        payload[key] = ids;
      }
      continue;
    }

    if (key === "tenant_role_values") {
      if (!tenantRoleValuesEqual(value, initial)) {
        payload[key] = filterTenantRoleValuesForIds(
          value,
          form.tenant_role_ids ?? initialForm?.tenant_role_ids
        );
      }
      continue;
    }

    if (key === "other_conditions_list") {
      if (!otherConditionsListEqual(value, initial)) {
        payload[key] = sanitizeOtherConditionsList(value);
      }
      continue;
    }

    if (value === initial) continue;
    if (value === "" && (initial === "" || initial === undefined)) continue;

    if (
      [
        "furnished",
        "kitchen_tank",
        "add_legal_agent_of_owner",
        "is_there_a_legal_representative_of_the_tenant",
      ].includes(key)
    ) {
      payload[key] = value === 1 || value === "1" || value === true ? 1 : 0;
      continue;
    }

    payload[key] = value;
  }

  // Keep tenant role flag + values in sync whenever selection changes.
  if (
    allowed.has("tenant_role_ids") &&
    ("tenant_role_ids" in payload || "tenant_role_values" in payload)
  ) {
    const ids = parseTenantRoleIds(form.tenant_role_ids);
    payload.tenant_role_ids = ids;
    if (allowed.has("tenant_roles")) {
      payload.tenant_roles = ids.length > 0 ? 1 : 0;
    }
    if (allowed.has("tenant_role_values")) {
      payload.tenant_role_values = filterTenantRoleValuesForIds(
        form.tenant_role_values,
        ids
      );
    }
  }

  // Keep conditions flag + list in sync.
  if (
    allowed.has("other_conditions_list") &&
    ("other_conditions_list" in payload || "conditions" in payload)
  ) {
    const enabled =
      form.conditions === true ||
      form.conditions === 1 ||
      form.conditions === "1";
    if (allowed.has("conditions")) {
      payload.conditions = enabled ? 1 : 0;
    }
    payload.other_conditions_list = enabled
      ? sanitizeOtherConditionsList(form.other_conditions_list)
      : [];
  }

  for (const [key, defaultValue] of Object.entries(REQUIRED_BOOLEAN_DEFAULTS)) {
    if (!allowed.has(key) || key in payload) continue;
    if (!(key in form)) continue;
    const value = form[key];
    payload[key] =
      value === 1 || value === "1" || value === true ? 1 : defaultValue;
  }

  return payload;
}

export function mapApiValidationErrors(errors) {
  if (!errors || typeof errors !== "object") return {};
  const mapped = {};
  for (const [key, messages] of Object.entries(errors)) {
    const message = Array.isArray(messages) ? messages[0] : String(messages);
    mapped[key] = message;
    // Laravel-style nested keys: tenant_role_values.3
    if (key.startsWith("tenant_role_values.")) {
      mapped[key] = message;
    }
  }
  return mapped;
}
