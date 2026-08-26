import { parseTenantRoleIds, normalizeTenantRoleValues } from "./tenant-roles";
import { normalizeOtherConditionsList } from "./other-conditions";

export const BOOLEAN_FIELD_KEYS = new Set([
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

export const REQUIRED_BOOLEAN_DEFAULTS = {
  add_legal_agent_of_owner: 0,
};

export const FILE_FIELD_KEYS = new Set([
  "copy_of_the_authorization_or_agency",
  "image_instrument",
  "image_instrument_from_the_front",
  "image_instrument_from_the_back",
  "Image_inheritance_certificate",
  "copy_power_of_attorney_from_heirs_to_agent",
  "copy_of_the_endowment_registration_certificate",
  "copy_of_the_trusteeship_deed",
  "copy_of_guardians_power_of_attorney_for_agent",
]);

function normalizeFileFieldValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.url || value.path || value.full_url || value.src || "";
  }
  return "";
}

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
  if (FILE_FIELD_KEYS.has(key)) {
    return normalizeFileFieldValue(value);
  }
  if (key === "contract_term_in_years" || key === "contract_period_id" || key === "payment_type_id") {
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
