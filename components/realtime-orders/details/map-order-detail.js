import { getInstrumentTypeLabel } from "@/src/lib/instrument-types";
import { getContractTypeLabel } from "@/src/lib/contract-period-utils";
import { getOrderClientPhone } from "@/components/orders/messages/order-section-message-utils";
import {
  getOrderDeedStep,
  getOrderEndowmentNazir,
  getOrderFinancialStep,
  getOrderLegalAgent,
  getOrderOwnerStep,
  getOrderTenantStep,
  getOrderUnits,
  getOrderUnitsCount,
  hasEndowmentNazir,
  hasLegalAgent,
  normalizeContractTypeKey,
  pickAgentRelatedField,
  resolveOrderContractTypeKey,
} from "@/src/lib/order-detail-steps";
import { fileNameFromUrl, resolveImageUrl, resolveNationalAddress } from "./national-address-utils";

function pick(...values) {
  for (const value of values) {
    if (value == null || value === "") continue;
    return value;
  }
  return null;
}

function isPaidValue(value) {
  return value === true || value === 1 || value === "1" || value === "paid";
}

function tenantEntityLabel(value) {
  if (value === "person") return "فرد";
  if (value === "institution") return "مؤسسة أو شركة";
  return value || "مستأجر";
}

function durationLabel(financial = {}) {
  const years = pick(financial.duration_years, financial.contract_term_in_years?.years);
  const months = financial.duration_months;
  if (years && months) return `${years} سنة / ${months} شهر`;
  if (years) return `${years} سنة`;
  if (months) return `${months} شهر`;
  if (typeof financial.contract_term_in_years === "string") {
    return financial.contract_term_in_years;
  }
  if (financial.contract_term_in_years && typeof financial.contract_term_in_years === "object") {
    return pick(
      financial.contract_term_in_years.period,
      financial.contract_term_in_years.name,
      financial.contract_term_in_years.note_trans,
      financial.contract_term_in_years.note_ar
    );
  }
  return pick(financial.contract_term_name, financial.duration_preset);
}

function yesNoLabel(value) {
  if (value === true || value === 1 || value === "1") return "نعم";
  if (value === false || value === 0 || value === "0") return "لا";
  return value == null || value === "" ? null : String(value);
}

function calendarTypeLabel(value) {
  if (value === "hijri") return "هجري";
  if (value === "gregorian") return "ميلادي";
  return value || null;
}

function appOrWebLabel(value) {
  if (value === "app") return "تطبيق";
  if (value === "web") return "موقع";
  return value || null;
}

function mapDeedAttachment(url, label) {
  const fileUrl = resolveImageUrl(url);
  if (!fileUrl) return null;
  return {
    label,
    file_url: fileUrl,
    file_name: fileNameFromUrl(fileUrl),
  };
}

function mapTotalPrice(totalPrice) {
  if (!totalPrice || typeof totalPrice !== "object") return null;
  const items = Array.isArray(totalPrice.items)
    ? totalPrice.items.map((item) => ({
        key: item.key,
        label: item.label,
        amount: item.amount,
        percent: item.percent ?? null,
      }))
    : [];
  return {
    items,
    subtotal: totalPrice.subtotal ?? null,
    tax_percent: totalPrice.tax_percent ?? null,
    total: totalPrice.total_price ?? null,
  };
}

function mapContractPayments(payments) {
  if (!Array.isArray(payments)) return [];
  return payments.map((payment, index) => ({
    id: payment.id ?? index,
    name: payment.name,
    amount: payment.amount,
    status: payment.status,
    payment_date: payment.payment_date,
    payment_method: payment.payment_method,
  }));
}

function mapStatusTimeline(timeline) {
  if (!Array.isArray(timeline)) return [];
  return timeline.map((entry, index) => ({
    id: entry.id ?? index,
    label: entry.status_label ?? entry.status,
    color: entry.status_color,
    description: entry.status_description,
    created_at: entry.created_at,
    state: entry.state,
  }));
}

