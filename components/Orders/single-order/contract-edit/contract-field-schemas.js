/** UI field definitions per step — keys match frontend contract payloads */

/** Owner fields from POST /contract/step3 */
export const SUMMARY_OWNER_FIELDS = [
  { key: "name_owner", label: "اسم المالك", type: "text" },
  { key: "property_owner_id_num", label: "رقم الهوية", type: "text" },
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
  { key: "property_owner_mobile", label: "رقم الجوال", type: "text" },
  { key: "property_owner_iban", label: "آيبان المالك", type: "text" },
];

export const SUMMARY_AGENT_FIELDS = [
  { key: "id_num_of_property_owner_agent", label: "رقم هوية الوكيل", type: "text" },
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
  { key: "mobile_of_property_owner_agent", label: "جوال الوكيل", type: "text" },
];

/** Address — POST /contract/step2 */
export const STEP1_ADDRESS_FIELDS = [
  { key: "property_place_id", label: "المنطقة", type: "text" },
  { key: "property_city_id", label: "المدينة", type: "text" },
  { key: "neighborhood", label: "الحي", type: "text" },
  { key: "street", label: "الشارع", type: "text" },
  { key: "building_number", label: "رقم المبنى", type: "text" },
  { key: "postal_code", label: "الرمز البريدي", type: "text" },
  { key: "extra_figure", label: "الرقم الإضافي", type: "text" },
  { key: "latitude", label: "خط العرض", type: "text" },
  { key: "longitude", label: "خط الطول", type: "text" },
  { key: "address_url", label: "رابط العنوان", type: "text" },
];

/** Kept for edit compatibility; not part of frontend step2 address payload */
export const STEP1_PROPERTY_FIELDS = [
  { key: "name_real_estate", label: "اسم العقار", type: "text" },
];

/** Unit — POST /contract/step5 (legacy single-unit contract fields) */
export const STEP2_UNIT_FIELDS = [
  { key: "unit_type_id", label: "نوع الوحدة", type: "text" },
  { key: "unit_usage_id", label: "استخدام الوحدة", type: "text" },
  { key: "unit_number", label: "رقم الوحدة", type: "text" },
  { key: "floor_number", label: "رقم الطابق", type: "text" },
  { key: "unit_area", label: "مساحة الوحدة", type: "text" },
];

/**
 * AdminUnit fields from data.units[] (UnitResource).
 * Display prefers *_name keys; edit uses *_id where applicable.
 */
export const ADMIN_UNIT_CORE_FIELDS = [
  { key: "unit_type_id", label: "نوع الوحدة", type: "text", displayKey: "unit_type_name" },
  { key: "unit_usage_id", label: "استخدام الوحدة", type: "text", displayKey: "unit_usage_name" },
  { key: "unit_number", label: "رقم الوحدة", type: "text" },
  { key: "floor_number", label: "رقم الطابق", type: "text" },
  { key: "unit_area", label: "مساحة الوحدة", type: "text" },
];

export const ADMIN_UNIT_ROOM_FIELDS = [
  { key: "tootal_rooms", label: "إجمالي الغرف", type: "text" },
  { key: "The_number_of_halls", label: "عدد الصالات", type: "text" },
  { key: "The_number_of_kitchens", label: "عدد المطابخ", type: "text" },
  { key: "The_number_of_toilets", label: "عدد دورات المياه", type: "text" },
  { key: "window_ac", label: "مكيف شباك", type: "text" },
  { key: "split_ac", label: "مكيف سبليت", type: "text" },
];

export const ADMIN_UNIT_SERVICE_FIELDS = [
  { key: "kitchen_tank", label: "مطبخ راكب", type: "boolean" },
  { key: "furnished", label: "مؤثثة", type: "boolean" },
  { key: "type_furnished", label: "نوع التأثيث", type: "text" },
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
  { key: "Number_parking_spaces", label: "مواقف السيارات", type: "text" },
];

