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
    agent_iban: pick(
      pickAgentRelatedField(orderData, "agent_iban_of_property_owner"),
      orderData.agent_iban_of_property_owner
    ),
    agent_record_id: pick(
      pickAgentRelatedField(orderData, "id_num_of_property_owner_agent_record"),
      orderData.id_num_of_property_owner_agent_record
    ),
    agent_dob_hijri: pick(
      orderData.dob_hijri_of_property_owner_agent,
      orderData.dob_hijri_of_property_owner_agent_record
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

function relationName(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    return pick(value.name_trans, value.name_ar, value.name, value.name_en);
  }
  return null;
}

function mapStatusCaseView(statusCase) {
  if (!statusCase || typeof statusCase !== "object") return null;
  const mapped = {
    deed_type: statusCase.deed_type,
    deed_addition_method: statusCase.deed_addition_method,
    deed_number: statusCase.deed_number,
    ejar_contract_number: statusCase.ejar_contract_number,
    ejar_contract_draft_number: statusCase.ejar_contract_draft_number,
    ejar_status_notes: pick(statusCase.ejar_status_notes, statusCase.notes),
    contact_number_mode: statusCase.contact_number_mode,
    contact_number: pick(statusCase.contact_number, statusCase.current_contact_number),
    attachment: resolveImageUrl(
      pick(statusCase.attachment, statusCase.status_attachment)
    ),
  };
  const hasAny = Object.values(mapped).some((value) => value != null && value !== "");
  return hasAny ? mapped : null;
}

function mapInvoiceView(invoice) {
  if (!invoice || typeof invoice !== "object") return null;
  return {
    number: pick(invoice.invoice_number, invoice.invoiceNo, invoice.number, invoice.id),
    amount: pick(invoice.amount, invoice.total, invoice.total_amount),
    status: pick(invoice.status, invoice.status_label),
    date: pick(invoice.date, invoice.invoice_date, invoice.created_at),
    reference: pick(invoice.reference_number, invoice.referenceNo, invoice.reference),
  };
}

function mapAccountView(account) {
  if (!account || typeof account !== "object") return null;
  return {
    holder_name: pick(
      account.account_holder_name,
      account.client_account_holder_name,
      account.name
    ),
    bank_name: pick(account.bank_name, account.bank),
    account_number: pick(account.account_number, account.bank_account_number, account.iban),
    iban: account.iban,
  };
}

function mapRefundView(orderData = {}) {
  const refund = orderData.refund ?? orderData.refundable_contract ?? null;
  const mapped = {
    return_status: pick(orderData.return_request_status, orderData.return_status),
    refund_amount: pick(orderData.refund_amount, refund?.amount, refund?.refund_amount),
    refund_id: pick(orderData.refund_id, refund?.id),
    reference_number: pick(orderData.reference_number, refund?.reference_number),
    refund_notes: pick(orderData.refund_notes, refund?.notes),
    accept_return: yesNoLabel(orderData.accept_retrun_contract),
    accept_return_employee: pick(
      orderData.accept_retrun_contract_employee?.name,
      orderData.accept_retrun_contract_employee_id
    ),
  };
  const hasAny = Object.values(mapped).some((value) => value != null && value !== "");
  return hasAny ? mapped : null;
}