function composeTenantDob(tenant) {
  const composed = [
    tenant.tenant_dob_day,
    tenant.tenant_dob_month,
    tenant.tenant_dob_year,
  ]
    .filter((part) => part != null && part !== "")
    .join("-");
  return pick(tenant.tenant_dob, composed || null);
}

function composePartsDob(bucket, baseKey) {
  if (!bucket) return null;
  const full = bucket[baseKey];
  const composed = [bucket[`${baseKey}_day`], bucket[`${baseKey}_month`], bucket[`${baseKey}_year`]]
    .filter((part) => part != null && part !== "")
    .join("-");
  return pick(full, composed || null);
}

function mapLegalAgentView(orderData) {
  if (!hasLegalAgent(orderData)) return null;
  const agent = getOrderLegalAgent(orderData);
  const dob = composePartsDob(agent, "dob_of_property_owner_agent")
    ?? composePartsDob(
        {
          dob_of_property_owner_agent: pickAgentRelatedField(
            orderData,
            "dob_of_property_owner_agent"
          ),
          dob_of_property_owner_agent_day: pickAgentRelatedField(
            orderData,
            "dob_of_property_owner_agent_day"
          ),
          dob_of_property_owner_agent_month: pickAgentRelatedField(
            orderData,
            "dob_of_property_owner_agent_month"
          ),
          dob_of_property_owner_agent_year: pickAgentRelatedField(
            orderData,
            "dob_of_property_owner_agent_year"
          ),
        },
        "dob_of_property_owner_agent"
      );
  const dobType = calendarTypeLabel(
    pickAgentRelatedField(orderData, "type_dob_property_owner_agent")
  );
  const agencyDate =
    composePartsDob(agent, "agency_instrument_date_of_property_owner") ??
    composePartsDob(
      {
        agency_instrument_date_of_property_owner: pickAgentRelatedField(
          orderData,
          "agency_instrument_date_of_property_owner"
        ),
        agency_instrument_date_of_property_owner_day: pickAgentRelatedField(
          orderData,
          "agency_instrument_date_of_property_owner_day"
        ),
        agency_instrument_date_of_property_owner_month: pickAgentRelatedField(
          orderData,
          "agency_instrument_date_of_property_owner_month"
        ),
        agency_instrument_date_of_property_owner_year: pickAgentRelatedField(
          orderData,
          "agency_instrument_date_of_property_owner_year"
        ),
      },
      "agency_instrument_date_of_property_owner"
    );

  return {
    id_num: pickAgentRelatedField(orderData, "id_num_of_property_owner_agent"),
    phone: pickAgentRelatedField(orderData, "mobile_of_property_owner_agent"),
    dob,
    dob_type: dobType,
    dob_display: dob ? (dobType ? `${dob} (${dobType})` : dob) : null,
    agency_number: pickAgentRelatedField(
      orderData,
      "agency_number_in_instrument_of_property_owner"
    ),
    agency_date: agencyDate,
    agency_date_type: calendarTypeLabel(
      pickAgentRelatedField(orderData, "type_agency_instrument_date_of_property_owner")
    ),
    owner_is_deceased: yesNoLabel(
      pickAgentRelatedField(orderData, "property_owner_is_deceased")
    ),
  };
}

