/** بيانات الطلب المستخدمة في إرسال الخطأ عبر واتساب (منفصلة عن رسائل الأقسام) */

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

export function getOrderSectionFields(orderData, context) {
  const summary = orderData?.contract_summary ?? {};
  const owner = getOrderOwnerStep(orderData);
  const address = getOrderAddressStep(orderData);
  const deed = getOrderDeedStep(orderData);
  const orderId = orderData?.uuid ?? orderData?.id ?? summary?.id;

  if (context === "owner") {
    return [
      { label: "رقم الطلب", value: orderId },
      { label: "رقم الهوية", value: owner.property_owner_id_num ?? summary.property_owner_id_num },
      { label: "تاريخ الميلاد", value: owner.property_owner_dob ?? summary.property_owner_dob },
      { label: "رقم الجوال", value: owner.property_owner_mobile ?? summary.property_owner_mobile },
      { label: "ايبان المالك", value: owner.property_owner_iban ?? summary.property_owner_iban },
      {
        label: "المنطقة",
        value: summary.relation_labels?.property_region || address.property_place_name,
      },
      {
        label: "المدينة",
        value: summary.relation_labels?.property_city || address.city_name,
      },
      { label: "الحي", value: address.neighborhood ?? summary.neighborhood },
      { label: "الشارع", value: address.street ?? summary.street },
    ];
  }

  if (context === "agent") {
    return [
      { label: "رقم الطلب", value: orderId },
      {
        label: "اسم الوكيل",
        value:
          summary.name_of_property_owner_agent ??
          summary.property_owner_agent_name,
      },
      {
        label: "رقم الهوية",
        value: pickAgentRelatedField(orderData, "id_num_of_property_owner_agent"),
      },
      {
        label: "تاريخ الميلاد",
        value: pickAgentRelatedField(orderData, "dob_of_property_owner_agent"),
      },
      {
        label: "رقم الجوال",
        value: pickAgentRelatedField(orderData, "mobile_of_property_owner_agent"),
      },
      {
        label: "رقم الوكالة",
        value: pickAgentRelatedField(
          orderData,
          "agency_number_in_instrument_of_property_owner"
        ),
      },
    ];
  }

  if (context === "propertyAddress") {
    return [
      { label: "رقم الطلب", value: orderId },
      { label: "المدينة", value: address.city_name || address.property_city_id },
      {
        label: "المنطقة",
        value: address.property_place_name || address.property_place_id,
      },
      { label: "الحي", value: address.neighborhood },
      { label: "الشارع", value: address.street },
      { label: "رقم المبنى", value: address.building_number },
      { label: "رقم الإضافي", value: address.extra_figure },
      { label: "الرمز البريدي", value: address.postal_code },
      { label: "خط العرض", value: address.latitude ?? address.lat },
      { label: "خط الطول", value: address.longitude ?? address.lng },
    ];
  }

  if (context === "propertyDetails") {
    return [
      { label: "رقم الطلب", value: orderId },
      {
        label: "استخدام العقار",
        value: deed.property_usages_name ?? address.property_usages_name,
      },
      {
        label: "نوع العقار",
        value: deed.property_type_name ?? address.property_type_name,
      },
      {
        label: "إجمالي عدد الوحدات في كل طابق",
        value: deed.number_of_units_per_floor,
      },
      { label: "إجمالي عدد الطوابق", value: deed.number_of_floors },
      { label: "عمر العقار", value: deed.age_of_the_property },
      {
        label: "إجمالي عدد الوحدات في العقار",
        value: deed.number_of_units_in_realestate,
      },
    ];
  }

  const unitsStep = getOrderUnitsStep(orderData);
  const unit = getOrderUnits(orderData)[0] ?? unitsStep.unit ?? {};

  if (context === "unitDetails") {
    return [
      { label: "رقم الطلب", value: orderId },
      {
        label: "نوع الوحدة",
        value:
          unit.unit_type_name ||
          unitsStep.unit_type_name ||
          unit.unit_type_id ||
          unitsStep.unit_type_id,
      },
      {
        label: "استخدام الوحدة",
        value:
          unit.unit_usage_name ||
          unitsStep.unit_usage_name ||
          unit.unit_usage_id ||
          unitsStep.unit_usage_id,
      },
      { label: "رقم الوحدة", value: unit.unit_number ?? unitsStep.unit_number },
      { label: "رقم الطابق", value: unit.floor_number ?? unitsStep.floor_number },
      { label: "مساحة الوحدة", value: unit.unit_area ?? unitsStep.unit_area },
      { label: "إجمالي الغرف", value: unit.tootal_rooms ?? unitsStep.tootal_rooms },
      {
        label: "عدد الغرف",
        value: unit.number_of_rooms ?? unitsStep.number_of_rooms,
      },
      {
        label: "عدد الصالات",
        value: unit.The_number_of_halls ?? unitsStep.The_number_of_halls,
      },
      {
        label: "عدد المطابخ",
        value: unit.The_number_of_kitchens ?? unitsStep.The_number_of_kitchens,
      },
      {
        label: "عدد دورات المياه",
        value: unit.The_number_of_toilets ?? unitsStep.The_number_of_toilets,
      },
    ];
  }

  const tenant = getOrderTenantStep(orderData);

  if (context === "contractTenant") {
    return [
      { label: "رقم الطلب", value: orderId },
      { label: "كيان المستأجر", value: tenant.tenant_entity },
      { label: "رقم هوية المستأجر", value: tenant.tenant_id_num },
      { label: "تاريخ ميلاد المستأجر", value: tenant.tenant_dob },
      { label: "رقم جوال المستأجر", value: tenant.tenant_mobile },
      {
        label: "الرقم الموحد للمنشأة",
        value: tenant.tenant_entity_unified_registry_number,
      },
      {
        label: "رقم هوية وكيل المستأجر",
        value: tenant.id_num_of_property_tenant_agent,
      },
      {
        label: "جوال وكيل المستأجر",
        value: tenant.mobile_of_property_tenant_agent,
      },
    ];
  }

  const financial = getOrderFinancialStep(orderData);

  if (context === "financialTerms") {
    return [
      { label: "رقم الطلب", value: orderId },
      {
        label: "نوع الدفع",
        value:
          orderData?.payment_type?.name_trans ||
          orderData?.payment_type?.name_ar ||
          orderData?.payment_type?.name ||
          financial.payment_type_name ||
          financial.payment_type_id,
      },
      {
        label: "مدة العقد",
        value:
          typeof financial.contract_term_in_years === "object"
            ? financial.contract_term_in_years?.name ||
              financial.contract_term_in_years?.period
            : financial.contract_term_in_years,
      },
      { label: "مدة (سنوات)", value: financial.duration_years },
      { label: "مدة (أشهر)", value: financial.duration_months },
      { label: "تاريخ بداية العقد", value: financial.contract_starting_date },
      {
        label: "صلاحيات المستأجر",
        value: (() => {
          const details =
            orderData?.tenant_roles_details || financial.tenant_roles_details;
          if (Array.isArray(details) && details.length) {
            return details
              .map((item) => {
                const label = item?.text_of_reason || item?.name || "";
                return item?.value != null && item.value !== ""
                  ? `${label} (${item.value})`
                  : label;
              })
              .filter(Boolean)
              .join("، ");
          }
          const names =
            orderData?.tenant_role_names || financial.tenant_role_names;
          if (Array.isArray(names) && names.length) return names.join("، ");
          return (
            orderData?.tenant_role?.text_of_reason ||
            orderData?.tenant_role?.name ||
            financial.tenant_role_id
          );
        })(),
      },
      {
        label: "شروط أخرى",
        value: (() => {
          const list =
            orderData?.other_conditions_list || financial.other_conditions_list;
          if (Array.isArray(list) && list.length) {
            return list.filter(Boolean).join("، ");
          }
          return (
            orderData?.other_conditions ||
            financial.other_conditions ||
            financial.text_additional_terms
          );
        })(),
      },
      { label: "نص الشروط الإضافية", value: financial.text_additional_terms },
      { label: "ملاحظات", value: financial.notes },
    ];
  }

  return [];
}