function mapExtrasView(orderData = {}) {
  const statusCase = mapStatusCaseView(orderData.status_case);
  const invoice = mapInvoiceView(orderData.invoice);
  const account = mapAccountView(orderData.account);
  const refund = mapRefundView(orderData);
  const draftBefore = resolveImageUrl(
    pick(orderData.draft_before_paid, orderData.draft_before_paid_path)
  );
  const draftAfter = resolveImageUrl(
    pick(orderData.draft_after_paid, orderData.draft_after_paid_path)
  );
  const strongArgument = resolveImageUrl(
    pick(orderData.strong_argument_photo_path, orderData.strong_argument_photo)
  );

  return {
    ejar_contract_number: pick(
      orderData.ejar_contract_number,
      statusCase?.ejar_contract_number
    ),
    ejar_contract_draft_number: pick(
      orderData.ejar_contract_draft_number,
      statusCase?.ejar_contract_draft_number
    ),
    ejar_status_notes: pick(orderData.ejar_status_notes, statusCase?.ejar_status_notes),
    deed_type: pick(orderData.deed_type, statusCase?.deed_type),
    deed_addition_method: pick(
      orderData.deed_addition_method,
      statusCase?.deed_addition_method
    ),
    deed_number: pick(orderData.deed_number, statusCase?.deed_number),
    draft_contract_status: pick(
      orderData.draft_contract_status?.name,
      orderData.draft_contract_status_name,
      orderData.relation_labels?.draft_contract_status
    ),
    draft_contract_number: orderData.draft_contract_number,
    expiry_date: orderData.expiry_date,
    rating: orderData.rating,
    rating_note: orderData.rating_note,
    is_review: yesNoLabel(orderData.is_review),
    notes_edits: pick(
      orderData.contract_summary?.notes_edits,
      orderData.notes_edits
    ),
    draft_before_paid_url: draftBefore,
    draft_before_paid_name: fileNameFromUrl(draftBefore),
    draft_after_paid_url: draftAfter,
    draft_after_paid_name: fileNameFromUrl(draftAfter),
    strong_argument_url: strongArgument,
    strong_argument_name: fileNameFromUrl(strongArgument),
    status_case: statusCase,
    invoice,
    account,
    refund,
  };
}

