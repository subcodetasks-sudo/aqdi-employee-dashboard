import { normalizeFieldValue } from "./field-normalize";
import {
  getOrderAddressStep,
  getOrderDeedStep,
  getOrderFinancialStep,
  getOrderOwnerStep,
  getOrderTenantStep,
  getOrderUnits,
  getOrderUnitsStep,
  pickAgentRelatedField,
} from "@/src/lib/order-detail-steps";

/**
 * Flat API field keys allowed per admin contract step.
 * Step numbers match GET /admin/orders/:id groups (and frontend POST /contract/stepN).
 */
export const CONTRACT_STEP_KEYS = {
  summary: [
    "contract_type",
    "instrument_type",
    "contract_period_id",
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
    "copy_of_the_authorization_or_agency",
    "image_instrument",
    "image_instrument_from_the_front",
    "image_instrument_from_the_back",
    "Image_inheritance_certificate",
    "copy_power_of_attorney_from_heirs_to_agent",
    "copy_of_the_endowment_registration_certificate",
    "copy_of_the_trusteeship_deed",
    "copy_of_guardians_power_of_attorney_for_agent",
    "notes_edits",
  ],
  /** step1 — الصك (Deed) */
  step1: [
    "instrument_type",
    "instrument_number",
    "type_instrument_history",
    "instrument_history_day",
    "instrument_history_month",
    "instrument_history_year",
    "image_instrument",
    "image_instrument_from_the_front",
    "image_instrument_from_the_back",
    "Image_inheritance_certificate",
    "copy_power_of_attorney_from_heirs_to_agent",
    "copy_of_guardians_power_of_attorney_for_agent",
    "copy_of_the_endowment_registration_certificate",
    "copy_of_the_trusteeship_deed",
    "is_multiple_trusteeship_deed_copy",
    "real_estate_registry_number",
    "date_first_registration",
    "property_type_id",
    "property_usages_id",
    "age_of_the_property",
    "number_of_floors",
    "number_of_units_per_floor",
    "number_of_units_in_realestate",
    "deed_type",
    "deed_addition_method",
  ],
  /** step2 — العنوان + وكيل / ناظر */
  step2: [
    "property_place_id",
    "property_city_id",
    "neighborhood",
    "street",
    "building_number",
    "postal_code",
    "extra_figure",
    "latitude",
    "longitude",
    "lat",
    "lng",
    "address_url",
    "image_address",
    "id_num_of_property_owner_agent",
    "mobile_of_property_owner_agent",
    "type_dob_property_owner_agent",
    "dob_of_property_owner_agent",
    "dob_of_property_owner_agent_day",
    "dob_of_property_owner_agent_month",
    "dob_of_property_owner_agent_year",
    "copy_power_of_attorney_from_heirs_to_agent",
    "copy_of_the_authorization_or_agency",
    "copy_of_the_trusteeship_deed",
    "copy_of_guardians_power_of_attorney_for_agent",
  ],
  /** step3 — المالك */
  step3: [
    "type_dob_property_owner",
    "property_owner_id_num",
    "property_owner_dob",
    "property_owner_dob_day",
    "property_owner_dob_month",
    "property_owner_dob_year",
    "property_owner_mobile",
    "name_owner",
    "property_owner_iban",
    "add_legal_agent_of_owner",
    "id_num_of_property_owner_agent",
    "mobile_of_property_owner_agent",
    "type_dob_property_owner_agent",
    "dob_of_property_owner_agent",
    "dob_of_property_owner_agent_day",
    "dob_of_property_owner_agent_month",
    "dob_of_property_owner_agent_year",
    "copy_of_the_authorization_or_agency",
    "agency_number_in_instrument_of_property_owner",
    "type_agency_instrument_date_of_property_owner",
    "agency_instrument_date_of_property_owner",
    "agency_instrument_date_of_property_owner_day",
    "agency_instrument_date_of_property_owner_month",
    "agency_instrument_date_of_property_owner_year",
    "copy_power_of_attorney_from_heirs_to_agent",
    "Image_inheritance_certificate",
    "property_owner_is_deceased",
    "copy_of_the_endowment_registration_certificate",
    "copy_of_the_trusteeship_deed",
    "is_multiple_trusteeship_deed_copy",
    "copy_of_guardians_power_of_attorney_for_agent",
  ],
  /** step4 — المستأجر */
  step4: [
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
    "dobof_property_tenant_agent_day",
    "dobof_property_tenant_agent_month",
    "dobof_property_tenant_agent_year",
    "mobile_of_property_tenant_agent",
    "copy_of_the_authorization_or_agency",
    "notes",
    "tenant_name",
    "tenant_email",
    "tenant_nationality",
    "tenant_work",
    "tenant_gender",
    "tenant_role_id",
    "is_there_a_legal_representative_of_the_tenant",
  ],
  /** step5 — الوحدات (aliases for first unit / legacy single-unit edit) */
  step5: [
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
  /** step6 — المالية */
  step6: [
    "app_or_web",
    "contract_starting_date",
    "type_contract_starting_date",
    "contract_starting_date_day",
    "contract_starting_date_month",
    "contract_starting_date_year",
    "contract_term_in_years",
    "duration_preset",
    "duration_years",
    "duration_months",
    "payment_type_id",
    "annual_rent_amount_for_the_unit",
    "conditions",
    "other_conditions_list",
    "tenant_roles",
    "additional_terms",
    "text_additional_terms",
    "notes",
    "notes_edits",
    "tenant_role_id",
    "tenant_role_ids",
    "tenant_role_values",
    "daily_fine",
  ],
};

function firstUnit(orderData) {
  const units = getOrderUnits(orderData);
  return units[0] ?? {};
}

function readUnitsAlias(orderData, key) {
  const step = getOrderUnitsStep(orderData);
  const unit = step.unit ?? firstUnit(orderData);
  if (key === "unit_number") {
    return step.unit_number ?? unit.unit_number ?? orderData?.unit_number;
  }
  if (key === "floor_number") {
    return step.floor_number ?? unit.floor_number ?? orderData?.floor_number;
  }
  if (key === "unit_area") {
    return step.unit_area ?? unit.unit_area ?? orderData?.unit_area;
  }
  return step[key] ?? unit[key] ?? orderData?.[key];
}

function readTenant(orderData, key) {
  const bucket = getOrderTenantStep(orderData);
  if (key === "id_num_of_property_tenant_agent") {
    return (
      bucket.id_num_of_property_tenant_agent ??
      bucket.id_number_of_property_tenant_agent ??
      orderData?.id_num_of_property_tenant_agent ??
      orderData?.id_number_of_property_tenant_agent
    );
  }
  if (
    key === "dob_of_property_tenant_agent_day" ||
    key === "dobof_property_tenant_agent_day"
  ) {
    return (
      bucket.dob_of_property_tenant_agent_day ??
      bucket.dobof_property_tenant_agent_day ??
      orderData?.dob_of_property_tenant_agent_day ??
      orderData?.dobof_property_tenant_agent_day
    );
  }
  if (
    key === "dob_of_property_tenant_agent_month" ||
    key === "dobof_property_tenant_agent_month"
  ) {
    return (
      bucket.dob_of_property_tenant_agent_month ??
      bucket.dobof_property_tenant_agent_month ??
      orderData?.dob_of_property_tenant_agent_month ??
      orderData?.dobof_property_tenant_agent_month
    );
  }
  if (
    key === "dob_of_property_tenant_agent_year" ||
    key === "dobof_property_tenant_agent_year"
  ) {
    return (
      bucket.dob_of_property_tenant_agent_year ??
      bucket.dobof_property_tenant_agent_year ??
      orderData?.dob_of_property_tenant_agent_year ??
      orderData?.dobof_property_tenant_agent_year
    );
  }
  return bucket[key] ?? orderData?.[key];
}

export function readOtherConditionsList(orderData) {
  const financial = getOrderFinancialStep(orderData);
  const list = orderData?.other_conditions_list ?? financial.other_conditions_list;
  if (Array.isArray(list) && list.length > 0) {
    return list.map((item) => (item == null ? "" : String(item))).filter((item) => item.trim() !== "");
  }

  const legacy = orderData?.other_conditions ?? financial.other_conditions;
  if (legacy != null && String(legacy).trim() !== "") {
    return [String(legacy).trim()];
  }
  return [];
}

function readTenantRoleIds(orderData) {
  const financial = getOrderFinancialStep(orderData);
  const ids = orderData?.tenant_role_ids ?? financial.tenant_role_ids;
  if (Array.isArray(ids) && ids.length > 0) return ids;

  const details = orderData?.tenant_roles_details ?? financial.tenant_roles_details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((item) => item?.id).filter((id) => id != null);
  }

  const legacy = orderData?.tenant_role_id ?? financial.tenant_role_id;
  if (legacy != null && legacy !== "") return [legacy];
  return [];
}