function mapEndowmentNazirView(orderData) {
  if (!hasEndowmentNazir(orderData)) return null;
  const nazir = getOrderEndowmentNazir(orderData);
  const dob =
    composePartsDob(nazir, "dob_of_property_owner_agent") ??
    composePartsDob(
      {
        dob_of_property_owner_agent: pickAgentRelatedField(
          orderData,
          "dob_of_property_owner_agent"
        ),
        dob_of_property_owner_agent_day: pickAgentRelatedField(
          orderData,
          "dob_of_property_owner_agent_day"
        ),
        dob_of_property_owner_agent_month: pickAgentRelatedField(
          orderData,
          "dob_of_property_owner_agent_month"
        ),
        dob_of_property_owner_agent_year: pickAgentRelatedField(
          orderData,
          "dob_of_property_owner_agent_year"
        ),
      },
      "dob_of_property_owner_agent"
    );
  const dobType = calendarTypeLabel(
    pickAgentRelatedField(orderData, "type_dob_property_owner_agent")
  );

  return {
    id_num: pick(
      nazir.id_num_of_property_owner_agent,
      pickAgentRelatedField(orderData, "id_num_of_property_owner_agent")
    ),
    phone: pick(
      nazir.mobile_of_property_owner_agent,
      pickAgentRelatedField(orderData, "mobile_of_property_owner_agent")
    ),
    dob,
    dob_type: dobType,
    dob_display: dob ? (dobType ? `${dob} (${dobType})` : dob) : null,
    is_multiple: yesNoLabel(
      pick(
        nazir.is_multiple_trusteeship_deed_copy,
        pickAgentRelatedField(orderData, "is_multiple_trusteeship_deed_copy")
      )
    ),
  };
}

/**
 * Shape GET /admin/orders/:id into the realtime detail header/groups view.
 */