/** @deprecated use ADMIN_UNIT_* — kept for legacy single-unit fallback callers */
export const STEP2_PER_UNIT_FIELDS = [
  { key: "unit_type_id", label: "نوع الوحدة", type: "text" },
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
  { key: "The_number_of_halls", label: "عدد الصالات", type: "text" },
  { key: "The_number_of_kitchens", label: "عدد المطابخ", type: "text" },
  { key: "The_number_of_toilets", label: "عدد دورات المياه", type: "text" },
  { key: "The_number_of_the_toilet", label: "دورة مياه", type: "text" },
  { key: "window_ac", label: "مكيف شباك", type: "text" },
  { key: "split_ac", label: "مكيف سبليت", type: "text" },
];

export const STEP2_SERVICE_FIELDS = [
  { key: "kitchen_tank", label: "مطبخ راكب", type: "boolean" },
  { key: "furnished", label: "مؤثثة", type: "boolean" },
  { key: "type_furnished", label: "نوع التأثيث", type: "text" },
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
    label: "كيان المستأجر",
    type: "select",
    options: [
      { value: "person", label: "فرد" },
      { value: "institution", label: "منشأة" },
    ],
  },
  { key: "tenant_id_num", label: "رقم هوية المستأجر", type: "text" },
  {
    key: "tenant_dob",
    label: "تاريخ ميلاد المستأجر",
    type: "date",
    calendarTypeKey: "type_tenant_dob",
  },
  {
    key: "type_tenant_dob",
    label: "نوع تاريخ الميلاد",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
  { key: "tenant_mobile", label: "جوال المستأجر", type: "text" },
  {
    key: "tenant_entity_unified_registry_number",
    label: "الرقم الموحد للمنشأة",
    type: "text",
  },
  {
    key: "authorization_type",
    label: "نوع التفويض",
    type: "select",
    options: [
      {
        value: "owner_and_representative_of_record",
        label: "مالك وممثل السجل",
      },
      {
        value: "agent_or_authorized_by_registry_owner",
        label: "وكيل أو مفوض من مالك السجل",
      },
    ],
  },
];

export const STEP3_TENANT_AGENT_FIELDS = [
  {
    key: "id_num_of_property_tenant_agent",
    label: "رقم هوية وكيل المستأجر",
    type: "text",
  },
  {
    key: "mobile_of_property_tenant_agent",
    label: "جوال وكيل المستأجر",
    type: "text",
  },
  {
    key: "dob_of_property_tenant_agent",
    label: "تاريخ ميلاد وكيل المستأجر",
    type: "date",
    calendarTypeKey: "type_dob_tenant_agent",
  },
  {
    key: "type_dob_tenant_agent",
    label: "نوع تاريخ ميلاد الوكيل",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
];

export const STEP3_CONTRACT_META_FIELDS = [
  { key: "contract_type", label: "نوع العقد", type: "text", step: "summary" },
  {
    key: "contract_starting_date",
    label: "تاريخ بدء العقد",
    type: "date",
    step: "step4",
    calendarTypeKey: "type_contract_starting_date",
  },
];

/** Financial / terms — POST /contract/step6 */
export const STEP4_FINANCIAL_FIELDS = [
  { key: "payment_type_id", label: "نوع الدفع", type: "text" },
  { key: "contract_term_in_years", label: "مدة العقد", type: "text" },
  { key: "duration_years", label: "مدة (سنوات)", type: "text" },
  { key: "duration_months", label: "مدة (أشهر)", type: "text" },
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
  { key: "conditions", label: "الشروط", type: "boolean" },
  { key: "tenant_roles", label: "صلاحيات المستأجر (علم)", type: "boolean" },
  { key: "additional_terms", label: "شروط إضافية (علم)", type: "boolean" },
  { key: "tenant_role_id", label: "دور المستأجر", type: "select", optionsSource: "tenant-roles" },
  { key: "text_additional_terms", label: "نص الشروط الإضافية", type: "textarea", colSpan: 2 },
  { key: "notes", label: "ملاحظات", type: "textarea", colSpan: 2 },
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
