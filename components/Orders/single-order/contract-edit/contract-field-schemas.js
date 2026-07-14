/** UI field definitions per step — `key` must match flat POST keys */

/** Only fields shown in deed-owners view (بيانات الملاك). */
export const SUMMARY_OWNER_FIELDS = [
  { key: "property_owner_id_num", label: "رقم الهوية", type: "text" },
  {
    key: "property_owner_dob",
    label: "تاريخ الميلاد",
    type: "date",
    calendarTypeKey: "type_dob_property_owner",
  },
  { key: "property_owner_mobile", label: "رقم الجوال", type: "text" },
];

export const SUMMARY_AGENT_FIELDS = [
  { key: "id_num_of_property_owner_agent", label: "رقم هوية الوكيل", type: "text" },
  {
    key: "dob_of_property_owner_agent",
    label: "تاريخ ميلاد الوكيل",
    type: "date",
    calendarTypeKey: "type_dob_property_owner_agent",
  },
  { key: "mobile_of_property_owner_agent", label: "جوال الوكيل", type: "text" },
];

export const STEP1_ADDRESS_FIELDS = [
  { key: "property_city_id", label: "معرف المدينة", type: "text", hint: "property_city_id" },
  { key: "property_place_id", label: "معرف المنطقة", type: "text" },
  { key: "neighborhood", label: "الحي", type: "text" },
  { key: "street", label: "الشارع", type: "text" },
  { key: "building_number", label: "رقم المبنى", type: "text" },
  { key: "extra_figure", label: "رقم الإضافي", type: "text" },
  { key: "postal_code", label: "الرمز البريدي", type: "text" },
];

export const STEP1_PROPERTY_FIELDS = [
  { key: "property_type_id", label: "معرف نوع العقار", type: "text" },
  { key: "property_usages_id", label: "معرف استخدام العقار", type: "text" },
  { key: "number_of_floors", label: "إجمالي عدد الطوابق", type: "text" },
  { key: "number_of_units_per_floor", label: "وحدات في كل طابق", type: "text" },
  { key: "age_of_the_property", label: "عمر العقار", type: "text" },
  { key: "number_of_units_in_realestate", label: "إجمالي الوحدات في العقار", type: "text" },
];

export const STEP2_UNIT_FIELDS = [
  { key: "unit_number", label: "رقم الوحدة", type: "text" },
  { key: "unit_type_id", label: "معرف نوع الوحدة", type: "text" },
  { key: "unit_usage_id", label: "معرف استخدام الوحدة", type: "text" },
  { key: "floor_number", label: "رقم الطابق", type: "text" },
  { key: "unit_area", label: "مساحة الوحدة", type: "text" },
  { key: "tootal_rooms", label: "عدد الغرف", type: "text" },
  { key: "furnished", label: "مؤثثة", type: "boolean" },
  { key: "kitchen_tank", label: "مطبخ راكب", type: "boolean" },
];

export const STEP2_ROOM_FIELDS = [
  { key: "The_number_of_the_toilet", label: "دورة مياه", type: "text" },
  { key: "The_number_of_halls", label: "الصالة", type: "text" },
  { key: "The_number_of_kitchens", label: "مطبخ", type: "text" },
  { key: "window_ac", label: "مكيف شباك", type: "text" },
  { key: "split_ac", label: "مكيف سبليت", type: "text" },
];

export const STEP2_SERVICE_FIELDS = [
  { key: "electricity_meter_number", label: "عداد الكهرباء", type: "text" },
  { key: "water_meter_number", label: "عداد المياه", type: "text" },
];

export const STEP3_TENANT_FIELDS = [
  { key: "tenant_entity", label: "كيان المستأجر", type: "text" },
  { key: "tenant_name", label: "اسم المستأجر", type: "text" },
  { key: "tenant_id_num", label: "رقم هوية المستأجر", type: "text" },
  { key: "tenant_mobile", label: "جوال المستأجر", type: "text" },
  { key: "tenant_email", label: "البريد الإلكتروني", type: "text" },
  { key: "tenant_dob", label: "تاريخ ميلاد المستأجر", type: "date", calendarTypeKey: "type_tenant_dob" },
  { key: "tenant_dob_day", label: "يوم الميلاد", type: "text" },
  { key: "tenant_dob_month", label: "شهر الميلاد", type: "text" },
  { key: "tenant_dob_year", label: "سنة الميلاد", type: "text" },
  {
    key: "type_tenant_dob",
    label: "نوع تاريخ ميلاد المستأجر",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
  {
    key: "tenant_entity_unified_registry_number",
    label: "الرقم الموحد للمنشأة",
    type: "text",
  },
  { key: "authorization_type", label: "نوع التفويض", type: "text" },
  {
    key: "copy_of_the_owner_record",
    label: "صورة سجل المالك",
    type: "text",
    colSpan: 2,
  },
];

export const STEP3_TENANT_AGENT_FIELDS = [
  {
    key: "region_of_the_tenant_legal_agent",
    label: "منطقة الوكيل الشرعي للمستأجر",
    type: "text",
  },
  {
    key: "city_of_the_tenant_legal_agent",
    label: "مدينة الوكيل الشرعي للمستأجر",
    type: "text",
  },
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
    key: "dob_of_property_tenant_agent_day",
    label: "يوم ميلاد الوكيل",
    type: "text",
  },
  {
    key: "dob_of_property_tenant_agent_month",
    label: "شهر ميلاد الوكيل",
    type: "text",
  },
  {
    key: "dob_of_property_tenant_agent_year",
    label: "سنة ميلاد الوكيل",
    type: "text",
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

export const STEP4_FINANCIAL_FIELDS = [
  { key: "annual_rent_amount_for_the_unit", label: "مبلغ الإيجار السنوي للوحدة", type: "text" },
  { key: "daily_fine", label: "الغرامة اليومية", type: "text" },
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
  { key: "other_conditions", label: "شروط إضافية", type: "text" },
  { key: "text_additional_terms", label: "نص الشروط الإضافية", type: "textarea", colSpan: 2 },
  { key: "notes_edits", label: "ملاحظات التعديل", type: "textarea", colSpan: 2 },
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
