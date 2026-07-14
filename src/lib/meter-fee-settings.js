export const METER_FEE_SETTINGS_QUERY_KEY = "meter-fee-settings";
export const METER_FEE_SETTINGS_API = "/admin/meter-fee-settings";

export const METER_FEE_SETTINGS_FIELDS = [
  {
    key: "electricity_meter_fee_commercial_tenant",
    label: "رسوم العداد الكهربائي تجاري للمستأجر",
  },
  {
    key: "electricity_meter_fee_housing_tenant",
    label: "رسوم العداد الكهربائي منزلي للمستأجر",
  },
  {
    key: "water_meter_fee_commercial_tenant",
    label: "رسوم عداد المياه تجاري للمستأجر",
  },
  {
    key: "water_meter_fee_housing_tenant",
    label: "رسوم عداد المياه منزلي للمستأجر",
  },
];

export const emptyMeterFeeSettingsForm = {
  electricity_meter_fee_commercial_tenant: "",
  electricity_meter_fee_housing_tenant: "",
  water_meter_fee_commercial_tenant: "",
  water_meter_fee_housing_tenant: "",
};

function toOptionalNumberInput(value) {
  if (value == null || value === "") return "";
  return String(value);
}

export function extractMeterFeeSettings(response) {
  const body = response?.data;
  const data = body?.data ?? body;

  if (!data || typeof data !== "object") return emptyMeterFeeSettingsForm;

  const record = Array.isArray(data?.items)
    ? data.items[0]
    : data?.settings && typeof data.settings === "object"
      ? data.settings
      : data;

  return {
    electricity_meter_fee_commercial_tenant: toOptionalNumberInput(
      record?.electricity_meter_fee_commercial_tenant
    ),
    electricity_meter_fee_housing_tenant: toOptionalNumberInput(
      record?.electricity_meter_fee_housing_tenant
    ),
    water_meter_fee_commercial_tenant: toOptionalNumberInput(
      record?.water_meter_fee_commercial_tenant
    ),
    water_meter_fee_housing_tenant: toOptionalNumberInput(
      record?.water_meter_fee_housing_tenant
    ),
  };
}

function parseOptionalFee(value) {
  if (value == null || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num;
}

export function buildMeterFeeSettingsPayload(form = {}) {
  return {
    electricity_meter_fee_commercial_tenant: parseOptionalFee(
      form.electricity_meter_fee_commercial_tenant
    ),
    electricity_meter_fee_housing_tenant: parseOptionalFee(
      form.electricity_meter_fee_housing_tenant
    ),
    water_meter_fee_commercial_tenant: parseOptionalFee(
      form.water_meter_fee_commercial_tenant
    ),
    water_meter_fee_housing_tenant: parseOptionalFee(
      form.water_meter_fee_housing_tenant
    ),
  };
}