function readTenantRoleValues(orderData) {
  const financial = getOrderFinancialStep(orderData);
  const raw = orderData?.tenant_role_values ?? financial.tenant_role_values;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }

  const details = orderData?.tenant_roles_details ?? financial.tenant_roles_details;
  if (!Array.isArray(details)) return {};

  return Object.fromEntries(
    details
      .filter((item) => item?.id != null && item.value !== undefined && item.value !== null && item.value !== "")
      .map((item) => [String(item.id), String(item.value)])
  );
}

function readFinancial(orderData, key) {
  const financial = getOrderFinancialStep(orderData);

  if (key === "tenant_role_ids") return readTenantRoleIds(orderData);
  if (key === "tenant_role_values") return readTenantRoleValues(orderData);
  if (key === "tenant_roles") {
    const flag = financial[key] ?? orderData?.[key];
    if (flag !== undefined && flag !== null && flag !== "") return flag;
    return readTenantRoleIds(orderData).length > 0 ? 1 : 0;
  }
  if (key === "other_conditions_list") return readOtherConditionsList(orderData);
  if (key === "conditions") {
    const flag = financial[key] ?? orderData?.[key];
    if (flag !== undefined && flag !== null && flag !== "") return flag;
    return readOtherConditionsList(orderData).length > 0 ? 1 : 0;
  }
  if (key === "contract_term_in_years") {
    return (
      financial.contract_term_in_years ??
      orderData?.contract_term_in_years ??
      financial.contract_period_id ??
      orderData?.contract_period_id
    );
  }
  if (key === "payment_type_id") {
    return (
      financial.payment_type_id ??
      orderData?.payment_type_id ??
      orderData?.payment_type?.id ??
      financial.payment_type?.id
    );
  }
  return financial[key] ?? orderData?.[key];
}