export function formatSectionDataBlock(fields) {
  return fields
    .filter(({ value }) => value !== null && value !== undefined && value !== "")
    .map(({ label, value }) => `\t•\t${label}: ${value}`)
    .join("\n");
}

export function getOrderContractUuid(orderData) {
  const summary = orderData?.contract_summary ?? {};
  return (
    orderData?.uuid ??
    orderData?.contract_uuid ??
    summary?.uuid ??
    summary?.contract_uuid ??
    ""
  );
}

export function getOrderId(orderData) {
  const summary = orderData?.contract_summary ?? {};
  return getOrderContractUuid(orderData) || orderData?.id || summary?.id || "";
}

export function normalizeWhatsAppPhone(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  if (digits.length === 9) return `966${digits}`;
  return digits;
}

export function buildWhatsAppUrl(phone, messageText) {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) return null;
  const text = encodeURIComponent(messageText || "");
  return `https://wa.me/${normalized}${text ? `?text=${text}` : ""}`;
}

export function getOrderClientPhone(orderData) {
  return getOrderPhoneForContext(orderData, "owner");
}

export function getOrderPhoneForContext(orderData, context) {
  const summary = orderData?.contract_summary ?? {};
  const owner = getOrderOwnerStep(orderData);
  const tenant = getOrderTenantStep(orderData);

  if (context === "agent") {
    return pickAgentRelatedField(orderData, "mobile_of_property_owner_agent") || "";
  }

  if (context === "contractTenant") {
    return (
      tenant?.tenant_mobile ||
      tenant?.mobile_of_property_tenant_agent ||
      orderData?.user?.mobile ||
      orderData?.user_mobile ||
      owner.property_owner_mobile ||
      summary?.property_owner_mobile ||
      ""
    );
  }

  return (
    owner.property_owner_mobile ||
    summary?.property_owner_mobile ||
    orderData?.user?.mobile ||
    orderData?.user_mobile ||
    ""
  );
}

export function getWhatsAppRecipientLabel(context) {
  if (context === "agent") return "الوكيل";
  if (context === "contractTenant") return "المستأجر";
  return "العميل";
}
