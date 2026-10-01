/**
 * Admin GET /admin/orders/:id step buckets.
 *
 * Current API (aligned with frontend contract steps):
 *   start, step1=deed, step2=address, step3=owner,
 *   step4=tenant, step5=units, step6=financial, contract_summary,
 *   legal_agent, endowment_nazir (also mirrored on step2/step3)
 *
 * Legacy dashboard shape (still accepted for reads):
 *   step1=address, step2=units, step3=tenant, step4=financial
 *   (owner / deed lived on contract_summary + root)
 */

function pick(...values) {
  for (const value of values) {
    if (value == null || value === "") continue;
    return value;
  }
  return null;
}

function isNonEmptyObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
}

function looksLikeTenant(bucket) {
  return Boolean(
    bucket &&
      (bucket.tenant_entity != null ||
        bucket.tenant_id_num != null ||
        bucket.tenant_mobile != null ||
        bucket.tenant_entity_unified_registry_number != null)
  );
}

function looksLikeFinancial(bucket) {
  return Boolean(
    bucket &&
      (bucket.payment_type_id != null ||
        bucket.annual_rent_amount_for_the_unit != null ||
        bucket.contract_starting_date != null ||
        bucket.contract_term_in_years != null ||
        bucket.duration_years != null ||
        bucket.payment_type_name != null)
  );
}

function looksLikeAddress(bucket) {
  return Boolean(
    bucket &&
      (bucket.neighborhood != null ||
        bucket.street != null ||
        bucket.property_city_id != null ||
        bucket.property_place_id != null ||
        bucket.address_url != null ||
        bucket.image_address != null ||
        bucket.latitude != null ||
        bucket.longitude != null ||
        bucket.building_number != null)
  );
}

function looksLikeDeed(bucket) {
  return Boolean(
    bucket &&
      (bucket.instrument_type != null ||
        bucket.instrument_type_key != null ||
        bucket.image_instrument != null ||
        bucket.instrument_number != null ||
        bucket.image_instrument_from_the_front != null)
  );
}

function looksLikeOwner(bucket) {
  return Boolean(
    bucket &&
      (bucket.property_owner_id_num != null ||
        bucket.property_owner_mobile != null ||
        bucket.type_dob_property_owner != null ||
        bucket.property_owner_dob_day != null ||
        bucket.name_owner != null)
  );
}

function looksLikeUnits(bucket) {
  return Boolean(
    bucket &&
      (Array.isArray(bucket.units) ||
        bucket.unit_type_id != null ||
        bucket.unit_number != null ||
        bucket.unit_area != null ||
        bucket.unit != null)
  );
}

/** True when the payload uses the grouped admin steps (1=deed … 6=financial). */
export function usesGroupedAdminSteps(orderData = {}) {
  if (isNonEmptyObject(orderData.step6)) return true;
  if (isNonEmptyObject(orderData.step5)) return true;
  if (isNonEmptyObject(orderData.start)) return true;
  if (looksLikeTenant(orderData.step4)) return true;
  if (looksLikeOwner(orderData.step3) && !looksLikeTenant(orderData.step3)) return true;
  if (looksLikeAddress(orderData.step2) && !looksLikeUnits(orderData.step2)) return true;
  if (looksLikeDeed(orderData.step1) && !looksLikeAddress(orderData.step1)) return true;
  return false;
}

/** UI "سكني" / legacy `residential` → API `housing`. */
export function normalizeContractTypeKey(value) {
  if (value == null || value === "") return null;
  const raw = String(value).trim();
  const lower = raw.toLowerCase();
  if (lower === "housing" || lower === "residential" || raw === "سكني") return "housing";
  if (lower === "commercial" || raw === "تجاري") return "commercial";
  return raw;
}

export function resolveOrderContractTypeKey(orderData = {}) {
  return normalizeContractTypeKey(
    pick(
      orderData.contract_type_key,
      orderData.contract_summary?.contract_type_key,
      orderData.start?.contract_type,
      orderData.contract_type,
      orderData.contract_summary?.contract_type,
      orderData.step6?.contract_type,
      orderData.step5?.contract_type,
      orderData.step4?.contract_type
    )
  );
}

export function getOrderStart(orderData = {}) {
  return orderData.start ?? {};
}

function isTruthyFlag(value) {
  return value === true || value === 1 || value === "1";
}

function bucketHasMeaningfulValue(bucket = {}) {
  return Object.values(bucket).some((value) => value != null && value !== "");
}

/**
 * Top-level `legal_agent` (also mirrored on step2 / step3).
 * Always present in the new API; values are null when there is no agent.
 */
export function getOrderLegalAgent(orderData = {}) {
  if (isNonEmptyObject(orderData.legal_agent)) return orderData.legal_agent;
  if (isNonEmptyObject(orderData.step3?.legal_agent)) return orderData.step3.legal_agent;
  if (isNonEmptyObject(orderData.step2?.legal_agent)) return orderData.step2.legal_agent;
  return orderData.legal_agent ?? {};
}

