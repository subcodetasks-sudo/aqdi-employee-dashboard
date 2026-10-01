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
      if (actual === expected) return true;
      const isYes = (value) => value === true || value === 1 || value === "1";
      const isNo = (value) => value === false || value === 0 || value === "0";
      if (isYes(expected) && isYes(actual)) return true;
      if (isNo(expected) && isNo(actual)) return true;
      return false;
    });
  }

  return true;
}