function mapRealEstateView(orderData = {}) {
  const estate = orderData.real_estate;
  const isLinked =
    Boolean(estate && typeof estate === "object") ||
    orderData.is_real === 1 ||
    orderData.is_real === true ||
    orderData.real_id != null;

  if (!estate || typeof estate !== "object") {
    return {
      linked: Boolean(isLinked && orderData.real_id != null),
      id: orderData.real_id ?? null,
      name: null,
      instrument_type: null,
      instrument_number: null,
      registry_number: null,
      property_type: null,
      property_usage: null,
      region: null,
      city: null,
      district: null,
      street: null,
      building_number: null,
      owner_id: null,
      owner_phone: null,
      age: null,
      floors: null,
      units_count: null,
      date_first_registration: null,
    };
  }

  return {
    linked: true,
    id: pick(estate.id, orderData.real_id),
    name: pick(estate.name_real_estate, estate.name),
    instrument_type: pick(
      estate.instrument_type_trans,
      estate.instrument_type_label,
      estate.instrument_type
    ),
    instrument_number: pick(estate.instrument_number, estate.deed_number),
    registry_number: estate.real_estate_registry_number,
    property_type: pick(
      estate.property_type_name,
      estate.property_type?.name_ar,
      estate.property_type?.name
    ),
    property_usage: pick(
      estate.property_usages_name,
      estate.property_usages?.name_ar,
      estate.property_usages?.name
    ),
    region: pick(
      estate.property_place_name,
      estate.property_region?.name_ar,
      estate.property_region?.name
    ),
    city: pick(
      estate.property_city_name,
      estate.city_name,
      estate.property_city?.name_ar,
      estate.property_city?.name
    ),
    district: pick(estate.neighborhood, estate.district),
    street: estate.street,
    building_number: estate.building_number,
    owner_id: pick(estate.national_num, estate.property_owner_id_num),
    owner_phone: pick(estate.mobile, estate.property_owner_mobile),
    age: estate.age_of_the_property,
    floors: estate.number_of_floors,
    units_count: pick(
      estate.number_of_units_in_realestate,
      estate.Count_Units,
      estate.units_count
    ),
    date_first_registration: estate.date_first_registration,
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
      owner_name: pick(summary.name_owner, owner.name_owner, orderData.name_owner),
      owner_iban: pick(
        summary.property_owner_iban,
        owner.property_owner_iban,
        orderData.property_owner_iban
      ),
      owner_dob: (() => {
        const full = pick(
          summary.property_owner_dob,
          owner.property_owner_dob,
          orderData.property_owner_dob
        );
        if (full) return full;
        return composePartsDob(owner, "property_owner_dob")
          ?? composePartsDob(orderData, "property_owner_dob");
      })(),
      owner_dob_type: calendarTypeLabel(
        pick(
          summary.type_dob_property_owner,
          owner.type_dob_property_owner,
          orderData.type_dob_property_owner
        )
      ),
      file_url: deedUrl,
      file_name: fileNameFromUrl(deedUrl),
      file_label: isLeaseRenewal ? "العقد المرغوب تجديده" : "صورة الصك",
      attachments: extraAttachments,
      is_lease_renewal: isLeaseRenewal,
      legal_agent: legalAgent,
      endowment_nazir: endowmentNazir,
      property_name: pick(
        deed.name_real_estate,
        orderData.name_real_estate,
        orderData.real_estate?.name_real_estate,
        orderData.real_estate?.name
      ),
      property_type: pick(
        deed.property_type_name,
        orderData.property_type_name,
        orderData.relation_labels?.property_type,
        orderData.property_type?.name_ar,
        orderData.property_type?.name
      ),
      property_usage: pick(
        deed.property_usages_name,
        orderData.property_usages_name,
        orderData.relation_labels?.property_usages,
        orderData.property_usages?.name_ar,
        orderData.property_usages?.name
      ),
      contract_ownership: pick(deed.contract_ownership, orderData.contract_ownership),
      registry_number: pick(
        deed.real_estate_registry_number,
        orderData.real_estate_registry_number
      ),
      unit_number_of_real: pick(deed.unit_number_of_real, orderData.unit_number_of_real),
      instrument_history: (() => {
        const full = pick(deed.instrument_history, orderData.instrument_history);
        if (full) return full;
        const composed = [
          deed.instrument_history_day ?? orderData.instrument_history_day,
          deed.instrument_history_month ?? orderData.instrument_history_month,
          deed.instrument_history_year ?? orderData.instrument_history_year,
        ]
          .filter((part) => part != null && part !== "")
          .join("-");
        return composed || null;
      })(),
      instrument_history_type: calendarTypeLabel(
        pick(deed.type_instrument_history, orderData.type_instrument_history)
      ),
      date_first_registration: pick(
        deed.date_first_registration,
        orderData.date_first_registration
      ),
      date_first_registration_type: calendarTypeLabel(
        pick(deed.type_date_first_registration, orderData.type_date_first_registration)
      ),
      age_of_the_property: pick(deed.age_of_the_property, orderData.age_of_the_property),
      number_of_floors: pick(deed.number_of_floors, orderData.number_of_floors),
      number_of_units_per_floor: pick(
        deed.number_of_units_per_floor,
        orderData.number_of_units_per_floor
      ),
      number_of_units_in_realestate: pick(
        deed.number_of_units_in_realestate,
        orderData.number_of_units_in_realestate
      ),
    },
    national_address: resolveNationalAddress(orderData),
    tenant: {
      type_label: tenantEntityLabel(pick(tenant.tenant_entity, orderData.tenant_entity)),
      name: pick(tenant.tenant_name, orderData.tenant_name),
      email: pick(tenant.tenant_email, orderData.tenant_email),
      nationality: pick(tenant.tenant_nationality, orderData.tenant_nationality),
      work: pick(tenant.tenant_work, orderData.tenant_work),
      gender: pick(tenant.tenant_gender, orderData.tenant_gender),
      phone: pick(tenant.tenant_mobile, orderData.tenant_mobile),
      id_num: pick(tenant.tenant_id_num, orderData.tenant_id_num),
      dob: tenantDob,
      dob_type: tenantDobType,
      dob_display: tenantDob
        ? tenantDobType
          ? `${tenantDob} (${tenantDobType})`
          : tenantDob
        : null,
      entity_region: pick(
        orderData.relation_labels?.tenant_entity_region,
        relationName(orderData.tenant_entity_region),
        relationName(tenant.tenant_entity_region)
      ),
      entity_city: pick(
        orderData.relation_labels?.tenant_entity_city,
        relationName(orderData.tenant_entity_city),
        relationName(tenant.tenant_entity_city)
      ),
      entity_legal_region: pick(
        orderData.relation_labels?.tenant_entity_legal_region,
        relationName(orderData.tenant_entity_legal_region),
        relationName(tenant.tenant_entity_legal_region),
        relationName(orderData.region_of_the_tenant_legal_agent),
        tenant.region_of_the_tenant_legal_agent
      ),
      entity_legal_city: pick(
        orderData.relation_labels?.tenant_entity_legal_city,
        relationName(orderData.tenant_entity_legal_city),
        relationName(tenant.tenant_entity_legal_city),
        relationName(orderData.city_of_the_tenant_legal_agent),
        tenant.city_of_the_tenant_legal_agent
      ),
      has_legal_representative: yesNoLabel(
        pick(
          tenant.is_there_a_legal_representative_of_the_tenant,
          orderData.is_there_a_legal_representative_of_the_tenant
        )
      ),
      owner_record_url: resolveImageUrl(
        pick(
          tenant.copy_of_the_owner_record,
          orderData.copy_of_the_owner_record,
          orderData.copy_of_the_owner_record_path
        )
      ),
      owner_record_name: fileNameFromUrl(
        resolveImageUrl(
          pick(
            tenant.copy_of_the_owner_record,
            orderData.copy_of_the_owner_record,
            orderData.copy_of_the_owner_record_path
          )
        )
      ),
    },
    real_estate: mapRealEstateView(orderData),
    extras: mapExtrasView(orderData),
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
      daily_fine: pick(financial.daily_fine, orderData.daily_fine),
      sub_delay: pick(financial.sub_delay, orderData.sub_delay),
      deposit: pick(financial.deposit, orderData.deposit),
      guarantee_amount: pick(
        financial.Guarantee_amount,
        orderData.Guarantee_amount,
        financial.guarantee_amount
      ),
      premium_membership_for_free: yesNoLabel(
        pick(financial.premium_membership_for_free, orderData.premium_membership_for_free)
      ),
      bank_account_number: pick(
        financial.bank_account_number,
        orderData.bank_account_number,
        orderData.account?.account_number,
        orderData.account?.iban
      ),
      client_account_holder_name: pick(
        financial.client_account_holder_name,
        orderData.client_account_holder_name,
        orderData.account?.account_holder_name,
        orderData.account?.name
      ),
      notes_edits: pick(financial.notes_edits, orderData.notes_edits, summary.notes_edits),
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
      badge: pick(unit.unit_usage_name, unit.unit_usage, unit.badge),
      number: unit.unit_number,
      type: pick(unit.unit_type_name, unit.unit_type),
      use: pick(unit.unit_usage_name, unit.unit_usage),
      floor: unit.floor_number,
      area: unit.unit_area != null ? `${unit.unit_area} م²` : null,
      rooms: pick(unit.number_of_rooms, unit.tootal_rooms),
      halls: unit.The_number_of_halls,
      councils: unit.number_of_councils,
      bathrooms: pick(unit.The_number_of_toilets, unit.The_number_of_the_toilet),
      kitchens: unit.The_number_of_kitchens,
      ac:
        unit.split_ac || unit.window_ac || unit.number_of_unit_air_conditioners
          ? [
              unit.split_ac ? "سبليت" : null,
              unit.window_ac ? "شباك" : null,
              unit.number_of_unit_air_conditioners
                ? `${unit.number_of_unit_air_conditioners} مكيف`
                : null,
            ]
              .filter(Boolean)
              .join(" / ")
          : null,
      air_conditioners: unit.number_of_unit_air_conditioners,
      furnished: yesNoLabel(unit.furnished),
      kitchen_tank: yesNoLabel(unit.kitchen_tank),
      kitchen_cabinets: yesNoLabel(unit.kitchen_cabinets),
      electricity_meter: yesNoLabel(unit.electricity_meter),
      electricity_meter_number: unit.electricity_meter_number,
      water_meter: yesNoLabel(unit.water_meter),
      water_meter_number: unit.water_meter_number,
      gas_meter: yesNoLabel(unit.Gasmeter),
      parking_spaces: unit.Number_parking_spaces,
      services: Array.isArray(unit.Services)
        ? unit.Services.filter(Boolean).join(" / ") || null
        : yesNoLabel(unit.Services ?? unit.services),
    })),
    units_count: getOrderUnitsCount(orderData),
  };
}
