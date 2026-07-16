/** بيانات الطلب المستخدمة في إرسال الخطأ عبر واتساب (منفصلة عن رسائل الأقسام) */

export function getOrderSectionFields(orderData, context) {
  const summary = orderData?.contract_summary ?? {};
  const orderId = orderData?.uuid ?? orderData?.id ?? summary?.id;

  if (context === "owner") {
    return [
      { label: "رقم الطلب", value: orderId },
      { label: "اسم المالك", value: summary.name_owner },
      { label: "رقم الهوية", value: summary.property_owner_id_num },
      { label: "تاريخ الميلاد", value: summary.property_owner_dob },
      { label: "رقم الجوال", value: summary.property_owner_mobile },
      { label: "ايبان المالك", value: summary.property_owner_iban },
      { label: "المنطقة", value: summary.relation_labels?.property_region },
      { label: "المدينة", value: summary.relation_labels?.property_city },
      { label: "الحي", value: summary.neighborhood },
      { label: "الشارع", value: summary.street },
    ];
  }

  if (context === "agent") {
    return [
      { label: "رقم الطلب", value: orderId },
      {
        label: "اسم الوكيل",
        value:
          summary.name_of_property_owner_agent ??
          summary.property_owner_agent_name ??
          summary.name_owner,
      },
      { label: "رقم الهوية", value: summary.id_num_of_property_owner_agent },
      { label: "تاريخ الميلاد", value: summary.dob_of_property_owner_agent },
      { label: "رقم الجوال", value: summary.mobile_of_property_owner_agent },
    ];
  }

  const step1 = orderData?.step1 ?? {};

  if (context === "propertyAddress") {
    return [
      { label: "رقم الطلب", value: orderId },
      { label: "المدينة", value: step1.city_name || step1.property_city_id },
      { label: "المنطقة", value: step1.property_place_name || step1.property_place_id },
      { label: "الحي", value: step1.neighborhood },
      { label: "الشارع", value: step1.street },
      { label: "رقم المبنى", value: step1.building_number },
      { label: "رقم الإضافي", value: step1.extra_figure },
      { label: "الرمز البريدي", value: step1.postal_code },
      { label: "خط العرض", value: step1.latitude },
      { label: "خط الطول", value: step1.longitude },
    ];
  }

  if (context === "propertyDetails") {
    return [
      { label: "رقم الطلب", value: orderId },
      { label: "استخدام العقار", value: step1.property_usages_name },
      { label: "نوع العقار", value: step1.property_type_name },
      { label: "إجمالي عدد الوحدات في كل طابق", value: step1.number_of_units_per_floor },
      { label: "إجمالي عدد الطوابق", value: step1.number_of_floors },
      { label: "عمر العقار", value: step1.age_of_the_property },
      { label: "إجمالي عدد الوحدات في العقار", value: step1.number_of_units_in_realestate },
      { label: "إسم مالك العقار", value: summary.name_owner },
    ];
  }

  const step2 = orderData?.step2 ?? {};
  const unit = step2.unit ?? orderData?.unit ?? {};

  if (context === "unitDetails") {
    return [
      { label: "رقم الطلب", value: orderId },
      {
        label: "نوع الوحدة",
        value:
          step2.unit_type_name ||
          unit.unit_type_name ||
          step2.unit_type_id ||
          unit.unit_type_id,
      },
      {
        label: "استخدام الوحدة",
        value:
          step2.unit_usage_name ||
          unit.unit_usage_name ||
          step2.unit_usage_id ||
          unit.unit_usage_id,
      },
      { label: "رقم الوحدة", value: step2.unit_number ?? unit.unit_number },
      { label: "رقم الطابق", value: step2.floor_number ?? unit.floor_number },
      { label: "مساحة الوحدة", value: step2.unit_area ?? unit.unit_area },
      { label: "إجمالي الغرف", value: step2.tootal_rooms ?? unit.tootal_rooms },
      { label: "عدد الغرف", value: step2.number_of_rooms ?? unit.number_of_rooms },
      {
        label: "عدد الصالات",
        value: step2.The_number_of_halls ?? unit.The_number_of_halls,
      },
      {
        label: "عدد المطابخ",
        value: step2.The_number_of_kitchens ?? unit.The_number_of_kitchens,
      },
      {
        label: "عدد دورات المياه",
        value: step2.The_number_of_toilets ?? unit.The_number_of_toilets,
      },
    ];
  }

  const step3 = orderData?.step3 ?? {};

  if (context === "contractTenant") {
    return [
      { label: "رقم الطلب", value: orderId },
      { label: "كيان المستأجر", value: step3.tenant_entity },
      { label: "رقم هوية المستأجر", value: step3.tenant_id_num },
      { label: "تاريخ ميلاد المستأجر", value: step3.tenant_dob },
      { label: "رقم جوال المستأجر", value: step3.tenant_mobile },
      {
        label: "الرقم الموحد للمنشأة",
        value: step3.tenant_entity_unified_registry_number,
      },
      {
        label: "رقم هوية وكيل المستأجر",
        value: step3.id_num_of_property_tenant_agent,
      },
      {
        label: "جوال وكيل المستأجر",
        value: step3.mobile_of_property_tenant_agent,
      },
    ];
  }

  const step4 = orderData?.step4 ?? {};

  if (context === "financialTerms") {
    return [
      { label: "رقم الطلب", value: orderId },
      {
        label: "نوع الدفع",
        value:
          orderData?.payment_type?.name_trans ||
          orderData?.payment_type?.name_ar ||
          orderData?.payment_type?.name ||
          step4.payment_type_name ||
          step4.payment_type_id,
      },
      {
        label: "مدة العقد",
        value:
          typeof step4.contract_term_in_years === "object"
            ? step4.contract_term_in_years?.name ||
              step4.contract_term_in_years?.period
            : step4.contract_term_in_years,
      },
      { label: "مدة (سنوات)", value: step4.duration_years },
      { label: "مدة (أشهر)", value: step4.duration_months },
      { label: "تاريخ بداية العقد", value: step4.contract_starting_date },
      {
        label: "دور المستأجر",
        value:
          orderData?.tenant_role?.text_of_reason ||
          orderData?.tenant_role?.name ||
          step4.tenant_role_id,
      },
      { label: "الشروط الإضافية", value: step4.text_additional_terms },
      { label: "ملاحظات", value: step4.notes },
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
  const step3 = orderData?.step3 ?? {};

  if (context === "agent") {
    return summary?.mobile_of_property_owner_agent || "";
  }

  if (context === "contractTenant") {
    return (
      step3?.tenant_mobile ||
      step3?.mobile_of_property_tenant_agent ||
      orderData?.user?.mobile ||
      orderData?.user_mobile ||
      summary?.property_owner_mobile ||
      ""
    );
  }

  return (
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
