/** UI field definitions per step — keys match frontend contract payloads */

/** Owner fields from POST /contract/step3 */
export const SUMMARY_OWNER_FIELDS = [
  { key: "property_owner_id_num", label: "رقم الهوية", type: "text", inputKind: "national_id" },
  {
    key: "property_owner_dob",
    label: "تاريخ الميلاد",
    type: "date",
    calendarTypeKey: "type_dob_property_owner",
  },
  {
    key: "type_dob_property_owner",
    label: "نوع تاريخ الميلاد",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
  { key: "property_owner_mobile", label: "رقم الجوال", type: "text", inputKind: "phone" },
];

export const SUMMARY_AGENT_FIELDS = [
  {
    key: "id_num_of_property_owner_agent",
    label: "رقم هوية الوكيل",
    type: "text",
    inputKind: "national_id",
  },
  {
    key: "dob_of_property_owner_agent",
    label: "تاريخ ميلاد الوكيل",
    type: "date",
    calendarTypeKey: "type_dob_property_owner_agent",
  },
  {
    key: "type_dob_property_owner_agent",
    label: "نوع تاريخ ميلاد الوكيل",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
  {
    key: "mobile_of_property_owner_agent",
    label: "جوال الوكيل",
    type: "text",
    inputKind: "phone",
  },
  {
    key: "copy_of_the_authorization_or_agency",
    label: "صورة التفويض / الوكالة",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
];

/** Deed / instrument images — multipart on contract update */
export const SUMMARY_INSTRUMENT_IMAGE_FIELDS = [
  {
    key: "image_instrument",
    label: "صورة الصك",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  {
    key: "image_instrument_from_the_front",
    label: "صورة الصك (من الأمام)",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  {
    key: "image_instrument_from_the_back",
    label: "صورة الصك (من الخلف)",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  {
    key: "Image_inheritance_certificate",
    label: "شهادة حصر الإرث",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  {
    key: "copy_power_of_attorney_from_heirs_to_agent",
    label: "توكيل الورثة للوكيل",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  {
    key: "copy_of_the_endowment_registration_certificate",
    label: "شهادة تسجيل الوقف",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  {
    key: "copy_of_the_trusteeship_deed",
    label: "صك النظارة",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  {
    key: "copy_of_guardians_power_of_attorney_for_agent",
    label: "توكيل الأولياء للوكيل",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
];

/** Address — POST /contract/step2 */
export const STEP1_ADDRESS_FIELDS = [
  {
    key: "property_place_id",
    label: "المنطقة",
    type: "select",
    optionsSource: "regions",
  },
  {
    key: "property_city_id",
    label: "المدينة",
    type: "select",
    optionsSource: "cities",
  },
  { key: "neighborhood", label: "الحي", type: "text" },
  { key: "street", label: "الشارع", type: "text" },
  { key: "building_number", label: "رقم المبنى", type: "text" },
  { key: "postal_code", label: "الرمز البريدي", type: "text" },
  { key: "extra_figure", label: "الرقم الإضافي", type: "text" },
  { key: "latitude", label: "خط العرض", type: "text" },
  { key: "longitude", label: "خط الطول", type: "text" },
  { key: "address_url", label: "رابط العنوان", type: "text" },
];

/** Deed / property details — POST /admin/orders (step1 keys) */
export const STEP1_PROPERTY_FIELDS = [
  { key: "name_real_estate", label: "اسم العقار", type: "text", step: "step1" },
  {
    key: "property_type_id",
    label: "نوع العقار",
    type: "select",
    optionsSource: "property-types",
    displayKey: "property_type_name",
    step: "step1",
  },
  {
    key: "property_usages_id",
    label: "استخدام العقار",
    type: "select",
    optionsSource: "property-usages",
    displayKey: "property_usages_name",
    step: "step1",
  },
  {
    key: "real_estate_registry_number",
    label: "رقم السجل العقاري",
    type: "text",
    step: "step1",
  },
  {
    key: "unit_number_of_real",
    label: "رقم الوحدة في العقار",
    type: "text",
    step: "step1",
  },
  {
    key: "instrument_history",
    label: "تاريخ الصك",
    type: "date",
    calendarTypeKey: "type_instrument_history",
    step: "step1",
  },
  {
    key: "type_instrument_history",
    label: "نوع تاريخ الصك",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
    step: "step1",
  },
  {
    key: "date_first_registration",
    label: "تاريخ أول تسجيل",
    type: "date",
    calendarTypeKey: "type_date_first_registration",
    step: "step1",
  },
  {
    key: "type_date_first_registration",
    label: "نوع تاريخ أول تسجيل",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
    step: "step1",
  },
  { key: "number_of_floors", label: "عدد الطوابق", type: "text", step: "step1" },
  {
    key: "number_of_units_per_floor",
    label: "عدد الوحدات في كل طابق",
    type: "text",
    step: "step1",
  },
  {
    key: "number_of_units_in_realestate",
    label: "إجمالي وحدات العقار",
    type: "text",
    step: "step1",
  },
];

/** Unit — POST /contract/step5 (legacy single-unit contract fields) */
export const STEP2_UNIT_FIELDS = [
  {
    key: "unit_usage_id",
    label: "استخدام الوحدة",
    type: "select",
    optionsSource: "unit-usages",
  },
  { key: "unit_number", label: "رقم الوحدة", type: "text" },
  { key: "floor_number", label: "رقم الطابق", type: "text" },
  { key: "unit_area", label: "مساحة الوحدة", type: "text" },
];

/**
 * AdminUnit fields from data.units[] (UnitResource).
 * Display prefers *_name keys; edit uses *_id where applicable.
 */
export const ADMIN_UNIT_CORE_FIELDS = [
  {
    key: "unit_usage_id",
    label: "استخدام الوحدة",
    type: "select",
    optionsSource: "unit-usages",
    displayKey: "unit_usage_name",
  },
  { key: "unit_number", label: "رقم الوحدة", type: "text" },
  { key: "floor_number", label: "رقم الطابق", type: "text" },
  { key: "unit_area", label: "مساحة الوحدة", type: "text" },
];

export const ADMIN_UNIT_ROOM_FIELDS = [
  { key: "tootal_rooms", label: "إجمالي الغرف", type: "text" },
  { key: "The_number_of_kitchens", label: "عدد المطابخ", type: "text" },
  { key: "The_number_of_toilets", label: "عدد دورات المياه", type: "text" },
  { key: "window_ac", label: "مكيف شباك", type: "text" },
  { key: "split_ac", label: "مكيف سبليت", type: "text" },
];

export const ADMIN_UNIT_SERVICE_FIELDS = [
  { key: "kitchen_tank", label: "مطبخ راكب", type: "boolean" },
  { key: "furnished", label: "مؤثثة", type: "boolean" },
  {
    key: "type_furnished",
    label: "نوع التأثيث",
    type: "select",
    options: [
      { value: "1", label: "جديد" },
      { value: "0", label: "مستعمل" },
    ],
  },
  { key: "electricity_meter", label: "عداد كهرباء", type: "boolean" },
  { key: "electricity_meter_number", label: "رقم عداد الكهرباء", type: "text" },
  {
    key: "electricity_meter_ownership",
    label: "ملكية عداد الكهرباء",
    type: "select",
    options: [
      { value: "owner", label: "المالك" },
      { value: "tenant", label: "المستأجر" },
    ],
  },
  { key: "water_meter", label: "عداد مياه", type: "boolean" },
  { key: "water_meter_number", label: "رقم عداد المياه", type: "text" },
  {
    key: "water_meter_ownership",
    label: "ملكية عداد المياه",
    type: "select",
    options: [
      { value: "owner", label: "المالك" },
      { value: "tenant", label: "المستأجر" },
    ],
  },
];

/** @deprecated use ADMIN_UNIT_* — kept for legacy single-unit fallback callers */
export const STEP2_PER_UNIT_FIELDS = [
  { key: "unit_number", label: "رقم الوحدة", type: "text" },
  { key: "floor_number", label: "رقم الطابق", type: "text" },
  { key: "unit_area", label: "مساحة الوحدة", type: "text" },
  { key: "electricity_meter_number", label: "رقم عداد الكهرباء", type: "text" },
  { key: "water_meter_number", label: "رقم عداد المياه", type: "text" },
  {
    key: "electricity_meter_ownership",
    label: "ملكية عداد الكهرباء",
    type: "select",
    options: [
      { value: "owner", label: "المالك" },
      { value: "tenant", label: "المستأجر" },
    ],
  },
  {
    key: "water_meter_ownership",
    label: "ملكية عداد المياه",
    type: "select",
    options: [
      { value: "owner", label: "المالك" },
      { value: "tenant", label: "المستأجر" },
    ],
  },
];

export const STEP2_ROOM_FIELDS = [
  { key: "tootal_rooms", label: "إجمالي الغرف", type: "text" },
  { key: "number_of_rooms", label: "عدد الغرف", type: "text" },
  { key: "The_number_of_kitchens", label: "عدد المطابخ", type: "text" },
  { key: "The_number_of_toilets", label: "عدد دورات المياه", type: "text" },
  { key: "The_number_of_the_toilet", label: "دورة مياه", type: "text" },
  { key: "window_ac", label: "مكيف شباك", type: "text" },
  { key: "split_ac", label: "مكيف سبليت", type: "text" },
];

export const STEP2_SERVICE_FIELDS = [
  { key: "kitchen_tank", label: "مطبخ راكب", type: "boolean" },
  { key: "furnished", label: "مؤثثة", type: "boolean" },
  {
    key: "type_furnished",
    label: "نوع التأثيث",
    type: "select",
    options: [
      { value: "1", label: "جديد" },
      { value: "0", label: "مستعمل" },
    ],
  },
  { key: "electricity_meter", label: "عداد كهرباء", type: "boolean" },
  { key: "electricity_meter_number", label: "رقم عداد الكهرباء", type: "text" },
  {
    key: "electricity_meter_ownership",
    label: "ملكية عداد الكهرباء",
    type: "select",
    options: [
      { value: "owner", label: "المالك" },
      { value: "tenant", label: "المستأجر" },
    ],
  },
  { key: "water_meter", label: "عداد مياه", type: "boolean" },
  { key: "water_meter_number", label: "رقم عداد المياه", type: "text" },
  {
    key: "water_meter_ownership",
    label: "ملكية عداد المياه",
    type: "select",
    options: [
      { value: "owner", label: "المالك" },
      { value: "tenant", label: "المستأجر" },
    ],
  },
];

/** Tenant — POST /contract/step4 */
export const STEP3_TENANT_FIELDS = [
  {
    key: "tenant_entity",
    label: "صفة المستأجر",
    type: "select",
    options: [
      { value: "person", label: "فرد" },
      { value: "institution", label: "مؤسسة أو شركة" },
    ],
  },
  // —— فرد ——
  {
    key: "tenant_id_num",
    label: "رقم هوية المستأجر",
    type: "text",
    entity: "person",
    inputKind: "national_id",
  },
  {
    key: "tenant_mobile",
    label: "رقم جوال المستأجر",
    type: "text",
    entity: "person",
    inputKind: "phone",
  },
  {
    key: "type_tenant_dob",
    label: "نوع تاريخ الميلاد",
    type: "select",
    entity: "person",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
  {
    key: "tenant_dob",
    label: "تاريخ ميلاد المستأجر",
    type: "date",
    entity: "person",
    calendarTypeKey: "type_tenant_dob",
  },
  {
    key: "is_there_a_legal_representative_of_the_tenant",
    label: "هل يوجد ممثل نظامي للمستأجر؟",
    type: "boolean",
  },
  {
    key: "copy_of_the_owner_record",
    label: "صورة سجل المالك",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  // —— منشأة / مؤسسة ——
  {
    key: "authorization_type",
    label: "نوع التفويض أو الوكالة",
    type: "select",
    entity: "institution",
    options: [
      {
        value: "owner_and_representative_of_record",
        label: "أنا مالك السجل وممثله",
      },
      {
        value: "agent_or_authorized_by_registry_owner",
        label: "أنا وكيل أو مفوض عن مالك السجل",
      },
    ],
  },
  {
    key: "tenant_entity_unified_registry_number",
    label: "رقم السجل الموحد",
    type: "text",
    entity: "institution",
    hint: "10 أرقام ويبدأ بالرقم 7",
  },
  {
    key: "id_num_of_property_tenant_agent",
    label: "رقم هوية مالك السجل",
    type: "text",
    entity: "institution",
    inputKind: "national_id",
  },
  {
    key: "mobile_of_property_tenant_agent",
    label: "رقم جوال مالك السجل",
    type: "text",
    entity: "institution",
    inputKind: "phone",
  },
  {
    key: "type_dob_tenant_agent",
    label: "نوع تاريخ ميلاد مالك السجل",
    type: "select",
    entity: "institution",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
  {
    key: "dob_of_property_tenant_agent",
    label: "تاريخ ميلاد مالك السجل",
    type: "date",
    entity: "institution",
    calendarTypeKey: "type_dob_tenant_agent",
  },
  {
    key: "copy_of_the_authorization_or_agency",
    label: "صورة التفويض / الوكالة",
    type: "file",
    entity: "institution",
    colSpan: 3,
    accept: "image/*,application/pdf",
    hint: "مطلوبة عند اختيار وكيل أو مفوض عن مالك السجل",
    showWhen: {
      authorization_type: "agent_or_authorized_by_registry_owner",
    },
  },
];

/** @deprecated Prefer STEP3_TENANT_FIELDS (institution entity fields included) */
export const STEP3_TENANT_AGENT_FIELDS = [
  {
    key: "id_num_of_property_tenant_agent",
    label: "رقم هوية مالك السجل",
    type: "text",
    inputKind: "national_id",
  },
  {
    key: "mobile_of_property_tenant_agent",
    label: "رقم جوال مالك السجل",
    type: "text",
    inputKind: "phone",
  },
  {
    key: "dob_of_property_tenant_agent",
    label: "تاريخ ميلاد مالك السجل",
    type: "date",
    calendarTypeKey: "type_dob_tenant_agent",
  },
  {
    key: "type_dob_tenant_agent",
    label: "نوع تاريخ ميلاد مالك السجل",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
  {
    key: "copy_of_the_authorization_or_agency",
    label: "صورة التفويض / الوكالة",
    type: "file",
    accept: "image/*,application/pdf",
  },
];

export const STEP3_CONTRACT_META_FIELDS = [
  { key: "contract_type", label: "نوع العقد", type: "text", step: "summary" },
  {
    key: "contract_starting_date",
    label: "تاريخ بدء العقد",
    type: "date",
    step: "step6",
    calendarTypeKey: "type_contract_starting_date",
  },
];

function durationPartIsSet(value) {
  if (value == null || value === "") return false;
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) return numeric !== 0;
  return String(value).trim() !== "";
}

/** Listed catalog period vs custom years/months. Only one is shown at a time. */
export function resolveContractDurationMode(values = {}) {
  const listed =
    values.contract_term_in_years != null &&
    String(values.contract_term_in_years).trim() !== "";
  const custom =
    durationPartIsSet(values.duration_years) || durationPartIsSet(values.duration_months);

  if (custom && !listed) return "custom";
  return "listed";
}

/** Financial / terms — POST /contract/step6 */
export const STEP4_FINANCIAL_FIELDS = [
  {
    key: "payment_type_id",
    label: "نوع الدفع",
    type: "select",
    optionsSource: "payment-types",
  },
  {
    key: "duration_mode",
    label: "نوع المدة",
    type: "segmented",
    options: [
      { value: "listed", label: "من القائمة" },
      { value: "custom", label: "مخصصة" },
    ],
  },
  {
    key: "contract_term_in_years",
    label: "مدة العقد",
    type: "select",
    optionsSource: "contract-periods",
    showWhen: { duration_mode: "listed" },
  },
  {
    key: "duration_years",
    label: "مدة (سنوات)",
    type: "select",
    options: Array.from({ length: 31 }, (_, i) => ({
      value: String(i),
      label: String(i),
    })),
    showWhen: { duration_mode: "custom" },
  },
  {
    key: "duration_months",
    label: "مدة (أشهر)",
    type: "select",
    options: Array.from({ length: 12 }, (_, i) => ({
      value: String(i),
      label: String(i),
    })),
    showWhen: { duration_mode: "custom" },
  },
  {
    key: "notes_edits",
    label: "ملاحظات التعديل",
    type: "textarea",
    colSpan: 2,
  },
];

export const STEP4_TERMS_FIELDS = [
  {
    key: "contract_starting_date",
    label: "تاريخ بداية العقد",
    type: "date",
    calendarTypeKey: "type_contract_starting_date",
  },
  {
    key: "type_contract_starting_date",
    label: "نوع التاريخ",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
  { key: "conditions", label: "هل توجد شروط أخرى؟", type: "boolean" },
  { key: "tenant_roles", label: "تفعيل صلاحيات المستأجر", type: "boolean" },
  { key: "additional_terms", label: "شروط إضافية (علم)", type: "boolean" },
  { key: "tenant_role_id", label: "دور المستأجر", type: "select", optionsSource: "tenant-roles" },
  {
    key: "tenant_role_ids",
    label: "صلاحيات المستأجر",
    type: "tenant-roles",
    colSpan: 3,
  },
  { key: "tenant_role_values", label: "قيم صلاحيات المستأجر", type: "hidden" },
  {
    key: "other_conditions_list",
    label: "قائمة الشروط",
    type: "other-conditions",
    colSpan: 3,
  },
  { key: "text_additional_terms", label: "نص الشروط الإضافية", type: "textarea", colSpan: 2 },
  { key: "notes", label: "ملاحظات", type: "textarea", colSpan: 2 },
];

/** Editable other-conditions block on contract financial tab */
export const STEP4_OTHER_CONDITIONS_FIELDS = [
  { key: "conditions", label: "هل توجد شروط أخرى؟", type: "hidden" },
  {
    key: "other_conditions_list",
    label: "قائمة الشروط",
    type: "other-conditions",
    colSpan: 3,
  },
];

/** Notes / additional terms (separate from other_conditions_list) */
export const STEP4_NOTES_FIELDS = [
  { key: "additional_terms", label: "شروط إضافية (علم)", type: "boolean" },
  {
    key: "text_additional_terms",
    label: "نص الشروط الإضافية",
    type: "textarea",
    colSpan: 2,
  },
  { key: "notes", label: "ملاحظات", type: "textarea", colSpan: 2 },
];

/** Editable tenant-roles block on contract financial tab */
export const STEP4_TENANT_ROLES_FIELDS = [
  {
    key: "tenant_role_ids",
    label: "صلاحيات المستأجر",
    type: "tenant-roles",
    colSpan: 3,
  },
  { key: "tenant_role_values", label: "قيم صلاحيات المستأجر", type: "hidden" },
  { key: "tenant_roles", label: "تفعيل صلاحيات المستأجر", type: "hidden" },
];

/** Lease-renewal editable sections (displayed fields only). */
export const LEASE_RENEWAL_TENANT_FIELDS = [
  {
    key: "tenant_dob",
    label: "تاريخ ميلاد المستأجر",
    type: "date",
    calendarTypeKey: "type_tenant_dob",
  },
  {
    key: "type_tenant_dob",
    label: "نوع التاريخ",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
];

export const LEASE_RENEWAL_TERMS_FIELDS = [
  {
    key: "text_additional_terms",
    label: "الشروط والمتغيرات",
    type: "textarea",
    colSpan: 3,
  },
];

export const LEASE_RENEWAL_NOTES_FIELDS = [
  {
    key: "notes_edits",
    label: "ملاحظات الانتباه",
    type: "textarea",
    colSpan: 3,
  },
];

export const LEASE_RENEWAL_FINANCIAL_FIELDS = [
  {
    key: "annual_rent_amount_for_the_unit",
    label: "إجمالي قيمة العقد",
    type: "text",
  },
  { key: "daily_fine", label: "الغرامة اليومية", type: "text" },
];

export const LEASE_RENEWAL_CONTRACT_DATE_FIELDS = [
  {
    key: "contract_starting_date",
    label: "تاريخ بداية العقد",
    type: "date",
    calendarTypeKey: "type_contract_starting_date",
  },
  {
    key: "type_contract_starting_date",
    label: "نوع التاريخ",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
];