/**
 * Top-level `endowment_nazir` (also mirrored on step2 / step3).
 */
export function getOrderEndowmentNazir(orderData = {}) {
  if (isNonEmptyObject(orderData.endowment_nazir)) return orderData.endowment_nazir;
  if (isNonEmptyObject(orderData.step3?.endowment_nazir)) {
    return orderData.step3.endowment_nazir;
  }
  if (isNonEmptyObject(orderData.step2?.endowment_nazir)) {
    return orderData.step2.endowment_nazir;
  }
  return orderData.endowment_nazir ?? {};
}

/** Prefer legal_agent / endowment_nazir / owner / address / summary / root. */
export function pickAgentRelatedField(orderData, key) {
  const legalAgent = getOrderLegalAgent(orderData);
  const nazir = getOrderEndowmentNazir(orderData);
  const owner = getOrderOwnerStep(orderData);
  const address = getOrderAddressStep(orderData);
  const summary = orderData.contract_summary ?? {};
  return pick(
    legalAgent?.[key],
    nazir?.[key],
    owner?.[key],
    address?.[key],
    summary?.[key],
    orderData?.[key]
  );
}

export function hasLegalAgent(orderData = {}) {
  const agent = getOrderLegalAgent(orderData);
  const flag = pickAgentRelatedField(orderData, "add_legal_agent_of_owner");
  if (isTruthyFlag(flag)) return true;
  return Boolean(
    pick(
      agent.id_num_of_property_owner_agent,
      agent.mobile_of_property_owner_agent,
      agent.copy_of_the_authorization_or_agency,
      agent.agency_number_in_instrument_of_property_owner
    )
  );
}

export function hasEndowmentNazir(orderData = {}) {
  const nazir = getOrderEndowmentNazir(orderData);
  if (!bucketHasMeaningfulValue(nazir)) {
    return Boolean(
      pickAgentRelatedField(orderData, "copy_of_the_endowment_registration_certificate") ||
        pickAgentRelatedField(orderData, "copy_of_the_trusteeship_deed")
    );
  }
  return Boolean(
    pick(
      nazir.copy_of_the_endowment_registration_certificate,
      nazir.copy_of_the_trusteeship_deed,
      nazir.copy_of_guardians_power_of_attorney_for_agent,
      nazir.id_num_of_property_owner_agent,
      nazir.mobile_of_property_owner_agent,
      nazir.copy_of_the_authorization_or_agency
    )
  );
}

export function getOrderDeedStep(orderData = {}) {
  if (usesGroupedAdminSteps(orderData)) {
    return orderData.step1 ?? {};
  }
  return orderData.contract_summary ?? {};
}

export function getOrderAddressStep(orderData = {}) {
  if (usesGroupedAdminSteps(orderData)) {
    return orderData.step2 ?? {};
  }
  return orderData.step1 ?? {};
}

export function getOrderOwnerStep(orderData = {}) {
  if (usesGroupedAdminSteps(orderData)) {
    return orderData.step3 ?? {};
  }
  return orderData.contract_summary ?? {};
}

export function getOrderTenantStep(orderData = {}) {
  if (usesGroupedAdminSteps(orderData)) {
    return orderData.step4 ?? {};
  }
  return orderData.step3 ?? {};
}

export function getOrderUnitsStep(orderData = {}) {
  if (usesGroupedAdminSteps(orderData)) {
    return orderData.step5 ?? {};
  }
  return orderData.step2 ?? {};
}

export function getOrderFinancialStep(orderData = {}) {
  if (usesGroupedAdminSteps(orderData)) {
    return orderData.step6 ?? {};
  }
  return orderData.step4 ?? {};
}

/** Units list: prefer root `units`, then step5.units, then legacy step2. */
export function getOrderUnits(orderData = {}) {
  if (Array.isArray(orderData.units) && orderData.units.length > 0) {
    return orderData.units;
  }
  const step5 = orderData.step5 ?? {};
  if (Array.isArray(step5.units) && step5.units.length > 0) {
    return step5.units;
  }
  if (!usesGroupedAdminSteps(orderData)) {
    const step2 = orderData.step2 ?? {};
    if (Array.isArray(step2.units) && step2.units.length > 0) {
      return step2.units;
    }
  }
  return Array.isArray(orderData.units) ? orderData.units : [];
}

export function getOrderUnitsCount(orderData = {}) {
  const units = getOrderUnits(orderData);
  return pick(
    orderData.units_count,
    orderData.step5?.units_count,
    orderData.step2?.units_count,
    units.length
  );
}

/** Read a key from a step bucket, then root (empty → null). */
export function pickOrderField(orderData, bucket, key, ...fallbacks) {
  return pick(bucket?.[key], orderData?.[key], ...fallbacks);
}
