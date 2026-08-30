import { getInstrumentTypeLabel } from "@/src/lib/instrument-types";
import { getContractTypeLabel } from "@/src/lib/contract-period-utils";
import { getOrderClientPhone } from "@/components/Orders/messages/order-section-message-utils";
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

function durationLabel(step4 = {}) {
  const years = pick(step4.duration_years, step4.contract_term_in_years?.years);
  const months = step4.duration_months;
  if (years && months) return `${years} سنة / ${months} شهر`;
  if (years) return `${years} سنة`;
  if (months) return `${months} شهر`;
  if (typeof step4.contract_term_in_years === "string") return step4.contract_term_in_years;
  return step4.duration_preset || null;
}

/**
 * Shape GET /admin/orders/:id into the realtime detail header/groups view.
 */
export function mapOrderDetailView(orderData = {}) {
  const summary = orderData.contract_summary ?? {};
  const step1 = orderData.step1 ?? {};
  const step3 = orderData.step3 ?? {};
  const step4 = orderData.step4 ?? {};
  const units = Array.isArray(orderData.units) ? orderData.units : [];

  const contractTypeRaw = pick(
    summary.contract_type_trans,
    orderData.contract_type_trans,
    summary.contract_type,
    orderData.contract_type
  );
  const contractType =
    contractTypeRaw === "housing" || contractTypeRaw === "commercial"
      ? getContractTypeLabel(contractTypeRaw)
      : contractTypeRaw || "—";

  const instrumentRaw = pick(
    summary.instrument_type_trans,
    orderData.instrument_type_trans,
    summary.instrument_type,
    orderData.instrument_type,
    summary.instrument_type_key,
    orderData.instrument_type_key
  );

  const paid = isPaidValue(
    pick(summary.is_paid, orderData.is_paid, summary.payment_status, orderData.payment_status)
  );

  const deedUrl = resolveImageUrl(
    pick(
      summary.image_instrument,
      orderData.image_instrument,
      summary.image_instrument_from_the_front
    )
  );

  return {
    id: orderData.id ?? summary.id,
    uuid: pick(orderData.uuid, summary.uuid, orderData.id),
    contract_type: contractType,
    contract_type_key: pick(summary.contract_type_key, orderData.contract_type_key),
    instrument_type: getInstrumentTypeLabel(instrumentRaw),
    status_id: pick(
      summary.contract_status_id,
      orderData.contract_status_id,
      orderData.status?.id
    ),
    status_name: pick(
      summary.contract_status_name,
      orderData.status?.name,
      orderData.contract_status_name,
      "قيد المعالجة"
    ),
    status_color: pick(
      summary.contract_status_color,
      orderData.status?.color,
      orderData.contract_status_color
    ),
    is_paid: paid,
    amount_payment: pick(summary.amount_payment, orderData.amount_payment),
    user_mobile: pick(getOrderClientPhone(orderData), orderData.user_mobile, summary.user_mobile),
    employee_name: pick(summary.employee_name, orderData.employee_name, "—"),
    received_at: pick(orderData.received_at, summary.received_at),
    received_since: pick(orderData.received_since, summary.received_since),
    banner: pick(summary.notes_edits, orderData.notes_edits, summary.client_explanation),
    deed: {
      type_label: getInstrumentTypeLabel(instrumentRaw),
      number: pick(summary.instrument_number, orderData.instrument_number, summary.deed_number),
      owner_id: pick(summary.property_owner_id_num, orderData.property_owner_id_num),
      owner_phone: pick(summary.property_owner_mobile, orderData.property_owner_mobile),
      owner_name: pick(summary.name_owner, orderData.name_owner),
      file_url: deedUrl,
      file_name: fileNameFromUrl(deedUrl),
    },
    national_address: resolveNationalAddress(orderData),
    tenant: {
      type_label: tenantEntityLabel(pick(step3.tenant_entity, orderData.tenant_entity)),
      phone: pick(step3.tenant_mobile, orderData.tenant_mobile),
    },
    financial: {
      paid,
      payment_method: pick(step4.payment_type_name, orderData.payment_type?.name_ar),
      start_date: pick(step4.contract_starting_date, orderData.contract_starting_date),
      duration: durationLabel(step4),
      frequency: pick(step4.payment_type_name, orderData.payment_type?.name_trans),
      rent: pick(
        step4.annual_rent_amount_for_the_unit,
        step4.contract_term_in_years?.price,
        orderData.annual_rent_amount_for_the_unit
      ),
      fees: pick(summary.amount_payment, orderData.amount_payment),
      fees_paid: paid,
    },
    units: units.map((unit, index) => ({
      id: unit.id ?? index,
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
      furnished: unit.furnished === true || unit.furnished === 1 ? "نعم" : unit.furnished === false || unit.furnished === 0 ? "لا" : unit.furnished,
    })),
    units_count: orderData.units_count ?? units.length,
  };
}