export function mapOrderDetailView(orderData = {}) {
  const summary = orderData.contract_summary ?? {};
  const deed = getOrderDeedStep(orderData);
  const owner = getOrderOwnerStep(orderData);
  const tenant = getOrderTenantStep(orderData);
  const financial = getOrderFinancialStep(orderData);
  const units = getOrderUnits(orderData);

  const contractTypeKey = resolveOrderContractTypeKey(orderData);
  const contractTypeRaw = pick(
    summary.contract_type_trans,
    orderData.contract_type_trans,
    summary.contract_type,
    orderData.contract_type,
    contractTypeKey
  );
  const normalizedRaw = normalizeContractTypeKey(contractTypeRaw);
  const contractType =
    normalizedRaw === "housing" || normalizedRaw === "commercial"
      ? getContractTypeLabel(normalizedRaw)
      : contractTypeRaw || "—";

  const instrumentRaw = pick(
    summary.instrument_type_trans,
    deed.instrument_type_trans,
    orderData.instrument_type_trans,
    summary.instrument_type_label,
    deed.instrument_type_label,
    summary.instrument_type,
    deed.instrument_type,
    orderData.instrument_type,
    summary.instrument_type_key,
    deed.instrument_type_key,
    orderData.instrument_type_key
  );

  const paid = isPaidValue(
    pick(
      summary.is_paid,
      orderData.is_paid,
      summary.payment_status,
      orderData.payment_status,
      orderData.payment_label_ar
    )
  );

  const deedUrl = resolveImageUrl(
    pick(
      summary.image_instrument,
      deed.image_instrument,
      orderData.image_instrument,
      summary.image_instrument_from_the_front,
      deed.image_instrument_from_the_front
    )
  );

  const instrumentKey = pick(
    summary.instrument_type_key,
    deed.instrument_type_key,
    orderData.instrument_type_key
  );
  const isLeaseRenewal = instrumentKey === "lease_renewal";

  const paymentTypeAr = pick(
    orderData.payment_type?.name_ar,
    financial.payment_type?.name_ar,
    financial.payment_type_name,
    orderData.payment_type_name,
    orderData.payment_type?.name_trans,
    financial.payment_type?.name_trans
  );

  const tenantDob = composeTenantDob(tenant) ?? composeTenantDob(orderData);
  const tenantDobType = calendarTypeLabel(
    pick(tenant.type_tenant_dob, orderData.type_tenant_dob)
  );

  const extraAttachments = [
    mapDeedAttachment(
      pick(
        summary.Image_inheritance_certificate,
        deed.Image_inheritance_certificate,
        pickAgentRelatedField(orderData, "Image_inheritance_certificate"),
        orderData.Image_inheritance_certificate
      ),
      "شهادة حصر الإرث"
    ),
    mapDeedAttachment(
      pick(
        summary.copy_power_of_attorney_from_heirs_to_agent,
        deed.copy_power_of_attorney_from_heirs_to_agent,
        pickAgentRelatedField(orderData, "copy_power_of_attorney_from_heirs_to_agent"),
        orderData.copy_power_of_attorney_from_heirs_to_agent
      ),
      "توكيل الورثة للوكيل"
    ),
    mapDeedAttachment(
      pick(
        pickAgentRelatedField(orderData, "copy_of_the_authorization_or_agency"),
        deed.copy_of_the_authorization_or_agency,
        orderData.copy_of_the_authorization_or_agency
      ),
      "صورة التفويض / الوكالة"
    ),
    mapDeedAttachment(
      pick(
        deed.copy_of_the_endowment_registration_certificate,
        pickAgentRelatedField(orderData, "copy_of_the_endowment_registration_certificate"),
        orderData.copy_of_the_endowment_registration_certificate
      ),
      "شهادة تسجيل الوقف"
    ),
    mapDeedAttachment(
      pick(
        deed.copy_of_the_trusteeship_deed,
        pickAgentRelatedField(orderData, "copy_of_the_trusteeship_deed"),
        orderData.copy_of_the_trusteeship_deed
      ),
      "صك النظارة"
    ),
    mapDeedAttachment(
      pick(
        deed.copy_of_guardians_power_of_attorney_for_agent,
        pickAgentRelatedField(orderData, "copy_of_guardians_power_of_attorney_for_agent"),
        orderData.copy_of_guardians_power_of_attorney_for_agent
      ),
      "توكيل الأولياء للوكيل"
    ),
    mapDeedAttachment(
      pick(
        deed.image_instrument_from_the_back,
        orderData.image_instrument_from_the_back
      ),
      "صورة الصك (من الخلف)"
    ),
  ].filter(Boolean);

  const legalAgent = mapLegalAgentView(orderData);
  const endowmentNazir = mapEndowmentNazirView(orderData);

  return {
    id: orderData.id ?? summary.id,
    uuid: pick(orderData.uuid, summary.uuid, orderData.id),
    contract_type: contractType,
    contract_type_key: contractTypeKey ?? pick(summary.contract_type_key, orderData.contract_type_key),
    instrument_type: getInstrumentTypeLabel(instrumentRaw),
    status_id: pick(
      summary.contract_status_id,
      orderData.contract_status_id,
      orderData.status_id,
      orderData.status?.id
    ),
    status_name: pick(
      summary.contract_status_name,
      orderData.status_label,
      orderData.status?.name,
      orderData.contract_status_name,
      "قيد المعالجة"
    ),
    status_color: pick(
      summary.contract_status_color,
      orderData.status_color,
      orderData.status?.color,
      orderData.contract_status_color
    ),
    is_paid: paid,
    amount_payment: pick(
      summary.amount_payment,
      orderData.amount_payment,
      orderData.payment_amount
    ),
    user_mobile: pick(getOrderClientPhone(orderData), orderData.user_mobile, summary.user_mobile),
    employee_name: pick(summary.employee_name, orderData.employee_name, "—"),
    received_at: pick(orderData.received_at, summary.received_at),
    received_since: pick(orderData.received_since, summary.received_since),
    documentation_deadline_at: pick(
      orderData.documentation_deadline_at,
      summary.documentation_deadline_at
    ),
    app_or_web: appOrWebLabel(
      pick(orderData.app_or_web, summary.app_or_web, financial.app_or_web, orderData.start?.app_or_web)
    ),
    banner: pick(summary.notes_edits, financial.notes_edits, orderData.notes_edits, summary.client_explanation),
    status_timeline: mapStatusTimeline(orderData.status_timeline),
    deed: {
      type_label: getInstrumentTypeLabel(instrumentRaw),
      number: pick(
        summary.instrument_number,
        deed.instrument_number,
        orderData.instrument_number,
        summary.deed_number
      ),
      owner_id: pick(
        summary.property_owner_id_num,
        owner.property_owner_id_num,
        orderData.property_owner_id_num
      ),
      owner_phone: pick(
        summary.property_owner_mobile,
        owner.property_owner_mobile,
        orderData.property_owner_mobile
      ),
      file_url: deedUrl,
      file_name: fileNameFromUrl(deedUrl),
      file_label: isLeaseRenewal ? "العقد المرغوب تجديده" : "صورة الصك",
      attachments: extraAttachments,
      is_lease_renewal: isLeaseRenewal,
      legal_agent: legalAgent,
      endowment_nazir: endowmentNazir,
    },
    national_address: resolveNationalAddress(orderData),
    tenant: {
      type_label: tenantEntityLabel(pick(tenant.tenant_entity, orderData.tenant_entity)),
      name: pick(tenant.tenant_name, orderData.tenant_name),
      phone: pick(tenant.tenant_mobile, orderData.tenant_mobile),
      id_num: pick(tenant.tenant_id_num, orderData.tenant_id_num),
      dob: tenantDob,
      dob_type: tenantDobType,
      dob_display: tenantDob
        ? tenantDobType
          ? `${tenantDob} (${tenantDobType})`
          : tenantDob
        : null,
    },
    financial: {
      paid,
      payment_method: paymentTypeAr,
      start_date: pick(financial.contract_starting_date, orderData.contract_starting_date),
      duration: durationLabel(financial),
      frequency: paymentTypeAr,
      rent: pick(
        financial.annual_rent_amount_for_the_unit,
        financial.contract_term_in_years?.price,
        orderData.annual_rent_amount_for_the_unit
      ),
      fees: pick(summary.amount_payment, orderData.amount_payment, orderData.payment_amount),
      fees_paid: paid,
      total_price: mapTotalPrice(orderData.total_price),
      payments: mapContractPayments(
        orderData.contract_payments ?? orderData.payment_and_admin?.contract_payments
      ),
    },
    units: units.map((unit, index) => ({
      id: unit.id ?? unit.unit_id ?? index,
      title:
        unit.unit_number != null && unit.unit_number !== ""
          ? `الوحدة ${unit.unit_number}`
          : `الوحدة ${index + 1}`,
      badge: pick(unit.unit_type_name, unit.unit_type, unit.badge),
      number: unit.unit_number,
      type: pick(unit.unit_type_name, unit.unit_type),
      use: pick(unit.unit_usage_name, unit.unit_usage),
      floor: unit.floor_number,
      area: unit.unit_area != null ? `${unit.unit_area} م²` : null,
      rooms: pick(unit.number_of_rooms, unit.tootal_rooms),
      bathrooms: pick(unit.The_number_of_toilets, unit.The_number_of_the_toilet),
      kitchens: unit.The_number_of_kitchens,
      ac:
        unit.split_ac || unit.window_ac
          ? [unit.split_ac ? "سبليت" : null, unit.window_ac ? "شباك" : null]
              .filter(Boolean)
              .join(" / ")
          : null,
      furnished: yesNoLabel(unit.furnished),
      kitchen_tank: yesNoLabel(unit.kitchen_tank),
      kitchen_cabinets: yesNoLabel(unit.kitchen_cabinets),
      electricity_meter: yesNoLabel(unit.electricity_meter),
      water_meter: yesNoLabel(unit.water_meter),
      services: Array.isArray(unit.Services)
        ? unit.Services.filter(Boolean).join(" / ") || null
        : yesNoLabel(unit.Services ?? unit.services),
    })),
    units_count: getOrderUnitsCount(orderData),
  };
}
