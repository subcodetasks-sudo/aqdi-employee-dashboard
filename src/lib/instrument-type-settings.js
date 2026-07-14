import {
  getPopupInstrumentTypeLabel,
  POPUP_INSTRUMENT_TYPES,
} from "@/src/lib/popup-contracts";

export const SETTING_CONTRACTS_QUERY_KEY = "setting-contracts";
export const SETTING_CONTRACTS_API = "/admin/setting-contracts";

/** Fixed Arabic names for the deed types (never deleted / never show raw keys). */
export const SETTING_CONTRACT_INSTRUMENT_TYPES = [
  { value: "electronic", label: "صك ملكية إلكتروني من وزارة العدل" },
  {
    value: "electronic_deed_from_the_ministry_of_justice",
    label: "صك ملكية إلكتروني من وزارة العدل والسجل العيني",
  },
  {
    value: "electronic_tax_register",
    label: "صك ملكية إلكتروني من السجل العقاري",
  },
  { value: "old_handwritten", label: "صك ملكية ورقي" },
  {
    value: "property_ownership_owner_are_deceased",
    label: "صك ملكية والمالك متوفى",
  },
  {
    value: "property_ownership_owner_are_deceased_endowment",
    label: "صك ملكية ووقف ورثة متوفين",
  },
  {
    value: "property_ownership_owner_is_endowment",
    label: "صك ملكية والمالك وقف",
  },
  {
    value: "property_ownership_owner_are_suspended",
    label: "صك ملكية والمالك معلق",
  },
  { value: "sale_agreement", label: "ورقة مبايعة" },
  {
    value: "economic_cities_authority_suspended",
    label: "وثيقة هيئة المدن الاقتصادية",
  },
  { value: "strong_argument", label: "حجة استحكام" },
  { value: "sublease_agreement", label: "عقد إيجار من الباطن" },
  { value: "lease_renewal", label: "تجديد عقد إيجار" },
];

const SETTING_CONTRACT_TYPE_NAMES = Object.fromEntries(
  SETTING_CONTRACT_INSTRUMENT_TYPES.map((item) => [item.value, item.label])
);

export function getSettingContractTypeName(type) {
  if (!type) return "—";
  return (
    SETTING_CONTRACT_TYPE_NAMES[type] ||
    getPopupInstrumentTypeLabel(type) ||
    type
  );
}

/** @deprecated use SETTING_CONTRACTS_* */
export const INSTRUMENT_TYPE_SETTINGS_QUERY_KEY = SETTING_CONTRACTS_QUERY_KEY;
/** @deprecated use SETTING_CONTRACTS_* */
export const INSTRUMENT_TYPE_SETTINGS_API = SETTING_CONTRACTS_API;

export function extractSettingContracts(response) {
  const body = response?.data;
  return body?.data?.items ?? body?.items ?? [];
}

export function extractInstrumentTypeSettings(response) {
  return extractSettingContracts(response);
}

export function normalizeSettingContract(item = {}) {
  const instrumentType = item?.instrument_type ?? "";
  const typeName = getSettingContractTypeName(instrumentType);

  return {
    id: item?.id ?? null,
    instrument_type: instrumentType,
    type_name: typeName,
    label: item?.label?.trim() ? item.label : typeName,
    realestate: Boolean(item?.realestate),
    contract: Boolean(item?.contract),
    sms_user: item?.sms_user ?? "",
    sms_owner: item?.sms_owner ?? "",
    sms_employee: item?.sms_employee ?? "",
  };
}

export function normalizeInstrumentTypeSetting(item = {}) {
  return normalizeSettingContract(item);
}

/**
 * Fixed list of deed types. Backend items overlay visibility/label/sms.
 * Types are never removed from this list.
 */
export function mergeSettingContracts(items = []) {
  const byType = new Map(
    (items ?? [])
      .map(normalizeSettingContract)
      .filter((item) => item.instrument_type)
      .map((item) => [item.instrument_type, item])
  );

  const fixedTypes =
    SETTING_CONTRACT_INSTRUMENT_TYPES.length > 0
      ? SETTING_CONTRACT_INSTRUMENT_TYPES
      : POPUP_INSTRUMENT_TYPES;

  return fixedTypes.map((option) => {
    const existing = byType.get(option.value);
    if (existing) {
      return {
        ...existing,
        type_name: option.label,
      };
    }

    return {
      id: null,
      instrument_type: option.value,
      type_name: option.label,
      label: option.label,
      realestate: false,
      contract: false,
      sms_user: "",
      sms_owner: "",
      sms_employee: "",
    };
  });
}

export function mergeInstrumentTypeSettings(items = []) {
  return mergeSettingContracts(items);
}

export function buildSettingContractPayload({
  instrument_type,
  realestate,
  contract,
  label,
  sms_user,
  sms_owner,
  sms_employee,
}) {
  return {
    instrument_type,
    realestate: Boolean(realestate),
    contract: Boolean(contract),
    label: (label || getSettingContractTypeName(instrument_type) || "").trim(),
    sms_user: sms_user ?? "",
    sms_owner: sms_owner ?? "",
    sms_employee: sms_employee ?? "",
  };
}

export function buildInstrumentTypeSettingPayload(item) {
  return buildSettingContractPayload(item);
}

export function emptySettingContractSmsForm(item = {}) {
  return {
    sms_user: item?.sms_user ?? "",
    sms_owner: item?.sms_owner ?? "",
    sms_employee: item?.sms_employee ?? "",
  };
}

export const SETTING_CONTRACT_SMS_FIELDS = [
  {
    key: "sms_user",
    label: "رسالة للمستخدم",
    description: "رسالة SMS تظهر للمستخدم",
  },
  {
    key: "sms_owner",
    label: "رسالة للمالك",
    description: "رسالة SMS تظهر للمالك",
  },
  {
    key: "sms_employee",
    label: "رسالة للموظف",
    description: "رسالة SMS تظهر للموظف",
  },
];
