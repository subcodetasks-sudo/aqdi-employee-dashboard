import { normalizeFieldValue } from "./field-normalize";

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
    "copy_of_the_authorization_or_agency",
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

export function readOtherConditionsList(orderData) {
  const step4 = orderData?.step4 ?? {};
  const list = orderData?.other_conditions_list ?? step4.other_conditions_list;
  if (Array.isArray(list) && list.length > 0) {
    return list.map((item) => (item == null ? "" : String(item))).filter((item) => item.trim() !== "");
  }

  const legacy = orderData?.other_conditions ?? step4.other_conditions;
  if (legacy != null && String(legacy).trim() !== "") {
    return [String(legacy).trim()];
  }
  return [];
}

function readTenantRoleIds(orderData) {
  const step4 = orderData?.step4 ?? {};
  const ids = orderData?.tenant_role_ids ?? step4.tenant_role_ids;
  if (Array.isArray(ids) && ids.length > 0) return ids;

  const details = orderData?.tenant_roles_details ?? step4.tenant_roles_details;
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

  const details = orderData?.tenant_roles_details ?? step4.tenant_roles_details;
  if (!Array.isArray(details)) return {};

  return Object.fromEntries(
    details
      .filter((item) => item?.id != null && item.value !== undefined && item.value !== null && item.value !== "")
      .map((item) => [String(item.id), String(item.value)])
  );
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

export function getStepFormValues(orderData, step) {
  const keys = CONTRACT_STEP_KEYS[step] ?? [];
  return Object.fromEntries(
    keys.map((key) => [key, normalizeFieldValue(readValue(orderData, step, key), key)])
  );
}
