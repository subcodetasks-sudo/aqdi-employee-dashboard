export function isFieldEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function isFieldVisible(field, formValues) {
  if (!field) return false;

  const entity = formValues?.tenant_entity;
  if (field.entity === "institution" && entity !== "institution") return false;
  if (field.entity === "person" && entity === "institution") return false;

  if (field.showWhen && typeof field.showWhen === "object") {
    return Object.entries(field.showWhen).every(([key, expected]) => {
      const actual = formValues?.[key];
      if (Array.isArray(expected)) return expected.includes(actual);
      return actual === expected;
    });
  }

  return true;
}
