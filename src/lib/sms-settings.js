export const SMS_SETTINGS_QUERY_KEY = "sms-settings";
export const SMS_SETTINGS_API = "/admin/sms-settings";

export const SMS_SETTINGS_FIELDS = [
  {
    key: "sms_user",
    label: "رسالة للمستخدم",
    description: "رسالة SMS عامة للمستخدم على مستوى المشروع",
  },
  {
    key: "sms_owner",
    label: "رسالة للمالك",
    description: "رسالة SMS عامة للمالك على مستوى المشروع",
  },
  {
    key: "sms_employee",
    label: "رسالة للموظف",
    description: "رسالة SMS عامة للموظف على مستوى المشروع",
  },
];

export const emptySmsSettingsForm = {
  sms_user: "",
  sms_owner: "",
  sms_employee: "",
};

export function extractSmsSettings(response) {
  const body = response?.data;
  const data = body?.data ?? body;

  if (!data || typeof data !== "object") return emptySmsSettingsForm;

  // Some APIs wrap a single record in `items` or nest under `settings`
  const record = Array.isArray(data?.items)
    ? data.items[0]
    : data?.settings && typeof data.settings === "object"
      ? data.settings
      : data;

  return {
    sms_user: record?.sms_user ?? "",
    sms_owner: record?.sms_owner ?? "",
    sms_employee: record?.sms_employee ?? "",
  };
}

export function buildSmsSettingsPayload(form = {}) {
  return {
    sms_user: (form.sms_user ?? "").trim(),
    sms_owner: (form.sms_owner ?? "").trim(),
    sms_employee: (form.sms_employee ?? "").trim(),
  };
}