function readValue(orderData, step, key) {
  if (step === "summary") {
    const owner = getOrderOwnerStep(orderData);
    const deed = getOrderDeedStep(orderData);
    return (
      orderData?.contract_summary?.[key] ??
      pickAgentRelatedField(orderData, key) ??
      owner[key] ??
      deed[key] ??
      orderData?.[key]
    );
  }
  if (step === "step1") {
    const deed = getOrderDeedStep(orderData);
    return (
      deed[key] ??
      pickAgentRelatedField(orderData, key) ??
      orderData?.contract_summary?.[key] ??
      orderData?.[key]
    );
  }
  if (step === "step2") {
    const address = getOrderAddressStep(orderData);
    return address[key] ?? pickAgentRelatedField(orderData, key) ?? orderData?.[key];
  }
  if (step === "step3") {
    const owner = getOrderOwnerStep(orderData);
    return (
      owner[key] ??
      pickAgentRelatedField(orderData, key) ??
      orderData?.contract_summary?.[key] ??
      orderData?.[key]
    );
  }
  if (step === "step4") return readTenant(orderData, key);
  if (step === "step5") return readUnitsAlias(orderData, key);
  if (step === "step6") return readFinancial(orderData, key);
  return undefined;
}

export function getStepFormValues(orderData, step) {
  const keys = CONTRACT_STEP_KEYS[step] ?? [];
  return Object.fromEntries(
    keys.map((key) => [key, normalizeFieldValue(readValue(orderData, step, key), key)])
  );
}
