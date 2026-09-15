/**
 * Fields the mobile/frontend actually submits across contract steps.
 * Dashboard sections should display only these (empty → faded).
 */

export const INSTRUMENT_IMAGE_FIELDS = [
  { key: "image_instrument", label: "صورة الصك" },
  { key: "image_instrument_from_the_front", label: "صورة الصك (من الأمام)" },
  { key: "image_instrument_from_the_back", label: "صورة الصك (من الخلف)" },
  {
    key: "Image_inheritance_certificate",
    label: "شهادة حصر الإرث",
  },
  {
    key: "copy_power_of_attorney_from_heirs_to_agent",
    label: "توكيل الورثة للوكيل",
  },
  {
    key: "copy_of_the_endowment_registration_certificate",
    label: "شهادة تسجيل الوقف",
  },
  {
    key: "copy_of_the_trusteeship_deed",
    label: "صك النظارة",
  },
  {
    key: "copy_of_guardians_power_of_attorney_for_agent",
    label: "توكيل الأولياء للوكيل",
  },
];

export const ADDRESS_FIELDS = [
  { key: "property_place_id", label: "المنطقة", preferLabel: true },
  { key: "property_city_id", label: "المدينة", preferLabel: true },
  { key: "neighborhood", label: "الحي" },
  { key: "street", label: "الشارع" },
  { key: "building_number", label: "رقم المبنى" },
  { key: "postal_code", label: "الرمز البريدي" },
  { key: "extra_figure", label: "الرقم الإضافي" },
  { key: "address_url", label: "رابط العنوان" },
];

/** Yes/no / presence helpers matching frontend "0"|"1"|boolean payloads. */
export function asYesNo(value) {
  if (value === true || value === 1 || value === "1") return "نعم";
  if (value === false || value === 0 || value === "0") return "لا";
  return value;
}

export function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

export function resolveAddressFieldValue(orderData, field) {
  const step1 = orderData?.step1 || {};
  const labels = orderData?.relation_labels || {};

  if (field.key === "property_place_id") {
    return pickFirst(
      labels.property_region,
      orderData?.property_region?.name_trans,
      orderData?.property_region?.name_ar,
      orderData?.property_region?.name,
      step1.property_place_id,
      orderData?.property_place_id
    );
  }

  if (field.key === "property_city_id") {
    return pickFirst(
      labels.property_city,
      orderData?.property_city?.name_trans,
      orderData?.property_city?.name_ar,
      orderData?.property_city?.name,
      step1.property_city_id,
      orderData?.property_city_id
    );
  }

  if (field.key === "latitude") {
    return pickFirst(step1.latitude, orderData?.latitude, step1.lat, orderData?.lat);
  }

  if (field.key === "longitude") {
    return pickFirst(step1.longitude, orderData?.longitude, step1.lng, orderData?.lng);
  }

  return pickFirst(step1[field.key], orderData?.[field.key]);
}

/**
 * Normalize selected tenant roles for contract display.
 * Prefers tenant_roles_details (with values), then ids + values/names.
 */
export function resolveTenantRoleDetails(orderData, tenantRoles = []) {
  const step4 = orderData?.step4 || {};

  const details = pickFirst(
    orderData?.tenant_roles_details,
    step4.tenant_roles_details
  );
  if (Array.isArray(details) && details.length > 0) {
    return details.map((item) => ({
      id: item?.id ?? null,
      label:
        item?.text_of_reason ||
        item?.name ||
        (item?.id != null ? String(item.id) : "—"),
      value:
        item?.value !== undefined && item?.value !== null && item?.value !== ""
          ? String(item.value)
          : null,
      inputLabel: item?.input_field_label || null,
      hasUserInput: Boolean(item?.has_user_input),
    }));
  }

  const valuesRaw = pickFirst(
    orderData?.tenant_role_values,
    step4.tenant_role_values
  );
  const values =
    valuesRaw && typeof valuesRaw === "object" && !Array.isArray(valuesRaw)
      ? valuesRaw
      : {};

  const ids = pickFirst(orderData?.tenant_role_ids, step4.tenant_role_ids);
  const names = pickFirst(
    orderData?.tenant_role_names,
    step4.tenant_role_names
  );

  if (Array.isArray(ids) && ids.length > 0) {
    return ids.map((id, index) => {
      const role = tenantRoles.find((item) => String(item?.id) === String(id));
      const nameFromList =
        Array.isArray(names) && names[index] != null && names[index] !== ""
          ? String(names[index])
          : null;
      const value = values[String(id)] ?? values[id] ?? null;
      return {
        id,
        label:
          nameFromList ||
          role?.text_of_reason ||
          role?.name ||
          String(id),
        value: value !== undefined && value !== null && value !== ""
          ? String(value)
          : null,
        inputLabel: role?.input_field_label || null,
        hasUserInput: Boolean(role?.has_user_input),
      };
    });
  }

  if (Array.isArray(names) && names.length > 0) {
    return names.map((name) => ({
      id: null,
      label: String(name),
      value: null,
      inputLabel: null,
      hasUserInput: false,
    }));
  }

  const legacyId = pickFirst(orderData?.tenant_role_id, step4.tenant_role_id);
  if (legacyId != null && legacyId !== "") {
    const role = tenantRoles.find(
      (item) => String(item?.id) === String(legacyId)
    );
    return [
      {
        id: legacyId,
        label:
          orderData?.tenant_role?.text_of_reason ||
          orderData?.tenant_role?.name ||
          step4?.tenant_role?.text_of_reason ||
          step4?.tenant_role?.name ||
          orderData?.relation_labels?.tenant_role ||
          role?.text_of_reason ||
          role?.name ||
          String(legacyId),
        value: null,
        inputLabel: null,
        hasUserInput: false,
      },
    ];
  }

  return [];
}

/** Resolve other-conditions list for display. */
export function resolveOtherConditionsList(orderData) {
  const step4 = orderData?.step4 || {};
  const list = pickFirst(
    orderData?.other_conditions_list,
    step4.other_conditions_list
  );
  if (Array.isArray(list) && list.length > 0) {
    return list
      .map((item) => (item == null ? "" : String(item).trim()))
      .filter(Boolean);
  }
  const legacy = pickFirst(
    orderData?.other_conditions,
    step4.other_conditions
  );
  if (legacy != null && String(legacy).trim() !== "") {
    return [String(legacy).trim()];
  }
  return [];
}
